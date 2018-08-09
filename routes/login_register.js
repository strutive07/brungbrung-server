
const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

var express = require('express');
const router = express.Router();

const db = require('../util/db');
const register = require('../functions/register');
const login = require('../functions/login');
const user_quest_bool = require('../functions/user_quest_bool');
const elder_user_quest_accept_list= require('../functions/elder_user_quest_accept_list');
const profile = require('../functions/profile');
const quest_complete_flow = require('../functions/quest_complete_flow');
const password = require('../functions/password');
const config = require('../config/config');



    router.get('/', (req, res) => res.end('I choose you! (Server)\nMade by ssu.software.17.Wonjun Jang'));

    router.post('/authenticate', (req, res) => {
        var id = req.body.id;
        var password = req.body.password;
        console.log(id);
        console.log(password);
        if (id && password) {
            db.connectDB().then(login.LoginUser(id, password)
                .then(result => {
                    const token = jwt.sign(result, config.secret, {expiresIn: 144000});
                    console.log('token : ' + token);
                    res.status(result.status).json({id: result.message, token: token});
                })
                .catch(err => {
                    res.status(err.status).json({message: err.message})
                })
            )
        } else {
            res.status(400).json({message: 'Invalid Request !'});
        }
    });

    router.get('/authenticate', (req, res) => {
        res.redirect('/');
    });
/**
 * @swagger
 * tags:
 *   name: AUTH
 *   description: return auth
 * definitions:
 *   AUTH:
 *     type: object
 *     required:
 *       - content
 *     properties:
 *       id:
 *         type: string
 *         description: user auth_id
 *       token:
 *         type: string
 *         description: Token 값
 */

/**
 * @swagger
 * /user/authenticate:
 *   post:
 *     summary: 로그인. Return UserID, token as JSON
 *     tags: [User]
 *     parameters:
 *     - name: id
 *       in: body
 *       description: >-
 *          로그인에 필요한 user auth_id
 *       required: true
 *       default: None 없음!
 *       type: string
 *       example:
 *          id: "dev1234"
 *          password: "1234"
 *     - name: password
 *       in: body
 *       description: >-
 *          로그인에 필요한 user password
 *       required: true
 *       default: None 없음!
 *       type: string
 *       example:
 *          id: "dev1234"
 *          password: "1234"
 *     responses:
 *       200:
 *         description: 로그인 기능.
 *         schema:
 *           $ref: '#/definitions/AUTH'
 *       404:
 *         description: 일치하는 유저 없음.
 *         example:
 *            "message": "User Not Found !"
 *       401:
 *         description: 비밀번호 일치하지 않음.
 *         example:
 *            "message": "Invalid Credentials !"
 *
 */



router.post('/register', (req, res) => {
        const name = req.body.name;
        var id = req.body.id;
        const password = req.body.password;

        console.log('name : ' + name);
        console.log('id : ' + id);
        console.log('password : ' + password);

        if (!name || !id || !password || !name.trim() || !id.trim() || !password.trim()) {
            res.status(400).json({message: 'Invalid Request !'});
        } else {

            db.connectDB().then(register.RegisterUser(name, id, password)
                .then(result => {
                    console.log('name->' + name);
                    console.log('email->' + id);
                    res.setHeader('Location', '/users' + id);
                    res.status(result.status).json({message: result.message});
                })
                .catch(err => {
                    res.status(err.status).json({message: err.message});
                })
            );
        }
    });

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: 회원가입. Return message.
 *     tags: [User]
 *     parameters:
 *     - name: name
 *       in: body
 *       description: >-
 *          회원가입에 필요한 유저 이름.
 *       required: true
 *       default: None 없음!
 *       type: string
 *       example:
 *          name : "장원준"
 *          id: "dev1234"
 *          password: "1234"
 *     - name: id
 *       in: body
 *       description: >-
 *          회원가입에 필요한 ID
 *       required: true
 *       default: None 없음!
 *       type: string
 *       example:
 *          name : "장원준"
 *          id: "dev1234"
 *          password: "1234"
 *     - name: password
 *       in: body
 *       description: >-
 *          회원가입에 필요한 Password
 *       required: true
 *       default: None 없음!
 *       type: string
 *       example:
 *          name : "장원준"
 *          id: "dev1234"
 *          password: "1234"
 *     responses:
 *       200:
 *         description: 회원가입.
 *         example:
 *           message : "Sucessfully register user"
 *       404:
 *         description: 이미 있는 회원.
 *         example:
 *           message :  "이미 존재하는 사용자 입니다."
 *
 */



