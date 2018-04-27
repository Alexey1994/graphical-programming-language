var DocumentElements = {
    begin: addView,

    end: function()
    {
        return this.thisParent
    },

    inner: function(f)
    {
        f(this)
        return this
    }
}


function addElement(name, handler)
{
    DocumentElements[name] = function()
    {
        var self = this
        var element = {
            reference: document.createElement(name),
            parent:    self.structureParent,
            children:  []
        }

        element.reference.element = element
        this.elements.push(element)

        var handlerCall = 'handler('

        for(var i=0; i<arguments.length; ++i)
            handlerCall += 'arguments[' + i + '],'

        handlerCall += 'element)'

        eval(handlerCall)
        this.structureParent.reference.appendChild(element.reference)

        return this
    }
}


function addView(structureParent)
{
    var self

    if(this.structureParent)
    {
        structureParent = this.elements[ this.elements.length - 1 ]
        self = this
    }

    var elements = {}

    for(var i in DocumentElements)
        elements[i] = DocumentElements[i]

    elements.thisParent      = self
    elements.structureParent = structureParent,
    elements.elements        = structureParent.children

    return elements
}


function draw(structureParent)
{
    if(!structureParent)
        structureParent = {
            reference: document.body,
            children:  []
        }

    structureParent.reference.innerHTML = ''
    return addView(structureParent)
}