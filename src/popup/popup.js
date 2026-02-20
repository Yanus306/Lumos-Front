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
      low: document.getElementById('meter-low'),
      mid: document.getElementById('meter-mid'),
      high: document.getElementById('meter-high')
    };

    // 1. 모든 영역 초기화 (색상 리셋)
    Object.values(meters).forEach(m => {
      if (m) m.classList.remove('active');
    });

    // 2. 점수에 따른 등급 판별
    let currentLevel = 'low';
    if (score >= 66) {
      currentLevel = 'high';
    } else if (score >= 33) {
      currentLevel = 'mid';
    } else {
      currentLevel = 'low';
    }

    // 3. 해당 영역 활성화 및 텍스트 업데이트
    const targetMeter = meters[currentLevel];
    if (targetMeter) {
      targetMeter.classList.add('active');
    }

    if (riskTitle) {
      riskTitle.textContent = status;
    }

    applyLabelStyles(currentLevel);
  }

  function applyLabelStyles(activeLevel) {
    const levels = ['low', 'mid', 'high'];
    levels.forEach(level => {
      const label = document.getElementById(`txt-${level}`);
      if (label) {
        label.style.color = '#ffffff';
        
        if (level === activeLevel) {
          label.style.fontWeight = '800';
          label.style.opacity = "1";  
        } else {
          label.style.fontWeight = '400'; 
          label.style.opacity = "1";
        }
      }
    });
  }

  // 화면 업데이트 및 데이터 페칭
  function fetchAndShowRisk() {
    // 임시 데이터 사용 (추후 백엔드 연결 부위)
    const mockBackendData = { score: 85, status: "고위험" };
    console.log("📊 UI 업데이트 데이터:", mockBackendData);
    updateDonutGauge(mockBackendData.score, mockBackendData.status);
  }

  // --- [함수] ON 뷰 전환 실행 ---
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

  // --- [로직] 2. OFF -> ON 토글 클릭 ---
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
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
      fetchAndShowRisk();
    }
  });

  // --- [로직] 5. 정책 및 약관 링크 클릭 시 새 탭 열기 ---
  const policyLink = document.querySelector('.policy-link');
  if (policyLink) {
    policyLink.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('policy/policy.html')});
    });
  }
});