router.post('/profile/:id', (req, res) => {
    if (checkToken(req)) {
        db.connectDB().then(
            profile.GetProfile(req.params.id)
                .then(result => {
                    console.log('result : ' + result);
                    res.json(result);
                })
                .catch(err => {console.log('err : ' + err);
                    res.status(err.status).json({message: err.message});
                })
        );

    } else {
        res.status(401).json({message: 'Invalid Token! '});
    }
});
/**
 * @swagger
 * /user/profile/{id}:
 *   post:
 *     summary: 회원가입. Return message.
 *     tags: [User]
 *     parameters:
 *     - name: id
 *       in: path
 *       description: >-
 *          유저 이름
 *       required: true
 *       default: None 없음!
 *       type: string
 *     responses:
 *       200:
 *         description: 유저 정보 가져오기 성공.
 *         example:
 *           message : "Sucessfully register user"
 *       401:
 *         description: 토큰과 유저 일치 하지 않음.
 *         example:
 *           message :  "Invalid Token! "
 *
 */

    // router.get('/users_test/:id', (req, res) => {
    //     var id = req.params.id;
    //     // if (checkToken(req)) {
    //     db.connectDB().then(
    //         profile.GetProfile(id)
    //             .then(result => {
    //                 console.log('result : ' + result);
    //                 res.json(result);
    //             })
    //             .catch(err => {
    //                 console.log('err : ' + err);
    //                 res.status(err.status).json({message: err.message});
    //             })
    //     );
    // });

    router.post('/changepassword/:id', (req, res) => {
        if (checkToken(req)) {
            const oldPassword = req.body.password;
            const new_password = req.body.new_password;
            const new_password_confirm = req.body.new_password_confirm;
            const phone_number = req.body.phone_number;

            if (!oldPassword || !new_password || !phone_number || !new_password_confirm || !oldPassword.trim() || !new_password.trim() || !phone_number.trim() || !new_password_confirm.trim()) {
                res.status(400).json({message: '필수 입력 요소가 비어있습니다.'});
            } else {
                if(new_password === new_password_confirm){
                    db.connectDB().then( password.ChangePassword(req.params.id, oldPassword, new_password, phone_number)
                        .then(result => {
                            res.status(result.status).json({message: result.message});
                        })
                        .catch(err => {
                            res.status(err.status).json({message: err.message});
                        })
                    );
                }else{
                    res.status(402).json({message: '새로운 비밀번호의 입력값 2개가 일치하지 않습니다.'});
                }
            }
        } else {
            res.status(401).json({message: 'Invalid Token! '});
        }
    });

    router.get('/questtable/:id', (req, res) => {
        if (checkToken(req)) {
            db.connectDB().then(
                user_quest_bool.get_one_quest_bool(req.params.id)
                    .then(result => {
                        console.log('result : ' + result);
                        res.status(200).json({result : result});
                    })
                    .catch(err => {console.log('err : ' + err);
                        res.status(err.status).json({message: err.message});
                    })
            );

        } else {
            res.status(401).json({message: 'Invalid Token! '});
        }
    });

    router.post('/:email/password', (req, res) => {
        const email = req.params.email;
        const token = req.body.token;
        const newPassword = req.body.password;

        if (!token || !newPassword || !token.trim() || !newPassword.trim()) {
            password.ResetPasswordInit(email)
                .then(result => res.status(result.status).json({message: result.message}))
                .catch(err => res.status(err.status).json({message: err.message}));
        } else {
            password.ResetPasswordFinish(email, token, newPassword)
                .then(result => res.status(result.status).json({message: result.message}))
                .catch(err => res.status(err.status).json({message: err.message}));
        }
    });

    router.post('/first_connection/:id/:older_id', (req, res) => {
        if (checkToken(req)) {
            const id = req.params.id;
            const older_id = req.params.older_id;

            if (!id || !older_id || !id.trim() || !older_id.trim()) {
                res.status(400).json({message: 'Invalid Token! '});
            } else {
                db.connectDB().then(
                    register.set_first_connection(id, older_id)
                        .then(result =>
                            res.status(result.status).json({message: result.message, user : result.user})
                        )
                        .catch(err =>
                            res.status(err.status).json({message: err.message}))
                );
            }
        } else {
            res.status(401).json({message: 'Invalid Token! '});
        }
    });

    router.get('/ranking/:id', (req, res) => {
        console.log('ranking id : '+ req.params.id);
        if (checkToken(req)) {
            db.connectDB().then(
                profile.get_ranking(req.params.id)
                    .then(result =>
                        res.status(200).json({top_ranking : result.top_ranking, my_ranking : result.my_ranking, my_ranking_info : result.my_ranking_info})
                    ).catch(err => {console.log('err : ' + err);
                    res.status(err.status).json({message: err.message});
                })
            );
        } else {
            res.status(401).json({message: 'Invalid Token! '});
        }
    });

    router.get('/older_ranking/:id', (req, res) => {
        console.log('ranking id : '+ req.params.id);
        if (checkToken(req)) {
            db.connectDB().then(
                profile.get_older_ranking(req.params.id)
                    .then(result =>
                        res.status(200).json({top_ranking : result.top_ranking, my_ranking : result.my_ranking, my_ranking_info : result.my_ranking_info})
                    ).catch(err => {console.log('err : ' + err);
                    res.status(err.status).json({message: err.message});
                })
            );
        } else {
            res.status(401).json({message: 'Invalid Token! '});
        }
    });



    //========================================================================================================================


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


