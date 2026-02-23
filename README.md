# 🎥 YouTube Transcript Extractor

![YouTube Transcript Extractor](https://i.ibb.co/vCBPmhrD/unnamed.jpg)


A lightweight Chrome Extension to quickly grab transcripts from YouTube videos.

## ✨ Features
* **One-Click Extraction**: Get the full transcript without manual copying.
* **Timestamps Included**: Every line of text is paired with its original video timestamp.
* **Clean Formatting**: Outputs a structured `.txt` file ready for reading or AI processing.
* **Permissions**: Uses `activeTab` and `downloads` permissions to ensure privacy and functionality.

## 🛠️ Technical Details
* **Manifest V3**: Built using the latest Chrome extension standards.
* **Content Script**: Uses `content.js` to programmatically interact with the YouTube DOM to find hidden transcript elements.
* **Popup UI**: A simple interface (`popup.html` and `popup.js`) to trigger the extraction process.

## ⚠️ Requirements
* The video must have captions/transcript available on YouTube.
* The extension must be used while on a `youtube.com/watch` page.

---
*Created by [pavnxet](https://github.com/pavnxet/Yt-transcripter)*
