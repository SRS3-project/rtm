if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development')
    require('dotenv').config()
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const clients = {};

const port = parseInt(process.env.PORT) || 3000;
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
    console.log('connection');
    socket.on('auth', (data) => {
        console.log('auth:', data)
        if (data === process.env.AUTH_KEY) {
            console.log('auth success');
            clients[socket.id] = socket;
        }
    })

    socket.on('data', (data) => {
        try {
            data = JSON.parse(data);
            console.log(data);
            if (typeof data['brokerAuthKey'] !== 'undefined') {
                if (data['brokerAuthKey'] === process.env.BROKER_TOKEN) {
                    delete data['brokerAuthKey'];
                    data = JSON.stringify(data);
                    console.log(data);

                    Object.keys(clients).forEach(clientId => {
                        clients[clientId].emit('data', data);
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('disconnect', () => {
        if (typeof clients[socket.id] !== 'undefined') {
            delete clients[socket.id];
        }
    });
});
