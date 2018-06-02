var programBody
var canvasContext
var currentBranchSelector

var types = []
var constants = []

var primitiveTypes = [
    {name: 'массив бит'},
    {name: 'адрес'},
    {name: 'вложенный тип'}
]

var functions = [
    {
        name: 'старт программы',
        arguments: [],
        combinations: [
            {
                combination: [],
                variables: [],
                body: [],
                translate: ''
            }
        ],
        currentCombination: 0
    }
]

var currentConstant
var currentFunction = functions[0]
var currentFunctionInCustomTranslateMode = false
var translateFunctionCall = "//call\nvar address = (combination.beginAddress - out.address - 4 + 1) & 65535\nout.write(0xE8);\n    out.write(address % 256); out.write((address / 256) % 256);\nout.write(0x50);\n\n//jump\nif(typeof call.branch !== 'undefined'){\n    address = (body[call.branch].beginAddress - out.address - 7) & 65535\n\n    out.write(0x83); out.write(0xF8); //cmp ax, 0\n        out.write(0x00);\n                                \n    out.write(0x0F); out.write(0x84); //je address\n        out.write(address % 256); out.write((address / 256) % 256);\n}" //call 0x00; push ax


function functionIndex(f){
    for(var i=0; i<functions.length; ++i)
        if(functions[i] == f)
            return i
}


function variableIndex(combination, variable){
    for(var i=0; i<combination.variables.length; ++i)
        if(combination.variables[i] == variable)
            return i
}


function constantIndex(constant){
    for(var i=0; i<constants.length; ++i)
        if(constants[i] == constant)
            return i
}


function typeIndex(type){
    for(var i=0; i<types.length; ++i)
        if(type == types[i])
            return i
}


function primitiveTypeIndex(primitiveType){
    for(var i = 0; i < primitiveTypes.length; ++i)
        if(primitiveType == primitiveTypes[i])
            return i
}


function get_combination(f){
    return f.combinations[f.currentCombination]
}


function allAllowedFunctions(f, argumentNumber){
    var allowedFunctions = []

    for(var i in constants)
        allowedFunctions.push(constants[i])

    for(var i in currentFunction.arguments)
        allowedFunctions.push(currentFunction.arguments[i])

    var variables = get_combination(currentFunction).variables

    for(var i in variables)
        allowedFunctions.push(variables[i])

    for(var i in functions)
        allowedFunctions.push(functions[i])

    return allowedFunctions
}


function drawTypeBody(parent, type){
    parent
        .label('выбранный тип:')
        .label(currentType.name)
        .divider()

        .menu(primitiveTypes, function(type){
            if(type == primitiveTypes[0]){
                if(!currentType.type || currentType.type.type != type){
                    currentType.type = {
                        type:  primitiveTypes[0],
                        value: 0
                    }
                }

                redraw()
            }
            else if(type == primitiveTypes[1]) {
                if(!currentType.type || currentType.type.type != type){
                    currentType.type = {
                        type:  primitiveTypes[1],
                        value: ''
                    }
                }

                redraw()
            }
            else if(type == primitiveTypes[2]) {
                if(!currentType.type || currentType.type.type != type){
                    currentType.type = {
                        type:  primitiveTypes[2],
                        value: []
                    }
                }

                redraw()
            }
        })
        .divider()
        .inner(function(parent){
            if(!currentType.type)
                return

            if(currentType.type.type == primitiveTypes[0]){
                parent
                    .label('количество бит')
                    .input_text('', currentType.type.value, function(element, event){
                        var value = parseInt(event.target.value)

                        if(value)
                            currentType.type.value = value
                        else
                            currentType.type.value = 0
                    })

                //parent.structureParent.children[parent.structureParent.children.length - 1].reference.childNodes[0].value = currentType.type.value
            }
            else if(currentType.type.type == primitiveTypes[1]) {
                parent
                    .label('описание адреса:')
                    .input_text('', currentType.type.value, function(element, event){
                        var value = parseInt(event.target.value)

                        if(value)
                            currentType.type.value = value
                        else
                            currentType.type.value = 0
                    })
            }
            else if(currentType.type.type == primitiveTypes[2]) {
                parent
                    .vertical_space()
                    .inner(function(parent) {
                        currentType.type.value.forEach(function(innerType, i) {
                            parent
                                .menu(types, function(selectedType) {
                                    currentType.type.value.splice(i, 0, {
                                        name: '',
                                        type: selectedType
                                    })

                                    redraw()
                                })
                                .divider()
                                .rectangle(20, 20, '#aaa')
                                .input_text('имя', innerType.name, function(event) {
                                    innerType.name = event.text
                                })
                                .label(innerType.type.name)
                                .divider()
                        })

                        parent
                            .menu(types, function(selectedType) {
                                currentType.type.value.push({
                                    name: '',
                                    type: selectedType
                                })

                                redraw()
                            })
                    })
                    .divider()
            }
        })
}

