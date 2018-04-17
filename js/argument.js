addElement('argument', function(name, onmouseright, element)
{
    addView(element)
        .argument_name(name)

    element.onmouseright = onmouseright
    console.log(element.onmouseright)
    //element.reference.innerHTML = name
})

addElement('argument_name', function(name, element)
{
    element.reference.innerHTML = name
})