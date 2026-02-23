document.addEventListener('DOMContentLoaded', function() {
    const extractBtn = document.getElementById('extract-btn');
    const statusDiv = document.getElementById('status');
    const titleDiv = document.getElementById('video-title');

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs && tabs[0]) {
            titleDiv.textContent = tabs[0].title;

            if (!tabs[0].url.includes("youtube.com/watch")) {
                extractBtn.disabled = true;
                statusDiv.textContent = "Please go to a YouTube video page.";
            }
        }
    });

    extractBtn.addEventListener('click', function() {
        extractBtn.disabled = true;
        statusDiv.textContent = "Extracting transcript...";

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];

            chrome.tabs.sendMessage(activeTab.id, {action: "EXTRACT_TRANSCRIPT"}, function(response) {
                if (chrome.runtime.lastError) {
                    statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
                    extractBtn.disabled = false;
                    return;
                }

                if (response && response.status === "success") {
                    statusDiv.textContent = "Success! Downloading...";

                    const safeTitle = (response.title || "transcript").replace(/[^a-z0-9 \-]/gi, '_');
                    const filename = safeTitle + "_transcript.txt";
                    const blob = new Blob([response.data], {type: "text/plain"});
                    const url = URL.createObjectURL(blob);

                    chrome.downloads.download({
                        url: url,
                        filename: filename,
                        saveAs: true
                    }, (downloadId) => {
                        if (chrome.runtime.lastError) {
                            statusDiv.textContent = "Download failed: " + chrome.runtime.lastError.message;
                        } else {
                             statusDiv.textContent = "Download started!";
                        }
                        extractBtn.disabled = false;
                    });

                } else {
                    statusDiv.textContent = "Error: " + (response ? response.message : "Unknown error");
                    extractBtn.disabled = false;
                }
            });
        });
    });
});
