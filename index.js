const express = require('express');
const PORT = process.env.PORT || 8080;
const server = express()
  .use((req, res) => res.end('Server is running.\n'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const SocketServer = require('ws').Server
const wss = new SocketServer({ server });

var connections = [];
var paints = [];

wss.on('connection', function (ws) {
    connections.push(ws);
    broadcast(JSON.stringify(paints));

    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });

    ws.on('message', function (message) {
        const json = JSON.parse(message);

        if(json["delete"] == true){
            paints = [];
            broadcast(JSON.stringify(paints));
            return;
        }

        var flg = true;
        paints.forEach(function (paint, i) {
            if(paint["x"] == json["x"] && paint["y"] == json["y"]){
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

function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

