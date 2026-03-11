const style = document.createElement('style');
style.textContent = `
    /* 표시(하이라이트) OFF 상태일 때 */
    body.lumos-display-off .lumos-ai-highlight {
        display: none !important;
    }
    /* 삭제 OFF 상태일 때 (숨겨진 요소 다시 보이기) */
    body.lumos-remove-off .lumos-hidden-element {
        visibility: visible !important;
    }
    /* 삭제 ON 상태일 때 기본 숨김 */
    .lumos-hidden-element {
        visibility: hidden !important;
    }
`;
document.head.appendChild(style);

let scrollTimeout;
let isAnalyzing = false; // 중복 분석 방지 플래그
let lastAnalyzedY = -9999; // 마지막으로 분석한 위치 저장

const startAnalysis = async () => { 
    const currentY = window.scrollY;
    // 화면 높이의 70%를 임계값으로 설정
    const threshold = window.innerHeight * 0.7;

    // 1. 이미 분석 중이면 중단
    if (isAnalyzing) return;
    
    // 2. [서버 보호] 현재 위치가 마지막 분석 위치와 너무 가까우면 스킵
    if (Math.abs(currentY - lastAnalyzedY) < threshold) {
        console.log("⏭️ [Lumos] 이미 분석한 영역과 겹칩니다. 캡처를 건너뜁니다.");
        return;
    }

    isAnalyzing = true;
    console.log("🎯 [Lumos] 분석 및 하이라이트 생성");

    try {
        console.log("📸 [Lumos] 화면 캡쳐 요청 중...");
        const currentX = window.scrollX;

        // Caching element positions
        window.positionSnapshot = new Map();

        document.querySelectorAll('body *:not(script):not(style):not(link)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.width === 0 || rect.height === 0) return;

            // Visible check
            if(rect.top >= window.innerHeight ||
                rect.bottom <= 0 ||
                rect.left >= window.innerWidth ||
                rect.right <= 0) return;

            positionSnapshot.set(el, {
                x: rect.left + currentX,
                y: rect.top + currentY,
                width: rect.width,
                height: rect.height
            });
        });

        const imageBlob = await window.lumosCapture.takeScreenshot();

        console.log("🚀 [Lumos] BE로 데이터 전송 중...");
        const response = await fetch(`https://lumos.jongyeol.kr/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            body: imageBlob
        });
        
        // JSON 에러 방지: 텍스트로 먼저 받고 검사
        const rawText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(rawText);
        } catch (e) {
            console.error("❌ [Lumos] JSON 파싱 에러:", rawText);
            isAnalyzing = false;
            return;
        }

        console.log("📦 [Lumos] 서버 응답 원본:", responseData);

        // BE 데이터 추출
        const { riskLevel, results } = responseData; 
        const totalCount = results ? results.length : 0;

        // 위험도 기본값 설정
        let finalStatus = "안전";
        let finalLevel = "low";
        let displayScore = 10;

        // BE에서 넘겨준 riskLevel(0:안전, 1:주의, 2:위험)에 따라 분리
        if (riskLevel === 2) {
            // 고위험(High)
            finalStatus = "위험";
            finalLevel = "high";
            displayScore = 90; 
        } else if (riskLevel === 1) {
            // 중위험(Medium)
            finalStatus = "주의";
            finalLevel = "mid";
            displayScore = 50;
        } else {
            // 저위험(Low)
            finalStatus = "안전";
            finalLevel = "low";
            displayScore = 10;
        }

        // 하이라이트 데이터 생성
        const highlights = results.map(item => {
            const x = Number(item.rect[0]) + currentX;
            const y = Number(item.rect[1]) + currentY;
            
            return {
                x: x,
                y: y,
                width: Number(item.rect[2]),
                height: Number(item.rect[3]),
                type: item.patternType, 
                confidence: item.yoloConfidence
            };
        });

        // 스토리지에 저장 (팝업 UI 업데이트용)
        chrome.storage.local.set({ 
            lastRiskData: { 
                score: displayScore, 
                status: finalStatus, 
                level: finalLevel,
                count: totalCount,
                predictions: highlights
            } 
        });

        console.table(highlights);

        let notRemovedElements;
        if(window.removeElement) {
            notRemovedElements = window.removeElement(highlights, positionSnapshot);
        } else {
            notRemovedElements = highlights;
        }
        if (window.applyAiHighlight) {
            window.applyAiHighlight(notRemovedElements);
        }

        // 초기 클래스 상태 반영
        chrome.storage.local.get(['displayEnabled', 'removeEnabled'], (res) => {
            if (res.displayEnabled === false) document.body.classList.add('lumos-display-off');
            if (res.removeEnabled === false) document.body.classList.add('lumos-remove-off');
        });

        // 3. 분석 성공 후 위치 기록 업데이트
        lastAnalyzedY = currentY;

    } catch (error) {
        console.error("❌ [Lumos] API 분석 실패:", error);
    } finally {
        isAnalyzing = false; 
    }
};

// 하이라이트 제거 함수
const stopAnalysis = () => {
    console.log("🛑 [Lumos] 하이라이트 즉시 제거");
    lastAnalyzedY = -9999; // 위치 기록 초기화
    
    if (window.clearAiHighlight) {
        window.clearAiHighlight();
    }
    
    const overlays = document.querySelectorAll('.lumos-ai-highlight');
    overlays.forEach(el => el.remove());
};

// 스토리지 상태를 체크해서 켜고 끄는 함수
const syncState = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        const isModalPresent = document.querySelector('#lumos-injected-modal');

        if (result.lumosDetectEnabled === true && !isModalPresent) {
            console.log("🛡️ [Lumos] 이미 동의됨 - 자동 분석 시작");
            lastAnalyzedY = -9999; // 초기 실행을 위해 위치 초기화
            setTimeout(startAnalysis, 1000); 
        } else {
            if (!result.lumosDetectEnabled) stopAnalysis();
        }
    });
};

// 1. 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_SCAN") startAnalysis();
    if (request.action === "STOP_SCAN") stopAnalysis();
    sendResponse({ status: "done" });
    return true;
});

// 2. 스토리지 감시
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.lumosDetectEnabled) {
        console.log("🔄 [Lumos] 상태 변경됨:", changes.lumosDetectEnabled.newValue);
        syncState();
    }
});

// 3. 스크롤 감지 리스너
const handleScroll = () => {
    // 사용자가 스크롤을 멈추고 600ms 후에 실행 (서버 보호를 위해 조금 더 여유를 둠)
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
            const isModalPresent = document.querySelector('#lumos-injected-modal');
            // 분석 중이 아니고, 모달이 없을 때만 새 구역 여부 확인 후 실행
            if (result.lumosDetectEnabled === true && !isModalPresent) {
                startAnalysis();
            }
        });
    }, 600); 
};

// 초기 실행 및 리스너 등록
syncState();
window.addEventListener('scroll', handleScroll);