addElement('type', function(name, onClick, onmouseright, element)
{
    element.reference.innerHTML = name
    element.reference.onclick = onClick
    element.onmouseright = onmouseright
})