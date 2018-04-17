addElement('branch_selector', function(f, onClick, element)
{
    element.function = f

    element.reference.onclick = function()
    {
        onClick(element)
    }
})