var is10ConstantValueRepresentation = true
var isBitConstantValueRepresentation = false

function drawBitsArrayConstant(parent, constant) {
    parent
        .label('представление:')
        .divider()
            .label('десятичное')
            .checkbox(is10ConstantValueRepresentation, function(state){
                is10ConstantValueRepresentation = state
                redraw()
            })
        .divider()
            .label('битовое')
            .checkbox(isBitConstantValueRepresentation, function(state){
                isBitConstantValueRepresentation = state
                redraw()
            })
        .divider()

    if(is10ConstantValueRepresentation){
        parent
            .label('десятичное значение')
            .input_text('', constant.value, function(element, event){
                var value = parseInt(event.target.value)

                if(value)
                    constant.value = value
                else
                    constant.value = 0
            })
            .divider()
    }

    if(isBitConstantValueRepresentation){
        var bitValue = ''
        var t = constant.value

        while(t) {
            if(t % 2)
                bitValue = '1' + bitValue
            else
                bitValue = '0' + bitValue

            t >>= 1//t /= 2
        }

        parent
            .label('битовое значение')
            .input_text('', bitValue, function(element, event){
                var value = 0//parseInt(event.target.value)
                var selector = 1

                for(var i = event.target.value.length; i; --i) {
                    if(event.target.value[i - 1] == '1')
                        value += selector

                    selector *= 2
                }

                constant.value = value
            })
            .divider()
    }
}

function drawCompositeConstant(parent, constant){
    parent
        .label('тип константы: ')
        .label(constant.type.name)
        .divider()
        .inner(function(parent){
            /*for(var i in constant.type.type.value){
                var currentField = constant.type.type.value[i]

                console.log(currentField)
            }*/

            constant.type.type.value.forEach(function(currentField, index){
                parent
                    .label(currentField.name)
                    .inner(function(parent){
                        function drawConstantField(field){
                            if(field.type.type.type == primitiveTypes[0]){
                                parent
                                    .input_text('', constant.value[index], function(element, event){
                                        constant.value[index] = parseInt(element.text)
                                    })
                            }
                            else if(field.type.type.type == primitiveTypes[2]){
                                alert('recursive type not support')
                            }
                        }

                        drawConstantField(currentField)
                    })
                    .divider()
            })
        })
}

function drawConstantBody(parent, constant){
    parent
        .label('выбранная константа:')
        .label(currentConstant.name)
        .divider()

        .menu(types, function(type){
            console.log(type)

            constant.type = type

            if(type.type.type == primitiveTypes[0]){
                constant.value = 0
            }
            else if(type.type.type == primitiveTypes[2]){
                constant.value = []

                for(var i in type.type.value){
                    var currentType = type.type.value[i]

                    if(currentType.type.type.type == primitiveTypes[0]){
                        constant.value.push(0)
                    }
                    else{
                        console.log('error: recursive structures not implemented')
                    }
                }
            }

            redraw()
        })
        .divider()

    if(constant.type && constant.type.type){
        var type = constant.type.type.type

        if(type == primitiveTypes[0])
            drawBitsArrayConstant(parent, constant)
        else if(type == primitiveTypes[2])
            drawCompositeConstant(parent, constant)
    }
}


function drawVariable(parent, variable, parentList, indexInParentList){
    parent
        .variable(
            variable.name,
            
            function(event){

            },

            function(event){
                parent
                    .button('удалить', function() {
                        parentList.splice(indexInParentList, 1)

                        redraw()
                    })
            }
        )
}


