addElement('menu', function(list, onChange, element)
{
    addView(element)
        .menu_values()

    var menu_values = element.children[0]

    element.onChange = onChange
    element.reference.onmousedown = function(event)
    {
        menu_values.reference.style.display = 'block'

        //if(event.clientX + menu_values.reference.clientWidth + 2 < document.body.clientWidth)
            menu_values.reference.style.left = event.layerX + 'px'
        //else
        //    menu_values.reference.style.left = (document.body.clientWidth - menu_values.reference.clientWidth - 2) + 'px'

        //if(event.clientY + menu_values.reference.clientHeight + 2 < document.body.clientHeight)
            menu_values.reference.style.top = event.layerY + 'px'
        //else
        //    menu_values.reference.style.top = (document.body.clientHeight - menu_values.reference.clientHeight - 2) + 'px'
    }

    for(var i in list)
        addView(menu_values)
            .menu_value(list[i])
})


addElement('menu_values', function(element)
{
})


addElement('menu_value', function(f, element)
{
    element.reference.innerHTML = f.name
    element.reference.onmousedown = function(event)
    {
        var menu = element.parent.parent
        menu.onChange(f, element)
        element.parent.reference.style.display = 'none'
        event.stopPropagation()
    }
})