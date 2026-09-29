> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# FAQ

> **General troubleshooting:** Press `F12` to open the browser developer tools, switch to the **"Network"** tab, and check the **Response** details of the request. Most errors can be identified here.

## What if the translation result is empty, shows only the original text, or returns null?

Two different situations — check which one you have:

**Only a few lines show the original text** — that's the failed-line fallback: lines that couldn't be translated keep the original text as a placeholder so the file structure stays intact. A red alert appears at the top of the result — click **Retry failed lines** to re-translate just those lines (completed content isn't re-billed). Usually it's a network blip or a flaky service; one or two retries clear it.

**Nothing translated at all / large blanks / null** — the API isn't getting through. Work through these in order:

1. **Test the connection**: click the API status badge at the top of the page → **Test Connection** — confirms in seconds whether the API is reachable;
2. **Read the error message**: the tool converts common failures into readable hints (invalid key, quota exhausted, timeout, …) — follow what it says;
3. **A/B against the free API**: switch to **GTX (Free)** and translate a small sample. GTX works → the problem is the original provider's key / config / quota. GTX also fails → it's your network (proxy, firewall, regional restriction);
4. **Clear the cache and retry**: wipe the translation cache in settings to rule out stale results.

Still stuck? Press **F12** → **Network** → click "Translate" once more → open the newest request and bring its **Status** (401/429/5xx) and **Response** error to a [GitHub issue](https://github.com/rockbenben/subtitle-translator/issues).

## Will failed translations retry automatically? What's not retried?

Yes — **network blips, rate limits (429), and temporary server errors (5xx)** retry automatically, up to your "Retry count". Lines that still fail **fall back to the original text** (never empty) and collect in the red failure panel — click **Retry failed lines** to re-translate them in one go without re-billing completed content.

For these errors retrying can't change the outcome, so the tool fails fast and you need a settings change:

| Error                                   | What to do                                                   |
| --------------------------------------- | ------------------------------------------------------------ |
| Bad key (401 / 403)                     | Re-check or replace the API Key                              |
| Timeout                                 | Raise "Timeout", or pick a faster service                    |
| Text too long (context length exceeded) | Lower "Context lines", or split the file                     |
| Output truncated (max_tokens reached)   | Raise "Max tokens" (or set 0 = unlimited), or split the file |

Full mechanism: [Feature Guide → Failed-Line Retry](/en/guide/translation/info.md#failed-line-retry).

## Why is translation slow?

The single most effective fix: **raise "Concurrent lines"** — add 50%–100% over the current service's default, and dial back the moment 429 errors appear. Also:

- **Keep the cache on** (default) — identical content is reused instantly on re-runs
- **Enable "Context-Aware Translation" for AI models** — more coherent AND higher throughput
- **In a hurry? Pick a faster service** — free GTX runs circles around small local models; paid DeepL is faster than Claude Opus
- **Small local models (under 14B) need the opposite — context OFF**: small models drop lines in long batches; line-by-line concurrent mode is both faster and more reliable

Defaults vary per service. See [Feature Guide → Concurrent lines](/en/guide/translation/info.md#concurrent-lines).

## Translated subtitles are out of order, or several lines got merged into one — what to do?

Some LLMs (**Gemini and Mistral** in particular) tend to break the markers the tool uses to keep lines aligned, producing shifted translations or several adjacent cues translated as one block. The tool ships multiple safeguards:

- When line markers go missing, positions are **no longer guessed by line number** — no more whole-section shifts
- When one cue absorbs the next few, the merged block is **discarded and the whole group re-translated**, so nothing gets duplicated
- The model is explicitly instructed never to merge lines

If a particular model still does it frequently:

1. **Switch to a more format-faithful model** — DeepSeek / Claude / GPT follow the line markers noticeably better
2. **Lower "Context mode concurrency"** in API settings (e.g. 3 → 1) — the fewer lines per response, the less scrambling
3. Broken lines land in the failure panel — click **Retry failed lines** to fill them in without re-billing completed content

## How do I use AI translation for free, without a paid API key?

- **Zero-config start**: the default **GTX (Free)** needs no key and runs fast — plain machine translation, but plenty for batch subtitles and everyday text. If it won't connect, switch to the equally free **Edge (Free)** or **DeepLX (Free)** — different routes, mutual backups
- **Free LLM tiers**: several listed providers offer free quotas — **Google AI Studio** (Gemini Flash family), **OpenRouter** (models with the `:free` suffix), **OpenCode Zen** (the `(free)`-suffixed SKUs; an account with billing details is required, but there's no prepayment), **Cerebras** (1M tokens/day), **Nvidia NIM**, **SiliconFlow**, and more — see the [API guide](/en/guide/translation/api.md#provider-specific-notes). Browse the service list — many providers are included precisely because they have a free tier

  > GitHub Models was retired by GitHub on 2026-07-30 and has been removed from the tool — don't go looking for it.
- **Mind your network**: overseas services (Google, OpenRouter, …) need a suitable network environment — if they don't connect, check the network before blaming the config
- Only **privacy-sensitive** content is worth deploying locally; otherwise free cloud APIs beat small local models on both speed and reliability (next question)

## Which model should I pick for local translation?

In order of "good enough first":

1. **Prefer a translation-specialized model** (from 4B up): trained specifically for translation, they beat same-size generic models with lower VRAM needs and faster runs. Two options — pick either **directly in the service list** (not by typing a model name under Custom). Both are machine-translation services: prompts are built into the call format (system/user prompts don't apply), there is no glossary, and the source language must be set explicitly.

   - [TranslateGemma](/en/guide/translation/api.md#translategemma) (Google, 53 languages): includes **Ukrainian, Serbian, the Baltic three** and most Indic languages (Marathi, Telugu, Kannada…)
   - [MiLMMT](/en/guide/translation/api.md#milmmt) (Xiaomi, 47 languages): includes **Cantonese** plus Kazakh / Uzbek / Azerbaijani / Lao / Burmese / Khmer / Malay; **no Ukrainian or Serbian**

   They share 39 languages. Any common pair (EN↔ZH/JA/KO/FR/DE/ES/RU) works on both — choose by the languages you actually need
2. **Generic LLMs: 14B minimum** — Qwen3-14B / 32B, Gemma 3 27B, etc.; bigger is steadier. **Don't run large batch jobs on models under 8B** — they drop lines, scramble output, and long jobs can even crash the model
3. **Download source**: in mainland China, [ModelScope](https://www.modelscope.cn/models) is far faster than direct Hugging Face / LM Studio's built-in downloader

The main value of local deployment is **privacy** (content never leaves your machine). For non-sensitive content, free cloud APIs (previous question) give better quality without tying up your GPU.

## What if the AI translation quality is unsatisfactory?

Try these in order of increasing cost:

1. **Reset to defaults**: restore Translation Settings and re-test with a small segment — many "weird translations" come from previously changed parameters;
2. **Tune temperature**: ≈0.2 for strict terminology / technical docs; 0.4–0.7 for everyday content; 0.8–1.0 for creative paraphrasing. Note that OpenAI, Claude, Gemini, Moonshot Kimi, and Azure OpenAI expose no temperature control (locked model-side — see the [API guide](/en/guide/translation/api.md)); steer those with the system prompt or thinking effort instead;
3. **Enable context-aware translation**: dialogue and long-form text get noticeably more coherent;
4. **Inconsistent names / terms**: pin them with the Glossary (next question);
5. **Switch models**: mainstream online models (DeepSeek / Claude / GPT / Gemini — including their mini / flash tiers) are all capable enough; odd output is almost always a parameter or prompt issue, not the model. Small local models do have a real ceiling — see [Which model should I pick for local translation?](#which-model-should-i-pick-for-local-translation) above.

## How do I keep names and terminology translated consistently?

Use the **Glossary** — no need to stuff terms into the system prompt. The glossary is more reliable (per-request injection of matched terms, automatic retry on violations, post-hoc replacement net) and doesn't waste tokens.

How to use: Translation Settings → **Glossary** → Edit terms, one term per row as "**source word → required translation**" (e.g. `Spike → Спайк`). With the toggle on, it applies to every translation automatically.

For bulk import, use **TSV** (tab-separated — pastes straight from Excel / any spreadsheet):

```text
Spike	Спайк
Moscow	Москва
```

An optional third column takes a target language code (`zh`, `ja`, …) so one file can import terms for several languages. Full details: [Feature Guide → Glossary](/en/guide/translation/info.md#glossary).

## Should my custom prompt say "preserve timestamps / line numbers / formatting"?

**No.** The tool sends only the dialogue text to the model — timestamps, cue numbers, and ASS/VTT headers all stay local and are re-inserted at their original positions after translation. The model never sees the structure.

Format-preservation instructions ("keep line count / numbering / timecodes") are not just unnecessary — they waste tokens and can even coax the model into emitting extra content. Spend the prompt on **translation style and quality** instead (tone, domain terminology, target audience).

## GTX Free cannot connect or shows CORS errors?

GTX calls Google's translation gateway directly from your browser. When you see "service unavailable" or CORS errors in the console, **try two self-fixes first — they resolve most cases in one step**:

1. **Switch the gateway**: above the URL field, change it from `Legacy gtx` to `translate-pa` (the default). The old `translate.googleapis.com/translate_a` endpoint has been tightened by Google's anti-abuse (many IPs get redirected to a captcha page, which the browser reports as CORS); the default `translate-pa` gateway is CORS-correct with better availability.
2. **Switch to a free backup**: pick **Edge (Free)** or **DeepLX (Free)** from the dropdown — they take entirely different routes and are zero-config.

If neither helps, check your network environment:

3. **Mainland China without a proxy**: the relevant Google domains may be blocked there (shows as timeouts) — use a proxy, or switch to directly reachable Qwen-MT / DeepSeek
4. **Corporate / school networks**: a gateway intercepts the request and returns its own block page, which the browser reports as a CORS error — confirm by trying another network (e.g. a phone hotspot)
5. **Browser extensions**: some ad/privacy blockers intercept the `googleapis.com` domain — temporarily disable and refresh

> Before each run the tool probes the current free service's reachability and blocks the run with a clear message when it's unreachable, so a doomed job never starts. For rate limits and the automatic slowdown, see [API guide → Free machine translation essentials](/en/guide/translation/api.md#free-machine-translation-essentials).

## Local model reporting cross-origin (CORS) or connection failure?

When using local models like Ollama or LM Studio, common causes for failure are browser CORS policies or ad blockers:

1. Temporarily disable ad/privacy extensions and refresh.
2. Enable CORS for the local service according to the [Translation API Guide](/en/guide/translation/api.md#solving-cors-issues) (e.g., set `OLLAMA_ORIGINS=*`, check "Enable CORS" in LM Studio).
3. If it still fails, check for port conflicts and view the return status code in the **Network** panel. Company/Campus networks also need to ensure the firewall isn't blocking local ports.

## Running translategemma on Ollama is slow, dropping lines, or translating badly — what's wrong?

Two independent causes, and people usually hit both.

**① Drop Ollama.** TranslateGemma and MiLMMT pre-render their prompt and POST it to `/v1/completions`, which only works if the server applies no template of its own — and **Ollama still applies the Modelfile template on that endpoint** (`FromCompleteRequest` never sets `Raw`; `routes.go` does `if !req.Raw { tmpl := m.Template … }`). Your prompt gets wrapped a second time, quality degrades for no visible reason, **and nothing errors**. Use **LM Studio / llama.cpp / koboldcpp** instead — that is exactly why Ollama is missing from these two services' endpoint chips. See [Translation API Guide → Local Model Setup](/en/guide/translation/api.md#local-model-setup).

**② Don't configure it as a regular LLM.** Picking "Custom (OpenAI-compatible)" and filling in `translategemma-4b-it` routes you through the generic LLM pipeline with batching and context markers; small (under 14B) models struggle to preserve that structure — dropped lines and slower runs.

✅ Fix: pick the dedicated "**TranslateGemma**" or "**MiLMMT**" service from the dropdown. They use a purpose-built line-by-line path matching the translation model's I/O format, the most reliable option for local small models.

> Related: frequent **timeouts** on these two are usually not the model but concurrency exceeding your server's parallel slots — see [Local Model Setup](/en/guide/translation/api.md#local-model-setup).

## A local thinking model is very slow or never produces output?

**Thinking models** (e.g. the Qwen3 family, enabled by default) generate a long reasoning block before the actual translation — on limited hardware (a few tokens per second), every line waits tens of seconds for reasoning you never see. In order of effectiveness:

1. **Turn thinking off**: append `/no_think` at the end of the system prompt (Translation Settings → System prompt) — the Qwen3 family's soft switch; some community finetunes may not honor it
2. **Switch models**: pick an instruct variant, or select the translation-specialized [TranslateGemma](/en/guide/translation/api.md#translategemma) from the service list — no reasoning stage, solid quality from 4B, an order of magnitude faster
3. **Check GPU offload**: single-digit tokens/s usually means most layers run on CPU — check the GPU settings in LM Studio / Ollama
4. The Test Connection button shares the **"Request timeout"** setting with translation (default 180s) — raise it if reasoning genuinely takes that long

## Why does DeepL go through a relay server?

DeepL's official API can't be called directly from a web page (a browser CORS restriction), so the tool routes requests through a built-in relay — **Nvidia NIM** works the same way. **OpenCode Zen, TokenHub (Tencent) and YandexGPT** use the user-controlled **"API relay"** switch instead: none of their official endpoints can be reached from a browser today, so the switch defaults to ON but can be turned off at any time. All channels only forward requests and never record your content.

Prefer not to route through a third party? Enter a custom API URL in settings (e.g. your own relay) — it takes precedence over every built-in channel and requests go straight to your endpoint. See [Translation API Guide → API relay & Built-in Proxy](/en/guide/translation/api.md#api-relay--built-in-proxy).

## Is my API Key saved on a server?

No. The API Key and all settings are stored only in the local browser; no server can access them.

## Is there a CLI, API, or desktop version?

**There is a CLI.** The engine behind all three translation tools is platform-agnostic TypeScript, and the repository ships a command-line entry point — clone it and run `yarn cli`. It reuses **the same pipeline and the same format parsing/assembly code** as the web app, so batching, concurrency, retries, 429 cooldown, glossary, context translation and per-line caching behave identically; only the browser-specific pieces (fetch, cache, cancellation) are swapped for Node equivalents. All three formats — subtitles, Markdown, JSON — are built in, and it reads the settings JSON you download from the web UI's "Export settings". Full usage: [Command-line translation](/en/guide/translation/cli.md).

**There is no hosted API, and no downloadable desktop build today**: the web app opens instantly, is always up to date, and needs no install or update. Your subtitles and API keys live only in your own browser and never touch a server.

On the web, combine these existing features to cut down repetitive manual steps:

- **Batch mode**: drag in multiple files at once — they queue automatically and download as a bundle
- **Import settings**: pre-configure target languages, API config, and every other parameter from a JSON file (see [Feature Guide → Settings Import/Export](/en/guide/translation/info.md#settings-importexport))
- **Quick language-code entry**: in multi-language mode, paste a string of codes (e.g. `zh, de, ru`) instead of clicking through the picker