function drawConstant(parent, constant, parentList, indexInParentList){
    parent
        .constant(
            constant.name,
            
            function(event){

            },

            function(event){
                parent
                    .button('удалить', function() {
                        parentList.splice(indexInParentList, 1)

                        redraw()
                    })
            }
        )
}


function drawArgumentSelector(parent, f, selectedArguments, i){
    parent
        .cell()
        .begin()
            .argument_menu(
                constants,
                function(constant){
                    selectedArguments[i] = {
                        constant: constant
                    }

                    redraw()
                },

                get_combination(currentFunction).variables,
                function(variable){
                    selectedArguments[i] = {
                        variable: variable
                    }

                    redraw()
                },

                functions,
                function(f){
                    selectedArguments[i] = {
                        function: f,
                        arguments: [] //?
                    }

                    redraw()
                }
            )
        .end()
}

function drawArgument(parent, f, argumentDescription, selectedArguments, i){
    parent
        .argument(argumentDescription.label, function(argumentElement){
            console.log(argumentElement)
        })
        .begin()
            .inner(function(argumentBody){
                if(selectedArguments[i]){
                    if(selectedArguments[i].function)
                        drawFunction(argumentBody, selectedArguments[i].function, selectedArguments[i].arguments, selectedArguments, i)
                    else if(selectedArguments[i].variable)
                        drawVariable(argumentBody, selectedArguments[i].variable, selectedArguments, i)
                    else if(selectedArguments[i].constant)
                        drawConstant(argumentBody, selectedArguments[i].constant, selectedArguments, i)
                }
                else
                    drawArgumentSelector(argumentBody, f, selectedArguments, i)
            })     
        .end()
}

function drawFunction(parent, f, selectedArguments, parentList, indexInParentList){
    parent
        .function(
            f.name,

            function(){

            },

            function(element){
                parent
                    .button('удалить', function() {
                        parentList.splice(indexInParentList, 1)

                        redraw()
                    })
            }
        )
        .begin()
            .arguments()
            .begin()
                .inner(function(argumentsBody){
                    for(var i in f.arguments)
                        drawArgument(argumentsBody, f, f.arguments[i], selectedArguments, i)
                })
            .end()
        .end()
}



function drawArrows(){
    var arrows = []

    for(var i in get_combination(currentFunction).body){
        var currentCall = get_combination(currentFunction).body[i]

        if(typeof(currentCall.branch) == 'number'){
            arrows.push({
                from: {
                    x: currentCall.branchSelector.offsetTop + currentCall.branchSelector.clientHeight / 2,
                    y: currentCall.branchSelector.offsetTop + currentCall.branchSelector.clientHeight / 2
                },

                to: {
                    x: get_combination(currentFunction).body[currentCall.branch].branchSelector.offsetTop + get_combination(currentFunction).body[currentCall.branch].branchSelector.clientHeight / 2,
                    y: get_combination(currentFunction).body[currentCall.branch].branchSelector.offsetTop
                }
            })
        }
    }

    canvasContext.canvas.style.width = (arrows.length * 20 + 20) + 'px'
    canvasContext.canvas.parentNode.style.width = (arrows.length * 20 + 20) + 'px'
    canvasContext.canvas.width  = canvasContext.canvas.clientWidth
    canvasContext.canvas.height = canvasContext.canvas.clientHeight

    clearCanvas(canvasContext)

    for(var i=0; i<arrows.length; ++i){
        var arrow = arrows[i]
        
        drawLine(canvasContext, canvasContext.canvas.width, arrow.from.y, canvasContext.canvas.width - 20*(i+1), arrow.from.y)
        drawLine(canvasContext, canvasContext.canvas.width - 20*(i+1), arrow.from.y, canvasContext.canvas.width - 20*(i+1), arrow.to.y);
        drawLine(canvasContext, canvasContext.canvas.width, arrow.to.y, canvasContext.canvas.width - 20*(i+1), arrow.to.y)
        drawLine(canvasContext, canvasContext.canvas.width, arrow.to.y, canvasContext.canvas.width - 10, arrow.to.y + 5)
        drawLine(canvasContext, canvasContext.canvas.width, arrow.to.y, canvasContext.canvas.width - 10, arrow.to.y - 5)
    }
}


