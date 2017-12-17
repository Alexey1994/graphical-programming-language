function allAllowedFunctions(f, argumentNumber)
{
    var allowedFunctions = []

    for(var i in currentFunction.constants)
        allowedFunctions.push(currentFunction.constants[i])

    for(var i in currentFunction.arguments)
        allowedFunctions.push(currentFunction.constants[i])

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
        .argument(argumentDescription.label)
        .begin()
            .inner(function(argumentBody)
            {
                if(selectedArguments[i])
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
        .function(f.name, function()
        {

        })
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

function drawProgram(parent, program)
{
    parent
        .block()
        .begin()
            .menu(functions, function(f)
            {
                program.unshift({
                    function: f,
                    arguments: []
                })
                /*currentFunction.body.unshift({
                    function: f,
                    arguments: []
                })*/
                redraw()
            })
        .end()
        .inner(function(parent)
        {
            currentFunction.body.forEach(function(f, i)
            {
                parent
                    .block()
                    .begin()
                        .inner(function(functionBody)
                        {
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
                        .menu(functions, function(f)
                        {
                            program.splice( i+1, 0, {
                                function: f,
                                arguments: new Array(f.arguments.length)
                            })

                            redraw()
                        })
                        .end()
                    .end()
            })
        })
}

function translateFunctionCall(f, args)
{
    console.log('call ' + f.name)
    console.log('push eax')
}

var functions = {
    'main': {
        name: 'main',
        arguments: [],
        variables: [],
        constants: [],
        body: [],
        translate: function(f, args)
        {

        }
    },

    'сумма': {
        name: 'сумма',
        arguments: [
            { name: 'a', label: '' },
            { name: 'b', label: 'и' }
        ],
        variables: [],
        constants: [],
        body: [],
        translate: function(f, args)
        {
            //var asmString = 'add '
            console.log('pop ebx')
            console.log('pop eax')
            console.log('add eax, ebx')
            console.log('push eax')
        }
    },

    'разность': {
        name: 'разность',
        arguments: [
            { name: 'a', label: '' },
            { name: 'b', label: 'и' }
        ],
        variables: [],
        constants: [],
        body: [],
        translate: function(f, args)
        {
            //var asmString = 'add '
            console.log('pop ebx')
            console.log('pop eax')
            console.log('sub eax, ebx')
            console.log('push eax')
        }
    }
}

var currentFunction = functions['main']
/*
var program = [
    {
        function:  functions[0],
        arguments: [
            {
                function: functions[1],
                variable: undefined,
                arguments: []
            },

            {
                function: functions[0],
                variable: undefined,
                arguments: []
            }
        ]
    }
]*/

var programBody

function redraw()
{
    draw()
        
        .divider()
        .begin()
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
                .label('константы:')
                .list()
                .begin()
                    .inner(function(parent)
                    {
                        currentFunction.constants.forEach(function(canstant, i)
                        {
                            parent
                                .function(canstant.name, function()
                                {
                                    console.log(canstant)
                                })
                                //.label(variable.name)
                        })
                    })
                .end()

                .block()
                .begin()
                    .input_text('значение константы', function(element, event)
                    {
                        //console.log(element)
                        //console.log(event)
                    })
                    .button('добавить константу', function(element, event)
                    {
                        currentFunction.constants.push({
                            name:       element.parent.children[0].text,
                            arguments:  [],
                            variables:  [],
                            constants:  [],
                            body:       [],
                            isConstant: true
                        })
                        redraw()
                    })
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
                                .function(argument.label + ' ' + argument.name, function()
                                {
                                    console.log(argument)
                                })
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
                            label:      element.parent.children[0].text,
                            name:       element.parent.children[1].text,
                            arguments:  [],
                            variables:  [],
                            constants:  [],
                            body:       [],
                            isArgument: true
                        })
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
                                .function(variable.name, function()
                                {
                                    console.log(variable)
                                })
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
                            name:           element.parent.children[0].text,
                            arguments:      [],
                            variables:      [],
                            constants:      [],
                            body:           [],
                            variableNumber: currentFunction.variables.length,
                            isVariable:     true
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
                                .function(f.name, function()
                                {
                                    currentFunction = f
                                    redraw()
                                })
                        }

                        for(var i in functions)
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
                        functions[element.parent.children[0].text] = {
                            name:      element.parent.children[0].text,
                            arguments: [],
                            variables: [],
                            constants: [],
                            body:      [],
                            translate: translateFunctionCall
                        }
                        redraw()
                    })
                .end()
            .end()

            .inner_block()
            .begin()
                .button('Компилировать', function()
                {
                    function translateArgument(argument)
                    {
                        for(var j in argument.arguments)
                        {
                            var currentArgument = argument.arguments[j]
                            translateArgument(currentArgument)
                        }

                        if(argument.function && argument.function.translate)
                            argument.function.translate(argument.function, argument.arguments)
                        else if(argument.variable)
                            console.log('push [ebp + ' + argument.variable.variableNumber + '] (' + argument.variable.name + ')')
                        else if(argument.constant)
                            console.log('push ' + argument.constant.name)
                        else
                        {
                            console.log('ошибка: пустой аргумент')
                            console.log(argument)
                        }
                    }

                    var main = functions['main']

                    for(var i in main.body)
                    {
                        var currentCall = main.body[i]

                        for(var j in currentCall.arguments)
                        {
                            var currentArgument = currentCall.arguments[j]
                            translateArgument(currentArgument)
                        }

                        if(currentCall.function && currentCall.function.translate)
                            currentCall.function.translate(currentCall.function, currentCall.arguments)
                        else if(currentCall.variable)
                            console.log('push [ebp + ' + currentCall.variable.variableNumber + '] (' + currentCall.variable.name + ')')
                        else if(argument.constant)
                            console.log('push ' + currentCall.constant.name)
                        else
                        {
                            console.log('ошибка: пустой аргумент')
                            console.log(argument)
                        }
                    }
                })
            .end()
        .end()

        .window_divider()

        .divider()
        .begin()
            .inner(function(programBody)
            {
                drawProgram(programBody, currentFunction.body)
            })
        .end()
}

redraw()