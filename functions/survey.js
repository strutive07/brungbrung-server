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
const survey = require('../models/survey');
var mongoose = require('mongoose');


exports.create_survey = (room_id, surveys) =>
    new Promise(((resolve, reject) => {
        var survey_len = surveys.length;
        var survey_result = [];

        for(var i = 0; i<survey_len; i++){
            var tmp_json = JSON.parse(JSON.stringify(surveys[i]));
            tmp_json.write_string = []
            survey_result.push(tmp_json);
            // if(surveys[i].type == 2){
            //     var tmp_json = JSON.parse(JSON.stringify(surveys[i]));
            //     tmp_json.write_string = []
            //     survey_result.push(tmp_json);
            // }else{
            //     survey_result.push(surveys[i]);
            // }
        }

        const new_survey = new survey({
            room_id:room_id,
            survey_form:surveys,
            survey:survey_result
        });
        new_survey.save().then((data) => resolve({
            status : 200,
            message : 'Sucessfully register survey',
            data : data
        })).catch(err =>{
            if(err.code == 11000){
                reject({ status: 409, message: 'Already Registered'});
            }else{
                reject({ status: 500, message: 'Server Error' });
            }
        });
    }));

exports.get_survey = (room_ObjId) =>
    new Promise((resolve, reject) => {
        survey.find({room_id : room_ObjId}).then(results => {
            var survey = results[0];
            // console.log(user);
            // user.room_string.push(room_ObjId);
            // console.log(user);
            return survey;
        }).then(survey => {
            console.log(survey);
            resolve(survey);
        }).catch(err => {
            console.log("err : " + err);
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.submit_survey = (room_id, surveys) =>
    new Promise((resolve, reject) => {
        survey.find({room_id : room_id}).then(results => {
            var survey_one = results[0];
            var tmp_list = survey_one.survey;

            var survey_len = survey_one.survey.length;

            for(var i = 0; i < survey_len; i++){
                console.log("surveys[i] ")

                if(surveys[i].type === 0){
                    console.log(surveys[i])
                    var n_list_len = surveys[i].body.length;
                    for(var j = 0; j<n_list_len; j++){
                        console.log(survey_one.survey[i].body[j])
                        tmp_list[i].body[j].check += surveys[i].body[j].check;
                        console.log(survey_one.survey[i].body[j])
                    }
                }else if(surveys[i].type === 1){
                    var n_list_len = surveys[i].body.length;
                    for(var j = 0; j<n_list_len; j++){
                        tmp_list[i].body[j].check += surveys[i].body[j].check;
                    }
                }else if(surveys[i].type === 2){
                    tmp_list[i].write_string.push(surveys[i].write_string)
                }
            }


            for(var i=0; i<tmp_list.length; i++){
                survey_one.survey.set(i,tmp_list[i]);
            }

            console.log(survey_one);
            survey_one.save();
            console.log(survey_one);
            survey.update({room_id:room_id})
            return survey_one;
        }).then(survey_one => resolve(survey_one))
            .catch(err => {
                console.log("err : " + err);
                reject({ status: 501, message: 'Internal Server Error !' })
            })});

