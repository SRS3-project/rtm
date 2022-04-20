const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
require('dotenv').config()

const clients = {};

const port = parseInt(process.env.PORT) || 3000;
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
    console.log('connection')
    socket.on('auth', (data) => {
        if (data === process.env.AUTH_KEY) {
            clients[socket.id] = socket;
        }
    })

    socket.on('data', (data) => {
        data = JSON.parse(data);
        if (typeof data['brokerAuthKey'] !== 'undefined') {
            if (data['brokerAuthKey'] === process.env.BROKER_AUTH_KEY) {
                delete data['brokerAuthKey'];
                data = JSON.stringify(data);
                console.log(data);

                Object.keys(clients).forEach(clientId => {
                    clients[clientId].emit('data', data);
                });
            }
        }
    });

    socket.on('disconnect', () => {
        if (typeof clients[socket.id] !== 'undefined') {
            delete clients[socket.id];
        }
    });
});
