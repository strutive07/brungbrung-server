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
const post_model = require('../models/post');
var mongoose = require('mongoose');

exports.create_post = (room_id, user_auth_id,user_name, title, context, image_number, image_array) =>
    new Promise(((resolve, reject) => {
        const new_post = new post_model({
            room_id : room_id,
            user_auth_id : user_auth_id,
            user_name : user_name,
            title: title,
            context : context,
            created_at : new Date(),
            report_cnt : 0,
            comments : [],
            image_number : image_number,
            images : image_array
        });
        new_post.save().then((data) => resolve({
            status : 200,
            message : 'Sucessfully create post'
        })).catch(err =>{
            if(err.code == 11000){
                reject({ status: 409, message: 'Already Registered'});
            }else{
                reject({ status: 500, message: 'Server Error' });
            }
        });
    }));

exports.delete_post = (room_ObjId, post_ObjId) =>
    new Promise((resolve, reject) => {
        post_model.remove({$and:[
                {_id : mongoose.Types.ObjectId(post_ObjId)},
                {room_id : room_ObjId}
            ]})
            .then(results => {
                if(!results)
                    reject({ status: 404, message: 'Not Found that post'});
                else
                    resolve({status : 204, message : 'Sucessfully delete post'});
            })
    });




exports.get_one_post = (room_ObjId, post_ObjId) =>
    new Promise((resolve, reject) => {
        post_model.find({$and:[
                {_id : mongoose.Types.ObjectId(post_ObjId)},
                {room_id : room_ObjId}
            ]}).then(results => {
                if(results.length === 0){
                    reject({ status: 400, message: '그런 게시글이 존재하지 않습니다.' })
                }
            var post = results[0];
            return post;
        }).then(room => resolve(room))
            .catch(err => {
                console.log("err : " + err);
                reject({ status: 501, message: 'Internal Server Error !' })
            })});

exports.update_post = (room_ObjId, post_ObjId, title, context, image_number,image_array) =>
    new Promise((resolve, reject) => {
        post_model.find({$and:[
                {_id : mongoose.Types.ObjectId(post_ObjId)},
                {room_id : room_ObjId}
            ]}).then(results => {
            if(results.length === 0){
                reject({ status: 400, message: '그런 게시글이 존재하지 않습니다.' })
            }
            var post = results[0];
            post.title = title;
            post.context = context;
            post.images_cnt = image_number;
            post.images = image_array;
            post.save();
            return post;
        }).then(room => resolve(room))
            .catch(err => {
                console.log("err : " + err);
                reject({ status: 501, message: 'Internal Server Error !' })
            })});

exports.get_all_post = (room_ObjId) =>
    new Promise((resolve, reject) => {
        post_model.find({room_id:room_ObjId}).then(results =>{
            if(results.length === 0){
                reject({ status: 400, message: '그런 게시글이 존재하지 않거나 행사 정보가 잘못되었습니다.' })
            }
            resolve(results)
        }).catch(err => {
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.search = sub_string =>
    new Promise((resolve, reject) => {
        post_model.find({$or :[
               {user_name:sub_string},
               {title:{$regex:sub_string}},
               {context:{$regex:sub_string}}
                ]})
           .then(results => {
               resolve(results);
           }).catch(err => {
           console.log("err : " + err);
           reject({ status: 500, message: 'Internal Server Error !' })
       })
    });