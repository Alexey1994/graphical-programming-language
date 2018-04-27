addElement('button', function(name, onClick, element)
{
    element.reference.innerHTML = name
    element.reference.onclick = function(event)
    {
        onClick(element, event)
    }
})