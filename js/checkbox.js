addElement('checkbox', function(state, onChange, element)
{
    var input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.checked = state

    input.onchange = function(){
        onChange(input.checked)
    }

    element.reference.appendChild(input)
})