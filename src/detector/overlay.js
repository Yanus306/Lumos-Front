function applyAiHighlight(predictions) {
    predictions.forEach(item => {
        const overlay = document.createElement('div');
        // 클래스 이름을 scanner.js가 지우려는 이름과 맞춥니다.
        overlay.className = 'lumos-ai-highlight'; 

        Object.assign(overlay.style, {
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.width}px`,
            height: `${item.height}px`,
            border: '2px dashed #FF0000',
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
            zIndex: '2147483647',
            pointerEvents: 'none'
        });
        document.body.appendChild(overlay);
    });
}

function clearAiHighlight() {
    const overlays = document.querySelectorAll('.lumos-ai-highlight');
    overlays.forEach(el => el.remove());
}

window.applyAiHighlight = applyAiHighlight;
window.clearAiHighlight = clearAiHighlight;