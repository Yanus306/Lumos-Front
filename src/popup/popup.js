document.addEventListener('DOMContentLoaded', () => {
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg');
  const labelText = document.querySelector('.center-layout .label-text'); // OFF/ON 글자

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

  // OFF -> ON 토글 클릭 이벤트
  if (toOnBtn) {
    toOnBtn.addEventListener('change', function() {
      if (this.checked) {
        // 1. 상태 메시지 즉시 변경
        if (statusMsg) { 
          statusMsg.textContent = "보호가 활성화됨"; 
          statusMsg.style.color = "#383838"; 
        }

        // 2. 토글 내부 글자 변경 및 위치 이동 (원의 반대편으로)
        if (labelText) {
          labelText.style.opacity = '0'; // 잠시 숨김
          setTimeout(() => {
            labelText.textContent = "ON";
            labelText.style.left = "25px"; // 원이 우측으로 갔으니 글자는 좌측으로
            labelText.style.opacity = '1';
          }, 200);
        }
        
        // 3. 토글 애니메이션(0.4초)을 충분히 보여준 뒤 화면 전환
        setTimeout(() => {
          viewOff.classList.remove('active');
          setTimeout(() => {
            viewOn.classList.add('active');
            if (toOffBtn) toOffBtn.checked = true;
            setTimeout(() => updateRisk('high'), 400); 
          }, 300);
        }, 500); // 0.5초 대기 (토글 이동 감상 시간)
      }
    });
  }

  // ON -> OFF 토글 클릭 이벤트
  if (toOffBtn) {
    toOffBtn.addEventListener('change', function() {
      if (!this.checked) {
        viewOn.classList.remove('active');
        
        setTimeout(() => {
          viewOff.classList.add('active');
          if (toOnBtn) toOnBtn.checked = false;
          
          // 글자 및 상태 메시지 원복
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
});