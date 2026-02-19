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

    // 게이지 색상 초기화 (회색으로)
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

    // 화면 중앙에 "고위험" 등 텍스트 표시
    if (riskTitle) riskTitle.textContent = status;
    applyLabelStyles(currentLevel);
  }

  function fetchAndShowRisk() {
    // 실제 서버가 없으니 임시 데이터 사용
    const mockBackendData = { score: 85, status: "고위험" };
    
    console.log("📊 게이지 업데이트 시작:", mockBackendData);
    updateDonutGauge(mockBackendData.score, mockBackendData.status);
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
  function proceedToOnView() {
    // --- [1단계] 토글 스위치만 먼저 ON으로 변경 ---
    // 첫 번째 화면에 있는 체크박스를 체크하여 원이 이동하게 합니다.
    if (toOnBtn) {
        toOnBtn.checked = true;
    }

    // 레이블 텍스트를 ON으로 변경 (위치 이동 애니메이션 포함)
    if (labelText) {
        labelText.textContent = "ON";
        labelText.style.left = "25px";
    }

    if (statusMsg) {
        statusMsg.textContent = "보호 활성화 중...";
    }

    // --- [2단계] 첫 번째 화면 상태에서 '잠시 멈춤' ---
    // 사용자가 스위치가 바뀐 것을 인지할 수 있도록 시간을 줍니다.
    const pauseTime = 1000; // 💡 1초 동안 첫 화면 유지 (원하는 대로 조절하세요)

    setTimeout(() => {
        // --- [3단계] 이제서야 두 번째 화면으로 전환 ---
        // 1. 첫 번째 화면 페이드 아웃 시작
        viewOff.classList.remove('active');

        // 2. CSS 트랜지션(0.4s)이 끝날 때쯤 두 번째 화면 등장
        setTimeout(() => {
            viewOn.classList.add('active');
            
            // 두 번째 화면의 상단 미니 토글도 ON 상태로 맞춰줌
            if (toOffBtn) toOffBtn.checked = true;
            
            if (statusMsg) {
                statusMsg.textContent = "보호가 활성화됨";
            }

            // 게이지 로드
            fetchAndShowRisk();
        }, 400); // .page-view의 transition 시간과 맞춤
        
    }, pauseTime);
  }

  // --- [로직] 1. 초기 상태 반영 ---
  chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
      if (result.lumosDetectEnabled) {
          console.log("📡 스토리지에서 ON 상태 감지 - 화면 전환");
          
          // UI 요소들을 ON 상태로 즉시 변경
          viewOff.classList.remove('active');
          viewOn.classList.add('active');
          if (toOnBtn) toOnBtn.checked = true;
          if (toOffBtn) toOffBtn.checked = true; // ON 뷰 내의 토글도 ON으로
          
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
        // 이미 활성화된 상태인지 확인
        chrome.storage.local.get(['lumosDetectEnabled'], (result) => {
          if (result.lumosDetectEnabled) {
            // 이미 동의했다면 모달 없이 바로 전환
            proceedToOnView();
          } else {
            // 처음 켜는 것이라면 모달 요청
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (!tabs[0]) return;
              chrome.tabs.sendMessage(tabs[0].id, { action: "SHOW_MODAL" });
            });
            // 모달 동의 전까지는 버튼을 다시 OFF 상태로 시각적 유지
            this.checked = false;
          }
        });
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
      console.log("✅ 모달 동의 확인됨. 스토리지 업데이트 및 화면 전환.");
      
      // 모달 동의 완료 시 스토리지에 ON 상태 저장
      chrome.storage.local.set({ lumosDetectEnabled: true }, () => {
        if (toOnBtn) toOnBtn.checked = true;
        proceedToOnView(); // 게이지 화면으로 전환하는 기존 함수 실행
      });
    }
  });
});