import "./content.css";
import mainLogoSrc from "../assets/main-logo.svg";

// 이미지 로고
const mainLogoElement = document.querySelector('#main-logo');
if (mainLogoElement) mainLogoElement.src = mainLogoSrc;

// 페이지 로드 시 현재 설정 상태 확인
chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
    if (result.lumosDetectEnabled) {
        injectModal();
    }
});

// 스토리지 값이 변경될 때 버튼 On/Off 실시간 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {
        const isEnabled = changes.lumosDetectEnabled.newValue;
        
        if (isEnabled) {
            // 버튼 On 시 모달 없으면 생성
            if (!document.querySelector('#lumos-injected-modal')) {
                injectModal();
            }
        } else {
            // 버튼 Off 시 모달 제거
            const existingModal = document.querySelector('#lumos-injected-modal');
            if (existingModal) existingModal.remove();
        }
    }
});

/* 모달 주입 함수 */
const injectModal = () => {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'lumos-injected-modal';
    
    // 확장 프로그램 내의 리소스 주소를 웹 페이지에서 쓸 수 있는 URL로 변환합니다.
    const logoUrl = chrome.runtime.getURL("assets/main-logo.svg");

    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-container">
                <img src="${logoUrl}" alt="로고" class="modal-logo">
                
                <div class="modal-content-box">
                    <div class="modal-title">개인정보 처리방침</div>
                    <div class="modal-content-container">
                        Cupidatat labore velit in magna elit cillum sint id sit labore ipsum cupidatat minim consectetur. 
                        Est elit sunt irure in sint labore ut proident eiusmod cillum officia duis.
                        (중략...)
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
                        (중략...)
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
                // 팝업에게 "사용자가 동의를 완료했다"는 신호를 보냄
                chrome.runtime.sendMessage({ action: "MODAL_COMPLETE" });
            }, 300);
        }
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', handleCheck);
    });
};