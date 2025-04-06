import SupportedLanguages from "./supported-languages.md"

## Translation API

This tool supports 5 translation APIs and 5 LLM (large language model) interfaces, allowing users to choose the appropriate translation method based on their needs:

### Comparison of Translation APIs

| API Type               | Translation Quality | Stability  | Suitable Scenarios           | Free Quota                  |
|------------------------|---------------------|------------|------------------------------|-----------------------------|
| **DeepL(X)**           | ★★★★★               | ★★★★☆     | Suitable for long texts; smoother translations | 500,000 characters per month |
| **Google Translate**   | ★★★★☆              | ★★★★★     | Ideal for UI text and common phrases | 500,000 characters per month |
| **Azure Translate**    | ★★★★☆              | ★★★★★     | Broadest language support    | 2,000,000 characters per month **for the first 12 months** |
| **GTX API (Free)**     | ★★★☆☆              | ★★★☆☆     | General text translation     | Free                        |
| **GTX Web (Free)**     | ★★★☆☆              | ★★☆☆☆     | Suitable for small-scale translation | Free                        |

- **DeepL**: Ideal for long texts with smoother and more natural translations; however, it does not support web API calls and requires local or server-side proxy usage.
- **Google Translate**: Offers stable translation quality, suitable for short sentences and UI text, and supports web API calls.
- **Azure Translate**: Provides the widest range of language support, meeting diverse multilingual translation needs.
- **GTX API/Web**: A free translation option suitable for small-scale use, though its stability is average.

For higher translation speed and quality, you can apply for an API Key from [Google Translate](https://cloud.google.com/translate/docs/setup?hl=zh-cn), [Azure Translate](https://learn.microsoft.com/zh-cn/azure/ai-services/translator/reference/v3-0-translate), or [DeepL Translate](https://www.deepl.com/your-account/keys). Refer to the related [API application tutorial](https://ttime.timerecord.cn/service/translate/google.html) for the application process.

### LLM Translation (AI Large Models)

This tool also supports translation using 5 AI LLM models, including OpenAI, DeepSeek, Siliconflow, Groq, and others.

- **Suitable Scenarios**: Ideal for more complex language comprehension needs, such as literary works and technical documents.
- **Customizability**: Supports customizable System Prompts and User Prompts to tailor the translation style.
- **Temperature Control**: Allows adjustment of the AI translation’s randomness. A higher value yields more creative translations but may reduce stability.

For custom LLM, it is recommended to use the qwen2.5-14b-instruct model or above.

<SupportedLanguages />

## API Parameters

### Translation Rate

Excessive translation rate may cause the API to return null values; please reduce the rate appropriately.

### Segmented Translation

To speed up translation, multiple subtitle lines are grouped together for translation. The character limit specified here is the maximum number of characters per group. Below are the maximum character limits for each translation service:

- **DeepL API**: Maximum of 128K characters per request.
- **DeepLX Free**: Maximum of 1000 characters per request.
- **Azure Translate**: Maximum of 10K characters per request.
- **Google Translate**: The Google Translate web interface supports up to 5000 characters per translation, while the Google Cloud Translation API allows up to 30K characters per request. (Segmented translation is not used for Google Translate because it may disrupt line breaks.)

### Delay Time

The delay setting mainly applies to the free tier of Azure Translate; other translation APIs do not require modification. In testing, setting the delay for Azure Translate Free to over 5000 milliseconds is ideal. When translating a large volume of subtitles, increasing the delay can help prevent numerous blank subtitles.
