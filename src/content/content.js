console.log("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨");

// [수정] 피그마 디자인 반영: 아주 은은한 배경 + 직각 점선 테두리
const applyAiHighlight = (predictions) => {
    predictions.forEach(item => {
        // 좌표의 중앙점에 있는 실제 HTML 요소를 찾음
        const el = document.elementFromPoint(
            item.x + (item.width / 2) - window.scrollX,
            item.y + (item.height / 2) - window.scrollY
        );

        if (el && el !== document.body) {
            // 1. 빨간 점선 테두리 (직각)
            el.style.setProperty('outline', '2px dashed #FF4D4D', 'important');
            el.style.setProperty('outline-offset', '2px', 'important');
            el.style.setProperty('border-radius', '0', 'important'); 

            // 2. 투명한 빨간색 배경
            el.style.setProperty('background-color', 'rgba(255, 77, 77, 0.05)', 'important');
            
            // 3. 부드러운 전환 효과
            el.style.setProperty('transition', 'all 0.3s', 'important');

            el.title = `[Lumos 감지] ${item.label}`;
            el.classList.add('lumos-detected'); 
        }
    });
};

// 분석 시작 (가짜 데이터로 테스트)
const startAnalysis = () => {
    console.log("🔍 AI 분석 시작...");
    const mockData = [{ x: 500, y: 300, width: 150, height: 80, label: "주의 요망" }];
    applyAiHighlight(mockData);
};

/*나중에 API 연결할 때 코드 수정 위에 부분
const startAnalysis = async () => {
    try {
        // 1. AI 서버에 화면 분석 요청
        const response = await fetch('https://친구의-AI-서버-주소.com/predict');
        const aiData = await response.json(); // AI가 보낸 픽셀 좌표 리스트

        // 2. 받은 진짜 데이터를 우리 강조 함수에 전달
        applyAiHighlight(aiData); 
        
    } catch (error) {
        console.error("오류남", error);
    }
};
이렇게 수정하면 됨 위에는 테스트용 좌표*/

// 체크박스 동의 로직
const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('.lumos-check');
    const modalOverlay = container.querySelector('.lumos-modal-overlay');

    const handleCheck = () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        if (allChecked) {
            chrome.storage.local.set({ lumosDetectEnabled: true }, () => {
                setTimeout(() => {
                    if (modalOverlay) modalOverlay.classList.add('lumos-hidden');
                    chrome.runtime.sendMessage({ action: "MODAL_COMPLETE" });
                    startAnalysis(); 
                }, 300);
            });
        }
    };
    checkboxes.forEach(cb => cb.addEventListener('change', handleCheck));
};

// 모달 주입 함수
const injectModal = () => {
    if (document.querySelector('#lumos-injected-modal')) return;
    const modalContainer = document.createElement('div');
    modalContainer.id = 'lumos-injected-modal';
    const logoUrl = chrome.runtime.getURL("assets/main-logo.svg");

    modalContainer.innerHTML = `
        <div class="lumos-modal-overlay">
            <div class="lumos-modal-container">
                <img src="${logoUrl}" class="lumos-modal-logo" alt="Lumos Logo">
                <div class="lumos-modal-content-box">
                    <div class="lumos-modal-title">개인정보 처리방침</div>
                    <div class="lumos-modal-content-container">안내 문구입니다.</div>
                    <label class="lumos-modal-checkbox">
                        <input type="checkbox" class="lumos-check">
                        <span class="lumos-checkbox-mark"></span>
                        <span class="lumos-checkbox-text">동의합니다</span>
                    </label>
                </div>
                <div class="lumos-modal-content-box">
                    <div class="lumos-modal-title">이용약관</div>
                    <div class="lumos-modal-content-container">약관 내용입니다.</div>
                    <label class="lumos-modal-checkbox">
                        <input type="checkbox" class="lumos-check">
                        <span class="lumos-checkbox-mark"></span>
                        <span class="lumos-checkbox-text">동의합니다</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    document.documentElement.appendChild(modalContainer);
    setupCheckboxLogic(modalContainer);
};

// 초기화 로직
const initLumos = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        if (result.lumosDetectEnabled === true) {
            startAnalysis(); 
        }
    });
};

if (document.readyState === 'complete') {
    initLumos();
} else {
    window.addEventListener('load', initLumos);
}

// 스토리지 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {
        if (changes.lumosDetectEnabled.newValue === false) {
            const existingModal = document.querySelector('#lumos-injected-modal');
            if (existingModal) existingModal.remove();
        }
    }
});

// 팝업 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_MODAL") {
        injectModal(); 
        if (sendResponse) sendResponse({status: "success"});
    }
    return true;
});