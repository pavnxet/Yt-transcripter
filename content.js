// content.js

function injectScript(file) {
    const s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', chrome.runtime.getURL(file));
    (document.head || document.documentElement).appendChild(s);
    s.onload = function() {
        s.remove();
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_TRANSCRIPT") {
        handleExtraction().then(sendResponse).catch((err) => {
            console.error(err);
            sendResponse({ status: "error", message: err.message });
        });
        return true; // Indicates async response
    }
});

function handleExtraction() {
    return new Promise((resolve, reject) => {
        const listener = (event) => {
            if (event.source !== window) return;
            if (event.data.type && event.data.type === "YT_DATA_RESPONSE") {
                window.removeEventListener("message", listener);
                const data = event.data.payload;
                if (!data) {
                    reject(new Error("Failed to extract YouTube data. Make sure you are on a video page."));
                    return;
                }

                fetchTranscript(data.apiKey, data.context, data.videoId)
                    .then(transcript => resolve({ status: "success", data: transcript, title: document.title.replace(" - YouTube", "") }))
                    .catch(reject);
            }
        };

        window.addEventListener("message", listener);

        injectScript("injected.js");

        // Dispatch event after a short delay to allow script to load and execute
        setTimeout(() => {
            window.postMessage({ type: "YT_EXTRACT_REQUEST" }, "*");
        }, 100);
    });
}

async function fetchTranscript(apiKey, context, videoId) {
    try {
        const response = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context: context,
                videoId: videoId
            })
        });

        if (!response.ok) {
            throw new Error(`Player API request failed: ${response.status}`);
        }

        const data = await response.json();
        const captions = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!captions || captions.length === 0) {
            throw new Error("No captions found for this video.");
        }

        // Prioritize manually uploaded transcripts (not kind='asr')
        let bestTrack = captions.find(track => track.kind !== 'asr');

        // Fallback to ASR if no manual track is found
        if (!bestTrack) {
            bestTrack = captions.find(track => track.kind === 'asr');
        }

        // If still no track found (unlikely if captions array is not empty), use the first one
        if (!bestTrack) {
            bestTrack = captions[0];
        }
        const trackUrl = bestTrack.baseUrl;

        if (!trackUrl) {
            throw new Error("Caption track URL not found.");
        }

        const transcriptResponse = await fetch(trackUrl);
        const transcriptText = await transcriptResponse.text();

        return parseTranscript(transcriptText);
    } catch (e) {
        console.error("Error fetching transcript:", e);
        throw e;
    }
}

function parseTranscript(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const textNodes = xmlDoc.getElementsByTagName("text");

    let formattedTranscript = "";

    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const start = parseFloat(node.getAttribute("start"));
        let text = node.textContent;

        // Replace newlines with spaces to keep it on one line per timestamp
        text = text.replace(/\n/g, " ");

        formattedTranscript += `${formatTime(start)} ${decodeHTMLEntities(text)}\n`;
    }

    return formattedTranscript;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "[00:00]";

    const date = new Date(0);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 8);

    if (timeString.startsWith("00:")) {
        return `[${timeString.substr(3)}]`;
    }
    return `[${timeString}]`;
}

function decodeHTMLEntities(text) {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
}
