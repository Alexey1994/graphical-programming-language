addElement('input_text', function(placeholder, onInput, element)
{
    var input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.setAttribute('placeholder', placeholder)

    input.oninput = function(event)
    {
        element.text = event.target.value
        onInput(element, event)
    }

    element.reference.appendChild(input)
    element.text = input.value
})