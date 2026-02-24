chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 캡처 요청 처리
    if (request.action === "CAPTURE_SCREEN") {
        try {
            chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 80 }, (dataUrl) => {
                if (chrome.runtime.lastError) {
                    console.error("❌ 캡처 에러:", chrome.runtime.lastError.message);
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

    // 모달 완료 요청 처리
    if (request.action === "MODAL_COMPLETE") {
        console.log("✅ 사용자 약관 동의 완료 수신");
        sendResponse({ success: true });
        return true;
    }
});