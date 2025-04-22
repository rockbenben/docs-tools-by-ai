import SupportedLanguages from "./supported-languages.md"

## Translation API

This tool supports 5 translation APIs and 6 LLM (large language model) interfaces, allowing users to choose the appropriate translation method based on their needs:

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

This tool offers access to six mainstream AI large language models (LLMs) or interfaces, including: DeepSeek, OpenAI, Azure OpenAI, Siliconflow, Groq, and a customizable Custom LLM option.

- **Applicable Scenarios**: Ideal for tasks that demand high levels of language comprehension, such as literary works, technical documentation, and multilingual materials.  
- **Highly Customizable**: Allows configuration of system prompts and user prompts, enabling flexible control over translation style, terminology preferences, and more—catering to a wide range of translation needs.  
- **LLM Model**: Typically, this field should contain the model name provided by the selected interface; for Azure OpenAI, the corresponding deployment name should be entered.  
- **Temperature Parameter**: Controls the creativity and consistency of translation results. Higher values yield more diverse and creative outputs but may reduce accuracy; lower values produce more stable and consistent results, making them suitable for formal or highly technical content.

The **Custom LLM** option allows integration with third-party services or local inference platforms (such as **ollama**) by configuring the API endpoint and model name. For example, the default API endpoint for a local ollama setup is:

```yml
http://127.0.0.1:11434/v1/chat/completions
```

The default model used is `llama3.2`. For **LM Studio**, the local API endpoint is:

```yml
http://localhost:61234/v1/chat/completions
```

To achieve better translation quality, it is recommended to use `qwen2.5-14b-instruct` or a higher-performing model in the Custom LLM setup.

<SupportedLanguages />
