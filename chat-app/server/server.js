var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 7676);

console.log('server running...');

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname,'../public')
    })
})

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('connected: %s sockets connected', connections.length);
    console.log(socket.id);
    //disconnect
    socket.on('disconnect', function(data){
   
        users.splice(users.indexOf(socket.username),1);
        updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
     console.log('Disconnected: %s sockets conected', connections.length);
    });
    //send message
    socket.on('send message', function(data){
       //console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });
    //new user
    socket.on('new user', function(data, callback){
     //  console.log('inside new');
       
        if(users.indexOf(data) > -1) {

            socket.emit('userExists', data + ' username is taken! Try some other username.');
         }else{
           //  console.log('else');
        socket.username = data;
        users.push(socket.username);
        socket.emit('showMessage',socket.username);
        updateUsernames();
         }
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});