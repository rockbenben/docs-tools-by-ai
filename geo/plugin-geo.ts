import * as path from "node:path";
import * as fs from "node:fs";
import { execFileSync } from "node:child_process";
import type { RspressPlugin } from "@rspress/core";

// Build-time cache: git log spawns are slow (~50–100 ms each). One Map
// per plugin invocation lets `extendPageData` re-look-up free.
const gitMtimeCache = new Map<string, string | null>();
// Cached parsed FAQ arrays — same file may be visited multiple times.
const faqExtractCache = new Map<string, FaqItem[]>();

interface FaqItem {
  q: string;
  a: string;
}

// Strip frontmatter then capture every H2 whose heading ends with `?` or `？`.
// The body until the next H2 (or EOF) becomes the answer text. Sections without
// a trailing question mark are skipped — they're explainers, not Q&A.
const extractFaqFromMarkdown = (content: string): FaqItem[] => {
  const noFrontmatter = content.replace(/^---[\r\n][\s\S]*?[\r\n]---[\r\n]?/, "");
  const items: FaqItem[] = [];
  const re = /^##\s+([^\r\n]+?)\s*$([\s\S]*?)(?=^##\s+|\Z)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noFrontmatter)) !== null) {
    const q = m[1].trim();
    if (!/[?？]\s*$/.test(q)) continue;
    const a = m[2].trim();
    if (!a) continue;
    items.push({ q, a });
  }
  return items;
};

const readFaqFromFile = (filepath: string): FaqItem[] => {
  if (faqExtractCache.has(filepath)) return faqExtractCache.get(filepath)!;
  try {
    const content = fs.readFileSync(filepath, "utf8");
    const items = extractFaqFromMarkdown(content);
    faqExtractCache.set(filepath, items);
    return items;
  } catch {
    faqExtractCache.set(filepath, []);
    return [];
  }
};

const gitLastModified = (filepath: string): string | null => {
  if (gitMtimeCache.has(filepath)) return gitMtimeCache.get(filepath)!;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", filepath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
    const value = out ? out.slice(0, 10) : null;
    gitMtimeCache.set(filepath, value);
    return value;
  } catch {
    gitMtimeCache.set(filepath, null);
    return null;
  }
};

export interface PluginGeoOptions {
  /** Canonical docs site URL, no trailing slash. */
  siteUrl: string;
  /** Organization / brand name. */
  orgName: string;
  /** Absolute URL to the brand logo. */
  orgLogo: string;
  /** Profile / repo URLs that disambiguate the organization (sameAs). */
  orgSameAs?: string[];
  /** URL of the actual web app — distinct from the docs site if hosted separately. Defaults to siteUrl. */
  appUrl?: string;
  /** Plain-text feature labels surfaced under SoftwareApplication.featureList. */
  appFeatureList?: string[];
  /** Bilingual site names rendered as name / alternateName. */
  siteNames?: Record<string, string>;
  /** Reserved for future per-locale description support; not currently emitted. */
  siteDescriptions?: Record<string, string>;
}

const buildSiteGraph = (o: PluginGeoOptions) => {
  const appUrl = o.appUrl ?? o.siteUrl;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${o.siteUrl}/#organization`,
        name: o.orgName,
        url: o.siteUrl,
        logo: o.orgLogo,
        sameAs: o.orgSameAs ?? [],
      },
      {
        "@type": "WebSite",
        "@id": `${o.siteUrl}/#website`,
        url: o.siteUrl,
        name: o.siteNames?.en ?? `${o.orgName} Docs`,
        alternateName: o.siteNames?.zh,
        inLanguage: ["zh-CN", "en"],
        publisher: { "@id": `${o.siteUrl}/#organization` },
        // No SearchAction: rspress's search is an in-page modal (Cmd/Ctrl+K),
        // not a URL-query endpoint, so a SearchAction would point at a fictional
        // endpoint and degrade trust signal.
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${appUrl}/#software`,
        name: o.orgName,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        url: appUrl,
        author: { "@id": `${o.siteUrl}/#organization` },
        publisher: { "@id": `${o.siteUrl}/#organization` },
        featureList: o.appFeatureList ?? [],
      },
    ],
  };
};

export function pluginGeo(opts: PluginGeoOptions): RspressPlugin {
  const componentPath = path.resolve(__dirname, "GeoHead.tsx");
  const todayIso = new Date().toISOString().slice(0, 10);

  return {
    name: "plugin-geo",
    globalUIComponents: [componentPath],
    extendPageData(pageData) {
      const fm = (pageData.frontmatter || {}) as Record<string, unknown>;
      const filepath = (pageData as { _filepath?: string })._filepath;

      const manualDate = fm.dateModified as string | undefined;
      const resolvedDate = manualDate || (filepath && gitLastModified(filepath)) || todayIso;
      (pageData as Record<string, unknown>).dateModified = resolvedDate;

      // FAQ auto-extraction: when pageType === 'faq' and no manual array,
      // parse H2 sections out of the source so authors don't have to duplicate
      // the same Q&A into both body and frontmatter.
      const wantsAutoFaq = fm.pageType === "faq" && !Array.isArray(fm.faq);
      if (wantsAutoFaq && filepath) {
        const items = readFaqFromFile(filepath);
        if (items.length) {
          (pageData as Record<string, unknown>).faq = items;
        }
      }
    },
    builderConfig: {
      html: {
        tags: [
          {
            tag: "script",
            attrs: { type: "application/ld+json" },
            children: JSON.stringify(buildSiteGraph(opts)),
            append: true,
          },
        ],
      },
    },
  };
}
