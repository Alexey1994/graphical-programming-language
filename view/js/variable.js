addElement('variable_name', function(name, element)
{
    element.reference.innerHTML = name
    element.onmouseright = element.parent.onmouseright
})

addElement('variable', function(name, onClick, onmouseright, element)
{
    element.reference.onclick = onClick
    element.onmouseright = onmouseright

    draw(element)
        .variable_name(name)
})