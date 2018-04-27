var programBody
var canvasContext
var currentBranchSelector

var types = []
var constants = []

var primitiveTypes = [
    {
        name: 'массив бит'
    },

    {
        name: 'адрес'
    },

    {
        name: 'функция'
    },

    {
        name: 'вложенный тип'
    }
]

var functions = [
    {
        name: 'старт программы',
        arguments: [],
        variables: [],
        combinations: [
            {
                combination: [],
                variables: [],
                body: [],
                translate: ''
            }
        ],
        currentCombination: 0
        //,
        //body: []
    }/*,

    {
        name: 'сумма',
        arguments: [
            { name: 'a', label: '' },
            { name: 'b', label: 'и' }
        ],
        variables: [],
        body: [],
        translate: 'out.write(0x5B); out.write(0x58); out.write(0x01); out.write(0xD8); out.write(0x50);'//pop bx; pop ax; add ax, bx; push ax
    },

    {
        name: 'разность',
        arguments: [
            { name: 'a', label: '' },
            { name: 'b', label: 'и' }
        ],
        variables: [],
        body: [],
        translate: 'out.write(0x5B); out.write(0x58); out.write(0x29); out.write(0xD8); out.write(0x50);'//pop bx; pop ax; sub ax, bx; push ax
    },

    {
        name: 'копировать',
        arguments: [
            { name: 'a', label: '' },
            { name: 'b', label: 'в' }
        ],
        variables: [],
        body: [],
        translate: 'out.write(0x58); out.write(0xA3); out.write(0x00); out.write(0x00);'//pop ax; mov [], ax
    }*/
]

var currentConstant
var currentFunction = functions[0]
var currentFunctionInCustomTranslateMode = false
var translateFunctionCall = "//call\nvar address = (combination.beginAddress - out.address- 4 + 1) & 65535\nout.write(0xE8);\n    out.write(address % 256); out.write((address / 256) % 256);\nout.write(0x50);\n\n//jump\nif(typeof call.branch !== 'undefined'){\n    address = (body[call.branch].beginAddress - out.address - 7) & 65535\n\n    out.write(0x83); out.write(0xF8); //cmp ax, 0\n        out.write(0x00);\n                                \n    out.write(0x0F); out.write(0x84); //je address\n        out.write(address % 256); out.write((address / 256) % 256);\n}" //call 0x00; push ax


function functionIndex(f)
{
    for(var i=0; i<functions.length; ++i)
        if(functions[i] == f)
            return i
}


function typeIndex(type){
    for(var i=0; i<types.length; ++i)
        if(types[i] == type)
            return i
}


function get_combination(f)
{
    return f.combinations[f.currentCombination]
}


function allAllowedFunctions(f, argumentNumber)
{
    var allowedFunctions = []

    for(var i in constants)
        allowedFunctions.push(constants[i])

    for(var i in currentFunction.arguments)
        allowedFunctions.push(currentFunction.arguments[i])

    for(var i in currentFunction.variables)
        allowedFunctions.push(currentFunction.variables[i])

    for(var i in functions)
        allowedFunctions.push(functions[i])

    return allowedFunctions
}

function drawArgumentSelector(parent, f, selectedArguments, i)
{
    parent
        .begin()
            .menu(allAllowedFunctions(f, i), function(f, element)
            {
                if(f.isVariable)
                {
                    selectedArguments[i] = {
                        variable: f,
                        arguments: []
                    }

                    drawFunction(parent, selectedArguments[i].variable, selectedArguments[i].arguments)
                }
                else if(f.isConstant)
                {
                    selectedArguments[i] = {
                        constant: f,
                        arguments: []
                    }

                    drawFunction(parent, selectedArguments[i].constant, selectedArguments[i].arguments)
                }
                else
                {
                    selectedArguments[i] = {
                        function: f,
                        arguments: []
                    }

                    drawFunction(parent, selectedArguments[i].function, selectedArguments[i].arguments)
                }

                redraw()
            })
        .end()
}

