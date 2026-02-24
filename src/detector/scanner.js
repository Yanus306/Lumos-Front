const startAnalysis = async () => {
  // 중복 실행 방지
  if (document.getElementById("lumos-highlight-host")) return;

  console.log("🎯 [Lumos] 분석 시작");

  // ---------------------------------------------------------
  // STEP 1: API 데이터 가져오기 (미래 작업 영역)
  // ---------------------------------------------------------
  // let apiData = [];
  // try {
  //     const response = await fetch("https://api.yourserver.com/detect");
  //     apiData = await response.json();
  // } catch (e) { console.error("API 호출 실패", e); }

  // 현재는 테스트를 위해 임시 데이터(Mock Data) 사용
  const mockData = [{ x: 300, y: 250, width: 450, height: 60 }];

  // ---------------------------------------------------------
  // STEP 2: 셀렉터를 좌표로 변환하기 (미래 작업 영역)
  // API가 { selector: ".ad" } 처럼 요소를 지정해서 줄 경우 사용합니다.
  // ---------------------------------------------------------
  /*
    const highlights = apiData.map(item => {
        const element = document.querySelector(item.selector); 
        if (element) {
            const rect = element.getBoundingClientRect(); 
            return {
                x: rect.left + window.scrollX, 
                y: rect.top + window.scrollY, 
                width: rect.width,            
                height: rect.height            
            };
        }
        return null;
    }).filter(h => h !== null); // 없는 요소는 제외
    */

  // ---------------------------------------------------------
  // STEP 3: 화면에 그리기 명령
  // ---------------------------------------------------------
  if (typeof window.applyAiHighlight === "function") {
    // API 연동 후에는 applyAiHighlight(highlights)로 변수를 바꾸기
    window.applyAiHighlight(mockData);
  }
};

/**
 * 하이라이트 즉시 제거
 */
const stopAnalysis = () => {
  console.log("🛑 [Lumos] 제거");
  if (window.clearAiHighlight) window.clearAiHighlight();
};

/**
 * 확장 프로그램 상태(On/Off) 동기화
 */
const syncState = () => {
  chrome.storage.local.get(["lumosDetectEnabled"], (result) => {
    result.lumosDetectEnabled ? startAnalysis() : stopAnalysis();
  });
};

// --- 이벤트 리스너 설정 (수정 필요 없음) ---

// 1. 팝업에서 버튼 클릭 시 반응
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "START_SCAN") startAnalysis();
  if (request.action === "STOP_SCAN") stopAnalysis();
  return true;
});

// 2. 스토리지(On/Off 설정) 변경 감지
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lumosDetectEnabled) syncState();
});

// 3. 페이지 로딩 완료 시점에 자동 실행 체크
if (document.readyState === "complete") {
  syncState();
} else {
  window.addEventListener("load", syncState);
}
