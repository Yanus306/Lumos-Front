const renderedHighlights = new Set();

function applyAiHighlight(predictions) {
    predictions.forEach(item => {
        // 좌표를 기반으로 고유 키 생성 (오차 범위 고려하여 정수 변환)
        const key = `${Math.round(item.x)},${Math.round(item.y)},${Math.round(item.width)},${Math.round(item.height)}`;
        
        // 이미 동일한 위치에 하이라이트가 있다면 건너뜁니다.
        if (renderedHighlights.has(key)) return;

        const overlay = document.createElement('div');
        overlay.className = 'lumos-ai-highlight'; 
        
        // 중복 방지를 위해 데이터 속성에 키 저장
        overlay.dataset.highlightKey = key;

        Object.assign(overlay.style, {
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.width}px`,
            height: `${item.height}px`,
            border: '2px dashed #FF0000',
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
            zIndex: '2147483647',
            pointerEvents: 'none'
        });

        document.body.appendChild(overlay);
        
        // 그려진 하이라이트 목록에 추가
        renderedHighlights.add(key);
    });
}

function clearAiHighlight() {
    const overlays = document.querySelectorAll('.lumos-ai-highlight');
    overlays.forEach(el => el.remove());
    // 전체 제거 시 저장된 좌표 목록도 초기화
    renderedHighlights.clear();
}

window.applyAiHighlight = applyAiHighlight;
window.clearAiHighlight = clearAiHighlight;

// 팝업(popup.js)에서 보낸 메시지를 수신하는 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_HIGHLIGHT") {
        console.log("🎨 [Lumos] 하이라이트 표시 명령 수신");
        
        // 스토리지에 저장된 마지막 분석 데이터를 가져와서 다시 그립니다.
        chrome.storage.local.get(["lastRiskData"], (result) => {
            if (result.lastRiskData && result.lastRiskData.predictions) {
                applyAiHighlight(result.lastRiskData.predictions);
            } else {
                console.log("ℹ️ 표시할 분석 데이터가 없습니다.");
            }
        });
    } 
    else if (request.action === "HIDE_HIGHLIGHT") {
        console.log("🚫 [Lumos] 하이라이트 제거 명령 수신");
        clearAiHighlight();
    }
});