function drawProgram(parent, program){
    parent
        .cell()
        .begin()
            .inner(function(parent){
                var ref = parent.structureParent.reference
                var canvas = document.createElement('canvas')
                var style = canvas.style

                ref.style.width = '100px'

                style.position = 'absolute'
                style.width = '100px'
                style.height = '100%'
                style.top = 0

                ref.appendChild(canvas)

                canvasContext = canvas.getContext('2d')
            })
        .end()

        .cell()
        .begin()
            .block()
            .begin()
                .menu(functions, function(f){
                    program.unshift({
                        function: f,
                        functionIndex: functionIndex(f),
                        arguments: []
                    })

                    redraw()
                })
            .end()
            .inner(function(parent){
                get_combination(currentFunction).body.forEach(function(f, i){
                    if(!f || !functionIndex(f.function))
                        return

                    f.index = i

                    parent
                        .block()
                        .begin()
                            .inner(function(functionBody){
                                f.branchSelector = functionBody.structureParent.reference

                                functionBody
                                    .branch_selector(f, function(){
                                        if(currentBranchSelector){
                                            currentBranchSelector.branch = f.index
                                            drawArrows()
                                            currentBranchSelector = null
                                        }
                                        else{
                                            currentBranchSelector = f
                                            currentBranchSelector.branch = null
                                            drawArrows()
                                        }
                                    })

                                drawFunction(functionBody, f.function, f.arguments, get_combination(currentFunction).body, i)
                            })
                        .end()

                        .block()
                        .begin()
                            .cell()
                            .begin()
                            .menu(functions, function(f, index){
                                program.splice( i+1, 0, {
                                    function:      f,
                                    functionIndex: functionIndex(f),
                                    arguments:     new Array(f.arguments.length)
                                })

                                redraw()
                            })
                            .end()
                        .end()
                })
            })
        .end()

    drawArrows()
}


function drawFunctionBody(programBody, currentFunction){
    programBody
        .inner(function(parent){
            parent
                .label('выбранная функция:')
                .label(currentFunction.name)

                .inner_block()
                .begin()
                    .label('аргументы:')
                    .list()
                    .begin()
                        .inner(function(parent){
                            currentFunction.arguments.forEach(function(argument, i){
                                parent
                                    .function(
                                        argument.label + ' ' + argument.name,

                                        function(){
                                            console.log(argument)
                                        },

                                        function(){

                                        }
                                    )
                            })
                        })
                    .end()

                    .block()
                    .begin()
                        .inner(function(parent){
                            var newArgumentDescription = ''
                            var newArgumentName = 'без имени'

                            parent
                                .input_text('описание аргумента', '', function(element, event){
                                    newArgumentDescription = element.text
                                })
                                .input_text('имя аргумента', '', function(element, event){
                                    newArgumentName = element.text
                                })
                                .button('добавить аргумент', function(element, event){
                                    currentFunction.arguments.push({
                                        label: newArgumentDescription,
                                        name:  newArgumentName
                                    })

                                    for(var i in currentFunction.combinations){
                                        var currentCombination = currentFunction.combinations[i]

                                        currentCombination.combination.push(undefined)
                                    }

                                    redraw()
                                })
                        })
                    .end()
                .end()
        })
        .window_divider()

        .label('комбинации типов аргументов')
        .divider()
        .inline_block()
        .begin()
        .inner(function(parent){
            currentFunction.combinations.forEach(function(currentCombination, i){
                if(currentFunction.currentCombination == i)
                    parent
                        .label('&#8594;')

                parent
                    .button('выбрать комбинацию', function(){
                        currentFunction.currentCombination = i
                        redraw()
                    })
                    .inner(function(parent){
                        currentCombination.combination.forEach(function(currentArgumentCombination, i){
                            if(typeof(currentArgumentCombination) == 'undefined' || currentArgumentCombination === null){
                                parent
                                    .label(currentFunction.arguments[i].name)
                                    .menu(types, function(type){
                                        currentCombination.combination[i] = type
                                        redraw()
                                    })
                            }
                            else{
                                parent
                                    .label(currentFunction.arguments[i].name + ':')
                                    .label(currentArgumentCombination.name)
                                    .menu(types, function(){

                                    })
                            }
                    })
                })
                .button('удалить комбинацию', function(){

                })
                .divider()
            })

            parent
                .divider()
                .button('новая комбинация', function(){
                    var newCombination = {
                        combination: [],
                        variables: [],
                        body: [],
                        translate: translateFunctionCall
                    }

                    for(var i=0; i<currentFunction.arguments.length; ++i)
                        newCombination.combination.push(undefined)

                    currentFunction.combinations.push(newCombination)

                    redraw()
                })
        })
        .end()

        .window_divider()
        .inner_block()
        .begin()
            .label('переменные:')
            .list()
            .begin()
                .inner(function(parent){
                    get_combination(currentFunction).variables.forEach(function(variable, i){
                        parent
                            .function(
                                variable.name,

                                function(){
                                    console.log(variable)
                                },

                                function(){

                                }
                            )
                    })
                })
            .end()

            .block()
            .begin()
                .inner(function(parent){
                    var newVariableName = 'без имени'

                    parent
                        .input_text('имя переменной', '', function(element, event){
                            newVariableName = element.text
                        })
                        .button('добавить переменную', function(element, event){
                            get_combination(currentFunction).variables.push({
                                name: newVariableName
                            })

                            redraw()
                        })
                })
            .end()
        .end()
        .window_divider()

        .checkbox(get_combination(currentFunction).currentFunctionInCustomTranslateMode, function(state){
            get_combination(currentFunction).currentFunctionInCustomTranslateMode = state
            redraw()
        })
        .label('текстовый режим')
        .window_divider()

        if(get_combination(currentFunction).currentFunctionInCustomTranslateMode){
            programBody
                .text_input(get_combination(currentFunction).translate, function(text){
                    get_combination(currentFunction).translate = text
                })
        }
        else
            drawProgram(programBody, get_combination(currentFunction).body)
}


