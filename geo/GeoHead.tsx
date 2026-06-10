import { useHead } from "@unhead/react";
import { usePage } from "@rspress/core/runtime";

const SITE_URL = "https://docs.newzone.top";
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const HEADLINE_MAX = 110; // Schema.org spec: max 110 chars

type FaqItem = { q: string; a: string };
type HowToStep = { name: string; text: string };
type Lang = "zh" | "en" | string;

// Top-level path segments → human-readable section labels for breadcrumbs and articleSection.
// Falls back to title-cased segment for anything not listed.
const SECTION_LABELS: Record<Lang, Record<string, string>> = {
  zh: {
    guide: "指南",
    translation: "翻译工具",
    json: "JSON 工具",
    tools: "工具",
    others: "其他",
    "subtitle-translator": "Subtitle Translator",
    "md-translator": "Markdown Translator",
    "json-translate": "JSON Translate",
  },
  en: {
    guide: "Guide",
    translation: "Translation",
    json: "JSON Tools",
    tools: "Tools",
    others: "Others",
    "subtitle-translator": "Subtitle Translator",
    "md-translator": "Markdown Translator",
    "json-translate": "JSON Translate",
  },
};

const titleCase = (s: string) =>
  s
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Normalize BCP-47-ish tags ("zh-CN", "zh-Hant") to the short keys used in SECTION_LABELS.
const labelLang = (lang: Lang): "zh" | "en" => (lang.toLowerCase().startsWith("zh") ? "zh" : "en");

const labelFor = (segment: string, lang: Lang) => {
  const key = labelLang(lang);
  return SECTION_LABELS[key]?.[segment] || SECTION_LABELS.en[segment] || titleCase(segment);
};

const pickLang = (lang: string): string => {
  if (!lang || lang === "en") return "en";
  if (lang === "zh") return "zh-CN";
  if (lang === "zh-hant") return "zh-Hant";
  return lang;
};

// Strip common Markdown for clean JSON-LD text. Not a full parser — just enough
// to flatten links / emphasis / headers / lists / code in FAQ-style answers.
const stripMarkdown = (input: unknown): string => {
  if (typeof input !== "string") return "";
  return input
    .replace(/```[\s\S]*?```/g, "") // fenced code
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/(\*\*|__)(.+?)\1/g, "$2") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic (asterisk)
    .replace(/(^|[^\w])_(.+?)_(?!\w)/g, "$1$2") // italic (underscore) — intra-word `_` like `a_b_c` is not emphasis
    .replace(/^#{1,6}\s+/gm, "") // ATX headers
    .replace(/^[\s]*[-*+]\s+/gm, "") // unordered list markers
    .replace(/^[\s]*\d+\.\s+/gm, "") // ordered list markers
    .replace(/\s+/g, " ")
    .trim();
};

const truncate = (s: string, max: number) =>
  s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";

// `/zh/guide/translation/api` → ['zh', 'guide', 'translation', 'api']
// `/` → []
const pathSegments = (routePath: string): string[] =>
  routePath.split("/").filter(Boolean);

// Default lang renders without a locale prefix in rspress (e.g., zh is the default
// here, so `/guide/...` is Chinese). Use page.lang as the source of truth and only
// strip a path-segment locale when one is actually present.
const stripLocalePrefix = (segments: string[]): string[] => {
  const first = segments[0];
  if (first === "zh" || first === "en" || first === "zh-hant") return segments.slice(1);
  return segments;
};

const isLocaleRoot = (segments: string[]): boolean =>
  segments.length === 0 || (segments.length === 1 && /^(zh|en|zh-hant)$/.test(segments[0]));

const isIndexPage = (routePath: string): boolean => {
  if (routePath === "/" || routePath.endsWith("/")) return true;
  return isLocaleRoot(pathSegments(routePath));
};

const homeLabel = (lang: Lang): string =>
  lang === "zh-CN" || lang === "zh" || lang === "zh-Hant" ? "首页" : "Home";

