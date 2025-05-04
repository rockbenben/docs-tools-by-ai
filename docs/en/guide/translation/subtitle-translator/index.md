import Api from '../api.md';
import Parameters from '../api-parameters.md';
import Info from '../info.md';

# Introduction

In recent years, with the rise of online videos, the translation of popular foreign films and TV shows has mostly been handled by video platforms, while traditional subtitle groups have gradually faded from view. However, the demand for subtitles in niche and self-produced videos has not been effectively met, leading to a continuous increase in videos without subtitles. To solve this problem, the Whisper tool can be used to automatically generate subtitles for these raw videos and then translate them into Chinese using translation APIs.

To address issues with existing subtitle translation tools such as slow speed, lack of batch processing, and the need for manual intervention, I developed a free and fully featured subtitle translation tool—[Subtitle Translator](https://tools.newzone.top/en/subtitle-translator). This tool supports various subtitle formats including `.srt`, `.ass`, `.vtt`, and `.lrc`, and offers translation speeds measured in seconds to greatly enhance efficiency. I have successfully transcribed over 500 videos, and the translated subtitle files can be viewed at [whisper-subtitles](https://github.com/rockbenben/whisper-subtitles).

## Key Features

!["Batch Translation"](https://img.newzone.top/subtile-translator.gif?imageMogr2/format/webp "Batch Translation")

- **Second-Level Translation**: Uses chunk compression and parallel processing of subtitle text to translate an episode of a TV series in just 1 second (the GTX interface is slightly slower).
- **Batch Translation**: Supports processing hundreds of subtitle files at once, greatly boosting efficiency.
- **Translation Cache**: Automatically caches translation results locally to avoid duplicate API calls, saving both time and costs.
- **Format Compatibility**: Automatically matches mainstream subtitle formats (.srt / .ass / .vtt / .lrc) with the exported file keeping the original filename, so no manual adjustments are needed.
- **Subtitle Extraction**: Supports extracting subtitle text for later use in AI summarization, secondary creation, and other applications.
- **Multiple Interface Options**: Offers 3 free translation methods, 3 commercial-grade translation APIs, and 5 AI LLM (large model) interfaces to meet different needs.
- **Multilingual Support & Internationalization**: Supports 35 mainstream languages (including English, Chinese, Japanese, Korean, French, German, Spanish, etc.), and can translate the same subtitle file into multiple languages simultaneously to meet international requirements.

Subtitle Translator provides a wide range of parameter options to suit different user needs. Below is a detailed explanation of each parameter:

<Api />

<Parameters />

## Feature Description

### Subtitle Formats

Subtitle Translator supports various subtitle formats including `.srt`, `.ass`, `.vtt`, and `.lrc`, and offers automatic format matching:

- **Bilingual Subtitles**: When enabled, the translated text is inserted below the original subtitles, and the display position (above/below) can be adjusted.
- **Timeline Compatibility**: Supports time formats that omit default hours, exceed 100 hours, and display 1-3 digits for milliseconds to ensure compatibility.
- **Automatic Encoding Recognition**: Automatically detects the subtitle file encoding to prevent garbled text, eliminating the need to manually select the encoding.

### Translation Modes

Subtitle Translator supports both batch translation and single file mode to accommodate different needs:

**Batch Translation** (default):

- Supports processing hundreds of files at once, greatly improving work efficiency.
- Translated files are automatically saved in the browser’s default download directory without any manual steps.

**Single File Mode** (suitable for small tasks):

- Ideal for quick translation of a single subtitle file, and supports direct text pasting for translation.
- The translation result can be viewed in real time on the webpage and can be manually copied or exported.
- When single file mode is enabled, **uploading a new file will overwrite the previous one**.

<Info />
