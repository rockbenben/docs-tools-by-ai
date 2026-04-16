import { useHead } from "@unhead/react";
import { useFrontmatter, usePage } from "@rspress/core/runtime";

const SITE_URL = "https://docs.newzone.top";
const ORG_ID = `${SITE_URL}/#organization`;

type FaqItem = { q: string; a: string };
type HowToStep = { name: string; text: string };

const pickLang = (lang: string) => (lang === "zh" ? "zh-CN" : lang || "en");

const stripMarkdown = (s: unknown) =>
  typeof s === "string" ? s.replace(/```[\s\S]*?```/g, "").replace(/`([^`]+)`/g, "$1").trim() : "";

export default function GeoHead() {
  const { page } = usePage();
  const { frontmatter } = useFrontmatter();
  const fm = (frontmatter || {}) as Record<string, unknown>;
  const pageAny = (page || {}) as Record<string, unknown>;

  const routePath = (pageAny.routePath as string) || "/";
  const url = SITE_URL + routePath;
  const title = (fm.title as string) || (pageAny.title as string) || "";
  const description = (fm.description as string) || (pageAny.description as string) || "";
  const dateModified = (pageAny.dateModified as string) || (fm.dateModified as string);

  const scripts: Array<{ type: string; innerHTML: string; key: string }> = [];

  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    inLanguage: pickLang(page?.lang || ""),
    url,
    mainEntityOfPage: url,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
  if (fm.datePublished) article.datePublished = fm.datePublished;
  if (dateModified) article.dateModified = dateModified;
  if (fm.image) article.image = fm.image;

  scripts.push({
    type: "application/ld+json",
    innerHTML: JSON.stringify(article),
    key: "geo-article",
  });

  if (Array.isArray(fm.faq) && (fm.faq as unknown[]).length) {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (fm.faq as FaqItem[]).map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: stripMarkdown(item.a) },
      })),
    };
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify(faq),
      key: "geo-faq",
    });
  }

  const howto = fm.howto as { name?: string; steps?: HowToStep[] } | undefined;
  if (howto && Array.isArray(howto.steps) && howto.steps.length) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: howto.name || title,
      step: howto.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: stripMarkdown(s.text),
      })),
    };
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify(schema),
      key: "geo-howto",
    });
  }

  useHead({ script: scripts });

  return null;
}
