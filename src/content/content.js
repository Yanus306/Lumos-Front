// src/content/content.js

const injectModal = () => {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'lumos-injected-modal';
  
  // 1번 단계에서 완성한 HTML을 그대로 복사해서 넣기
  modalContainer.innerHTML = `
    <div class="lumos-overlay">
      <div class="lumos-box">
        <img src="${chrome.runtime.getURL('assets/text-logo.svg')}" class="modal-logo">
        <h2>다크 패턴 감지!</h2>
        <p>이 사이트에서 사용자를 기만하는 디자인이 발견되었습니다.</p>
        <button id="close-modal">확인</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalContainer);
};

injectModal();