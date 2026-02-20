import textLogoSrc from "../assets/text-logo.svg";

// 글자 로고
const textLogoElement = document.querySelector('#text-logo');
if (textLogoElement) textLogoElement.src = textLogoSrc;

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

// 페이지 로드 시 실행
loadTexts();