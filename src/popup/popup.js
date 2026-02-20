document.addEventListener('DOMContentLoaded', () => {
  // 1. UI 요소 로드
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg');
  const labelText = document.querySelector('.center-layout .label-text');
  const riskTitle = document.querySelector('.risk-title');

  function updateDonutGauge(score, status) {
    const meters = {
      high: document.getElementById('meter-high'),
      mid: document.getElementById('meter-mid'),
      low: document.getElementById('meter-low')
    };

    // 초기화 (전체 회색)
    Object.values(meters).forEach(m => { 
      if(m) m.style.setProperty('stroke', '#e0e0e2', 'important'); 
    });

    // 점수 구간별 색상 적용
    let currentLevel = 'low';
    if (score >= 66) {
      currentLevel = 'high';
      if(meters.high) meters.high.style.setProperty('stroke', '#100252', 'important'); 
    } else if (score >= 33) {
      currentLevel = 'mid';
      if(meters.mid) meters.mid.style.setProperty('stroke', '#6D62AA', 'important'); 
    } else {
      currentLevel = 'low';
      if(meters.low) meters.low.style.setProperty('stroke', '#9B9AC4', 'important'); 
    }

    if (riskTitle) riskTitle.textContent = status;
    applyLabelStyles(currentLevel);
  }

  function applyLabelStyles(activeLevel) {
    const levels = ['low', 'mid', 'high'];
    levels.forEach(level => {
      const label = document.getElementById(`txt-${level}`);
      if (label) {
        if (level === activeLevel) {
          label.style.setProperty('color', '#ffffff', 'important');
          label.style.opacity = "1";
        } else {
          label.style.setProperty('color', '#383838', 'important');
          label.style.opacity = "0.4";
        }
      }
    });
  }

  // --- [함수] 화면 전환 로직 ---
  function fetchAndShowRisk() {
    const mockBackendData = { score: 85, status: "고위험" };
    updateDonutGauge(mockBackendData.score, mockBackendData.status);
  }

  // [함수] ON 뷰 전환 실행 (사용자 원본 로직 유지)
  function proceedToOnView() {
    if (statusMsg) {
      statusMsg.textContent = "보호가 활성화됨";
      statusMsg.style.color = "#383838";
    }

    if (labelText) {
      labelText.style.opacity = '0';
      setTimeout(() => {
        labelText.textContent = "ON";
        labelText.style.left = "25px";
        labelText.style.opacity = '1';
      }, 200);
    }

    setTimeout(() => {
      viewOff.classList.remove('active');
      setTimeout(() => {
        viewOn.classList.add('active'); 
        if (toOffBtn) toOffBtn.checked = true;
        fetchAndShowRisk();
      }, 300);
    }, 200);
  }

  // --- [로직] 1. 초기 상태 반영 ---
  chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
    if (result.lumosDetectEnabled) {
      viewOff.classList.remove('active');
      viewOn.classList.add('active');
      if (toOnBtn) toOnBtn.checked = true;
      if (toOffBtn) toOffBtn.checked = true;
      
      if (labelText) {
        labelText.textContent = "ON";
        labelText.style.left = "25px";
      }
      fetchAndShowRisk(); 
    } else {
      viewOff.classList.add('active');
      viewOn.classList.remove('active');
      if (toOnBtn) toOnBtn.checked = false;
    }
  });

  // --- [로직] 2. OFF -> ON 토글 클릭 (원본 유지) ---
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
        // 모달 요청을 보내되, 팝업 화면은 바로 ON 뷰로 넘기도록 유지
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "SHOW_MODAL" });
          }
        });

        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ lumosDetectEnabled: true });
        }
        proceedToOnView();
      }
    });
  }

  // --- [로직] 3. ON -> OFF 토글 클릭 (원본 유지) ---
  if (toOffBtn) {
    toOffBtn.addEventListener('change', function() {
      if (!this.checked) {
        chrome.storage.local.set({ lumosDetectEnabled: false }, () => {
          viewOn.classList.remove('active');
          setTimeout(() => {
            viewOff.classList.add('active');
            if (toOnBtn) toOnBtn.checked = false;
            if (labelText) {
              labelText.textContent = "OFF";
              labelText.style.left = "55px";
              labelText.style.opacity = '1';
            }
            if (statusMsg) {
              statusMsg.textContent = "보호가 비활성화됨";
              statusMsg.style.color = "#bbb";
            }
          }, 300);
        });
      }
    });
  }

  // --- [로직] 4. 모달 완료 신호 수신 ---
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "MODAL_COMPLETE") {
      console.log("✅ 모달 동의 완료 신호 수신");
      // 필요 시 추가 로직 작성 가능
    }
  });
});