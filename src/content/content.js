console.log("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨");

/* 함수 선언부 (리스너보다 위에 위치하여 Hoisting 에러 방지) */

// 체크박스 로직: 모든 체크박스 선택 시 팝업으로 신호 전송
const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const modalOverlay = container.querySelector('.modal-overlay');

    const handleCheck = () => {
        // allChecked 변수 선언 확인
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked) {
            setTimeout(() => {
                if (modalOverlay) {
                    modalOverlay.style.display = 'none';
                }
                // 팝업으로 완료 신호 전송
                chrome.runtime.sendMessage({ action: "MODAL_COMPLETE" });
                console.log("✅ 모든 약관 동의 완료 신호 전송");
            }, 300);
        }
    };

    checkboxes.forEach(cb => cb.addEventListener('change', handleCheck));
};

// 모달 주입 함수
const injectModal = () => {
    if (document.querySelector('#lumos-injected-modal')) return;
    
    console.log("✅ 모달 주입 시작");
    const modalContainer = document.createElement('div');
    modalContainer.id = 'lumos-injected-modal';
    
    // 로고 경로 설정
    const logoUrl = chrome.runtime.getURL("assets/main-logo.svg");

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

// 초기화 함수
const initLumos = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        const isEnabled = result && result.lumosDetectEnabled;
        console.log("Current Storage Status:", isEnabled);
        if (isEnabled === true) {
            injectModal();
        }
    });
};

/* 실행 및 리스너 등록부 */

// 로드 시점 확인 후 초기화 실행
if (document.readyState === 'complete') {
    initLumos();
} else {
    window.addEventListener('load', initLumos);
}

// 스토리지 변경 감지 (다른 페이지에서의 동기화용)
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
// sender와 sendResponse를 포함하여 정의 (사용하지 않더라도 문법적 완전성 유지)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_MODAL") {
        console.log("✅ 팝업으로부터 모달 주입 신호 수신");
        injectModal();
        if (sendResponse) sendResponse({status: "success"}); 
    }
    return true; // 비동기 응답을 위해 true 반환
});