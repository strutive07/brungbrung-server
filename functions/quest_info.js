'use strict';
// quest_id : String
// request_person_id : Number,
//     title : String,
//     context : String,
//     purpose : String,
//     location : String,
//     difficulty : Boolean, //0 쉬움 1 어려움
//     reward : String


//title, context, purpose, location, difficulty, reward
//는 quest_info 에 저장

//의뢰인 이름, 전화번호는 선배 db 에서 불러오기. request_person_Id 로 불러옴.
const quest_info = require('../models/quest_info');
const user = require('../models/user');
const bcrypt = require('bcryptjs');
const db = require('mongodb');
var mongoose = require('mongoose');

exports.create_quest = (quest_name, request_person_id, title, context, location, people_num_max, people_num, room_type) =>
    new Promise(((resolve, reject) => {
        const new_quest_info = new quest_info({
            quest_name : quest_name,
            request_person_id : request_person_id,
            title : title,
            context : context,
            location : location,
            people_num_max : people_num_max,
            people_num : people_num,
            users : [],
            type : room_type
        });
        new_quest_info.save().then((data) => resolve({
            status : 200,
            message : 'Sucessfully register quest',
            data : data
        })).catch(err =>{
            if(err.code == 11000){
                reject({ status: 409, message: 'Already Registered'});
            }else{
                reject({ status: 500, message: 'Server Error' });
            }
        });

    }));

exports.enter_quest = (auth_id, room_ObjId) =>
    new Promise((resolve, reject) => {
        user.find({auth_id : auth_id}).then(results => {
            var user = results[0];
            console.log(user);
            user.room_string.push(room_ObjId);
            console.log(user);
            return user.save();
        }).then(user => {
            console.log(user);
            resolve(user);
        }).catch(err => {
            console.log("err : " + err);
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.append_user_in_quest = (auth_id, room_ObjId) =>
    new Promise((resolve, reject) => {
        quest_info.find({_id : mongoose.Types.ObjectId(room_ObjId)}).then(results => {
            var room = results[0];
            console.log(room);
            room.people_num = room.people_num + 1;
            room.users.push(auth_id);
            room.save();
            console.log(room);
            resolve(room);
            // return room;
        }).catch(err => {
                console.log("err : " + err);
                reject({ status: 501, message: 'Internal Server Error !' })
            })});

exports.get_all_quest = () =>
    new Promise((resolve, reject) => {
        quest_info.find().then(results =>
            resolve(results)
        ).catch(err => {
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.get_one_quest = (room_ObjId) =>
    new Promise((resolve, reject) => {
        quest_info.find({_id : mongoose.Types.ObjectId(room_ObjId)}).then(results => {
            var room = results[0];
            return room;
        }).then(room => resolve(room))
            .catch(err => {
                console.log("err : " + err);
                reject({ status: 501, message: 'Internal Server Error !' })
            })});
exports.search = sub_string =>
    new Promise((resolve, reject) => {
       quest_info.find({$or :[{quest_name:{$regex:sub_string},}, {title:{$regex:sub_string}}, {context:{$regex:sub_string}}, {request_person_id:{$regex:sub_string}}]})
           .then(results => {
               resolve(results);
           }).catch(err => {
           console.log("err : " + err);
           reject({ status: 500, message: 'Internal Server Error !' })
       })
    });

exports.search_type = sub_string =>
    new Promise((resolve, reject) => {
        quest_info.find({type:sub_string})
            .then(results => {
                resolve(results);
            }).catch(err => {
            console.log("err : " + err);
            reject({ status: 500, message: 'Internal Server Error !' })
        })
    });

