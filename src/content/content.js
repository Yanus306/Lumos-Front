console.error("🚨🚨🚨 LUMOS IS ALIVE! 🚨🚨🚨"); 
console.log("Lumos 주입 성공!");

import "../../src/common.css";
import "../content/content.css";
import mainLogoSrc from "../assets/main-logo.svg";

/* 초기화 함수 */
const initLumos = () => {
    chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
        // 결과값이 undefined이거나 null인 경우를 대비한 방어 코드
        const isEnabled = result && result.lumosDetectEnabled;
        console.log("Current Storage Status:", isEnabled);
        
        if (isEnabled === true) {
            injectModal();
        }
    });
};

// 페이지 로드 상태 확인 후 실행
if (document.readyState === 'complete') {
    initLumos();
} else {
    window.addEventListener('load', initLumos);
}

/*// 페이지 로드 시 현재 설정 상태 확인
chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
    console.log("Current Storage Status:", result.lumosDetectEnabled);
    if (result.lumosDetectEnabled) {
        injectModal();
    }
});*/

// 스토리지 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {

        const newValue = changes.lumosDetectEnabled.newValue;
        const isEnabled = typeof newValue === 'object' ? newValue.enabled : newValue;
        
        console.log("Storage Changed. New Value:", isEnabled);
        
        if (isEnabled === true) {
            if (!document.querySelector('#lumos-injected-modal')) {
                injectModal();
            }
        } else {
            const existingModal = document.querySelector('#lumos-injected-modal');
            if (existingModal) existingModal.remove();
        }
    }
});

/* 모달 주입 함수 */
const injectModal = () => {
    if (document.querySelector('#lumos-injected-modal')) return;
    
    console.log("Injecting Modal into Body...");
    const modalContainer = document.createElement('div');
    modalContainer.id = 'lumos-injected-modal';
    
    // 확장 프로그램 내의 리소스 주소 URL로 변환
    const logoUrl = chrome.runtime.getURL("assets/main-logo.svg");

    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-container">
                <img id="main-logo" src="${logoUrl}" alt="로고" class="modal-logo">
                
                <div class="modal-content-box">
                    <div class="modal-title">개인정보 처리방침</div>
                    <div class="modal-content-container">
                        Cupidatat labore velit in magna elit cillum sint id sit labore ipsum cupidatat minim consectetur. 
                        Est elit sunt irure in sint labore ut proident eiusmod cillum officia duis.
                        Fugiat pariatur ipsum nisi est nulla adipisicing excepteur.
                        Esse deserunt ut velit incididunt eiusmod duis aute duis enim. Sunt culpa exercitation commodo ipsum est sunt laborum. Cillum aliquip velit nisi deserunt minim. Lorem eu ad pariatur consectetur et sit deserunt eiusmod et.
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
                        Esse deserunt ut velit incididunt eiusmod duis aute duis enim. 
                        Sunt culpa exercitation commodo ipsum est sunt laborum.
                        Cillum aliquip velit nisi deserunt minim. Lorem eu ad pariatur consectetur et sit deserunt eiusmod et.
                        Cupidatat labore velit in magna elit cillum sint id sit labore ipsum cupidatat minim consectetur. Est elit sunt irure in sint labore ut proident eiusmod cillum officia duis. Fugiat pariatur ipsum nisi est nulla adipisicing excepteur.
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

    // 이미지 로고 설정
    const mainLogoElement = modalContainer.querySelector('#main-logo');
    if (mainLogoElement) {
        mainLogoElement.src = mainLogoSrc;
    }

    // 주입 직후 체크박스 이벤트 바인딩
    setupCheckboxLogic(modalContainer);
};

/* 체크박스 감지 및 자동 닫기 로직 */
const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const modalOverlay = container.querySelector('.modal-overlay');

    const handleCheck = () => {
        // 모든 체크박스가 체크되었는지 확인
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        // handleCheck 함수 내부
        if (allChecked) {
            setTimeout(() => {
                modalOverlay.classList.add('hidden');
                // 팝업에게 사용자 동의 신호 전송
                chrome.runtime.sendMessage({ action: "MODAL_COMPLETE" });
            }, 300);
        }
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', handleCheck);
    });
};