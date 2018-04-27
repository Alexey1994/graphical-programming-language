addElement('function_name', function(name, element)
{
    element.reference.innerHTML = name
    element.onmouseright = element.parent.onmouseright
})

addElement('function', function(name, onClick, onmouseright, element)
{
    element.reference.onclick = onClick
    element.onmouseright = onmouseright

    //element.reference.innerHTML = name

    draw(element)
        .function_name(name)

    /*
    element.reference.onclick = function()
    {
        alert()
    }*/
})