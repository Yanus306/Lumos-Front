let lumosHost = null;
let lumosShadow = null;
let lastPredictions = []; // 좌표 저장을 위한 변수

window.applyAiHighlight = function (predictions) {
  lastPredictions = predictions; // 좌표 저장
  window.clearAiHighlight();

  // 1. Shadow Host 생성
  lumosHost = document.createElement("div");
  lumosHost.id = "lumos-highlight-host";

  // Host는 화면에 고정
  Object.assign(lumosHost.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
  });

  document.documentElement.appendChild(lumosHost);
  lumosShadow = lumosHost.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .lumos-ai-highlight {
        position: fixed; /* fixed로 고정하여 가시성 확보 */
        border: 2px dashed #FF4D4D; 
        background-color: #ff4d4d0d;
        pointer-events: none;
        box-sizing: border-box;
    }
  `;
  lumosShadow.appendChild(style);

  // 2. 박스 그리기 실행
  renderBoxes();

  // 3. 스크롤할 때마다 박스 위치 재계산 (이게 핵심!)
  window.removeEventListener("scroll", renderBoxes);
  window.addEventListener("scroll", renderBoxes);
};

// 실시간 위치 계산 함수
function renderBoxes() {
  if (!lumosShadow || lastPredictions.length === 0) return;

  // 기존 박스들 위치만 업데이트하거나 새로 그림
  lumosShadow
    .querySelectorAll(".lumos-ai-highlight")
    .forEach((el) => el.remove());

  lastPredictions.forEach((item) => {
    const overlay = document.createElement("div");
    overlay.className = "lumos-ai-highlight";

    const currentX = item.x - window.scrollX;
    const currentY = item.y - window.scrollY;

    Object.assign(overlay.style, {
      left: `${currentX}px`,
      top: `${currentY}px`,
      width: `${item.width}px`,
      height: `${item.height}px`,
    });
    lumosShadow.appendChild(overlay);
  });
}

window.clearAiHighlight = function () {
  window.removeEventListener("scroll", renderBoxes);
  if (lumosHost) {
    lumosHost.remove();
    lumosHost = null;
    lumosShadow = null;
  }
};
