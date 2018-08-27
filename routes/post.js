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
const post_functions = require('../functions/post_api');
const db = require('../util/db');
const config = require('../config/config');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const uniqid = require('uniqid');
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
        console.log(req.body.data);
        data = JSON.parse(req.body.data);
        var room_id = data.room_id;
        var user_auth_id = data.user_auth_id;
        var user_name = data.user_name;
        var title = data.title;
        var context = data.context;
        var images_cnt = data.images_cnt;
        var images_list = [];
        console.log('[data] ',room_id, user_auth_id);
        req.files.forEach((element) => {
            images_list.push(element.filename);
        });

        console.log(req.files);
            db.connectDB().then(
                post_functions.create_post(room_id, user_auth_id, user_name,title,context,images_cnt,images_list)
                    .then(result => {
                        res.status(result.status).json({message: result.message});
                    })
                    .catch(err => {
                        console.log('err : ' + err);
                        res.status(err.status).json({message: err.message});
                    })
            );
    });

/**
 * @swagger
 * /post/create:
 *   post:
 *     summary: 게시글 추가하기.
 *     tags: [Post]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *     - name: images
 *       in: formData
 *       description: >-
 *          이미지들
 *       required: false
 *       default: None
 *       type: file
 *     - name: data
 *       in: body
 *       description: >-
 *          행사 Object Id
 *       required: true
 *       default: None
 *       type: Object
 *       example:
 *	        room_id : "5b6e898a715e837293dfd7fd"
 *	        user_auth_id : "dev1234"
 *	        user_name : "장원준"
 *	        title : "hi"
 *	        context : "context hoho"
 *	        images_cnt : 0
 *
 *     responses:
 *       200:
 *         description: 게시글 추가하기 성공.
 *         example:
 *           message : "Sucessfully create post"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Server Error"
 *
 */

