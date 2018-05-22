addElement('rectangle', function(width, height, color, element) {
    var style = element.reference.style

    style.width = width + 'px'
    style.height = height + 'px'
    style.backgroundColor = color
})