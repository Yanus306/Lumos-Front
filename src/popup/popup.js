document.addEventListener("DOMContentLoaded", () => {
  // 1. UI 요소 로드
  const toOnBtn = document.getElementById("to-on-btn");
  const toOffBtn = document.getElementById("to-off-btn");
  const viewOff = document.getElementById("view-off");
  const viewOn = document.getElementById("view-on");
  const statusMsg = document.getElementById("status-msg");
  const labelText = document.querySelector(".center-layout .label-text");

  // --- [함수] 위험 등급별 게이지 업데이트 ---
  function updateDonutGauge(score, status) {
    const meters = {
      low: document.getElementById("meter-low"),
      mid: document.getElementById("meter-mid"),
      high: document.getElementById("meter-high"),
    };

    // 1. 모든 영역 초기화 (색상 리셋)
    Object.values(meters).forEach((m) => {
      if (m) m.classList.remove("active");
    });

    // 2. 점수에 따른 등급 판별 및 활성화
    let currentLevel = "low";
    if (score >= 66) {
      currentLevel = "high";
    } else if (score >= 33) {
      currentLevel = "mid";
    } else {
      currentLevel = "low";
    }

    // 3. 해당 영역에 active 클래스 추가 (색상 점등)
    const targetMeter = meters[currentLevel];
    if (targetMeter) {
      targetMeter.classList.add("active");
    }

    applyLabelStyles(currentLevel);
  }

  // 에러 방지를 위해 fetchAndShowRisk 함수도 확실히 정의
  function fetchAndShowRisk() {
    chrome.storage.local.get(["lastRiskData"], (result) => {
      const data = result.lastRiskData || { score: 0, status: "데이터 없음", level: "low" };
      updateDonutGauge(data.score, data.status, data.level);
    });
  }

  function updateDonutGauge(score, status, level) {
    const meters = {
      low: document.getElementById("meter-low"),
      mid: document.getElementById("meter-mid"),
      high: document.getElementById("meter-high"),
    };

    // 1. 초기화
    Object.values(meters).forEach(m => m?.classList.remove("active"));

    // 2. 전달받은 level("low", "mid", "high")에 따라 활성화
    if (meters[level]) {
      meters[level].classList.add("active");
    }
    
    applyLabelStyles(level);
  }

  function applyLabelStyles(activeLevel) {
    const levels = ["low", "mid", "high"];
    levels.forEach((level) => {
      const label = document.getElementById(`txt-${level}`);
      if (label) {
        label.style.color = "#ffffff";

        if (level === activeLevel) {
          label.style.fontWeight = "800";
          label.style.opacity = "1";
        } else {
          label.style.fontWeight = "400";
          label.style.opacity = "1";
        }
      }
    });
  }

  // --- [함수] 화면 전환 로직 ---
  function proceedToOnView() {
    // 이미 ON 화면이면 실행 안 함
    if (viewOn.classList.contains("active")) return;

    console.log("🎬 애니메이션 시작 - 5초 대기");

    if (toOnBtn) toOnBtn.checked = true;
    if (labelText) {
      labelText.textContent = "ON";
      labelText.style.left = "25px";
    }
    if (statusMsg) {
      statusMsg.textContent = "보호 활성화 중...";
    }

    const pauseTime = 500; // 전환 지연 시간 (0.5초)

    setTimeout(() => {
      console.log("⌛ 5초 경과 - 화면 전환");
      viewOff.classList.remove("active");

      setTimeout(() => {
        viewOn.classList.add("active");
        if (toOffBtn) toOffBtn.checked = true;
        if (statusMsg) statusMsg.textContent = "보호가 활성화됨";
        fetchAndShowRisk();
      }, 400);
    }, pauseTime);
  }

  // --- [로직] 1. 초기 상태 반영 ---
  chrome.storage.local.get(["lumosDetectEnabled"], (result) => {
    if (result.lumosDetectEnabled) {
      console.log("📡 ON 상태 감지 - 애니메이션 여부 확인");

      // 현재 화면이 OFF 상태(view-off에 active가 있음)라면,
      // 팝업이 방금 열린 것이므로 애니메이션 함수를 호출합니다.
      if (viewOff.classList.contains("active")) {
        proceedToOnView();
      } else {
        // 이미 ON 화면이라면 (중복 방지) 즉시 UI 세팅
        viewOff.classList.remove("active");
        viewOn.classList.add("active");
        if (toOnBtn) toOnBtn.checked = true;
        if (toOffBtn) toOffBtn.checked = true;
        if (labelText) {
          labelText.textContent = "ON";
          labelText.style.left = "25px";
        }
        fetchAndShowRisk();
      }
    } else {
      viewOff.classList.add("active");
      viewOn.classList.remove("active");
      if (toOnBtn) toOnBtn.checked = false;
    }
  });

  // --- [로직] 2. OFF -> ON 토글 클릭 ---
  if (toOnBtn) {
    toOnBtn.addEventListener("change", function () {
      if (this.checked) {
        chrome.storage.local.get(["lumosDetectEnabled"], (result) => {
          if (result.lumosDetectEnabled) {
            proceedToOnView();
          } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (!tabs[0] || !tabs[0].id) return;

              // ✅ 딱 요기! 콜백 함수와 lastError 체크만 추가해서 에러를 씹어버립니다.
              chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "SHOW_MODAL" },
                () => {
                  if (chrome.runtime.lastError) {
                    // 에러가 나도 콘솔에 조용히 기록만 남기고 팝업은 죽이지 않음
                    console.log(
                      "ℹ️ [Lumos] 이 페이지는 컨텐트 스크립트가 실행되지 않는 페이지입니다.",
                    );
                  }
                },
              );
            });
            // 모달이 뜰 때까지 버튼 상태만 일단 유지 (원래 코드 유지)
            this.checked = false;
          }
        });
      }
    });
  }

  // --- [로직] 3. ON -> OFF 토글 클릭 ---
  if (toOffBtn) {
    toOffBtn.addEventListener("change", function () {
      if (!this.checked) {
        chrome.storage.local.set({ lumosDetectEnabled: false }, () => {
          viewOn.classList.remove("active");
          setTimeout(() => {
            viewOff.classList.add("active");
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

  // --- [로직] 5. 정책 및 약관 링크 클릭 시 새 탭 열기 ---
  const policyLink = document.querySelector(".policy-link");
  if (policyLink) {
    policyLink.addEventListener("click", () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("policy/policy.html") });
    });
  }
});
