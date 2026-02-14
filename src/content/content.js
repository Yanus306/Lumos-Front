import mainLogoSrc from "../assets/main-logo.svg";

// 이미지 로고
const mainLogoElement = document.querySelector('#main-logo');
if (mainLogoElement) mainLogoElement.src = mainLogoSrc;

const injectModal = () => {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'lumos-injected-modal';
  
  const logoUrl = chrome.runtime.getURL("assets/main-logo.svg");

  modalContainer.innerHTML = `
    <div class="modal-overlay">
        <div class="modal-container">
            <img src="${logoUrl}" alt="로고" class="modal-logo">
            <div class="modal-content-box">
                <div class="modal-title">개인정보 처리방침</div>
                <div class="modal-content-container">
                    Cupidatat labore velit...
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
                    Esse deserunt ut velit...
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

  // 주입된 후 체크박스 로직 설정
  setupCheckboxLogic(modalContainer);
};

// 체크박스 감지 및 자동 닫기 로직
const setupCheckboxLogic = (container) => {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const modalOverlay = container.querySelector('.modal-overlay');

    const handleCheck = () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        if (allChecked) {
            setTimeout(() => {
                modalOverlay.classList.add('hidden');
                // 아예 DOM에서 제거하고 싶다면 아래 주석 해제
                // container.remove(); 
            }, 300);
        }
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', handleCheck);
    });
};

injectModal();