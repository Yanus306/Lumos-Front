const startAnalysis = async () => { 
    if (document.querySelector('.lumos-ai-highlight')) return;

    console.log("🎯 [Lumos] 분석 및 하이라이트 생성");

    // =========================================================
    // Mock Data 사용 (현재 주석 처리됨)
    // =========================================================
    /*
    const mockData = [{ x: 500, y: 420, width: 400, height: 600 }];
    
    if (typeof window.applyAiHighlight === 'function') {
        window.applyAiHighlight(mockData);
    } else {
        console.error("❌ 에러: applyAiHighlight 함수를 찾을 수 없습니다.");
    }
    */

    // =========================================================
    // 실제 API 연동 (캡쳐 기능 포함)
    // =========================================================
    try {
        console.log("📸 [Lumos] 화면 캡쳐 요청 중...");
        const imageBlob = await window.lumosCapture.takeScreenshot();

        console.log("🚀 [Lumos] BE로 데이터 전송 중...");
        const response = await fetch(`https://lumos.jongyeol.kr/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            body: imageBlob
        });
        
        const data = await response.json(); 
        console.log("📦 [Lumos] 서버 응답 원본:", data); // 서버가 준 쌩 데이터를 확인

        if (!Array.isArray(data) || data.length === 0) {
            console.log("✅ [Lumos] 검출된 다크 패턴이 없습니다.");
            return;
        }

        const highlights = data.map(item => {
            // 좌표 값이 숫자인지 꼭 확인해야 합니다.
            const x = Number(item.rect[0]) + window.scrollX;
            const y = Number(item.rect[1]) + window.scrollY;
            
            return {
                x: x,
                y: y,
                width: Number(item.rect[2]),
                height: Number(item.rect[3]),
                type: item.patternType, 
                riskLevel: item.risk.level,
                score: item.risk.score 
            };
        });

        // 표 형태로 깔끔하게 로그 출력 (X, Y 좌표가 0이 아닌지 확인 가능)
        console.table(highlights); 

        if (window.applyAiHighlight) {
            window.applyAiHighlight(highlights);
        }
    } catch (error) {
        console.error("❌ [Lumos] API 분석 실패:", error);
    }
};

const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}

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
        // 1. 활성화 상태인지 확인
        // 2. 현재 화면에 모달이 없는지 확인 (최초 동의 중에는 자동 실행 방지)
        const isModalPresent = document.querySelector('#lumos-injected-modal');

        if (result.lumosDetectEnabled === true && !isModalPresent) {
            console.log("🛡️ [Lumos] 이미 동의됨 - 자동 분석 시작");
            setTimeout(startAnalysis, 1000); 
        } else {
            // 아직 동의 전이거나 비활성 상태면 아무것도 하지 않음
            if (!result.lumosDetectEnabled) stopAnalysis();
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