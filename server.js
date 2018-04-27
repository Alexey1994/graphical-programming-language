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

    var output = {
        address: 0,

        write: function(){
            ++this.address
        }
    }

    for(var i in functions){
        var combinations = functions[i].combinations

        for(var j in combinations){
            var combination = combinations[j]
            var body = combination.body

            combination.beginAddress = output.address

            for(var k in body){
                var call = body[k]

                function translateCall(call){
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
                        function f(out, arguments, call, combination, body){
                            eval(combination.translate)
/*
                            //call
                            var address = (combination.beginAddress - call.beginAddress - 4 + 1) & 65535

                            out.write(0xE8);
                                out.write(address % 256); out.write((address / 256) % 256);
                            out.write(0x50);

                            //jump
                            if(typeof call.branch !== 'undefined'){
                                address = (body[call.branch].beginAddress - out.address - 7) & 65535

                                out.write(0x83); out.write(0xF8); //cmp ax, 0
                                    out.write(0x00);
                                
                                out.write(0x0F); out.write(0x84); //je address
                                    out.write(address % 256); out.write((address / 256) % 256);
                            }
*/
                        }

                        f(output, arguments, call, combination, body)
                    }

                    call.endAddress = output.address

                    return null //temporary
                    return combination.type
                }

                translateCall(call)
            }

            combination.endAddress = output.address
        }
    }
}


function compile(functions, output){

    for(var i in functions){
        var combinations = functions[i].combinations

        for(var j in combinations){
            var combination = combinations[j]
            var body = combination.body

            for(var k in body){
                var call = body[k]

                function translateCall(call){
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
                        function f(out, arguments, call, combination, body){
                            eval(combination.translate)
/*
                            //call
                            var address = (combination.beginAddress - call.beginAddress - 4 + 1) & 65535

                            out.write(0xE8);
                                out.write(address % 256); out.write((address / 256) % 256);
                            out.write(0x50);

                            //jump
                            if(typeof call.branch !== 'undefined'){
                                address = (body[call.branch].beginAddress - out.address - 7) & 65535

                                out.write(0x83); out.write(0xF8); //cmp ax, 0
                                    out.write(0x00);
                                
                                out.write(0x0F); out.write(0x84); //je address
                                    out.write(address % 256); out.write((address / 256) % 256);
                            }
*/
                        }

                        f(output, arguments, call, combination, body)
                    }

                    return null //temporary
                    return combination.type
                }

                translateCall(call)
            }
        }
    }

    output.write(0x90); //for help, del
}


server.post('/compile', function(request, response){
    var program = request.body
    var output = new Output()

    calculateAddresses(program)
    compile(program.functions, output)
    output.save('code.bin')

    response.send()
})

server.post('/save', function(request, response){
    fs.writeFile('code.json', JSON.stringify(request.body), function(){})
})

server.get('/load', function(request, response){
    fs.readFile('code.json', function(errorCode, data){
        response.send(data)
    })
})

server.listen(8000)