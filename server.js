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


function calculateAddresses(program){
    var functions = program.functions
    var constants = program.constants
    var types = program.types

    var output = {
        address: 0x7C00,

        write: function(){
            ++this.address
        }
    }

    output.write(0x8C); output.write(0xC8); //mov ax,cs
    output.write(0x8E); output.write(0xD8); //mov ds,ax
    output.write(0x8E); output.write(0xD0); //mov ss,ax

    for(var i in functions){
        var combinations = functions[i].combinations

        for(var j in combinations){
            var rootCombination = combinations[j]
            var body = rootCombination.body

            rootCombination.beginAddress = output.address
/*
            output.write(0x55); //push bp
            output.write(0x89); output.write(0xE5); //mov bp, sp
            output.write(0x83); output.write(0xEC); output.write(rootCombination.variables.length * 2); //sub sp, rootCombination.variables.length * 2
*/
            for(var k in body){
                var call = body[k]

                function translateFunctionCall(call){
                    call.beginAddress = output.address

                    var arguments = call.arguments
                    var type = []

                    for(var l in arguments)
                        type.push(translateCall(arguments[l]))

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
                    }

                    var combination = getCombination(functions[call.functionIndex], type)

                    if(typeof combination == 'undefined'){
                        console.log('error in ' + functions[call.functionIndex].name)
                        return undefined
                    }
                    else{
                        function f(out, arguments, call, rootCombination, combination, body){
                            eval(combination.translate)
                        }

                        f(output, arguments, call, rootCombination, combination, body)
                    }

                    call.endAddress = output.address

                    return null //temporary
                    return combination.type
                }

                function translateVariableCall(call){
                    output.write(0xFF) //push [bp + variableIndex]
                    output.write(0x76)
                    output.write((-call.variableIndex * 2) & 0xff)

                    return null
                    return call.type
                }

                function translateConstantCall(call){
                    var constant = constants[ call.constantIndex ]
                    //var type = types[ constant.typeIndex ]
                    //console.log('constant ' + JSON.stringify(constant))
                    //console.log('type ' + JSON.stringify(type))
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
                }

                translateCall(call)
            }
/*
            output.write(0x89); output.write(0xEC); //mov sp, bp
            output.write(0x5D); //pop bp
            output.write(0x83); output.write(0xC4); output.write(functions[i].arguments.length * 2); //add sp, functions[i].arguments.length * 2
            output.write(0xA1); output.write(0x00); output.write(0x00); //mov ax, 0
            output.write(0xC3); //ret
*/
            rootCombination.endAddress = output.address
        }
    }
}


function compile(constants, functions, output){
    output.address = 0x7C00

    output.write(0x8C); output.write(0xC8); //mov ax,cs
    output.write(0x8E); output.write(0xD8); //mov ds,ax
    output.write(0x8E); output.write(0xD0); //mov ss,ax

    for(var i in functions){
        var combinations = functions[i].combinations

        for(var j in combinations){
            var rootCombination = combinations[j]
            var body = rootCombination.body
/*
            output.write(0x55);                                                                         //push bp
            output.write(0x89); output.write(0xE5);                                                     //mov bp, sp
            output.write(0x83); output.write(0xEC); output.write(rootCombination.variables.length * 2); //sub sp, rootCombination.variables.length * 2
*/
            for(var k in body){
                var call = body[k]

                function translateFunctionCall(call){
                    var arguments = call.arguments
                    var type = []

                    for(var l in arguments)
                        type.push(translateCall(arguments[l]))

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
                    }

                    var combination = getCombination(functions[call.functionIndex], type)

                    if(typeof combination == 'undefined'){
                        //console.log('error in ' + functions[call.functionIndex].name)
                        return undefined
                    }
                    else{
                        function f(out, arguments, call, rootCombination, combination, body){
                            var console = {
                                log: function(){}
                            }
                            
                            eval(combination.translate)
                        }

                        f(output, arguments, call, rootCombination, combination, body)
                    }

                    return null //temporary
                    return combination.type
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
                    //var type = types[ constant.typeIndex ]
                    //console.log('constant ' + JSON.stringify(constant))
                    //console.log('type ' + JSON.stringify(type))
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
                }

                translateCall(call)
            }
/*
            output.write(0x89); output.write(0xEC);                                                  //mov sp, bp
            output.write(0x5D);                                                                      //pop bp
            output.write(0x83); output.write(0xC4); output.write(functions[i].arguments.length * 2); //add sp, functions[i].arguments.length * 2
            output.write(0xA1); output.write(0x00); output.write(0x00);                              //mov ax, 0
            output.write(0xC3);       */                                                               //ret
        }
    }

    output.write(0x90); //for help, del

    while(output.address < 0x7C00 + 510)
        output.write(0x90)

    output.write(0x55)
    output.write(0xAA)
}


server.post('/compile', function(request, response){
    var program = request.body
    var output = new Output()

    calculateAddresses(program)
    compile(program.constants, program.functions, output)
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