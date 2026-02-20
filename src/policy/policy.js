import textLogoSrc from "../assets/text-logo.svg";

// 글자 로고 설정
const textLogoElement = document.querySelector('#text-logo');
if (textLogoElement) textLogoElement.src = textLogoSrc;

// policy data 불러오기 및 렌더링
export async function renderPolicyTexts(privacyId, termsId) {
  try {
    const response = await fetch(chrome.runtime.getURL('data/policy.json'));
    const data = await response.json();

    const privacyElem = document.getElementById(privacyId);
    const termsElem = document.getElementById(termsId);

    const buildHTML = (items) => {
      return items.map(item => {
        const className = item.isHeading ? 'lumos-heading' : '';
        return `<div ${className ? `class="${className}"` : ''}>${item.text}</div>`;
      }).join('');
    };

    if (privacyElem) privacyElem.innerHTML = buildHTML(data.privacyPolicy);
    if (termsElem) termsElem.innerHTML = buildHTML(data.termsOfService);
    
    console.log("✅ 정책 페이지 텍스트 로드 완료");
  } catch (error) {
    console.error("문구 로드 실패:", error);
  }
}

// 페이지 로드 시 실행 (아이디가 존재하는지 확인)
if (document.getElementById('privacy-text')) {
    renderPolicyTexts('privacy-text', 'terms-text');
}