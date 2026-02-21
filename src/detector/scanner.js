// 하이라이트 실행 함수
const startAnalysis = async () => { // API 호출(fetch)을 대비해 async를 추가했습니다.
    // 이미 박스가 있으면 중복 생성 방지
    if (document.querySelector('.lumos-ai-highlight')) return;

    console.log("🎯 [Lumos] 분석 및 하이라이트 생성");

    // =========================================================
    //Mock Data 사용
    // =========================================================
    const mockData = [{ x: 150, y: 100, width: 200, height: 150 }];
    
    if (window.applyAiHighlight) {
        window.applyAiHighlight(mockData);
    }

    /* =========================================================
    //실제 API 연동 (나중에 주소 나오면 주석 해제)
    // =========================================================
    try {
        const API_URL = "https://나중에 넣을 주소.com/api/detect"; 
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: window.location.href })
        });
        
        const data = await response.json(); 

        // 서버가 알려준 요소(selector)를 찾아 실제 좌표(DOM) 계산
        const highlights = data.map(item => {
            const el = document.querySelector(item.selector); 
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height
            };
        }).filter(item => item !== null);

        if (window.applyAiHighlight && highlights.length > 0) {
            // API 데이터가 성공적으로 오면 기존 mockData 하이라이트를 지우고 교체 가능
            // window.clearAiHighlight();
            // window.applyAiHighlight(highlights);
        }
    } catch (error) {
        console.error("❌ API 분석 실패:", error);
    }
    ========================================================= */
};

// 하이라이트 제거 함수
const stopAnalysis = () => {
    console.log("🛑 [Lumos] 하이라이트 즉시 제거");
    
    if (window.clearAiHighlight) {
        window.clearAiHighlight();
    }
    
    const overlays = document.querySelectorAll('.lumos-ai-highlight');
    overlays.forEach(el => el.remove());
};

// 스토리지 상태를 체크해서 켜고 끄는 함수
const syncState = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        if (result.lumosDetectEnabled === true) {
            startAnalysis();
        } else {
            stopAnalysis();
        }
    });
};

// 1. 메시지 리스너 (팝업에서 버튼 클릭 시)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_SCAN") startAnalysis();
    if (request.action === "STOP_SCAN") stopAnalysis();
    sendResponse({ status: "done" });
    return true;
});

// 2. 스토리지 감시 (토글 스위치 변경 시 즉시 반응)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.lumosDetectEnabled) {
        console.log("🔄 [Lumos] 상태 변경됨:", changes.lumosDetectEnabled.newValue);
        syncState();
    }
});

// 3. 페이지 로드 시 초기 상태 확인
syncState();