console.log("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨");

// [수정] 피그마 디자인 반영: 아주 은은한 배경 + 직각 점선 테두리
const applyAiHighlight = (predictions) => {
    predictions.forEach(item => {
        const el = document.elementFromPoint(
            item.x + (item.width / 2) - window.scrollX,
            item.y + (item.height / 2) - window.scrollY
        );

        if (el && el !== document.body) {
            el.style.setProperty('outline', '2px dashed #FF4D4D', 'important');
            el.style.setProperty('outline-offset', '2px', 'important');
            el.style.setProperty('border-radius', '0', 'important'); 

            el.style.setProperty('background-color', 'rgba(255, 77, 77, 0.05)', 'important');
            el.style.setProperty('transition', 'all 0.3s', 'important');

            el.title = `[Lumos 감지] ${item.label}`;
            el.classList.add('lumos-detected'); 
        }
    });
};

const startAnalysis = () => {
    console.log("🔍 AI 분석 시작...");
    const mockData = [{ x: 500, y: 300, width: 150, height: 80, label: "주의 요망" }];
    applyAiHighlight(mockData);
};

// 체크박스 동의 로직
const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('.lumos-check');
    const modalOverlay = container.querySelector('.lumos-modal-overlay');

    const handleCheck = () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        if (allChecked) {
            console.log("✅ 모든 약관 동의 완료 - 스토리지 직접 업데이트");
            
            chrome.storage.local.set({ lumosDetectEnabled: true }, () => {
                setTimeout(() => {
                    // 모달 제거
                    if (modalOverlay) {
                        modalOverlay.classList.add('lumos-hidden');
                    }
                    
                    // 팝업 업데이트용 메시지 전송
                    chrome.runtime.sendMessage({ action: "MODAL_COMPLETE" });

                    // 사용자에게 안내 알림창 띄우기
                    alert("✅ 동의가 완료되었습니다!\n확장 프로그램 팝업을 다시 열어 분석 결과를 확인해주세요.");
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
                    <div class="lumos-modal-content-container" id="privacy-text">불러오는 중 ...</div>
                    <label class="lumos-modal-checkbox">
                        <input type="checkbox" class="lumos-check">
                        <span class="lumos-checkbox-mark"></span>
                        <span class="lumos-checkbox-text">동의합니다</span>
                    </label>
                </div>
                <div class="lumos-modal-content-box">
                    <div class="lumos-modal-title">이용약관</div>
                    <div class="lumos-modal-content-container" id="terms-text">불러오는 중 ...</div>
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

    loadTexts();
    setupCheckboxLogic(modalContainer);
};

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

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {
        if (changes.lumosDetectEnabled.newValue === false) {
            const existingModal = document.querySelector('#lumos-injected-modal');
            if (existingModal) existingModal.remove();
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_MODAL") {
        injectModal(); 
        if (sendResponse) sendResponse({status: "success"});
    }
    return true;
});

async function loadTexts() {
  try {
    const response = await fetch(chrome.runtime.getURL('data/policy.json'));
    const data = await response.json();

    const privacyElem = document.getElementById('privacy-text');
    const termsElem = document.getElementById('terms-text');

    if (privacyElem) privacyElem.textContent = data.privacyPolicy.join('\n');
    if (termsElem) termsElem.textContent = data.termsOfService.join('\n');
  } catch (error) {
    console.error("문구 로드 실패:", error);
  }
}