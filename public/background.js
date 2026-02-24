chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CAPTURE_SCREEN") {
        try {
            chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true, image: dataUrl });
                }
            });
        } catch (e) {
            sendResponse({ success: false, error: e.message });
        }
        return true; 
    }
});