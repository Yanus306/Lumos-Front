window.lumosCapture = {
    takeScreenshot: () => {
        return new Promise(async (resolve, reject) => {
            chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 90 }, async (dataUrl) => {
                try {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    resolve(blob);
                } catch(error) {
                    reject(error)
                }
            })


            // chrome.runtime.sendMessage({ action: "CAPTURE_SCREEN" }, (response) => {
            //     if (response && response.success) {
            //         resolve(response.image);
            //     } else {
            //         reject(response.error || "캡쳐 실패");
            //     }
            // });
        });
    }
};