function drawArgumentSelector(parent, f, selectedArguments, i)
{
    parent
        .begin()
            .menu(functions, function(f, element)
            {
                selectedArguments[i] = {
                    function: f,
                    arguments: []
                }

                drawFunction(parent, selectedArguments[i].function, selectedArguments[i].arguments)
                redraw()
            })
        .end()
}

function drawArgument(parent, f, argumentDescription, selectedArguments, i)
{
    parent
        .argument(argumentDescription.name)
        .begin()
            .inner(function(argumentBody)
            {
                if(selectedArguments[i])
                    drawFunction(argumentBody, selectedArguments[i].function, selectedArguments[i].arguments)
                else
                    drawArgumentSelector(argumentBody.cell(), f, selectedArguments, i)
            })     
        .end()
}

function drawFunction(parent, f, selectedArguments)
{
    parent
        .function(f.name)
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
                program.unshift( {function: f, arguments: []} )
                redraw()
            })
        .end()
        .inner(function(parent)
        {
            program.forEach(function(f, i)
            {
                parent
                    .block()
                    .begin()
                        .inner(function(functionBody)
                        {
                            drawFunction(functionBody, f.function, f.arguments)
                        })
                    .end()

                    .block()
                    .begin()
                        .cell()
                        .begin()
                        .menu(functions, function(f)
                        {
                            program.splice( i+1, 0, {function: f, arguments: new Array(f.arguments.length)} )
                            redraw()
                        })
                        .end()
                    .end()
            })
        })
}

var functions = [
    {
        name: 'main',
        arguments: [],
        variables: [],
        body: []
    },

    {
        name: 'сумма',
        arguments: [
            { name: '' },
            { name: 'и' }
        ],
        body: []
    }

    /*{
        name: 'взорвать',
        arguments: [
            { name: 'объект' }
        ]
    },

    {
        name: 'бомба',
        arguments: []
    },

    {
        name: '1',
        arguments: []
    },

    {
        name: '2',
        arguments: []
    },

    {
        name: 'сумма',
        arguments: [
            { name: '' },
            { name: 'и' }
        ]
    },

    {
        name: 'разность',
        arguments: [
            { name: '' },
            { name: 'и' }
        ]
    },

    {
        name: 'умножение',
        arguments: [
            { name: '' },
            { name: 'на' }
        ]
    },

    {
        name: 'деление',
        arguments: [
            { name: '' },
            { name: 'на' }
        ]
    },

    {
        name: 'запомнить',
        arguments: [
            { name: '' },
            { name: 'как' }
        ]
    },

    {
        name: 'первый член определителя',
        arguments: []
    },

    {
        name: 'второй член определителя',
        arguments: []
    },

    {
        name: 'определитель',
        arguments: []
    },

    {
        name: 'а11',
        arguments: []
    },

    {
        name: 'а12',
        arguments: []
    },

    {
        name: 'а21',
        arguments: []
    },

    {
        name: 'а22',
        arguments: []
    },

    {
        name: 'номер числа',
        arguments: []
    },

    {
        name: 'изменить порядковый номер',
        arguments: [
            { name: '' },
            { name: 'на' }
        ]
    },

    {
        name: 'запомнить',
        arguments: [
            { name: '' },
            { name: 'как' }
        ]
    },

    {
        name: 'взять следующий номер',
        arguments: [
            { name: '' }
        ]
    },

    {
        name: 'продолжить если',
        arguments: [
            { name: '' },
            { name: 'меньше чем' }
        ]
    },

    {
        name: 'установить позицию',
        arguments: [
            { name: 'итератора' },
            { name: 'на' }
        ]
    },*/
]

var currentFunction = functions[0]

var program = [
    /*{
        function:  functions[0],
        arguments: [
            {
                function: functions[1],
                arguments: []
            },

            {
                function: functions[0],
                arguments: []
            }
        ]
    }*/
]

var programBody

function redraw()
{
    draw()
        .block()
        .begin()
            .inner(function(programBody)
            {
                drawProgram(programBody, program)
            })
        .end()

        .block()
        .begin()
            .vertical_space()
            .block()
            .begin()
                .label('переменные:')
                .inner(function(parent)
                {
                    currentFunction.variables.forEach(function(variable, i)
                    {
                        parent
                            .label(variable.name)
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
                        name: element.parent.children[0].text,
                        arguments: [],
                        body: []
                    })
                    redraw()
                })
            .end()

            .vertical_space()
            .block()
            .begin()
                .label('функции:')
                .inner(function(parent)
                {
                    functions.forEach(function(f, i)
                    {
                        parent
                            .label(f.name)
                    })
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
                        name: element.parent.children[0].text,
                        arguments: [],
                        body: []
                    })
                    redraw()
                })
            .end()
        .end()
}

redraw()