let hiddenElements = [];

window.removeElement = (predictions, positionSnapshot) => {
    
    let notRemovedItems = [];
    const THRESHOLD = 50; // 정확도 보고 조정

    predictions.forEach(item => {
        if(item.type !== 'dark_pattern_0') {
            notRemovedItems.push(item);
            return;
        }

        let closestEl = null;
        let minScore = Infinity;

        positionSnapshot.forEach((pos, el) => {
            const score = Math.sqrt(
                Math.pow(pos.x - item.x, 2) +
                Math.pow(pos.y - item.y, 2) +
                Math.pow(pos.width - item.width, 2) +
                Math.pow(pos.height - item.height, 2)
            );
            if (score < minScore) {
                minScore = score;
                closestEl = el;
            }
        });

        if(minScore <= THRESHOLD && closestEl) {
            // 요소를 직접 숨기는 대신 클래스만 부여
            closestEl.classList.add('lumos-hidden-element');
            if (!hiddenElements.includes(closestEl)) hiddenElements.push(closestEl);
        } else {
            notRemovedItems.push(item);
        }
    });
    return notRemovedItems;
};
//팝업에서 보낸 메시지를 수신하는 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_REMOVAL") {
        document.body.classList.remove('lumos-remove-off');
    } else if (request.action === "STOP_REMOVAL") {
        document.body.classList.add('lumos-remove-off');
    }
    sendResponse({ status: "done" });
});