const buildBreadcrumb = (
  routePath: string,
  pageTitle: string,
  lang: Lang,
): Record<string, unknown> | null => {
  const segments = pathSegments(routePath);
  if (isLocaleRoot(segments)) return null;

  const rest = stripLocalePrefix(segments);
  // Reconstruct locale prefix from the original path so URLs stay accurate
  // (the default-lang case has no prefix to add).
  const hadPrefix = segments[0] !== rest[0];
  const localePrefix = hadPrefix ? `/${segments[0]}` : "";
  const homeUrl = `${SITE_URL}${localePrefix || "/"}`;

  const items: Array<{ "@type": string; position: number; name: string; item?: string }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: homeLabel(lang),
      item: homeUrl,
    },
  ];

  let acc = localePrefix;
  rest.forEach((segment, idx) => {
    acc += `/${segment}`;
    const isLast = idx === rest.length - 1;
    items.push({
      "@type": "ListItem",
      position: idx + 2,
      name: isLast ? pageTitle || labelFor(segment, lang) : labelFor(segment, lang),
      ...(isLast ? {} : { item: `${SITE_URL}${acc}` }),
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
};

const sectionFor = (routePath: string, lang: Lang): string | null => {
  const rest = stripLocalePrefix(pathSegments(routePath));
  // Prefer the second segment (e.g., "translation" under "/guide/translation/api")
  // over the generic "guide" parent.
  const seg = rest[1] || rest[0];
  return seg ? labelFor(seg, lang) : null;
};

// Map any route to its language-equivalent URL pair. zh is the default lang
// here, so its paths have no prefix; en lives at /en/. x-default points to zh.
const buildLanguageAlternates = (routePath: string): { zh: string; en: string } => {
  let core: string;
  if (routePath === "/en" || routePath === "/en/") {
    core = "/";
  } else if (routePath.startsWith("/en/")) {
    core = routePath.slice(3); // strip "/en"
  } else {
    core = routePath;
  }
  if (!core.startsWith("/")) core = "/" + core;
  const zhPath = core;
  const enPath = core === "/" ? "/en" : "/en" + core;
  return { zh: SITE_URL + zhPath, en: SITE_URL + enPath };
};

export default function GeoHead() {
  const { page } = usePage();
  const pageAny = (page || {}) as Record<string, unknown>;
  const fm = (pageAny.frontmatter || {}) as Record<string, unknown>;
  const hero = (fm.hero || {}) as Record<string, unknown>;

  const routePath = (pageAny.routePath as string) || "/";
  const url = SITE_URL + routePath;
  // Hero pages (pageType: home) usually omit title/description; fall back to hero
  // fields so the schema isn't empty for SERP / AI crawlers.
  const rawTitle =
    (fm.title as string) ||
    (pageAny.title as string) ||
    (hero.name as string) ||
    (hero.text as string) ||
    "";
  const headline = truncate(rawTitle, HEADLINE_MAX);
  const description =
    (fm.description as string) ||
    (pageAny.description as string) ||
    (hero.tagline as string) ||
    "";
  const dateModified = (pageAny.dateModified as string) || (fm.dateModified as string);
  const lang = pickLang((page?.lang as string) || "");
  const inLanguage = lang;
  const isHome = fm.pageType === "home";

  const scripts: Array<{ type: string; innerHTML: string; key: string }> = [];

  // Page-type-aware primary schema:
  // - Hero / index / landing pages → WebPage (lighter, signals "browse this hub")
  // - Article pages → TechArticle (signals "read this content")
  const primaryType = isHome || isIndexPage(routePath) ? "WebPage" : "TechArticle";
  const primary: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": primaryType,
    headline,
    name: headline,
    description,
    inLanguage,
    url,
    mainEntityOfPage: url,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
  if (fm.datePublished) primary.datePublished = fm.datePublished;
  if (dateModified) primary.dateModified = dateModified;
  if (fm.image) primary.image = fm.image;

  if (primaryType === "TechArticle") {
    const section = sectionFor(routePath, lang);
    if (section) primary.articleSection = section;
    // speakable tells AI/voice engines which parts are voice-suitable summaries.
    // Title + first H2 give the gist; rspress's `.rspress-doc` wraps full content.
    primary.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".rspress-doc"],
    };
  }

  scripts.push({
    type: "application/ld+json",
    innerHTML: JSON.stringify(primary),
    key: "geo-primary",
  });

  // Breadcrumb improves SERP rich-result rendering and helps AI search engines
  // understand the content hierarchy.
  const breadcrumb = buildBreadcrumb(routePath, headline, lang);
  if (breadcrumb) {
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify(breadcrumb),
      key: "geo-breadcrumb",
    });
  }

  // Per-tool SoftwareApplication schema: when frontmatter.appUrl is set, the
  // page describes a specific tool (vs the brand-level SoftwareApplication in
  // plugin-geo). Helps AI engines recognize each tool as a distinct entity.
  const appUrl = fm.appUrl as string | undefined;
  if (appUrl) {
    const appName = (fm.appName as string) || rawTitle.split(/[-—|·]/)[0].trim();
    const appCategory = (fm.appCategory as string) || "DeveloperApplication";
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${appUrl}#software`,
        name: appName,
        description,
        url: appUrl,
        applicationCategory: appCategory,
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        inLanguage,
        ...(fm.image ? { image: fm.image } : {}),
        ...(dateModified ? { dateModified } : {}),
      }),
      key: "geo-tool",
    });
  }

  // FAQ data source priority:
  //   1. frontmatter.faq (curated, author-controlled — usually concise)
  //   2. pageData.faq (auto-extracted at build time from H2 sections when
  //      pageType: faq is set; see plugin-geo.ts)
  const manualFaq = Array.isArray(fm.faq) ? (fm.faq as FaqItem[]) : null;
  const autoFaq = Array.isArray(pageAny.faq) ? (pageAny.faq as FaqItem[]) : null;
  const faqItems = manualFaq && manualFaq.length ? manualFaq : autoFaq && autoFaq.length ? autoFaq : null;
  if (faqItems) {
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: stripMarkdown(item.a) },
        })),
        // Question headings are ideal for voice/quick AI answers.
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h2"] },
      }),
      key: "geo-faq",
    });
  }

  const howto = fm.howto as { name?: string; steps?: HowToStep[] } | undefined;
  if (howto && Array.isArray(howto.steps) && howto.steps.length) {
    const howToObj: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: howto.name || rawTitle,
      step: howto.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: stripMarkdown(s.text),
      })),
    };
    // Link the HowTo to the per-tool SoftwareApplication via @id reference, so
    // AI engines know "these steps are for this specific tool" instead of treating
    // the HowTo as a free-floating tutorial.
    if (appUrl) howToObj.tool = [{ "@id": `${appUrl}#software` }];
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify(howToObj),
      key: "geo-howto",
    });
  }

  // Canonical, og:url, hreflang — minimal but essential for AI-search citation
  // and bilingual cross-linking. x-default points to zh (the site's default lang).
  const alts = buildLanguageAlternates(routePath);
  const canonical = lang === "en" ? alts.en : alts.zh;

  // og / Twitter / article meta — overrides the site-wide defaults set in
  // rspress.config.ts head. Content pages should be "article" not "website";
  // each page gets its own twitter card text and image; bilingual locale tags
  // tell crawlers about the cross-language pair.
  const ogType = primaryType === "TechArticle" ? "article" : "website";
  const ogLocale = lang === "en" ? "en_US" : lang === "zh-Hant" ? "zh_TW" : "zh_CN";
  const ogLocaleAlternate = lang === "en" ? "zh_CN" : "en_US";
  const pageImage = (fm.image as string) || undefined;
  const articleSection = primaryType === "TechArticle" ? sectionFor(routePath, lang) : null;
  const datePublished = (fm.datePublished as string) || undefined;

  const meta: Array<{ property?: string; name?: string; content: string }> = [
    { property: "og:url", content: canonical },
    { property: "og:type", content: ogType },
    { property: "og:locale", content: ogLocale },
    { property: "og:locale:alternate", content: ogLocaleAlternate },
    { name: "twitter:title", content: headline },
    { name: "twitter:description", content: description },
  ];
  if (pageImage) {
    meta.push({ property: "og:image", content: pageImage });
    meta.push({ name: "twitter:image", content: pageImage });
  }
  if (ogType === "article") {
    if (datePublished) meta.push({ property: "article:published_time", content: datePublished });
    if (dateModified) meta.push({ property: "article:modified_time", content: dateModified });
    if (articleSection) meta.push({ property: "article:section", content: articleSection });
  }

  useHead({
    script: scripts,
    link: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hreflang: "zh-CN", href: alts.zh },
      { rel: "alternate", hreflang: "en", href: alts.en },
      { rel: "alternate", hreflang: "x-default", href: alts.zh },
    ],
    meta: meta.filter((m) => m.content),
  });

  return null;
}
