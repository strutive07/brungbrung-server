var express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

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


    router.get('/', (req, res) => res.end('I choose you! (Server)\nMade by ssu.software.17.Wonjun Jang'));




    function checkToken(req){
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


module.exports = router;


