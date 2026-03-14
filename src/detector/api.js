window.analyzeImage = async (imageBlob, currentX, currentY) => {
    try {
        const response = await fetch(`https://lumos.jongyeol.kr/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            body: imageBlob
        });

        const rawText = await response.text();
        const responseData = JSON.parse(rawText);

        const { riskLevel, results } = responseData;
        const riskMap = {
            2: { status: "위험", level: "high", score: 90 },
            1: { status: "주의", level: "mid", score: 50 },
            0: { status: "안전", level: "low", score: 10 }
        };

        const config = riskMap[riskLevel] || riskMap[0];

        const highlights = (results || []).map(item => ({
            x: Number(item.rect[0]) + currentX,
            y: Number(item.rect[1]) + currentY,
            width: Number(item.rect[2]),
            height: Number(item.rect[3]),
            type: item.patternType,
            confidence: item.yoloConfidence
        }));

        return { ...config, count: highlights.length, predictions: highlights };
    } catch (error) {
        console.error("❌ [Lumos] API 분석 실패:", error);
        throw error;
    }
};