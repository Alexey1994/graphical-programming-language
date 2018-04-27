addElement('type', function(name, onClick, element)
{
    element.reference.innerHTML = name
    element.reference.onclick = onClick
})