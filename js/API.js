function get_client_API()
{
    var client_API

    try { client_API = new ActiveXObject("Msxml2.XMLHTTP") } 
    catch (e) 
    {
        try { client_API = new ActiveXObject("Microsoft.XMLHTTP") } 
        catch (E) { client_API = false }
    }

    if (!client_API &&  typeof XMLHttpRequest != 'undefined')
        client_API = new XMLHttpRequest()

    return client_API
}


function get(path, on_success)
{
    var client_API = get_client_API()

    client_API.open('GET', path, true)

    client_API.onreadystatechange = function()
    {
        if(client_API.readyState==4)
        {
            if(client_API.status!=200)
                return

            on_success(client_API.responseText)
        }
    }

    client_API.send(null)
}


function send(path, data, on_success)
{
    var client_API = get_client_API()

    client_API.open('POST', path, true)
    client_API.setRequestHeader('Content-Type', 'application/json')

    client_API.onreadystatechange = function()
    {
        if(client_API.readyState==4)
            on_success(client_API.responseText)
    }

    client_API.send(data)
}
