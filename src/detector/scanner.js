// src/detector/scanner.js
let scrollTimeout;
let isAnalyzing = false;
let lastAnalyzedY = -9999;

const startAnalysis = async () => {
    const currentY = window.scrollY;
    const currentX = window.scrollX;
    const threshold = window.innerHeight * 0.7;

    if (isAnalyzing || Math.abs(currentY - lastAnalyzedY) < threshold) return;

    isAnalyzing = true;
    try {
        // 1. DOM Snapshot 생성 (remover.js에서 사용)
        window.positionSnapshot = new Map();
        document.querySelectorAll('body *:not(script):not(style):not(link)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                window.positionSnapshot.set(el, {
                    x: rect.left + currentX,
                    y: rect.top + currentY,
                    width: rect.width,
                    height: rect.height
                });
            }
        });

        // 2. 캡처 (capture.js의 window.lumosCapture 사용)
        const imageBlob = await window.lumosCapture.takeScreenshot();
        
        // 3. 분석 (api.js의 window.analyzeImage 사용)
        const resultData = await window.analyzeImage(imageBlob, currentX, currentY);

        // 4. 저장
        chrome.storage.local.set({ lastRiskData: resultData });

        // 5. 제거 로직 실행 (remover.js)
        const notRemoved = window.removeElement(resultData.predictions, window.positionSnapshot);

        // 6. 하이라이트 표시 (overlay.js)
        window.applyAiHighlight(notRemoved);

        lastAnalyzedY = currentY;
    } catch (error) {
        console.error("스캔 실패:", error);
    } finally {
        isAnalyzing = false;
    }
};

const stopAnalysis = () => {
    lastAnalyzedY = -9999;
    if (window.clearAiHighlight) window.clearAiHighlight();
    document.querySelectorAll('.lumos-ai-highlight').forEach(el => el.remove());
};

const syncState = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        if (result.lumosDetectEnabled === true && !document.querySelector('#lumos-injected-modal')) {
            lastAnalyzedY = -9999;
            setTimeout(startAnalysis, 1000);
        } else if (!result.lumosDetectEnabled) {
            stopAnalysis();
        }
    });
};

window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        chrome.storage.local.get(['lumosDetectEnabled'], (res) => {
            if (res.lumosDetectEnabled && !document.querySelector('#lumos-injected-modal')) {
                startAnalysis();
            }
        });
    }, 600);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_SCAN") startAnalysis();
    if (request.action === "STOP_SCAN") stopAnalysis();
    sendResponse({ status: "done" });
    return true;
});

syncState();