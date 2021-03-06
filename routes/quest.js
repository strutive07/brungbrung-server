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

router.get('/', (req, res) => res.end('I choose you! (Server)\nMade by ssu.software.17.Wonjun Jang\nquest routes'));

storage = multer.diskStorage({
    destination:(req, file, cb)=>{

        dirPath = __basedir + '/uploads'
        console.log(dirPath);

        cb(null, dirPath);
    },
    filename: (req, file, cb)=>{
        cb(null, uniqid() +file.originalname);
    }
})

router.post('/create', multer({storage:storage}).array('images', 20), (req, res) => {
    if(checkToken_by_id(req, req.body.data.request_person_id) === false){
        res.status(401).json({message: "Invalid Token!"});
    }
        data = JSON.parse(req.body.data);
        var quest_name = data.quest_name;
        var request_person_id = data.request_person_id;
        var title = data.title;
        var context = data.context;
        var location = data.location;
        var people_num_max = data.people_num_max;
        var people_num = 0;
        var room_type = data.type;
        var images_list = [];
        req.files.forEach((element) => {
            images_list.push(element.filename);
        });

            db.connectDB().then(
                quest_info.create_quest(quest_name, request_person_id, title, context, location, people_num_max, people_num,room_type, images_list)
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

/**
 * @swagger
 * /room/create:
 *   post:
 *     summary: 행사 추가하기.
 *     tags: [Room]
 *     parameters:
 *     - name: quest_name
 *       in: body
 *       description: >-
 *          행사 이름
 *       required: true
 *       default: None
 *       type: string
 *     - name: request_person_id
 *       in: body
 *       description: >-
 *          주최자 이름(단체 이름)
 *       required: true
 *       default: None
 *       type: string
 *     - name: title
 *       in: body
 *       description: >-
 *          행사 주제
 *       required: true
 *       default: None
 *       type: string
 *     - name: context
 *       in: body
 *       description: >-
 *          행사 설명
 *       required: true
 *       default: None
 *       type: string
 *     - name: location
 *       in: body
 *       description: >-
 *          행사 장소
 *       required: true
 *       default: None
 *       type: string
 *     - name: people_num_max
 *       in: body
 *       description: >-
 *          행사 최대 인원
 *       required: true
 *       default: None
 *       type: integer
 *     responses:
 *       200:
 *         description: 행사 추가하기 성공.
 *         example:
 *           message : "Sucessfully register quest"
 *       409:
 *         description: 이미 등록된 행사.
 *         example:
 *           message :  "Already Registered"
 *       401:
 *         description: 토큰과 유저 일치 하지 않음.
 *         example:
 *           message :  "Invalid Token! "
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Server Error"
 *
 */


router.post('/search', (req, res) => {
    var sub_string = req.body.sub_string;
    console.log(sub_string);
    db.connectDB().then(
        quest_info.search(sub_string)
            .then(results=>
                res.status(200).json({message: "success", results:results})
            ).catch(err => {
            console.log('err : ' + err);
            res.status(err.status).json({message: err.message});
        }));
});

/**
 * @swagger
 * /room/search:
 *   post:
 *     summary: 행사 검색하기.
 *     tags: [Room]
 *     parameters:
 *     - name: sub_string
 *       in: body
 *       description: >-
 *          검색할 부분 문자열
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 검색 성공. 검색 성공이 무조건 아이템이 존재함을 설명하지는 않음.
 *         example:
 *           message : "Sucessfully register quest"
 *           results: "results As JSON"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */

router.post('/search_type', (req, res) => {

    var sub_string = req.body.sub_string;
    console.log(sub_string);
    db.connectDB().then(
        quest_info.search_type(sub_string)
            .then(results=>
                res.status(200).json({message: "success", results:results})
            ).catch(err => {
            console.log('err : ' + err);
            res.status(err.status).json({message: err.message});
        }));
});

/**
 * @swagger
 * /room/search_type:
 *   post:
 *     summary: 행사 타입으로  검색하기.
 *     tags: [Room]
 *     parameters:
 *     - name: sub_string
 *       in: body
 *       description: >-
 *          검색할 부분 문자열
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 검색 성공. 검색 성공이 무조건 아이템이 존재함을 설명하지는 않음.
 *         example:
 *           message : "Sucessfully register quest"
 *           results: "results As JSON"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */

router.post('/go', (req, res) => {

    var id = req.body.id;
    var password = req.body.password;
    var objId = req.body.objId;

    console.log(id);
    console.log(password);

    if (id && password) {
        db.connectDB().then(login.LoginUser(id, password)
            .then(result => {
                const token = jwt.sign(result, config.secret, {expiresIn: 144000});

                db.connectDB().then(
                    quest_info.append_user_in_quest(id, objId)
                        .then(function(room) {
                            quest_info.enter_quest(id, room)
                                .then(user => {
                                    console.log(user);
                                    res.status(200).json({message: "success", results:user})
                                });
                        }).catch(err => {
                        console.log('err : ' + err);
                        res.status(err.status).json({message: err.message});
                    })
                );
            })
            .catch(err => {
                res.status(err.status).json({message: err.message})
            })
        )
    } else {
        res.status(400).json({message: 'Invalid Request !'});
    }
});



router.post('/enter/:id/:objId', (req, res) => {
    if (checkToken(req)) {
        const id = req.params.id;
        const objId = req.params.objId;
        if(id && objId){

            db.connectDB().then(
                quest_info.append_user_in_quest(id, objId)
                    .then(function(room) {
                        quest_info.enter_quest(id, room)
                            .then(user => {
                                res.status(200).json({message: "success", results:user})
                            });
                    }).catch(err => {
                    console.log('err : ' + err);
                    res.status(err.status).json({message: err.message});
                })
            );

        }else{
            res.status(401).json({message: 'Invalid Token! '});
        }

    } else {
        res.status(401).json({message: 'Invalid Token! '});
    }
});



/**
 * @swagger
 * /room/enter/{id}/{objId}:
 *   post:
 *     summary: 행사 참여하기.
 *     tags: [Room]
 *     parameters:
 *     - name: id
 *       in: path
 *       description: >-
 *          참여할 유저
 *       required: true
 *       default: None
 *       type: string
 *     - name: objId
 *       in: path
 *       description: >-
 *          참여할 행사의 ObjId 의 String
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 참여 성공.
 *         example:
 *           message : "success"
 *       401:
 *         description: 토큰과 유저 일치 하지 않음.
 *         example:
 *           message :  "Invalid Token! "
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */

router.get('/welcome/:objId', (req, res)=>{
    const objId = req.params.objId;

    if(objId){
        db.connectDB().then(
            quest_info.get_one_quest(objId)
                .then(results =>{
                    console.log(results);
                    res.render('welcome', {title:"hi",json:results});
                }).catch(err => {
                console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            }));
    }else{
        res.status(401).json({message: 'Invalid Token! '});
    }
});


router.get('/get_room/:objId', (req, res) => {
    const objId = req.params.objId;
    if(objId){
        db.connectDB().then(
            quest_info.get_one_quest(objId)
                .then(results =>{
                    res.status(200).json(results)
                }).catch(err => {
                console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            }));
    }else{
        res.status(401).json({message: 'Invalid Token! '});
    }
});

/**
 * @swagger
 * tags:
 *   name: RoomInfo
 *   description: return RoomInfo
 * definitions:
 *   RoomInfo:
 *     type: object
 *     required:
 *       - content
 *     properties:
 *       _id:
 *         type: string
 *         description: room Object Id
 *       quest_name:
 *         type: string
 *         description: 행사 이름
 *       request_person_id:
 *          type: string
 *          description: 주최자
 *       title:
 *          type: string
 *          description: 행사 주제, 이름
 *       context:
 *          type: string
 *          description: 행사 정보
 *       location:
 *          type: string
 *          description: 행사 위치
 *       people_num_max:
 *          type: Integer
 *          description: 최대 인원
 *       people_num:
 *          type: Integer
 *          description: 현재 인
 */

/**
 * @swagger
 * /room/get_room/{objId}:
 *   get:
 *     summary: 행사 정보 가져오기.
 *     tags: [Room]
 *     parameters:
 *     - name: objId
 *       in: path
 *       description: >-
 *          정보를 가져올 행사의 ObjId 의 String
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 참여 성공.
 *         schema:
 *           $ref: '#/definitions/RoomInfo'
 *       401:
 *         description: ObjId 없음 또는 오류.
 *         example:
 *           message :  "Invalid Token! "
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */


router.get('/get_room_all', (req, res) => {

        db.connectDB().then(
            quest_info.get_all_quest()
                .then(results =>{
                    res.status(200).json(results)
                }).catch(err => {
                console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            }));

});
/**
 * @swagger
 * /room/get_room_all/:
 *   get:
 *     summary: 행사 정보 가져오기.
 *     tags: [Room]
 *     parameters:
 *     responses:
 *       200:
 *         description: 참여 성공. 아래 데이터를 아이템으로 가지는 배열 리턴.
 *         schema:
 *           $ref: '#/definitions/RoomInfo'
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */





    // router.post('/push/:id/:older_id/:quest_id', (req, res) => {
    //     if (checkToken(req)) {
    //         var junior_json;
    //         db.connectDB().then(profile.GetProfile(req.params.id)
    //             .then(result =>{
    //                 junior_json = {name : result.name, phone_number : result.phone_number, difficulty : (req.params.quest_id)%10, quest_id : req.params.quest_id ,id : req.params.id};
    //                 return elder_user_quest_accept_list.push_one_quest_list_in_progress(req.params.older_id, junior_json)
    //             })
    //             .then( result =>
    //                 res.status(result.status).json({message: result.message, result : result.elder_user_accept_list})
    //             )
    //             .catch(err => {
    //                 res.status(err.status).json({message: err.message});
    //             })
    //         );
    //     } else {
    //         res.status(401).json({message: 'Invalid Token! '});
    //     }
    // });

    // router.post('/delete/:id/:index', (req, res) => {
    //     if (checkToken(req)) {
    //         db.connectDB().then(elder_user_quest_accept_list.delete_one_quest_list_by_index(req.params.id, req.params.index)
    //             .then( result =>
    //                 res.status(result.status).json({message: result.message, result : result.elder_user_accept_list})
    //             )
    //             .catch(err => {
    //                 res.status(err.status).json({message: err.message});
    //             })
    //         );
    //     } else {
    //         res.status(401).json({message: 'Invalid Token! '});
    //     }
    // });







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


