addElement('argument_menu', function(constants, onSelectConstant, variables, onSelectVariable, functions, onSelectFunction, functionArguments, onSelectArgument, element)
{
    var reference = element.reference
    var searchText = ''
    var menuBody

    var constantsBodyParent
    var constantsBody

    var variablesBodyParent
    var variablesBody

    var functionsBodyParent
    var functionsBody

    var argumentsBodyParent
    var argumentsBody

    reference.onclick = function(event){
        menuBody.reference.style.display = 'inline-block'
    }

    function updateFields(parent, body, list, onselect, searchText){
        parent.elements = []
        body.reference.innerHTML = ''

        for(var i in list){
            var field = list[i]
                    
            function drawField(field, i){
                parent
                    .label(field.name)
                    .begin()
                        .inner(function(parent){
                            var label = parent.structureParent

                            label.reference.onclick = function(event){
                                menuBody.reference.style.display = 'none'
                                onselect(field)
                                event.stopPropagation()
                            }
                        })
                    .end()
            }

            if(typeof searchText == 'undefined' || field.name.indexOf(searchText) >= 0)
                drawField(field, i)
        }
    }

    addView(element)
        .block()
        .begin()
            .inner(function(parent){
                menuBody = parent.structureParent
            })

            .input_text('поиск', '', function(element){
                searchText = element.text
                updateFields(constantsBodyParent, constantsBody, constants, onSelectConstant, searchText)
                updateFields(variablesBodyParent, variablesBody, variables, onSelectVariable, searchText)
                updateFields(functionsBodyParent, functionsBody, functions, onSelectFunction, searchText)
                updateFields(argumentsBodyParent, argumentsBody, functionArguments, onSelectArgument, searchText)
            })
            .divider()

            .inner_block()
            .begin()
                .label('константы')
                .block()
                .begin()
                    .inner(function(parent){
                        constantsBodyParent = parent
                        constantsBody = parent.structureParent

                        updateFields(constantsBodyParent, constantsBody, constants, onSelectConstant, searchText)
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('переменные')
                .block()
                .begin()
                    .inner(function(parent){
                        variablesBodyParent = parent
                        variablesBody = parent.structureParent

                        updateFields(variablesBodyParent, variablesBody, variables, onSelectVariable, searchText)
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('функции')
                .block()
                .begin()
                    .inner(function(parent){
                        functionsBodyParent = parent
                        functionsBody = parent.structureParent

                        updateFields(functionsBodyParent, functionsBody, functions, onSelectFunction, searchText)
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('аргументы')
                .block()
                .begin()
                    .inner(function(parent){
                        argumentsBodyParent = parent
                        argumentsBody = parent.structureParent

                        updateFields(argumentsBodyParent, argumentsBody, functionArguments, onSelectArgument, searchText)
                    })
                .end()
            .end()
        .end()

    menuBody.reference.style.display = 'none'
})