if (!window.lumosCapture) {
    window.lumosCapture = {
        takeScreenshot: () => {
            return new Promise((resolve, reject) => {
                console.log("📨 [Capture] Background에 캡처 요청 중...");
                
                // Background Script(service worker)에 캡처 요청 전송
                chrome.runtime.sendMessage({ action: "CAPTURE_SCREEN" }, async (response) => {
                    // 응답이 오기 전에 확장 프로그램이 업데이트되거나 연결이 끊기면 에러가 날 수 있음
                    if (chrome.runtime.lastError) {
                        return reject("Runtime Error: " + chrome.runtime.lastError.message);
                    }

                    if (response && response.success) {
                        try {
                            // 받은 dataUrl(Base64)을 Blob(Binary)으로 변환
                            const res = await fetch(response.image);
                            const blob = await res.blob();
                            console.log("✅ [Capture] Blob 변환 완료:", blob);
                            resolve(blob);
                        } catch (error) {
                            reject("Blob 변환 실패: " + error);
                        }
                    } else {
                        reject(response?.error || "캡처 응답 실패");
                    }
                });
            });
        }
    };
}