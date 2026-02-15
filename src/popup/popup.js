document.addEventListener('DOMContentLoaded', () => {
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg');
  const labelText = document.querySelector('.center-layout .label-text');
  const riskTitle = document.querySelector('.risk-title');

  // [함수] 점수별 게이지 색상 업데이트
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
      if(meters.high) meters.high.style.setProperty('stroke', '#011139', 'important');
    } else if (score >= 33) {
      currentLevel = 'mid';
      if(meters.mid) meters.mid.style.setProperty('stroke', '#6b62AA', 'important');
    } else {
      currentLevel = 'low';
      if(meters.low) meters.low.style.setProperty('stroke', '#9B9AC4', 'important');
    }

    if (riskTitle) riskTitle.textContent = status;
    applyLabelStyles(currentLevel);
  }

  // [함수] 활성화된 라벨 흰색 강조
  function applyLabelStyles(activeLevel) {
    const levels = ['low', 'mid', 'high'];
    levels.forEach(level => {
      const label = document.getElementById(`txt-${level}`);
      if (label) {
        label.style.fontWeight = "500";
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

  // [함수] 데이터 로드 (테스트용)
  function fetchAndShowRisk() {
    const mockBackendData = { score: 85, status: "고위험" };
    updateDonutGauge(mockBackendData.score, mockBackendData.status);
  }

  // [함수] ON 뷰 전환 실행
  function proceedToOnView() {
    setTimeout(() => {
      viewOff.classList.remove('active');
      setTimeout(() => {
        viewOn.classList.add('active'); 
        if (toOffBtn) toOffBtn.checked = true;
        fetchAndShowRisk(); 
      }, 300);
    }, 200);
  }

  // [이벤트] 메인 토글 ON (보호 활성화)
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
        if (labelText) {
          labelText.style.opacity = '0';
          setTimeout(() => {
            labelText.textContent = "ON";
            labelText.style.left = "25px";
            labelText.style.opacity = '1';
          }, 200);
        }
        if (statusMsg) {
          statusMsg.textContent = "보호가 활성화됨";
          statusMsg.style.color = "#919191";
        }
        
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ lumosDetectEnabled: true });
        }
        proceedToOnView();
      }
    });
  }

  // [이벤트] 미니 토글 OFF (보호 비활성화 및 리셋)
  if (toOffBtn) {
    toOffBtn.addEventListener('change', function() {
      if (!this.checked) {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ lumosDetectEnabled: false });
        }
        
        viewOn.classList.remove('active');
        
        setTimeout(() => {
          viewOff.classList.add('active');
          
          // 토글 및 텍스트 상태 초기화
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
      }
    });
  }
});