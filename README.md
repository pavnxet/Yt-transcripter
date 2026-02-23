# YouTube Transcript Extractor

![YouTube Transcript Extractor](images/demo.png)

A high-performance Chrome Extension that allows you to extract YouTube video transcripts with timestamps into a `.txt` file with a single click.

## Features

*   **No API Keys Required:** Works by interacting directly with the YouTube interface, so you don't need to configure any personal API keys.
*   **One-Click Download:** Simply open the popup and click "Download Transcript".
*   **Timestamps Included:** Extracts timestamps along with the text (e.g., `[00:15] Hello world`).
*   **Smart Selection:** Automatically opens the transcript panel (handling "More actions" -> "Show transcript") and scrapes the content.
*   **SPA Support:** Works seamlessly when navigating between videos without refreshing the page.
*   **Watermark & Attribution:** Includes a footer with the source repository link in the downloaded file.

## Installation

1.  Clone or download this repository.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the folder containing this extension.

## Usage

1.  Navigate to any YouTube video.
2.  Click the extension icon in the toolbar.
3.  Click the **Download Transcript** button.
4.  The extension will automatically open the transcript panel, extract the text, and download a `.txt` file named after the video title.

## Attribution

This tool adds a visible watermark to the end of the transcript file and a hidden console log watermark, linking to the project repository:
[https://github.com/pavnxet/Yt-transcripter](https://github.com/pavnxet/Yt-transcripter)
