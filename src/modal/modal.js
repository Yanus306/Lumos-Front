console.log("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨");

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
                        // 애니메이션 후 아예 DOM에서 제거하고 싶다면 아래 주석 해제
                        // setTimeout(() => modalOverlay.closest('#lumos-injected-modal').remove(), 400);
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

    // policy data 불러오기
    loadTexts();

    setupCheckboxLogic(modalContainer);
};

// 초기화 및 스토리지 감지 로직
const initLumos = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        if (result.lumosDetectEnabled === true) {
            console.log("🛡️ Lumos 보호 활성화 상태 (이미 동의함)");
            // 여기서 모달 주입 대신 'AI 분석 시작' 함수 실행
        }
    });
};

// 페이지 로드 시 상태 확인
if (document.readyState === 'complete') {
    initLumos();
} else {
    window.addEventListener('load', initLumos);
}

// 스토리지 변경 감지 (다른 탭에서 OFF 했을 때 모달 제거 등)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {
        // 기능이 꺼졌을 때만 모달 즉시 제거
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

// policy data 불러오기
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