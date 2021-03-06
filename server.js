var express    = require('express')
var fs         = require('fs')
var bodyParser = require('body-parser')

var server  = express()

server.use(bodyParser.json())
server.use(express.static(__dirname + '/view'))


function Output(){
    this.buffer = []
    this.address = 0

    this.write = function(byte){
        this.buffer.push(byte)
        ++this.address
    }

    this.save = function(fileName){
        fs.writeFile(fileName, new Buffer(this.buffer, 'binary'), function(){})
    }
}


function variableSize(variable, types){
    var variableType = types[variable.typeIndex]

    //console.log(variable)

    if(variableType.type.primitiveTypeIndex == 0)
        return variableType.type.value

    if(variableType.type.primitiveTypeIndex == 2){
        var variablesSize = 0

        for(var i = 0; i < variableType.type.value.length; ++i)
            variablesSize += variableSize(variableType.type.value[i], types)

        return variablesSize
    }
}


function calculateAddresses(program){
    var functions = program.functions
    var constants = program.constants
    var types = program.types

    var output = {
        address: 0,//0x7C00,

        write: function(){
            ++this.address
        }
    }

    function typeSize(type){
        if(type.type.primitiveTypeIndex == 0)
            type.size = type.type.value

        if(type.type.primitiveTypeIndex == 2){
            type.size = 0

            for(var i in type.type.values){
                type.size = type.type.value
            }
        }
    }

    for(var i in types)
        typeSize(types[i])

    //output.write(0x8C); output.write(0xC8); //mov ax,cs
    //output.write(0x8E); output.write(0xD8); //mov ds,ax
    //output.write(0x8E); output.write(0xD0); //mov ss,ax

    for(var i in functions){
        var combinations = functions[i].combinations

        for(var j in combinations){
            var rootCombination = combinations[j]
            var body = rootCombination.body

            rootCombination.beginAddress = output.address

            var variableIndex = 0

            for(var k in rootCombination.variables){
                /*function variableSize(variable, types){
                    var variableType = types[variable.typeIndex]

                    //console.log(variable)

                    if(variableType.type.primitiveTypeIndex == 0)
                        return variableType.type.value

                    if(variableType.type.primitiveTypeIndex == 2){
                        var variablesSize = 0

                        for(var i = 0; i < variableType.type.value.length; ++i)
                            variablesSize += variableSize(variableType.type.value[i], types)

                        return variablesSize
                    }
                }*/

                rootCombination.variables[k].size = variableSize(rootCombination.variables[k], types)
                rootCombination.variables[k].index = variableIndex
                variableIndex += rootCombination.variables[k].size
            }

            console.log(rootCombination.variables)

            if(!rootCombination.isMacros){
                output.write(0x55); //push bp
                output.write(0x89); output.write(0xE5); //mov bp, sp
                output.write(0x83); output.write(0xEC); output.write(rootCombination.variables.length * 2); //sub sp, rootCombination.variables.length * 2

                function f(out, arguments){
                    eval(rootCombination.translate)
                }

                f(output, functions[i].arguments)
            }

            for(var k in body){
                var call = body[k]

                function translateRootFunctionCall(call){
                    call.beginAddress = output.address

                    var arguments = call.arguments

                    var type = arguments
                        .map(function(argument){
                            return translateCall(argument)
                        })

                    function getCombination(f, type){
                        var combinations = f.combinations
                        var foundedCombination

                        if(!f.arguments.length)
                            return combinations[0]

                        for(var i in combinations){
                            var combination = combinations[i].combination
                            foundedCombination = combination

                            for(var j in combination)
                                if(combination[j] !== type[j]){
                                    foundedCombination = undefined
                                    break
                                }

                            if(foundedCombination !== undefined)
                                return combinations[i]
                        }

                        return combinations[0]
                    }

                    var combination = getCombination(functions[call.functionIndex], type)

                    if(combination.isMacros){
                        function f(out, arguments){
                            eval(combination.translate)
                        }

                        f(output, functions[i].arguments)
                    }
                    else{
                        var functionAddress = (combination.beginAddress - output.address - 4 + 1) & 65535

                        output.write(0xE8); //call combination.address
                            output.write(functionAddress % 256); output.write(functionAddress / 256 % 256);
                    }

                    if(typeof call.branch !== 'undefined'){
                        var address = (rootCombination.body[call.branch].beginAddress - output.address - 7) & 65535

                        output.write(0x83); output.write(0xF8); //cmp ax, 0
                            output.write(0x00);
                                                    
                        output.write(0x0F); output.write(0x84); //je address
                            output.write(address % 256); output.write((address / 256) % 256);
                    }

                    call.endAddress = output.address
                }

                function translateFunctionCall(call){
                    call.beginAddress = output.address

                    var arguments = call.arguments
                    /*var type = []

                    for(var l in arguments)
                        type.push(translateCall(arguments[l]))*/
                    var type = arguments
                        .map(function(argument){
                            return translateCall(argument)
                        })

                    function getCombination(f, type){
                        var combinations = f.combinations
                        var foundedCombination

                        if(!f.arguments.length)
                            return combinations[0]

                        for(var i in combinations){
                            var combination = combinations[i].combination
                            foundedCombination = combination

                            for(var j in combination)
                                if(combination[j] !== type[j]){
                                    foundedCombination = undefined
                                    break
                                }

                            if(foundedCombination !== undefined)
                                return combinations[i]
                        }

                        return combinations[0]
                    }

                    var combination = getCombination(functions[call.functionIndex], type)
/*
                    if(typeof combination == 'undefined'){
                        //console.log('error in ' + functions[call.functionIndex].name)
                        return undefined
                    }
                    else{
                        function f(out, arguments, call, rootCombination, combination, body){
                            eval(combination.translate)
                        }

                        //f(output, arguments, call, rootCombination, combination, body)
                    }*/

                    if(combination.isMacros){
                        function f(out, arguments){
                            eval(combination.translate)
                        }

                        f(output, functions[i].arguments)
                    }
                    else{
                        var functionAddress = (combination.beginAddress - output.address - 4 + 1) & 65535

                        output.write(0xE8); //call combination.address
                            output.write(functionAddress % 256); output.write(functionAddress / 256 % 256);
                    }

                    output.write(0x50); //push ax

                    call.endAddress = output.address

                    //return null //temporary
                    return combination.type
                }

                function translateArgumentCall(call){
                    output.write(0xFF) //push [bp + variableIndex]
                    output.write(0x76)
                    output.write(((functions[i].arguments.length - call.argumentIndex + 1) * 2) & 0xff) //size of bp + argument index

                    return null
                    return call.type
                }

                function translateVariableCall(call, variables){
                    output.write(0xFF) //push [bp + variableIndex]
                    output.write(0x76)
                    output.write((-call.variableIndex * 2) & 0xff)
/*
                    function getVariableIndex(findedVariable, variables){
                        var index = 0

                        for(var i in variables){
                            var currentVariable = variables[i]
                            var currentType = types[currentVariable.typeIndex]

                            if(currentVariable == findedVariable)
                                return {index: index, isEnd: true}

                            if(currentType.type.primitiveTypeIndex == 0)
                                index += currentType.type.value

                            if(currentType.type.primitiveTypeIndex == 2){
                                var state = getVariableIndex(findedVariable, currentType.type.value)

                                if(state.isEnd)
                                    return state

                                index += state.index
                            }
                        }

                        return {index: index, isEnd: false}
                    }*/

                    var variable = variables[call.variableIndex]
                    var variableType = types[variable.typeIndex]
                    var innerValueIndex = call.innerValueIndex

                    if(typeof innerValueIndex !== 'undefined')
                        //console.log(getVariableIndex(variable, variables))
                        ;//console.log(variableType.type.value[innerValueIndex])

                    //console.log(call)
                    //console.log(variableSize(variable, types))

                    return null
                    return call.type
                }

                function translateConstantCall(call){
                    var constant = constants[ call.constantIndex ]
                    var type = types[ constant.typeIndex ]
                    //console.log('constant ' + JSON.stringify(constant))
                    //console.log('type ' + JSON.stringify(type))

                    //if(type.type.primitiveTypeIndex == 0){
                        /*output.write(0xFF); output.write(0x36); //push word[address]
                            output.write(constant.beginAddress % 256); output.write(constant.beginAddress / 256 % 256);*/

                        output.write(0x2E); output.write(0xFF); output.write(0x36); //push word[CS:address]
                            output.write(constant.beginAddress % 256); output.write(constant.beginAddress / 256 % 256);
                    //}

                    //return null
                    return constant.typeIndex
                }

                function translateCall(call){
                    if(typeof call.functionIndex !== 'undefined')
                        return translateFunctionCall(call)
                    else if(typeof call.variableIndex !== 'undefined')
                        return translateVariableCall(call, rootCombination.variables)
                    else if(typeof call.constantIndex !== 'undefined')
                        return translateConstantCall(call)
                    else if(typeof call.argumentIndex !== 'undefined')
                        return translateArgumentCall(call)
                }

                translateRootFunctionCall(call)
            }

            if(!rootCombination.isMacros){
                output.write(0x89); output.write(0xEC);                                                  //mov sp, bp
                output.write(0x5D);                                                                      //pop bp
                //output.write(0x83); output.write(0xC4); output.write(functions[i].arguments.length * 2); //add sp, functions[i].arguments.length * 2
                //output.write(0xA1); output.write(0x00); output.write(0x00);                              //mov ax, 0
                output.write(0xC3);                                                                       //ret
            }

            rootCombination.endAddress = output.address
        }
    }

    var bitStream = {
        position: 0,
        data: 0,

        write: function(bit){
            if(bit)
                this.data |= 1

            ++this.position

            if(this.position == 8){
                output.write(this.data)
                this.position = 0
                this.data = 0
            }
            else
                this.data <<= 1
        }
    }

    for(var i in constants){
        var currentConstant = constants[i]
        var constantType = types[currentConstant.typeIndex]

        currentConstant.beginAddress = output.address

        if(constantType.type.primitiveTypeIndex == 0){
            var position = 0
            var value = currentConstant.value

            for(var j = 0; j < constantType.type.value; ++j){
                bitStream.write((value & (0b10000000 >> position)))

                ++position

                if(position == 8){
                    position = 0
                    value /= 256
                }
            }
        }
        else if(constantType.type.primitiveTypeIndex == 2){
            var type = types[currentConstant.typeIndex]

            for(var j in currentConstant.value){
                var currentValue = currentConstant.value[j]
                var currentFieldPrimitiveTypeIndex = types[type.type.value[j].typeIndex].type.primitiveTypeIndex
                var currentFieldTypeValue = types[type.type.value[j].typeIndex].type.value

                if(currentFieldPrimitiveTypeIndex == 0){
                    var position = 0

                    for(var k = 0; k < currentFieldTypeValue; ++k){
                        bitStream.write((currentValue & (0b10000000 >> position)))

                        ++position

                        if(position == 8){
                            position = 0
                            currentValue /= 256
                        }
                    }
                }
                else if(currentFieldPrimitiveTypeIndex == 2){
                    throw 'recursive type not defined'
                }
            }
        }

        if(bitStream.position){
            output.write(bitStream.data)
        }

        currentConstant.endAddress = output.address
    }
}


