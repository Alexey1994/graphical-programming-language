function clearCanvas(canvasContext){
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height)
}

function drawLine(canvasContext, x1, y1, x2, y2){
    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.lineWidth = 1
    canvasContext.strokeStyle = '#487F7E'
    canvasContext.stroke();
}