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



router.get('/', (req, res) => res.end('I choose you! (Server)\nMade by ssu.software.17.Wonjun Jang\nquest routes'));


router.post('/create', (req, res) => {
        var quest_name = req.body.quest_name;
        var request_person_id = req.body.request_person_id;
        var title = req.body.title;
        var context = req.body.context;
        var location = req.body.location;
        var people_num_max = req.body.people_num_max;
        var people_num = 0;
        var room_type = req.body.type;


            db.connectDB().then(
                quest_info.create_quest(quest_name, request_person_id, title, context, location, people_num_max, people_num,room_type)
                    .then(result => {
                        // console.log(result);

                        dirPath = __basedir + '/uploads/' + result.data._id;
                        console.log(dirPath)
                        fs.mkdirSync(dirPath);
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

router.post('/enter/:id/:objId', (req, res) => {
    if (checkToken(req)) {
        const id = req.params.id;
        const objId = req.params.objId;
        if(id && objId){
            // db.connectDB().then(
            //     quest_info.enter_quest(id, objId)
            //         .then(user =>{
            //
            //         }).catch(err => {
            //             console.log('err : ' + err);
            //             res.status(err.status).json({message: err.message});
            //         }));
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


module.exports = router;


