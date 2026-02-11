document.addEventListener('DOMContentLoaded', () => {
  
  const toOnBtn = document.getElementById('to-on-btn');
  const toOffBtn = document.getElementById('to-off-btn');
  const viewOff = document.getElementById('view-off');
  const viewOn = document.getElementById('view-on');
  const statusMsg = document.getElementById('status-msg'); 

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
        console.log("토글 켜짐!"); // 작동 확인용
        if (statusMsg) { 
          statusMsg.textContent = "보호가 활성화됨"; 
          statusMsg.style.color = "#919191"; 
        }
        
        // 1. 현재 화면 살짝 내리면서 사라지게
        viewOff.classList.remove('active');
        
        setTimeout(() => {
          // 2. 다음 화면 나타나게
          viewOn.classList.add('active');
          // 3. 상단 미니 토글도 ON 상태로 동기화
          if (toOffBtn) toOffBtn.checked = true;
          // 4. 분석 게이지 작동
          setTimeout(() => updateRisk('high'), 400); 
        }, 300);
      }
    });
  }

  // ON -> OFF 토글 클릭 이벤트
  if (toOffBtn) {
    toOffBtn.addEventListener('change', function() {
      if (!this.checked) {
        console.log("토글 꺼짐!"); // 작동 확인용
        viewOn.classList.remove('active');
        
        setTimeout(() => {
          viewOff.classList.add('active');
          if (toOnBtn) toOnBtn.checked = false;
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