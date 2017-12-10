addElement('argument', function(name, element)
{
    addView(element)
        .argument_name(name)
    //element.reference.innerHTML = name
})

addElement('argument_name', function(name, element)
{
    element.reference.innerHTML = name
})