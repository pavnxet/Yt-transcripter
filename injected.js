(function() {
    function extractData() {
        try {
            if (!window.ytcfg) {
                console.error("YouTube Transcript Extractor: ytcfg not found");
                return null;
            }

            let apiKey, context;
            if (typeof window.ytcfg.get === 'function') {
                apiKey = window.ytcfg.get('INNERTUBE_API_KEY');
                context = window.ytcfg.get('INNERTUBE_CONTEXT');
            }

            // Fallback to direct data access if get() didn't work or returned nothing
            if (!apiKey && window.ytcfg.data_) {
                 apiKey = window.ytcfg.data_.INNERTUBE_API_KEY;
                 context = window.ytcfg.data_.INNERTUBE_CONTEXT;
            }

            // Get video ID from URL or player response
            const urlParams = new URLSearchParams(window.location.search);
            const videoId = urlParams.get('v');

            if (!apiKey || !context || !videoId) {
                console.error("YouTube Transcript Extractor: Missing critical data", { apiKey, context, videoId });
                return null;
            }

            return {
                apiKey: apiKey,
                context: context,
                videoId: videoId
            };
        } catch (e) {
            console.error("YouTube Transcript Extractor: Error extracting data", e);
            return null;
        }
    }

    // Listen for request from content script
    if (!window.hasYoutubeTranscriptExtractorListener) {
        window.addEventListener("message", function(event) {
            if (event.source !== window) return;
            if (event.data.type && event.data.type === "YT_EXTRACT_REQUEST") {
                const data = extractData();
                window.postMessage({
                    type: "YT_DATA_RESPONSE",
                    payload: data
                }, "*");
            }
        }, false);
        window.hasYoutubeTranscriptExtractorListener = true;
    }
})();
