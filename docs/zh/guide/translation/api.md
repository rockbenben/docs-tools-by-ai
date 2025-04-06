
import SupportedLanguages from "./supported-languages.md"

## 翻译 API

本工具支持 5 种翻译 API 和 5 种 LLM（大语言模型）接口，用户可根据需求选择合适的翻译方式：  

### 翻译 API 对比

| API 类型 | 翻译质量 | 稳定性 | 适用场景 | 免费额度 |  
|----------|----------|----------|----------|----------|  
| **DeepL(X)** | ★★★★★ | ★★★★☆ | 适合长文本，翻译更流畅 | 每月 50 万字符 |  
| **Google Translate** | ★★★★☆ | ★★★★★ | 适合 UI 界面、常见句子 | 每月 50 万字符 |  
| **Azure Translate** | ★★★★☆ | ★★★★★ | 语言支持最广泛 | **前 12 个月** 每月 200 万字符 |  
| **GTX API（免费）** | ★★★☆☆ | ★★★☆☆ | 一般文本翻译 | 免费 |  
| **GTX Web（免费）** | ★★★☆☆ | ★★☆☆☆ | 适合小规模翻译 | 免费 |  

- **DeepL**：适用于长篇文本，翻译更加流畅自然，但不支持网页端 API，需本地或服务器代理调用。  
- **Google Translate**：翻译质量稳定，适用于短句、界面文本，支持网页端调用。  
- **Azure Translate**：支持语言最多，适合多语言翻译需求。  
- **GTX API/Web**：免费翻译选项，适合小规模使用，但稳定性一般。  

如果对翻译速度和质量有更高要求，可自行申请 API Key：[Google Translate](https://cloud.google.com/translate/docs/setup?hl=zh-cn)、[Azure Translate](https://learn.microsoft.com/zh-cn/azure/ai-services/translator/reference/v3-0-translate)、[DeepL Translate](https://www.deepl.com/your-account/keys)。申请流程参考相关的[接口申请教程](https://ttime.timerecord.cn/service/translate/google.html)。

### LLM 翻译（AI 大模型）

本工具还支持 5 种 AI LLM 模型进行翻译，包括 OpenAI、DeepSeek、Siliconflow、Groq 等。  

- **适用场景**：适合更复杂的语言理解需求，如文学作品、技术文档等。  
- **可定制性**：支持自定义系统提示词（System Prompt）和用户提示词（User Prompt），让翻译风格更加符合预期。  
- **温度控制（temperature）**：可以调整 AI 翻译的随机性，数值越高，翻译越有创意，但可能会降低稳定性。

自定义 LLM 建议使用 qwen2.5-14b-instruct 或以上的模型。

<SupportedLanguages />

## API 参数

### 翻译速率

速率过高可能导致 API 返回空值，请适当降低速率。

### 分割翻译

为加快翻译速度，我将多行字幕打包在一起翻译，而这里的分割翻译字符数就是每个打包块的上限。以下是每个翻译服务的最大字符数限制：

- **DeepL API**：每个请求最大字符数为 128K。
- **DeepLX Free**：每个请求最大字符数为 1000。
- **Azure Translate**：每个请求最大字符数为 10K。
- **Google Translate**: Google Translate 网页界面每次翻译最多 5000 个字符，Google Cloud Translation API 每个请求最大字符数为 30K 个字符。（由于 Google 翻译会破坏换行符，因此未使用分割翻译。）

### 延迟时间

延迟时间主要针对 Azure Translate 的免费套餐，其他翻译 API 可以不修改。在我的测试中，Azure Translate Free 的延迟时间设为 5000 毫秒以上为佳。大量字幕需要翻译时，可以多设些延迟，避免出现大量空白字幕。
