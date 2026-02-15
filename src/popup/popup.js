document.addEventListener('DOMContentLoaded', () => {
  // UI 요소 로드
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg');
  const labelText = document.querySelector('.center-layout .label-text');
  const riskTitle = document.querySelector('.risk-title');

  // --- [상대방 기능] 점수 및 게이지 UI 업데이트 ---
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

  // --- [통합 기능] 데이터 로드 및 화면 전환 ---
  
  // 데이터 로드 (실제 데이터나 Mock 데이터를 가져와 게이지 업데이트)
  function fetchAndShowRisk() {
    const mockBackendData = { score: 85, status: "고위험" };
    updateDonutGauge(mockBackendData.score, mockBackendData.status);
  }

  // ON 뷰 전환 실행 (모달이 닫힌 후 호출됨)
  function proceedToOnView() {
    // 1. 상태 메시지 업데이트
    if (statusMsg) {
      statusMsg.textContent = "보호가 활성화됨";
      statusMsg.style.color = "#383838";
    }

    // 2. 토글 내부 글자 변경 애니메이션
    if (labelText) {
      labelText.style.opacity = '0';
      setTimeout(() => {
        labelText.textContent = "ON";
        labelText.style.left = "25px";
        labelText.style.opacity = '1';
      }, 200);
    }

    // 3. 뷰 전환 애니메이션
    setTimeout(() => {
      viewOff.classList.remove('active');
      setTimeout(() => {
        viewOn.classList.add('active'); 
        if (toOffBtn) toOffBtn.checked = true; // 미니 토글 상태 맞춤
        fetchAndShowRisk(); // 게이지 데이터 로드 및 출력
      }, 300);
    }, 200);
  }

  // --- [이벤트] 1. OFF -> ON 메인 토글 (모달 신호 전송) ---
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
        chrome.storage.local.set({ lumosDetectEnabled: true }, () => {
          console.log("✅ [Lumos] 스토리지 저장 완료");
          
          // [추가] 현재 활성화된 탭에 직접 메시지 전송
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: "SHOW_MODAL" });
            }
          });
        });
        this.checked = false; // 대기 상태 유지
      }
    });
  }

  // --- [이벤트] 2. ON -> OFF 미니 토글 (보호 비활성화) ---
  if (toOffBtn) {
    toOffBtn.addEventListener('change', function() {
      if (!this.checked) {
        // 스토리지 해제 및 뷰 리셋
        chrome.storage.local.set({ lumosDetectEnabled: false });
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
      }
    });
  }

  // --- [이벤트] 3. Content Script로부터 모달 완료 신호 수신 ---
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "MODAL_COMPLETE") {
      console.log("✅ [Lumos] 사용자가 모달에 동의함. 화면 전환 시작.");
      // 실제 토글 상태를 ON으로 바꾸고 뷰 전환 실행
      if (toOnBtn) toOnBtn.checked = true;
      proceedToOnView();
    }
  });
});