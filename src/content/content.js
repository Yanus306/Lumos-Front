console.log("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨");

const initLumos = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        const isEnabled = result && result.lumosDetectEnabled;
        console.log("Current Storage Status:", isEnabled);
        if (isEnabled === true) {
            injectModal();
        }
    });
};

// 로드 시점 확인
if (document.readyState === 'complete') {
    initLumos();
} else {
    window.addEventListener('load', initLumos);
}

// 스토리지 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {
        const isEnabled = changes.lumosDetectEnabled.newValue;
        if (isEnabled === true) {
            if (!document.querySelector('#lumos-injected-modal')) injectModal();
        } else {
            const existingModal = document.querySelector('#lumos-injected-modal');
            if (existingModal) existingModal.remove();
        }
    }
});

// 팝업에서 보내는 직접 메시지 감지
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "SHOW_MODAL") {
        injectModal();
    }
});

/* 모달 주입 */
const injectModal = () => {
    if (document.querySelector('#lumos-injected-modal')) return;
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'lumos-injected-modal';
    
    // image_c87ac0.png 구조에 맞게 수정: dist 루트에 있으므로 파일명만 적음
    const logoUrl = chrome.runtime.getURL("main-logo.svg");

    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-container">
                <img id="main-logo" src="${logoUrl}" alt="로고" class="modal-logo">
                <div class="modal-content-box">
                    <div class="modal-title">개인정보 처리방침</div>
                    <div class="modal-content-container">
                        사용자 개인정보 보호를 위한 안내 문구입니다.
                    </div>
                    <label class="modal-checkbox">
                        <input type="checkbox" name="agree-privacy">
                        <span class="checkbox-mark"></span>
                        <span class="checkbox-text">동의합니다</span>
                    </label>
                </div>
                <div class="modal-content-box">
                    <div class="modal-title">이용약관</div>
                    <div class="modal-content-container">
                        서비스 이용 약관 내용입니다.
                    </div>
                    <label class="modal-checkbox">
                        <input type="checkbox" name="agree-terms">
                        <span class="checkbox-mark"></span>
                        <span class="checkbox-text">동의합니다</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalContainer);
    setupCheckboxLogic(modalContainer);
};

const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const modalOverlay = container.querySelector('.modal-overlay');

    const handleCheck = () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        if (allChecked) {
            setTimeout(() => {
                if (modalOverlay) modalOverlay.style.display = 'none';
                chrome.runtime.sendMessage({ action: "MODAL_COMPLETE" });
            }, 300);
        }
    };

    checkboxes.forEach(cb => cb.addEventListener('change', handleCheck));
};