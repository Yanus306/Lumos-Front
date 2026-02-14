import textLogoSrc from "../assets/text-logo.svg";

// 글자 로고
const textLogoElement = document.querySelector('#text-logo');
if (textLogoElement) textLogoElement.src = textLogoSrc;




// content.js
import mainLogoSrc from "../assets/main-logo.svg";

// 이미지 로고
const mainLogoElement = document.querySelector('#main-logo');
if (mainLogoElement) mainLogoElement.src = mainLogoSrc;

// 체크박스 감지 로직
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal-overlay');
    const checkboxes = document.querySelectorAll('.modal-container input[type="checkbox"]');

    const handleCheck = () => {
        // 모든 체크박스의 상태 확인
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked) {
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', handleCheck);
    });
});