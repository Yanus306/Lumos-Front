document.addEventListener('DOMContentLoaded', () => {
  // 1. UI 요소 로드
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg');
  const labelText = document.querySelector('.center-layout .label-text');
  const riskTitle = document.querySelector('.risk-title');

  // --- [함수] 위험 등급별 게이지 업데이트 ---
  function updateDonutGauge(score, status) {
    const meters = {
      high: document.getElementById('meter-high'),
      mid: document.getElementById('meter-mid'),
      low: document.getElementById('meter-low')
    };

    // 게이지 초기화
    Object.values(meters).forEach(m => { 
      if(m) m.style.setProperty('stroke', '#e0e0e2', 'important'); 
    });

    // 점수 구간별 색상 적용 (사용자 정의 색상 반영)
    let currentLevel = 'low';
    if (score >= 66) {
      currentLevel = 'high';
      if(meters.high) meters.high.style.setProperty('stroke', '#100252', 'important'); // 고위험
    } else if (score >= 33) {
      currentLevel = 'mid';
      if(meters.mid) meters.mid.style.setProperty('stroke', '#6D62AA', 'important'); // 중위험
    } else {
      currentLevel = 'low';
      if(meters.low) meters.low.style.setProperty('stroke', '#9B9AC4', 'important'); // 저위험
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
      fetchAndShowRisk(); 
    } else {
      viewOff.classList.add('active');
      viewOn.classList.remove('active');
      if (toOnBtn) toOnBtn.checked = false;
    }
  });

  // --- [로직] 2. OFF -> ON 토글 클릭 ---
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]) return;

          // 해당 탭에 content.js가 살아있는지 확인차 메시지 전송
          chrome.tabs.sendMessage(tabs[0].id, { action: "SHOW_MODAL" }, (response) => {
            if (chrome.runtime.lastError) {
              // 에러가 있다면 content.js가 로드되지 않은 것임 -> 새로고침 안내
              console.error("Content script not responding. Please refresh the page.");
              alert("페이지를 새로고침한 후 다시 시도해주세요!");
            }
          });
        });
        this.checked = false;
      }
    });
  }

  // --- [로직] 3. ON -> OFF 토글 클릭 ---
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
            }
          }, 300);
        });
      }
    });
  }

  // --- [로직] 4. 모달 완료 신호 수신 ---
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "MODAL_COMPLETE") {
      console.log("✅ 모달 동의 확인됨. 화면 전환.");
      if (toOnBtn) toOnBtn.checked = true;
      proceedToOnView();
    }
  });
});