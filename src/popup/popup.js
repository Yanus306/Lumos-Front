document.addEventListener('DOMContentLoaded', () => {
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg');
  const labelText = document.querySelector('.center-layout .label-text');

  const levels = ['low', 'mid', 'high'];

  function updateRisk(targetLevel) {
    levels.forEach(level => {
      const meterPiece = document.getElementById(`meter-${level}`);
      const targetLabel = document.getElementById(`txt-${level}`);

      if (level === targetLevel) {
        if (meterPiece) meterPiece.classList.add('active');
        if (targetLabel) {
          targetLabel.style.opacity = "1";
          targetLabel.style.fontWeight = "900";
          targetLabel.style.transform = "translate(-50%, -50%) scale(1.1)"; 
        }
      } else {
        if (meterPiece) meterPiece.classList.remove('active');
        if (targetLabel) {
          targetLabel.style.opacity = "0.4";
          targetLabel.style.fontWeight = "500";
          targetLabel.style.transform = "translate(-50%, -50%) scale(1)";
        }
      }
    });
  }

  // --- 핵심: 모달이 닫혔을 때 실행될 화면 전환 함수 ---
  function proceedToOnView() {
    // 1. 상태 메시지 즉시 변경
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
    
    // 3. 화면 전환
    setTimeout(() => {
      viewOff.classList.remove('active');
      setTimeout(() => {
        viewOn.classList.add('active');
        if (toOffBtn) toOffBtn.checked = true;
        setTimeout(() => updateRisk('high'), 400); 
      }, 300);
    }, 500);
  }

  // --- 1. OFF -> ON 토글 클릭 (모달 띄우기 신호만 보냄) ---
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
        // 확실하게 값을 저장하고 콜백으로 확인
        chrome.storage.local.set({ "lumosDetectEnabled": true }, () => {
          console.log("✅ 저장소에 true 저장 완료");
        });
        
        // 모달이 뜨는 동안 버튼이 체크 상태로 남지 않게 하려면 아래 유지
        this.checked = false; 
      }
    });
  }

  // --- 2. 스토리지 감시 (모달이 다 닫혔는지 확인) ---
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lumosDetectEnabled) {
      const isEnabled = changes.lumosDetectEnabled.newValue;
      
      // 모달 내 체크박스가 다 눌려서 content.js가 hidden 처리를 하고 
      // 만약 스토리지 상태를 변경한다면 여기서 감지하여 proceedToOnView() 실행
      // (지금 로직상으로는 모달이 떴다는 것 자체가 이미 On 신호이므로, 
      //  별도의 '완료' 신호를 추가하면 더 완벽합니다.)
      
      // 테스트용: 버튼 누르면 바로 실행되게 하려면 위 1번에서 바로 실행하거나, 
      // 완료 신호를 따로 만드세요.
    }
  });

  // --- 3. ON -> OFF 토글 클릭 ---
  if (toOffBtn) {
    toOffBtn.addEventListener('change', function() {
      if (!this.checked) {
        chrome.storage.local.set({ lumosDetectEnabled: false });
        viewOn.classList.remove('active');
        
        setTimeout(() => {
          viewOff.classList.add('active');
          if (toOnBtn) toOnBtn.checked = false;
          if (labelText) {
            labelText.textContent = "OFF";
            labelText.style.left = "65.29px";
          }
          if (statusMsg) { 
            statusMsg.textContent = "보호가 비활성화됨"; 
            statusMsg.style.color = "#bbb"; 
          }
          updateRisk('none');
        }, 300);
      }
    });
  }

  chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "MODAL_COMPLETE") {
          // 모달이 닫혔으니 이제 팝업 버튼을 ON으로 옮기고 다음 페이지로!
          if (toOnBtn) toOnBtn.checked = true;
          proceedToOnView();
      }
  });
});