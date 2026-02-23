// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_TRANSCRIPT") {
        extractTranscriptFromDom().then(sendResponse).catch((err) => {
            console.error(err);
            sendResponse({ status: "error", message: err.message });
        });
        return true; // Indicates async response
    }
});

function extractTranscriptFromDom() {
    return new Promise((resolve, reject) => {
        const playlistPanel = document.querySelector('ytd-playlist-panel-renderer#playlist');

        // Function to restore UI state
        function cleanupUI() {
            if (playlistPanel) {
                playlistPanel.style.display = '';
            }
        }

        // Temporarily hide playlist panel if present
        if (playlistPanel) {
            playlistPanel.style.display = 'none';
        }

        const moreActionsButton = document.querySelector('button[aria-label="More actions"]');
        if (!moreActionsButton) {
            // Try to find the button again, maybe it's under a different selector or requires interaction?
            // But for now, fail.
            cleanupUI();
            reject(new Error("Could not find 'More actions' button."));
            return;
        }

        moreActionsButton.click();

        // The userscript logic
        let transcriptButtonTimeout;
        let transcriptPanelTimeout;
        let panelIntervalId;
        let buttonIntervalId;

        const clearAll = () => {
            clearInterval(buttonIntervalId);
            clearTimeout(transcriptButtonTimeout);
            clearInterval(panelIntervalId);
            clearTimeout(transcriptPanelTimeout);
        };

        buttonIntervalId = setInterval(() => {
            const transcriptButton = document.querySelector('[aria-label="Show transcript"]');

            if (transcriptButton) {
                transcriptButton.click();
                clearInterval(buttonIntervalId);
                clearTimeout(transcriptButtonTimeout);

                panelIntervalId = setInterval(() => {
                    const transcriptPanel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"] #content');

                    if (transcriptPanel && transcriptPanel.querySelector('ytd-transcript-segment-renderer')) {
                        clearAll();

                        try {
                            const result = scrapeTranscriptText(transcriptPanel);
                            cleanupUI();
                            resolve({
                                status: "success",
                                data: result,
                                title: document.title.replace(" - YouTube", "")
                            });
                        } catch (e) {
                            cleanupUI();
                            reject(e);
                        }
                    }
                }, 100);

                transcriptPanelTimeout = setTimeout(() => {
                    clearAll();
                    cleanupUI();
                    reject(new Error("Transcript panel or segments not found after timeout."));
                }, 15000);
            }
        }, 250);

        transcriptButtonTimeout = setTimeout(() => {
            clearAll();
            cleanupUI();
            // If "Show transcript" isn't found, maybe it's already open?
            // Or maybe there are no captions.
            reject(new Error("Transcript button not found after timeout."));
        }, 10000);
    });
}

function scrapeTranscriptText(transcriptPanel) {
    let transcriptText = "";
    const lines = transcriptPanel.querySelectorAll('ytd-transcript-segment-renderer');

    if (!lines || lines.length === 0) {
        throw new Error("No transcript lines found.");
    }

    lines.forEach(line => {
        const timestampElement = line.querySelector('.segment-timestamp');
        const textElement = line.querySelector('.segment-text');

        if (timestampElement && textElement) {
            transcriptText += timestampElement.textContent.trim() + " " + textElement.textContent.trim() + "\n";
        }
    });

    // Add visible watermark with repo link
    transcriptText += "\n--\nTranscribed by YouTube Transcript Extractor\nhttps://github.com/jules/youtube-transcript-extractor";

    // Add hidden watermark (console log)
    console.log("Transcript extracted by YouTube Transcript Extractor (https://github.com/jules/youtube-transcript-extractor)");

    return transcriptText;
}
