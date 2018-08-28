var express = require('express');
const router = express.Router();

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');
const urlencode = require('urlencode');

const register = require('../functions/register');
const login = require('../functions/login');
const user_quest_bool = require('../functions/user_quest_bool');
const elder_user_quest_accept_list= require('../functions/chat');
const profile = require('../functions/profile');
const quest_complete_flow = require('../functions/quest_complete_flow');
const quest_info = require('../functions/quest_info');
const password = require('../functions/password');
const db = require('../util/db');
const config = require('../config/config');
const fs = require('fs');
const multer = require('multer');
const uniqid = require('uniqid');
require('babel-polyfill');
var brandedQRCode = require('branded-qr-code');
const python_shell = require('python-shell');
const survey_functions = require('../functions/survey');

router.get('/', (req, res) => res.end('I choose you! (Server)\nMade by ssu.software.17.Wonjun Jang\nquest routes'));


router.post('/create', (req, res) => {
        var room_id = req.body.room_id;
        var survey_form = req.body.survey_form;
        console.log(room_id);
            db.connectDB().then(
                survey_functions.create_survey(room_id, survey_form)
                    .then(result => {
                        // console.log(result);
                        res.status(result.status).json({message: result.message, data : result.data});
                    })
                    .catch(err => {
                        console.log('err : ' + err);
                        res.status(err.status).json({message: err.message});
                    })
            );
    });


router.post('/get_survey', (req, res) => {
    var room_id = req.body.room_id;
    console.log(room_id)
    db.connectDB().then(
        survey_functions.get_survey(room_id)
            .then(result => {
                // console.log(result);
                res.status(200).json(result);
            })
            .catch(err => {
                console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    );
});

router.post('/submit_survey', (req, res) => {
    var room_id = req.body.room_id;
    var survey_data = req.body.survey_form;
    console.log(survey_data);
    db.connectDB().then(
        survey_functions.submit_survey(room_id,survey_data)
            .then(result => {
                // console.log(result);
                res.status(200).json(result);
            })
            .catch(err => {
                console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    );
});

    function checkToken(req){
        return true;
        const token = req.headers['x-access-token'];
        if(token){
            try{
                var decoded = jwt.verify(token, config.secret);
                if(decoded.message === req.params.id){
                    console.log("hoho");
                    return true;
                }else{
                    console.log("bobo");
                    return false;
                }

            }catch(err){
                return false;
            }
        }else{
            return false;
        }
    }
    function checkToken_by_id(req, id){
        return true;
        const token = req.headers['x-access-token'];
        if(token){
            try{
                var decoded = jwt.verify(token, config.secret);
                if(decoded.message === id){
                    console.log("hoho");
                    return true;
                }else{
                    console.log("bobo");
                    return false;
                }

            }catch(err){
                return false;
            }
        }else{
            return false;
        }
    }


module.exports = router;


