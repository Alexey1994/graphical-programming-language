addElement('combobox', function(list, onChange, element)
{
    element.onChange = onChange

    addView(element)
        .combobox_selected()
        .combobox_values()

    var values = element.children[1]

    for(var i in list)
        addView(values)
            .combobox_value(list[i])
})


addElement('combobox_selected', function(element)
{
    var combobox_search     = document.createElement('input')
    combobox_search.value   = ''
    
    combobox_search.onfocus = function()
    {
        element.parent.children[1].reference.style.display = 'block'
    }
    
    //combobox_search.onblur  = function(event)
    //{
        //element.parent.children[1].reference.style.display = 'none'
    //}

    element.reference.appendChild(combobox_search)
    element.combobox_search = combobox_search

    element.reference.oninput = function(event)
    {
        var values = element.parent.children[1].children

        for(var i=0; i<values.length; ++i)
        {
            var value = values[i]

            if(value.reference.innerHTML.indexOf(combobox_search.value) < 0)
                value.reference.style.display = 'none'
            else
                value.reference.style.display = 'block'
        }
    }
})


addElement('combobox_values', function(element)
{
})


addElement('combobox_value', function(text, element)
{
    element.reference.innerHTML = text
    element.reference.onclick = function(event)
    {
        var combobox          = element.parent.parent
        var combobox_selected = combobox.children[0]
        combobox_selected.combobox_search.value = text
        combobox.onChange(text)
        element.parent.reference.style.display = 'none'
    }
})