function redraw(){
    draw()
        .divider()
        .begin()
            .inner_block()
            .begin()
                .label('типы:')
                .list()
                .begin()
                    .inner(function(parent){
                        types.forEach(function(type, i){
                            parent
                                .type(
                                    type.name,

                                    function(){
                                        currentType = type
                                        currentConstant = null
                                        currentFunction = null
                                        redraw()
                                    },

                                    function() {
                                        parent
                                            .button('удалить', function(){
                                                types.splice(i, 1)
                                                redraw()
                                            })
                                    }
                                )

                        })
                    })
                .end()

                .block()
                .begin()
                    .inner(function(parent){
                        var newTypeName = 'без имени'

                        parent
                            .input_text('имя типа', '', function(element, event){
                                newTypeName = element.text
                            })
                            .button('добавить тип', function(element, event){
                                types.push({
                                    name:      newTypeName,
                                    structure: []
                                })

                                redraw()
                            })
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('константы:')
                .list()
                .begin()
                    .inner(function(parent){
                        constants.forEach(function(constant, i){
                            parent
                                .constant(
                                    constant.name,

                                    function(){
                                        currentType = null
                                        currentConstant = constant
                                        currentFunction = null
                                        redraw()
                                    },

                                    function(){
                                        parent
                                            .button('удалить', function(){
                                                constants.splice(i, 1)
                                                redraw()
                                            })
                                    }
                                )
                        })
                    })
                .end()

                .block()
                .begin()
                    .inner(function(parent){
                        var newConstantName = 'без имени'

                        parent
                            .input_text('имя константы', '', function(element, event){
                                newConstantName = element.text
                            })
                            .button('добавить константу', function(element, event){
                                constants.push({
                                    name: newConstantName
                                })

                                redraw()
                            })
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('функции:')
                .list()
                .begin()
                    .inner(function(parent){
                        function selectFunction(f){
                            parent
                                .function(
                                    f.name,

                                    function(){
                                        currentFunction = f
                                        redraw()
                                    },

                                    function(){
                                        parent
                                            .button('удалить', function(){
                                                var index = functionIndex(f)

                                                functions.splice(index, 1)
 
                                                redraw()
                                            })
                                    }
                                )
                        }

                        for(var i=0; i<functions.length; ++i)
                            selectFunction(functions[i])
                    })
                .end()

                .block()
                .begin()
                    .inner(function(parent){
                        var newFunctionName = 'без имени'

                        parent
                            .input_text('имя функции', '', function(element, event){
                                newFunctionName = element.text
                            })
                            .button('добавить функцию', function(element, event){
                                functions.push({
                                    name:      newFunctionName,
                                    arguments: [],
                                    variables: [],
                                    combinations: [
                                        {
                                            combination: [],
                                            variables: [],
                                            body: [],
                                            translate: translateFunctionCall
                                        }
                                    ],
                                    currentCombination: 0
                                })

                                redraw()
                            })
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .button('Сохранить', function(){
                    var program = serialize(types, constants, functions)

                    console.log(program)

                    send('/save', JSON.stringify(program), function(){

                    })
                })
                .button('Компилировать', function(){
                    var program = serialize(types, constants, functions)
                    //console.log(functions)
                    //console.log(program)

                    send('/compile', JSON.stringify(program), function(){

                    })
                })
            .end()
        .end()

        .window_divider()

        .divider()
        .inner(function(programBody){
            if(currentFunction)
                drawFunctionBody(programBody, currentFunction)
            else if(currentConstant)
                drawConstantBody(programBody, currentConstant)
            else if(currentType)
                drawTypeBody(programBody, currentType)
        })
}


document.addEventListener('contextmenu', function(event){
    var element = event.target.element

    if(element && element.onmouseright){
        element.onmouseright(element)
        event.preventDefault()
    }
})


function deserializeTypes(types){
    var newTypes = []

    for(var i in types){
        var currentType = types[i]

        newTypes.push({
            name: currentType.name,
            type: {
                type: primitiveTypes[ currentType.type.primitiveTypeIndex ],
                value: currentType.type.value
            }
        })
    }

    function deserializeType2Value(value) {
        var newValue = []

        for(var i in value) {
            var currentType = value[i]

            newValue.push({
                name: currentType.name,
                type: newTypes[ currentType.typeIndex ]
            })
        }

        return newValue
    }

    for(var i in newTypes){
        var currentType = newTypes[i]

        if(currentType.type.type == primitiveTypes[2])
            currentType.type.value = deserializeType2Value(currentType.type.value)
    }

    return newTypes
}


function deserializeConstants(constants){
    var newConstants = []

    for(var i in constants){
        var currentConstant = constants[i]

        newConstants.push({
            name: currentConstant.name,
            type: types[ currentConstant.typeIndex ],
            value: currentConstant.value
        })
    }

    return newConstants
}


function deserialize(functions){
    function deserializeCombination(combination){
        var newCombination = []

        for(var i in combination)
            newCombination.push(types[combination[i]])

        return newCombination
    }

    function deserializeCombinations(combinations){
        var newCombinations = []

        for(var i in combinations){
            var currentCombination = combinations[i]

            newCombinations.push({
                combination: deserializeCombination(currentCombination.combination),
                translate: currentCombination.translate,
                variables: currentCombination.variables
            })
        }

        return newCombinations
    }

    var newFunctions = []

    for(var i in functions){
        var currentFunction = functions[i]

        newFunctions.push({
            name: currentFunction.name,
            arguments: currentFunction.arguments,
            currentCombination: 0,
            combinations: deserializeCombinations(currentFunction.combinations)
        })
    }

    function deserializeArguments(arguments){
        var newArguments = []

        for(var i in arguments){
            var currentArgument = arguments[i]

            if(typeof currentArgument.functionIndex !== 'undefined'){
                newArguments.push({
                    function: newFunctions[currentArgument.functionIndex],
                    arguments: deserializeArguments(currentArgument.arguments)
                })
            }
            else if(typeof currentArgument.variableIndex !== 'undefined'){
                newArguments.push({
                    variable: currentCombination.variables[currentArgument.variableIndex]
                })
            }
            else if(typeof currentArgument.constantIndex !== 'undefined'){
                newArguments.push({
                    constant: constants[currentArgument.constantIndex]
                })
            }
        }

        return newArguments
    }
    
    function deserializeCombinationBody(combinationBody){
        var newCombinationBody = []

        for(var i in combinationBody){
            var currentCall = combinationBody[i]

            newCombinationBody.push({
                branch: currentCall.branch,
                arguments: deserializeArguments(currentCall.arguments),
                functionIndex: currentCall.functionIndex,
                function: newFunctions[ currentCall.functionIndex ]
            })
        }

        return newCombinationBody
    }

    for(var i in newFunctions){
        var currentFunction = newFunctions[i]

        for(var j in currentFunction.combinations){
            var currentCombination = currentFunction.combinations[j]

            currentCombination.body = deserializeCombinationBody(functions[i].combinations[j].body)
        }
    }

    return newFunctions
}


function serialize(types, constants, functions){
    function serializeTypes(types){
        var newTypes = []

        for(var i in types){
            var currentType = types[i]

            function serializeType2Value(value) {
                var newTypeValue = []

                for(var i in value) {
                    var currentValue = value[i]

                    newTypeValue.push({
                        name: currentValue.name,
                        typeIndex: typeIndex(currentValue.type)
                    })
                }

                return newTypeValue
            }

            if(currentType.type.type == primitiveTypes[2]) {
                newTypes.push({
                    name: currentType.name,
                    type: {
                        primitiveTypeIndex: primitiveTypeIndex(currentType.type.type),
                        value:              serializeType2Value(currentType.type.value)
                    }
                })
            }
            else {
                newTypes.push({
                    name: currentType.name,
                    type: {
                        primitiveTypeIndex: primitiveTypeIndex(currentType.type.type),
                        value:              currentType.type.value
                    }
                })
            }
        }

        return newTypes
    }

    function serializeConstants(constants){
        var newConstants = []

        for(var i in constants){
            var currentConstant = constants[i]

            newConstants.push({
                name: currentConstant.name,
                typeIndex: typeIndex(currentConstant.type),
                value: currentConstant.value
            })
        }

        return newConstants
    }

    var newFunctions = []

    function serializeVariables(variables){
        var newVariables = []

        for(var i in variables){
            var currentVariable = variables[i]

            newVariables.push({
                name: currentVariable.name
            })
        }

        return newVariables
    }

    function serializeArguments(arguments){
        var newArguments = []

        for(var i in arguments){
            var currentArgument = argumnets[i]

            newArguments.push({

            })
        }

        return newArguments
    }

    function serializeBody(combination, body){
        var newBody = []

        for(var i in body){
            var currentCall = body[i]
            var newCall = {}
            var newArguments = newCall.arguments

            if(typeof(currentCall.branch) == 'number')
                newCall.branch = currentCall.branch

            newCall.functionIndex = currentCall.functionIndex

            function serializeArguments(arguments){
                var newArguments = []

                for(var i in arguments){
                    var currentArgument = arguments[i]

                    if(currentArgument.function){
                        newArguments.push({
                            functionIndex: functionIndex(currentArgument.function),
                            arguments: serializeArguments(currentArgument.arguments)
                        })
                    }
                    else if(currentArgument.variable){
                        newArguments.push({
                            variableIndex: variableIndex(combination, currentArgument.variable)
                        })
                    }
                    else if(currentArgument.constant){
                        newArguments.push({
                            constantIndex: constantIndex(currentArgument.constant)
                        })
                    }
                }

                return newArguments
            }

            newCall.arguments = serializeArguments(currentCall.arguments)
            newBody.push(newCall)
        }

        return newBody
    }

    function serializeTranslate(translate){
        var newTranslate = translate

        return newTranslate
    }

    function serializeCombination(combination){
        var newCombination = []

        for(var i in combination){
            var currentType = combination[i]
            newCombination.push(typeIndex(currentType))
        }

        return newCombination
    }

    for(var i in functions)
    {
        var currentFunction = functions[i]
        var newFunction = {
            name: currentFunction.name,
            arguments: currentFunction.arguments,
            combinations: []
        }

        for(var j in currentFunction.combinations){
            var currentCombination = currentFunction.combinations[j]

            newFunction.combinations.push({
                variables:   serializeVariables(currentCombination.variables),
                combination: serializeCombination(currentCombination.combination),
                body:        serializeBody(currentCombination, currentCombination.body),
                translate:   serializeTranslate(currentCombination.translate)
            })
        }

        newFunctions.push(newFunction)
    }

    return {
        types: serializeTypes(types),
        constants: serializeConstants(constants),
        functions: newFunctions
    }
}


window.onload = function(){
    get('/load', function(data){
        //console.log(deserialize(JSON.parse(data)))
        var program = JSON.parse(data)

        types = deserializeTypes(program.types)
        constants = deserializeConstants(program.constants)
        functions = deserialize(program.functions)
        
        currentFunction = functions[0]
        //console.log(program)
        //console.log(functions)
        redraw()
    })
}