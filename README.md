# Tools By AI Docs

Docs for the [Tools By AI](https://tools.newzone.top) suite: <https://docs.newzone.top>

Source of the tools themselves: <https://github.com/rockbenben/web-tools-by-ai>

## Commands

```bash
yarn install
yarn dev        # local preview
yarn build      # production build into doc_build/
yarn preview    # serve the built site
yarn test       # unit tests for the generators and the drift gates
yarn check      # link check + drift gates (what CI runs)
```

## Where the content comes from

The tools change faster than prose can keep up, so anything that is really a
*fact about the app* — the provider roster, which endpoints have a relay
switch, the language list, the tool list — is not hand-copied into the pages.
It is derived from the source repo:

```bash
# both repos must be checked out side by side, with the source repo installed
yarn sync ../web-tools-by-ai
```

`yarn sync` evaluates the source's own registries (`toolRegistry.ts`,
`translation/registry.ts`, `languages-data.ts`) through the source repo's tsx,
writes `docs/data/*.json`, and renders the bilingual fragments in
`docs/{zh,en}/guide/_gen/` from the single template layer
`scripts/lib/render.mjs`.

**Never edit by hand:** `docs/data/*.json` and `docs/{zh,en}/guide/_gen/*.mdx`.
Change the template (or the upstream registry) instead — `yarn check:data`
re-renders and fails on any drift.

`yarn sync` is a local command only. CI never runs it (there is no source repo
on the runner); it runs `yarn check`, whose gates are:

| Gate | Catches |
| --- | --- |
| fragment freshness | hand edits to `_gen/`, or a fragment that no longer matches `docs/data/` |
| aggregate-count whitelist | a hardcoded "26 LLM endpoints" / "35 种引擎" creeping back into prose or `rspress.config.ts` |
| exact language total | a precise language count written outside generated fragments |
| zh/en parity | a page added to one locale only, or sidebar order drifting |
| appUrl traceability | a page linking to a tool URL that the app no longer serves |
| MT roster | the classic-translation table disagreeing with the provider catalog |

## Layout

```
docs/
  zh/  en/          one tree per locale, mirrored file-for-file
    guide/
      _gen/         generated fragments — do not edit
      translation/  subtitle / Markdown / JSON translation guides
      text/  json/  text and JSON utilities
  data/             derived catalog JSON — do not edit
  public/img/       screenshots (WebP, 1232px wide)
scripts/
  lib/render.mjs    the only template layer (sync + check share it)
  lib/gates.mjs     the six drift gates, as pure functions
  lib/source-eval.mts   run by the source repo's tsx; knows its data shapes
  sync-from-source.mjs  yarn sync
  check-data.mjs        yarn check:data
  check-links.mjs       yarn check:links
geo/                JSON-LD / hreflang / last-modified plugin
specs/  plans/      design docs for changes to this site
```
