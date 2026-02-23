from playwright.sync_api import sync_playwright
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Mock chrome API
        # We need to inject this before the page scripts run
        page.add_init_script("""
            window.chrome = {
                tabs: {
                    query: function(queryInfo, callback) {
                        console.log("chrome.tabs.query called");
                        setTimeout(() => {
                            callback([{
                                id: 1,
                                title: "Test Video - YouTube",
                                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            }]);
                        }, 10);
                    },
                    sendMessage: function(tabId, message, callback) {
                        console.log("chrome.tabs.sendMessage called with", message);
                        setTimeout(() => {
                            callback({
                                status: "success",
                                title: "Test Video",
                                data: "00:00 This is a transcript\\n00:05 End of transcript"
                            });
                        }, 1000); // Simulate network delay
                    }
                },
                runtime: {
                    lastError: null
                },
                downloads: {
                    download: function(options, callback) {
                        console.log("chrome.downloads.download called with", options);
                        if (callback) callback(12345);
                    }
                }
            };
        """)

        cwd = os.getcwd()
        filepath = f"file://{cwd}/popup.html"
        print(f"Navigating to {filepath}")

        page.goto(filepath)

        # Wait for the initial UI to settle (video title should appear)
        page.wait_for_selector("#video-title", state="visible")
        # Give a moment for the title to be populated by the mock query callback
        page.wait_for_timeout(500)

        page.screenshot(path="verification/popup_initial.png")
        print("Initial screenshot taken")

        # Click the button
        page.click("#extract-btn")

        # Take screenshot during "loading" state
        page.wait_for_timeout(200)
        page.screenshot(path="verification/popup_loading.png")
        print("Loading screenshot taken")

        # Wait for success state
        # The sendMessage mock has 1000ms delay
        page.wait_for_timeout(1500)
        page.screenshot(path="verification/popup_success.png")
        print("Success screenshot taken")

        browser.close()

if __name__ == "__main__":
    run()
