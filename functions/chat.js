// var socketio = require('socket.io');
const db = require('../util/db');
var mongoose = require('mongoose');
const quest_info = require('../models/quest_info');
const user = require('../models/user');
const chat = require('../models/chat');
const bcrypt = require('bcryptjs');


module.exports.sockets = function(io) {
    // io = socketio.listen(http);
    console.log('Socket io 준비');
    io.on('connect', function(socket) {
        // io.emit('connect', socket);

        console.log('Socket Connected');

        socket.on('joinRoom', (data)=>{
            id = data.id;
            room_object_id = data.room_object_id;
            console.log(id, room_object_id);
            db.connectDB().then(
                chat.find({room_id : room_object_id})
                    .then(results => {
                        if(results.length == 0){
                            console.log('new room');
                            var newRoom = new chat({
                                room_id:room_object_id,
                                users:[id],
                                messages:[]
                            });
                            newRoom.save((err, results)=>{
                                if(err){
                                    console.log(err);
                                    return err;
                                }
                                socket.join(room_object_id);
                                socket.emit('init_data', {result : results});
                            });
                        }else{

                            var result = results[0];
                            console.log('cur room', result);
                            result.users.push(id);
                            result.save();
                            socket.join(room_object_id);
                            socket.emit('init_data', {result : result});
                        }
                    }).catch(err => {
                    console.log(err);
                })
            );
        });

        socket.on('leaveRoom', (data)=>{
            id = data.id;
            room_object_id = data.room_object_id;
            console.log(id, room_object_id);
            db.connectDB().then(
                chat.find({room_id : room_object_id}, function(err, results) {
                    if(err)
                        return err;
                    if(results.length == 0){
                        console.log('No Such Room : ', room_object_id);
                        return null;
                    }

                    var result = results[0];
                    let len = result.users.length;
                    for(let i = 0; i<len; i++){
                        if(result.users[i] === id){
                            result.users.splice(i, 1);
                            break;
                        }
                    }
                    result.save();
                    socket.leave(room_object_id);
                    socket.emit('init_data', result);
                })
            );

        });

        socket.on('send_message', (data)=>{
            id = data.id;
            name = data.name;
            message = data.message;
            room_object_id = data.room_object_id;

            console.log(id, room_object_id);
            var message_json = {
                author : name,
                message : message,
                created_at : new Date()
            };


            socket.broadcast.to(room_object_id).emit('receive_message', message_json);

            db.connectDB().then(
                chat.find({room_id : room_object_id}, function(err, results) {
                    if(err)
                        return err;
                    if(results.length == 0){
                        console.log('No Such Room : ', room_object_id);
                        return null;
                    }

                    var result = results[0];

                    result.messages.push(message_json);
                    result.save();
                })
            );

        });

        socket.on('disconnect', ()=>{
            console.log('Socket disconnect');
        });
    })
}