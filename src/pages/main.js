import TextLogo from "../assets/text-logo.svg";

// 글자 로고
const TextLogo = document.querySelector('#text-logo');
TextLogo.src = TextLogo;


// content.js
import MainLogo from "../assets/main-logo.svg";
// 그림 로고
const MainLogo = document.querySelector('#main-logo');
MainLogo.src = MainLogo;

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('lumos-modal');
    const closeX = document.getElementById('close-modal-btn');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    // 닫기 함수
    const closeModal = () => {
        modal.classList.add('hidden');
    };

    closeX.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', closeModal);

    // 배경 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});