function drawArgument(parent, f, argumentDescription, selectedArguments, i)
{
    parent
        .argument(argumentDescription.label, function(argumentElement){
            console.log(argumentElement)
        })
        .begin()
            .inner(function(argumentBody)
            {
                if(selectedArguments[i] && functionIndex(selectedArguments[i].function))
                {
                    if(selectedArguments[i].function)
                        drawFunction(argumentBody, selectedArguments[i].function, selectedArguments[i].arguments)
                    else if(selectedArguments[i].constant)
                        drawFunction(argumentBody, selectedArguments[i].constant, selectedArguments[i].arguments)
                    else
                        drawFunction(argumentBody, selectedArguments[i].variable, selectedArguments[i].arguments)
                }
                else
                    drawArgumentSelector(argumentBody.cell(), f, selectedArguments, i)
            })     
        .end()
}

function drawFunction(parent, f, selectedArguments)
{
    parent
        .function(
            f.name,

            function(){

            },

            function(element){
                console.log(element)
            }
        )
        .begin()
            .arguments()
            .begin()
                .inner(function(argumentsBody)
                {
                    for(var i in f.arguments)
                        drawArgument(argumentsBody, f, f.arguments[i], selectedArguments, i)
                })
            .end()
        .end()
}



function drawArrows()
{
    var arrows = []

    for(var i in get_combination(currentFunction).body)
    {
        var currentCall = get_combination(currentFunction).body[i]

        if(typeof(currentCall.branch) == 'number')
        {
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

    for(var i=0; i<arrows.length; ++i)
    {
        var arrow = arrows[i]
        
        drawLine(canvasContext, canvasContext.canvas.width, arrow.from.y, canvasContext.canvas.width - 20*(i+1), arrow.from.y)
        drawLine(canvasContext, canvasContext.canvas.width - 20*(i+1), arrow.from.y, canvasContext.canvas.width - 20*(i+1), arrow.to.y);
        drawLine(canvasContext, canvasContext.canvas.width, arrow.to.y, canvasContext.canvas.width - 20*(i+1), arrow.to.y)
        drawLine(canvasContext, canvasContext.canvas.width, arrow.to.y, canvasContext.canvas.width - 10, arrow.to.y + 5)
        drawLine(canvasContext, canvasContext.canvas.width, arrow.to.y, canvasContext.canvas.width - 10, arrow.to.y - 5)
    }
}

function drawType(parent, type)
{
    parent
        .menu(primitiveTypes, function(type)
        {
            if(type == primitiveTypes[0])
            {
                if(!currentType.type || currentType.type.type != type)
                {
                    currentType.type = {
                        type:  primitiveTypes[0],
                        value: 0
                    }
                }

                redraw()
            }
        })
        .divider()
        .inner(function(parent)
        {
            if(!currentType.type)
                return

            if(currentType.type.type == primitiveTypes[0])
            {
                parent
                    .label('количество бит')
                    .input_text('0', function(element, event)
                    {
                        var value = parseInt(event.target.value)

                        if(value)
                            currentType.type.value = value
                        else
                            currentType.type.value = 0
                    })

                parent.structureParent.children[parent.structureParent.children.length - 1].reference.childNodes[0].value = currentType.type.value
            }
        })
}

function drawConstant(parent, constant)
{
    parent
        .menu(types, function(type)
        {
            constant.type = type
            constant.value = null

            redraw()
        })

    if(constant.type && constant.type.type)
    {
        var type = constant.type.type.type

        if(type == primitiveTypes[0])
        {
            parent
                .divider()
                .label('значение')
                .input_text('0', function(element, event)
                {
                    var value = parseInt(event.target.value)

                    if(value)
                        constant.value = value
                    else
                        constant.value = 0
                })

            if(constant.value)
                parent.structureParent.children[parent.structureParent.children.length - 1].reference.childNodes[0].value = constant.value
        }
    }
}

function drawProgram(parent, program)
{
    parent
        .cell()
        .begin()
            .inner(function(parent)
            {
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
                .menu(functions, function(f)
                {
                    program.unshift({
                        function: f,
                        functionIndex: functionIndex(f),
                        arguments: []
                    })

                    redraw()
                })
            .end()
            .inner(function(parent)
            {
                get_combination(currentFunction).body.forEach(function(f, i)
                {
                    if(!f || !functionIndex(f.function))
                        return

                    f.index = i

                    parent
                        .block()
                        .begin()
                            .inner(function(functionBody)
                            {
                                f.branchSelector = functionBody.structureParent.reference

                                functionBody
                                    .branch_selector(f, function()
                                    {
                                        if(currentBranchSelector)
                                        {
                                            currentBranchSelector.branch = f.index
                                            drawArrows()
                                            currentBranchSelector = null
                                        }
                                        else
                                        {
                                            currentBranchSelector = f
                                            currentBranchSelector.branch = null
                                            drawArrows()
                                        }
                                    })

                                if(f.function)
                                    drawFunction(functionBody, f.function, f.arguments)
                                else
                                    drawFunction(functionBody, f.variable, f.arguments)
                            })
                        .end()

                        .block()
                        .begin()
                            .cell()
                            .begin()
                            .menu(functions, function(f, index)
                            {
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


function redraw()
{
    draw()
        
        .divider()
        .begin()
            .inner_block()
            .begin()
                .label('типы:')
                .list()
                .begin()
                    .inner(function(parent)
                    {
                        types.forEach(function(type, i)
                        {
                            parent
                                .type(type.name, function()
                                {
                                    currentType = type
                                    currentConstant = null
                                    currentFunction = null
                                    redraw()
                                })
                        })
                    })
                .end()

                .block()
                .begin()
                    .input_text('имя типа', function(element, event)
                    {
                        //console.log(element)
                        //console.log(event)
                    })
                    .button('добавить тип', function(element, event)
                    {
                        types.push({
                            name:      element.parent.children[0].text,
                            structure: []
                        })

                        redraw()
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('константы:')
                .list()
                .begin()
                    .inner(function(parent)
                    {
                        constants.forEach(function(constant, i)
                        {
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

                                    }
                                )
                                //.label(variable.name)
                        })
                    })
                .end()

                .block()
                .begin()
                    .input_text('имя константы', function(element, event){})
                    .button('добавить константу', function(element, event)
                    {
                        constants.push({
                            name: element.parent.children[0].text
                        })

                        redraw()
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .label('функции:')
                .list()
                .begin()
                    .inner(function(parent)
                    {
                        function selectFunction(f)
                        {
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
                    .input_text('имя функции', function(element, event)
                    {
                        //console.log(element)
                        //console.log(event)
                    })
                    .button('добавить функцию', function(element, event)
                    {
                        functions.push({
                            name:      element.parent.children[0].text,
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
                            //body:      [],
                            //translate: translateFunctionCall
                        })
                        redraw()
                    })
                .end()
            .end()

            .inner(function(parent)
            {
                if(currentFunction)
                {
                    parent
                        .inner_block()
                        .begin()
                            .block()
                            .begin()
                                .label('выбранная функция:')
                                .label(currentFunction.name)
                            .end()
                        .end()

                        .inner_block()
                        .begin()
                            .label('аргументы:')
                            .list()
                            .begin()
                                .inner(function(parent)
                                {
                                    currentFunction.arguments.forEach(function(argument, i)
                                    {
                                        parent
                                            .function(
                                                argument.label + ' ' + argument.name,

                                                function(){
                                                    console.log(argument)
                                                },

                                                function(){

                                                }
                                            )
                                            //.label(variable.name)
                                    })
                                })
                            .end()

                            .block()
                            .begin()
                                .input_text('описание аргумента', function(element, event)
                                {
                                    //console.log(element)
                                    //console.log(event)
                                })
                                .input_text('имя аргумента', function(element, event)
                                {
                                    //console.log(element)
                                    //console.log(event)
                                })
                                .button('добавить аргумент', function(element, event)
                                {
                                    currentFunction.arguments.push({
                                        label: element.parent.children[0].text,
                                        name:  element.parent.children[1].text
                                    })

                                    for(var i in currentFunction.combinations)
                                    {
                                        var currentCombination = currentFunction.combinations[i]

                                        currentCombination.combination.push(undefined)
                                    }

                                    redraw()
                                })
                            .end()
                        .end()

                        .inner_block()
                        .begin()
                            .label('переменные:')
                            .list()
                            .begin()
                                .inner(function(parent)
                                {
                                    currentFunction.variables.forEach(function(variable, i)
                                    {
                                        parent
                                            .function(
                                                variable.name,

                                                function(){
                                                    console.log(variable)
                                                },

                                                function(){

                                                }
                                            )
                                            //.label(variable.name)
                                    })
                                })
                            .end()

                            .block()
                            .begin()
                                .input_text('имя переменной', function(element, event)
                                {
                                    //console.log(element)
                                    //console.log(event)
                                })
                                .button('добавить переменную', function(element, event)
                                {
                                    currentFunction.variables.push({
                                        name: element.parent.children[0].text
                                    })
                                    redraw()
                                })
                            .end()
                        .end()
                }
                else if(currentConstant)
                {
                    parent
                        .inner_block()
                        .begin()
                            .block()
                            .begin()
                                .label('выбранная константа:')
                                .label(currentConstant.name)
                            .end()
                        .end()
                }
                else if(currentType)
                {
                    parent
                        .inner_block()
                        .begin()
                            .block()
                            .begin()
                                .label('выбранный тип:')
                                .label(currentType.name)
                            .end()
                        .end()
                }
            })
            
            .divider()
            .inner_block()
            .begin()
                .inner(function(parent)
                {
                    if(currentFunction)
                        parent
                            .checkbox(get_combination(currentFunction).currentFunctionInCustomTranslateMode, function(state)
                            {
                                get_combination(currentFunction).currentFunctionInCustomTranslateMode = state
                                redraw()
                            })
                })
                .button('Сохранить', function(){
                    console.log(types)
                    var program = serialize(types, functions)

                    send('/save', JSON.stringify(program), function(){

                    })
                })
                .button('Компилировать', function()
                {
                    var program = serialize(types, functions)
                    console.log(functions)
                    console.log(program)

                    send('/compile', JSON.stringify(program), function(){

                    })
                })
            .end()
        .end()

        .window_divider()

        .divider()
        .begin()
            .inner(function(programBody)
            {
                if(currentFunction)
                {
                    if(get_combination(currentFunction).currentFunctionInCustomTranslateMode)
                    {
                        programBody
                            .text_input(get_combination(currentFunction).translate, function(text){
                                get_combination(currentFunction).translate = text
                            })
                    }
                    else
                    {
                        programBody
                            .inner(function(parent)
                            {
                                currentFunction.combinations.forEach(function(currentCombination, i)
                                {
                                    parent
                                        .button('выбрать комбинацию', function()
                                        {
                                            currentFunction.currentCombination = i
                                            redraw()
                                        })
                                        .inner(function(parent)
                                        {
                                            currentCombination.combination.forEach(function(currentArgumentCombination, i)
                                            {
                                                if(typeof(currentArgumentCombination) == 'undefined' || currentArgumentCombination === null)
                                                {
                                                    parent
                                                        .label(currentFunction.arguments[i].name)
                                                        .menu(types, function(type)
                                                        {
                                                            currentCombination.combination[i] = type
                                                            redraw()
                                                        })
                                                }
                                                else
                                                {
                                                    parent
                                                        .label(currentFunction.arguments[i].name + ':')
                                                        .label(currentArgumentCombination.name)
                                                        .menu(types, function()
                                                        {

                                                        })
                                                }
                                            })
                                        })
                                        .button('удалить комбинацию', function()
                                        {

                                        })
                                        .divider()
                                })

                                parent
                                    .divider()
                                    .button('новая комбинация', function()
                                    {
                                        var newCombination = {
                                            combination: [],
                                            body: [],
                                            translate: translateFunctionCall
                                        }

                                        for(var i=0; i<currentFunction.arguments.length; ++i)
                                            newCombination.combination.push(undefined)

                                        currentFunction.combinations.push(newCombination)

                                        redraw()
                                    })
                                    .divider()

                                drawProgram(programBody, get_combination(currentFunction).body)
                            })
                    }
                }
                else if(currentConstant)
                {
                    drawConstant(programBody, currentConstant)
                }
                else if(currentType)
                {
                    drawType(programBody, currentType)
                }
            })
        .end()

    drawArrows()
}


window.onload = function()
{
    redraw()
}


document.addEventListener('contextmenu', function(event)
{
    var element = event.target.element

    if(element && element.onmouseright){
        element.onmouseright(element)
        event.preventDefault()
    }
})


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
                //body: [],//deserializeCombinationBody(currentCombination.body),
                translate: currentCombination.translate,
                variables: []
            })
        }

        return newCombinations
    }

    var newFunctions = []

    for(var i in functions){
        var currentFunction = functions[i]

        newFunctions.push({
            name: currentFunction.name,
            arguments: currentFunction.arguments,//[],
            variables: [],//del, должны быть у комбинации
            currentCombination: 0,
            combinations: deserializeCombinations(currentFunction.combinations)
        })
    }

    function deserializeArguments(arguments){
        var newArguments = []

        for(var i in arguments){
            var currentArgument = arguments[i]

            var newArgument = {
                function: newFunctions[currentArgument.functionIndex],
                arguments: deserializeArguments(currentArgument.arguments)
            }

            newArguments.push(newArgument)
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
//console.log(functions[i].combinations[j])
            currentCombination.body = deserializeCombinationBody(functions[i].combinations[j].body)
        }
/*
        newFunctions.push({
            name: currentFunction.name,
            currentCombination: 0,
            combinations: deserializeCombinations(currentFunction.combinations)
        })*/
    }
//console.log(newFunctions)
    return newFunctions
}


function serialize(types, functions){
    var newFunctions = []

    function serializeVariables(variables){
        var newVariables = []

        for(var i in variables){
            var currentVariable = variables[i]

            newVariables.push({
                name: currentVariable.name,
                type: 'variable'
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

    function serializeBody(body){
        var newBody = []

        for(var i in body){
            var currentCall = body[i]
            var newCall = {}
            var newArguments = newCall.arguments

            if(typeof(currentCall.branch) == 'number'){
                newCall.branch = currentCall.branch
            }

            newCall.functionIndex = currentCall.functionIndex

            function serializeArguments(arguments){
                var newArguments = []

                for(var i in arguments){
                    var currentArgument = arguments[i]

                    newArguments.push({
                        functionIndex: functionIndex(currentArgument.function),
                        arguments: serializeArguments(currentArgument.arguments) //[]
                    })
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

        for(var j in currentFunction.combinations)
        {
            var currentCombination = currentFunction.combinations[j]

            newFunction.combinations.push({
                //name:      i,
                //arguments: currentCombination.arguments,
                combination: serializeCombination(currentCombination.combination),
                //variables: serializeVariables(currentCombination.variables),
                body:      serializeBody(currentCombination.body),
                translate: serializeTranslate(currentCombination.translate)
            })
        }

        newFunctions.push(newFunction)
    }

    return {
        types: types,
        functions: newFunctions
    }
}

get('/load', function(data){
    //console.log(deserialize(JSON.parse(data)))
    var program = JSON.parse(data)

    types = program.types
    functions = deserialize(program.functions)
    currentFunction = functions[0]
    console.log(functions)
    redraw()
})