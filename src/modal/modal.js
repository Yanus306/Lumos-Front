console.log("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨");

// 체크박스 동의 로직
const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('.lumos-check');
    const modalOverlay = container.querySelector('.lumos-modal-overlay');

    const handleCheck = () => {
        const checkboxes = container.querySelectorAll('.lumos-check');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked) {
            setTimeout(() => {
                // 알림창 표시
                alert("✅ 동의가 완료되었습니다!\n확인 버튼을 누르면 분석이 시작됩니다.");

                // 모달 제거
                const modalElement = document.querySelector('#lumos-injected-modal');
                if (modalElement) {
                    modalElement.remove();
                    console.log("🗑️ 모달 제거 완료");
                }

                // 스토리지 저장 및 분석 시작
                chrome.storage.local.set({ lumosDetectEnabled: true }, () => {
                    console.log("📸 [Lumos] 동의 완료 후 첫 분석 시작");
                    
                    if (typeof startAnalysis === 'function') {
                        startAnalysis(); 
                    } else {
                        chrome.runtime.sendMessage({ action: "START_SCAN" });
                    }
                });
            }, 100);
        }
    };
    checkboxes.forEach(cb => cb.addEventListener('change', handleCheck));
};

// policy data 불러오기 및 렌더링
async function loadTexts() {
  try {
    const response = await fetch(chrome.runtime.getURL('data/policy.json'));
    const data = await response.json();

    const privacyElem = document.getElementById('privacy-text');
    const termsElem = document.getElementById('terms-text');

    // buildHTML 함수를 아래와 같이 안전한 방식으로 변경
    const buildSafeDOM = (container, items) => {
        container.innerHTML = ''; // 초기화
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = item.isHeading ? 'lumos-heading' : 'lumos-body';
            div.textContent = item.text;
            container.appendChild(div);
        });
    };

    // loadTexts 함수 내부 수정
    if (privacyElem) buildSafeDOM(privacyElem, data.privacyPolicy);
    if (termsElem) buildSafeDOM(termsElem, data.termsOfService);

    console.log("✅ 약관 텍스트 주입 성공");
  } catch (error) {
    console.error("❌ 문구 로드 실패:", error);
  }
}

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

// 초기화 로직
const initLumos = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        if (result.lumosDetectEnabled === true) {
            console.log("🛡️ Lumos 보호 활성화 상태 (이미 동의함)");
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
        console.log("✅ 팝업으로부터 모달 주입 신호 수신");
        injectModal(); 
        if (sendResponse) sendResponse({status: "success"});
    }
    return true;
});