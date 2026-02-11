import TextLogo from "../assets/text-logo.svg";

// 글자 로고
const logoImg = document.querySelector('#text-logo');
logoImg.src = TextLogo;

// main.js
import Logo from "../assets/logo.svg";
// 그림 로고
const logoImg = document.querySelector('#logo');
logoImg.src = Logo;

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