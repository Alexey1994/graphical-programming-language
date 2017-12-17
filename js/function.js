addElement('function_name', function(name, element)
{
    element.reference.innerHTML = name
})

addElement('function', function(name, onClick, element)
{
    element.reference.onclick = onClick

    draw(element)
        .function_name(name)
    /*
    element.reference.onclick = function()
    {
        alert()
    }*/
})