## API Parameters

### Chunk Translation Size

For text files with contextual relationships—such as subtitles or Markdown documents—this tool automatically merges multiple lines into "chunks" for translation. The **chunk size** refers to the maximum number of characters per grouped block. The character limits for each translation service are as follows:

- **DeepL API**: Up to 128K characters per request  
- **DeepLX Free**: Up to 1,000 characters per request  
- **Azure Translate**: Up to 10,000 characters per request  
- **Google Translate**:  
  - Web version: Up to 5,000 characters per translation  
  - Cloud Translation API: Up to 30,000 characters per request  

**Note**: Google Translate disrupts line breaks during processing, so chunked translation is not used with this service.

### Delay Time

**Delay time** sets the wait interval between chunk translations. When processing large volumes of text, some translation APIs may respond slowly—especially under poor network conditions or when using free interfaces. In such cases, delay settings are particularly important.

For example, when testing with Azure Translate’s free tier, it is recommended to set the delay time to **5,000 milliseconds or more** to avoid empty responses or errors.

### Translation Rate

Setting the translation rate too high may result in empty API responses or cause requests to be flagged as abnormal. It's recommended to adjust the rate based on the specific translation service and its stability to improve success rates and maintain reliable performance.
