import * as path from "node:path";
import { execFileSync } from "node:child_process";
import type { RspressPlugin } from "@rspress/core";

const gitLastModified = (filepath: string): string | null => {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", filepath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? out.slice(0, 10) : null;
  } catch {
    return null;
  }
};

export interface PluginGeoOptions {
  siteUrl: string;
  orgName: string;
  orgLogo: string;
  orgSameAs?: string[];
  appFeatureList?: string[];
  siteNames?: Record<string, string>;
  siteDescriptions?: Record<string, string>;
}

const buildSiteGraph = (o: PluginGeoOptions) => ({
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
      potentialAction: {
        "@type": "SearchAction",
        target: `${o.siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: o.orgName,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: o.siteUrl,
      author: { "@id": `${o.siteUrl}/#organization` },
      featureList: o.appFeatureList ?? [],
    },
  ],
});

export function pluginGeo(opts: PluginGeoOptions): RspressPlugin {
  const componentPath = path.resolve(__dirname, "GeoHead.tsx");
  const todayIso = new Date().toISOString().slice(0, 10);
  return {
    name: "plugin-geo",
    globalUIComponents: [componentPath],
    extendPageData(pageData) {
      const fm = (pageData.frontmatter || {}) as Record<string, unknown>;
      const manual = fm.dateModified as string | undefined;
      if (manual) {
        (pageData as Record<string, unknown>).dateModified = manual;
        return;
      }
      const filepath = (pageData as { _filepath?: string })._filepath;
      (pageData as Record<string, unknown>).dateModified =
        (filepath && gitLastModified(filepath)) || todayIso;
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
