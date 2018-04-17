addElement('text_input', function(oldText, onChange, element)
{
    var textarea = document.createElement('textarea')
    textarea.value = oldText

    textarea.onkeydown = function(event){
        onChange(event.target.value)
    }

    element.reference.appendChild(textarea)
})