function compile(types, constants, functions, output){
    output.address = 0//0x7C00

    //output.write(0x8C); output.write(0xC8); //mov ax,cs
    //output.write(0x8E); output.write(0xD8); //mov ds,ax
    //output.write(0x8E); output.write(0xD0); //mov ss,ax

    for(var i in functions){
        var combinations = functions[i].combinations

        for(var j in combinations){
            var rootCombination = combinations[j]
            var body = rootCombination.body

            if(!rootCombination.isMacros){
                output.write(0x55);                                                                         //push bp
                output.write(0x89); output.write(0xE5);                                                     //mov bp, sp
                output.write(0x83); output.write(0xEC); output.write(rootCombination.variables.length * 2); //sub sp, rootCombination.variables.length * 2

                function f(out, arguments){
                    eval(rootCombination.translate)
                }

                f(output, functions[i].arguments)
            }

            for(var k in body){
                var call = body[k]

                function translateRootFunctionCall(call){
                    var arguments = call.arguments

                    var type = arguments
                        .map(function(argument){
                            return translateCall(argument)
                        })

                    function getCombination(f, type){
                        var combinations = f.combinations
                        var foundedCombination

                        if(!f.arguments.length)
                            return combinations[0]

                        for(var i in combinations){
                            var combination = combinations[i].combination
                            foundedCombination = combination

                            for(var j in combination)
                                if(combination[j] !== type[j]){
                                    foundedCombination = undefined
                                    break
                                }

                            if(foundedCombination !== undefined)
                                return combinations[i]
                        }

                        return combinations[0]
                    }

                    var combination = getCombination(functions[call.functionIndex], type)

                    if(combination.isMacros){
                        function f(out, arguments){
                            eval(combination.translate)
                        }

                        f(output, functions[i].arguments)
                    }
                    else{
                        var functionAddress = (combination.beginAddress - output.address - 4 + 1) & 65535

                        output.write(0xE8); //call combination.address
                            output.write(functionAddress % 256); output.write(functionAddress / 256 % 256);
                    }

                    if(typeof call.branch !== 'undefined'){
                        var address = (rootCombination.body[call.branch].beginAddress - output.address - 7) & 65535

                        output.write(0x83); output.write(0xF8); //cmp ax, 0
                            output.write(0x00);
                                                    
                        output.write(0x0F); output.write(0x84); //je address
                            output.write(address % 256); output.write((address / 256) % 256);
                    }
                }

                function translateFunctionCall(call){
                    var arguments = call.arguments
                    /*var type = []

                    for(var l in arguments)
                        type.push(translateCall(arguments[l]))*/
                    var type = arguments
                        .map(function(argument){
                            return translateCall(argument)
                        })

                    function getCombination(f, type){
                        var combinations = f.combinations
                        var foundedCombination

                        if(!f.arguments.length)
                            return combinations[0]

                        for(var i in combinations){
                            var combination = combinations[i].combination
                            foundedCombination = combination

                            for(var j in combination)
                                if(combination[j] !== type[j]){
                                    foundedCombination = undefined
                                    break
                                }

                            if(foundedCombination !== undefined)
                                return combinations[i]
                        }

                        return combinations[0]
                    }

                    var combination = getCombination(functions[call.functionIndex], type)
/*
                    if(typeof combination == 'undefined'){
                        //console.log('error in ' + functions[call.functionIndex].name)
                        return undefined
                    }
                    else{
                        function f(out, arguments, call, rootCombination, combination, body){
                            eval(combination.translate)
                        }

                        //f(output, arguments, call, rootCombination, combination, body)
                    }*/

                    if(combination.isMacros){
                        function f(out, arguments){
                            eval(combination.translate)
                        }

                        f(output, functions[i].arguments)
                    }
                    else{
                        var functionAddress = (combination.beginAddress - output.address - 4 + 1) & 65535

                        output.write(0xE8); //call combination.address
                            output.write(functionAddress % 256); output.write(functionAddress / 256 % 256);
                    }

                    output.write(0x50); //push ax

                    //return null //temporary
                    return combination.type
                }

                function translateArgumentCall(call){
                    output.write(0xFF) //push [bp + variableIndex]
                    output.write(0x76)
                    output.write(((functions[i].arguments.length - call.argumentIndex + 1) * 2) & 0xff) //size of bp + argument index

                    return null
                    return call.type
                }

                function translateVariableCall(call){
                    output.write(0xFF) //push [bp + variableIndex]
                    output.write(0x76)
                    output.write((-call.variableIndex * 2) & 0xff)

                    //console.log(combination.variables[call.variableIndex])

                    return null
                    return call.type
                }

                function translateConstantCall(call){
                    var constant = constants[ call.constantIndex ]
                    var type = types[ constant.typeIndex ]
                    //console.log('constant ' + JSON.stringify(constant))
                    //console.log('type ' + JSON.stringify(type))

                    //if(type.type.primitiveTypeIndex == 0){
                        /*output.write(0xFF); output.write(0x36); //push word[address]
                            output.write(constant.beginAddress % 256); output.write(constant.beginAddress / 256 % 256);*/

                        output.write(0x2E); output.write(0xFF); output.write(0x36); //push word[CS:address]
                            output.write(constant.beginAddress % 256); output.write(constant.beginAddress / 256 % 256);
                    //}

                    //return null
                    return constant.typeIndex
                }

                function translateCall(call){
                    if(typeof call.functionIndex !== 'undefined')
                        return translateFunctionCall(call)
                    else if(typeof call.variableIndex !== 'undefined')
                        return translateVariableCall(call)
                    else if(typeof call.constantIndex !== 'undefined')
                        return translateConstantCall(call)
                    else if(typeof call.argumentIndex !== 'undefined')
                        return translateArgumentCall(call)
                }

                translateRootFunctionCall(call)
            }

            if(!rootCombination.isMacros){
                output.write(0x89); output.write(0xEC);                                                  //mov sp, bp
                output.write(0x5D);                                                                      //pop bp
                //output.write(0x83); output.write(0xC4); output.write(functions[i].arguments.length * 2); //add sp, functions[i].arguments.length * 2
                //output.write(0xA1); output.write(0x00); output.write(0x00);                              //mov ax, 0
                output.write(0xC3);
            }                                                                      //ret
        }
    }

    var bitStream = {
        position: 0,
        data: 0,

        write: function(bit){
            if(bit)
                this.data |= 1

            ++this.position

            if(this.position == 8){
                output.write(this.data)
                this.position = 0
                this.data = 0
            }
            else
                this.data <<= 1
        }
    }

    for(var i in constants){
        var currentConstant = constants[i]
        var constantType = types[currentConstant.typeIndex]

        if(constantType.type.primitiveTypeIndex == 0){
            var position = 0
            var value = currentConstant.value

            for(var j = 0; j < constantType.type.value; ++j){
                bitStream.write((value & (0b10000000 >> position)))

                ++position

                if(position == 8){
                    position = 0
                    value /= 256
                }
            }
        }
        else if(constantType.type.primitiveTypeIndex == 2){
            var type = types[currentConstant.typeIndex]

            for(var j in currentConstant.value){
                var currentValue = currentConstant.value[j]
                var currentFieldPrimitiveTypeIndex = types[type.type.value[j].typeIndex].type.primitiveTypeIndex
                var currentFieldTypeValue = types[type.type.value[j].typeIndex].type.value

                if(currentFieldPrimitiveTypeIndex == 0){
                    var position = 0

                    for(var k = 0; k < currentFieldTypeValue; ++k){
                        bitStream.write((currentValue & (0b10000000 >> position)))

                        ++position

                        if(position == 8){
                            position = 0
                            currentValue /= 256
                        }
                    }
                }
                else if(currentFieldPrimitiveTypeIndex == 2){
                    throw 'recursive type not defined'
                }
            }
        }

        if(bitStream.position){
            output.write(bitStream.data)
        }
    }
/*
    while(output.address < 0x7C00 + 510)
        output.write(0x90)

    output.write(0x55)
    output.write(0xAA)*/
}


server.post('/compile', function(request, response){
    var program = request.body
    var output = new Output()

    calculateAddresses(program)
    compile(program.types, program.constants, program.functions, output)
    output.save('view/code.bin')

    response.send()
})

server.post('/save', function(request, response){
    fs.writeFile('view/code.json', JSON.stringify(request.body), function(){})
})

server.get('/load', function(request, response){
    fs.readFile('view/code.json', function(errorCode, data){
        response.send(data)
    })
})

server.listen(process.env.PORT || 8000)