window.removeElement = (predictions) => {
    let notRemovedItems = [];
    const THRESHOLD = 50; // 정확도 보고 조정
    const elements = Array.from(document.querySelectorAll('body *:not(script):not(style):not(link)')).filter(item => {
        const rect = item.getBoundingClientRect();
        return rect.width !== 0 && rect.height !== 0;
    });
    let needRemoveElements = [];

    predictions.forEach(item => {
        if(item.type !== 'dark_pattern_0') {
            notRemovedItems.push(item);
            return;
        }
        let closestElements = [];
        let minScore = Infinity;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();

            score_w = Math.abs(rect.width - item.width);
            score_h = Math.abs(rect.height - item.height);

            const score_a = (Math.max(0, Math.pow(Math.floor(Math.abs(rect.left - item.x)), 2)) +
                Math.max(0, Math.pow(Math.floor(Math.abs(rect.top - item.y)), 2)) +
                Math.pow(Math.floor(score_w), 2) +
                Math.pow(Math.floor(score_h), 2)
            );

            const score = Math.sqrt(score_a);
            if (score < minScore) {
                minScore = score;
                closestElements = [el];
            } else if(score === minScore) {
                closestElements.push(el);
            }
        });
        if(minScore <= THRESHOLD) {
            needRemoveElements.push(...closestElements);
            console.log('Target found. Score:', minScore, "Element:", closestElements);
        } else {
            console.log('No matching element found for prediction. Minimum score:', minScore, ", Prediction:", item);
            notRemovedItems.push(item);
        }
    });

    needRemoveElements.forEach(el => {
        el.style.setProperty('display', 'none', 'important');
    });

    return notRemovedItems;
};