var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Server is running.\n');
}).listen(3000);

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({
    host : '0.0.0.0',
    port : 8080
});

var connections = [];
var paints = [];

wss.on('connection', function (ws) {
    connections.push(ws);
    sendClientCounts();

    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
        sendClientCounts();
    });

    ws.on('message', function (message) {
        const json = JSON.parse(message);

        var flg = true;
        paints.forEach(function (paint, i) {
            if(paint["mouseX"] == json["mouseX"] && paint["mouseY"] == json["mouseY"]){
                flg = false;
            }
        });

        if(flg) {
            paints.push(json);
        }else{
            return;
        }

        broadcast(JSON.stringify(paints));
    });
});

function sendClientCounts() {
    var o = new Object();
    o.clients = connections.length;
    broadcast(JSON.stringify(o));
}

function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

console.log('http server running at http://127.0.0.1:3000/');
console.log('websocket server running at ws://127.0.0.1:8080/');