router.post('/update', (req, res) => {
    var room_id = req.body.room_id;
    var post_ObjId = req.body.post_ObjId;
    var title = req.body.title;
    var context = req.body.context;
    var images_cnt = req.body.images_cnt;
    var images_array = req.body.images;

    db.connectDB().then(
        post_functions.update_post(room_id,post_ObjId, title,context,images_cnt,images_array)
            .then(result => {
                res.status(200).json({message: "success", results: result});
            })
            .catch(err => {
                console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    );
});

/**
 * @swagger
 * /post/update:
 *   post:
 *     summary: 게시글 수정하기.
 *     tags: [Post]
 *     parameters:
 *     - name: room_id
 *       in: body
 *       description: >-
 *          행사 Object Id
 *       required: true
 *       default: None
 *       type: string
 *     - name: post_ObjId
 *       in: body
 *       description: >-
 *          게시글 Object Id
 *       required: true
 *       default: None
 *       type: string
 *     - name: title
 *       in: body
 *       description: >-
 *          게시글 제목
 *       required: true
 *       default: None
 *       type: string
 *     - name: context
 *       in: body
 *       description: >-
 *          게시글 내용
 *       required: true
 *       default: None
 *       type: string
 *     - name: images_cnt
 *       in: body
 *       description: >-
 *          이미지 개수
 *       required: true
 *       default: None
 *       type: integer
 *     - name: images
 *       in: body
 *       description: >-
 *          업로드된 이미지 urls
 *       required: true
 *       default: None
 *       type: string
 *       example:
 *	        room_id : "5b6e898a715e837293dfd7fd"
 *	        post_ObjId : "5b7566f34a3c915802e70580"
 *	        title : "hi hoho changed"
 *	        context : "context hoho"
 *	        images_cnt : 0
 *	        images : []
 *     responses:
 *       200:
 *         description: 게시글 수정하기 성공.
 *         example:
 *           message : "Sucessfully update post"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Server Error"
 *
 */


router.post('/search/:sub_string', (req, res) => {
    var sub_string = urlencode.decode(req.params.sub_string);
    db.connectDB().then(
        post_functions.search(sub_string)
            .then(results=>
                res.status(200).json({message: "success", results:results})
            ).catch(err => {
            console.log('err : ' + err);
            res.status(err.status).json({message: err.message});
        }));
});

/**
 * @swagger
 * /post/search/{sub_string}:
 *   post:
 *     summary: 게시글 검색하기.
 *     tags: [Post]
 *     parameters:
 *     - name: sub_string
 *       in: path
 *       description: >-
 *          검색할 부분 문자열
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 검색 성공. 검색 성공이 무조건 아이템이 존재함을 설명하지는 않음.
 *         example:
 *           message : "success"
 *           results: "results As JSON"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */



/**
 * @swagger
 * /post/search/{sub_string}:
 *   post:
 *     summary: 게시글 검색하기.
 *     tags: [Post]
 *     parameters:
 *     - name: sub_string
 *       in: path
 *       description: >-
 *          검색할 부분 문자열
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 검색 성공. 검색 성공이 무조건 아이템이 존재함을 설명하지는 않음.
 *         example:
 *           message : "success"
 *           results: "results As JSON"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */


router.post('/add_comment', (req, res) => {
    const objId = req.body.room_ObjId;
    const post_ObjId = req.body.post_ObjId;
    const user_auth_id = req.body.auth_id;
    const user_name = req.body.author;
    const context = req.body.message;

    if(objId && post_ObjId){
        db.connectDB().then(
            post_functions.add_comment(objId, post_ObjId,user_auth_id,user_name,context)
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

router.get('/get_post/:room_ObjId/:post_ObjId', (req, res) => {
    const objId = req.params.room_ObjId;
    const post_ObjId = req.params.post_ObjId;

    if(objId && post_ObjId){
        db.connectDB().then(
            post_functions.get_one_post(objId, post_ObjId)
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

router.get('/add_like/:room_ObjId/:post_ObjId', (req, res) => {
    const objId = req.params.room_ObjId;
    const post_ObjId = req.params.post_ObjId;

    if(objId && post_ObjId){
        db.connectDB().then(
            post_functions.add_like(objId, post_ObjId)
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

router.get('/get_top_3/:room_ObjId/', (req, res) => {
    const objId = req.params.room_ObjId;

    if(objId){
        db.connectDB().then(
            post_functions.get_top_3(objId)
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

router.get('/get_all_post/:room_ObjId/', (req, res) => {
    const objId = req.params.room_ObjId;

    if(objId){
        db.connectDB().then(
            post_functions.get_all_post(objId)
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
 * /post/get_all_post/{room_ObjId}:
 *   get:
 *     summary: 해당 행사 모든 게시글 가져오기.
 *     tags: [Post]
 *     parameters:
 *     - name: room_ObjId
 *       in: path
 *       description: >-
 *          게시글 정보를 가져올 행사의 ObjId 의 String
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 게시글 정보. Array 형태로 나옴.
 *         schema:
 *           $ref: '#/definitions/PostInfo'
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */

/**
 * @swagger
 * tags:
 *   name: PostInfo
 *   description: return PostInfo
 * definitions:
 *   RoomInfo:
 *     type: object
 *     required:
 *       - content
 *     properties:
 *       _id:
 *         type: ObjectId
 *         description: post Object Id
 *       room_id:
 *         type: string
 *         description: 행사 Object Id
 *       user_auth_id:
 *          type: string
 *          description: 게시글 생성자 id
 *       user_name:
 *          type: string
 *          description: 게시글 생성자 name
 *       title:
 *          type: string
 *          description: 게시글 제목
 *       context:
 *          type: string
 *          description: 게시글 정보
 *       created_at:
 *          type: string
 *          description: 게시글 생성 날짜 및 시간
 *       report_cnt:
 *          type: Integer
 *          description: 신고 받은 횟수
 *       images_cnt:
 *          type: Integer
 *          description: 이미지 개수
 *       images:
 *          type: Array
 *          description: 이미지 url 목록들.
 *       comments:
 *          type: Array
 *          description: 댓글
 */

/**
 * @swagger
 * /post/get_post/{room_ObjId}/{post_ObjId}:
 *   get:
 *     summary: 게시글 정보 하나 가져오기.
 *     tags: [Post]
 *     parameters:
 *     - name: room_ObjId
 *       in: path
 *       description: >-
 *          게시글 정보를 가져올 행사의 ObjId 의 String
 *       required: true
 *       default: None
 *       type: string
 *     - name: post_ObjId
 *       in: path
 *       description: >-
 *          게시글 정보를 가져올 게시글의 ObjId 의 String
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 참여 성공.
 *         schema:
 *           $ref: '#/definitions/PostInfo'
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */
router.post('/search/:sub_string', (req, res) => {
    var sub_string = urlencode.decode(req.params.sub_string);
    db.connectDB().then(
        post_functions.search(sub_string)
            .then(results=>
                res.status(200).json({message: "success", results:results})
            ).catch(err => {
            console.log('err : ' + err);
            res.status(err.status).json({message: err.message});
        }));
});

/**
 * @swagger
 * /post/search/{sub_string}:
 *   post:
 *     summary: 게시글 검색하기.
 *     tags: [Post]
 *     parameters:
 *     - name: sub_string
 *       in: path
 *       description: >-
 *          검색할 부분 문자열
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       200:
 *         description: 검색 성공. 검색 성공이 무조건 아이템이 존재함을 설명하지는 않음.
 *         example:
 *           message : "success"
 *           results: "results As JSON"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */

router.post('/delete/:id', (req, res) => {
    const objId = req.body.room_ObjId;
    const post_ObjId = req.body.post_ObjId;

    if(objId && post_ObjId && checkToken(req)){
        db.connectDB().then(
            post_functions.delete_post(objId, post_ObjId)
                .then(result =>{
                    res.status(result.status).json({message : results.message})
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
 * /post/delete/{id}:
 *   post:
 *     summary: 게시글 지우기.
 *     tags: [Post]
 *     parameters:
 *     - name: id
 *       in: path
 *       description: >-
 *          user id
 *       required: true
 *       default: None
 *       type: string
 *     - name: room_ObjId
 *       in: body
 *       description: >-
 *          행사 Object Id
 *       required: true
 *       default: None
 *       type: string
 *     - name: post_ObjId
 *       in: body
 *       description: >-
 *          게시글 Object Id
 *       required: true
 *       default: None
 *       type: string
 *     responses:
 *       204:
 *         description: 성공적으로 삭제.
 *         example:
 *           message : "Sucessfully delete post"
 *           results: "results As JSON"
 *       401:
 *         description: 토큰과 유저 일치 하지 않음.
 *         example:
 *           message :  "Invalid Token! "
 *       404:
 *         description: 행사와 게시글 정보에 해당하는 게시글이 존재하지 않음.
 *         example:
 *           message :  "Not Found that post"
 *       500:
 *         description: 서버 에러.
 *         example:
 *           message :  "Internal Server Error !"
 *
 */


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


