addElement('argument', function(name, onmouseright, element)
{
    addView(element)
        .argument_name(name)

    element.onmouseright = onmouseright
})

addElement('argument_name', function(name, element)
{
    element.reference.innerHTML = name
})