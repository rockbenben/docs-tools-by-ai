
import SupportedLanguages from "./supported-languages.md"

## 翻译 API

本工具支持 5 种翻译 API 和 6 种 LLM（大语言模型）接口，用户可根据需求选择合适的翻译方式：  

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

本工具提供了 6 种主流 AI 大语言模型（LLM）或接口，包括：DeepSeek、OpenAI、Azure OpenAI、Siliconflow、Groq，以及可自由配置的 Custom LLM。

- **适用场景**：适合处理语言理解要求较高的内容，如文学作品、技术文档、多语种资料等。
- **高度可定制**：支持配置系统提示词（System Prompt）与用户提示词（User Prompt），可灵活控制翻译风格、术语偏好等，满足多样化的翻译需求。
- **LLM 模型**：一般情况下填写所选接口提供的模型名称；若使用 Azure OpenAI，则需填写对应的部署名称。
- **温度参数（temperature）**：用于控制翻译结果的创造性与稳定性。数值越高，生成内容越具多样性和创造性，但可能降低准确性；数值越低，输出更稳定、一致，适合正式或技术性较强的场景。

自定义模型（Custom LLM）支持通过配置 API 接口和模型名称，接入第三方服务或本地推理平台（如 **ollama**）。例如，默认本地 ollama 的 API 地址为：

```yml
http://127.0.0.1:11434/v1/chat/completions
```

默认使用模型为 `llama3.2`。如使用 **LM Studio**，本地接口地址为：

```yml
http://localhost:61234/v1/chat/completions
```

为获得更优的翻译质量，推荐在自定义模型中使用 `qwen2.5-14b-instruct` 或性能更高的模型。

<SupportedLanguages />
