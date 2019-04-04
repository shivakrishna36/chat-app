var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
var folks = new Map();
server.listen(process.env.PORT || 7777);

console.log('server running...');

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, '../public')
    })
})

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('connected: %s sockets connected', connections.length);
    console.log(socket.id);
    //disconnect
    socket.on('disconnect', function (data) {

        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets conected', connections.length);
    });

    //new user
    socket.on('new user', function (data, callback) {
        //  console.log('inside new');

        if (users.indexOf(data) > -1) {

            socket.emit('userExists', data + ' username is taken! Try some other username.');
        } else {
            let i = 0;
            socket.username = data;
            users.push(socket.username);
            //socket.emit('users', users);
            console.log('names',users);
            let name = socket.username;
            let id = socket.id;
            folks.set(name, id );
            i++;
            /*var itr = folks[Symbol.iterator]();
            for (var u of itr) {
                console.log(u);
            }
            console.log('name',folks.get(value));*/
            socket.emit('showMessage', users);
            updateUsernames();
        }
    });

    //send message
    socket.on('send message', function (data) {
        //console.log(data);
        //io.sockets.emit('new message', { msg: data, user: socket.username });
        io.sockets.to(folks.get()).emit('new message', { msg: data, user: socket.username });
        //let ID = folks.name;
        //socket.broadcast.to(socket.id).emit('new message', { msg: data, user: socket.username });
        console.log(socket.id);
        //io.sockets.socket(socket.id).emit("new message",socket.username,data+socket.username);
    });

    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
});