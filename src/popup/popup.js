console.log("Lumos 팝업 스크립트 로드됨!");

const btn = document.getElementById('test-btn');
const counter = document.getElementById('counter');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  counter.textContent = count;
});