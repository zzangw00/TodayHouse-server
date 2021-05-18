const jwtMiddleware = require('../../../config/jwtMiddleware');
const userProvider = require('../../app/User/userProvider');
const userService = require('../../app/User/userService');
const baseResponse = require('../../../config/baseResponseStatus');
const { response, errResponse } = require('../../../config/response');
const regexEmail = require('regex-email');
const { emit } = require('nodemon');
const axios = require('axios');
const secret_config = require('../../../config/secret');
const jwt = require('jsonwebtoken');
const { logger } = require('../../../config/winston');
const baseResponseStatus = require('../../../config/baseResponseStatus');
const pwdRegExp = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/; // 비밀번호 정규표현식, 6~20 자 이내 숫자 + 영문
const nicknameRegExp = /^.*(?=.{2,15})(?=.*[0-9])(?=.*[a-zA-Z]).*$/; // 2~15 자 이내 숫자 + 영문

/**
 * API No. 3
 * API Name : 팔로우 누르기 API
 * [POST] /User/:followingUserId/:followerUserId/follow'
 */
exports.postFollower = async function (req, res) {
    /**
     * path: followingUserId, followerUserId
     */
    const followingUserId = req.params.followingUserId;
    const followerUserId = req.params.followerUserId;
    const checkStatus = await userProvider.existFollow(followingUserId, followerUserId);
    const followStatus = await userProvider.followStatus(followingUserId, followerUserId);

    //if () exist 함수가 0이면 추가, 1이면 업데이트
    if (checkStatus == 0) {
        const addFollow = await userService.addFollow(followingUserId, followerUserId);
        return res.send(response(baseResponse.SUCCESS));
    } else {
        if (followStatus[0].status == 1) {
            const updateFollowDelete = await userService.updateFollowDelete(
                followingUserId,
                followerUserId,
            );
            return res.send(response(baseResponse.SUCCESS, updateFollowDelete));
        } else {
            const updateFollowAdd = await userService.updateFollowAdd(
                followingUserId,
                followerUserId,
            );
            return res.send(response(baseResponse.SUCCESS, updateFollowAdd));
        }
    }
};

/**
 * API No. 9
 * API Name : 댓글 삭제 API
 * [POST] /app/users
 */
exports.commentDelete = async function (req, res) {
    /**
     * path: commentId
     */
    const commentId = req.params.commentId;

    const commentDelete = await userService.deleteComment(commentId);
    return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 17
 * API Name : 사진 게시물 좋아요 누른 사람 API
 * [GET] /user/picture/{pictureId/like
 */
exports.getPictureLikeUser = async function (req, res) {
    const pictureId = req.params.pictureId;
    const pictureLikeUserResult = await userProvider.pictureLikeUser(pictureId);

    return res.send(response(baseResponse.SUCCESS, pictureLikeUserResult));
};

/**
 * API No. 18
 * API Name : 사진 게시물 좋아요 누른 사람 API
 * [GET] /user/picture/{pictureId}/scrap
 */
exports.getPictureScrapUser = async function (req, res) {
    const pictureId = req.params.pictureId;
    const pictureScrapUserResult = await userProvider.pictureScrapUser(pictureId);

    return res.send(response(baseResponse.SUCCESS, pictureScrapUserResult));
};

/**
 * API No. 20
 * API Name : 전체 스크랩북 화면 API
 * [GET] /user/{userId}/scrapBook
 */
exports.getScrapBook = async function (req, res) {
    const userId = req.params.userId;
    const userEmailResult = await userProvider.getUserEmail(userId);
    const scrapBookResult = await userProvider.scrapBookUser(userId);
    result = {
        Email: userEmailResult,
        scrapList: scrapBookResult,
    };
    return res.send(response(baseResponse.SUCCESS, result));
};

/**
 * API No. 21
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {
    /**
     * Body: Id, password, email
     */
    const { Id, password, email } = req.body;

    // 형식 체크 (by 정규표현식) 에러리스폰스??
    if (!regexEmail.test(Id)) return res.send(response(baseResponse.SIGNUP_ID_ERROR_TYPE));

    if (!pwdRegExp.test(password))
        return res.send(response(baseResponse.SIGNUP_PASSWORD_ERROR_TYPE));

    //if (!nicknameRegExp.test(email))
    //  return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    // 기타 등등 - 추가하기

    const signUpResponse = await userService.createUser(Id, password, email);

    return res.send(signUpResponse);
};

/**
 * API No. 22
 * API Name : 로그인 API
 * [POST] /app/login
 * body : Id, passsword
 */
exports.login = async function (req, res) {
    const { Id, password } = req.body;

    if (!regexEmail.test(Id)) return res.send(response(baseResponse.SIGNUP_ID_ERROR_TYPE));

    const signInResponse = await userService.postSignIn(Id, password);

    return res.send(signInResponse);
};

/**
 * API No. 23
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/user/email
 * body : email
 */
exports.patchUsers = async function (req, res) {
    // jwt - userId
    const userIdFromJWT = req.verifiedToken.userId;

    const email = req.body.email;

    if (!email) {
        return res.send(errResponse(baseResponse.USER_EMAIL_EMPTY));
    }
    const editUserInfo = await userService.editUser(userIdFromJWT, email);
    return res.send(editUserInfo);
};

/**
 * API No. 24
 * API Name : 구글로그인 API
 * [POST] /app/login
 * body : Id, passsword
 */
exports.Login = async function (req, res) {
    //const signInResponse = await userService.postSignIn(Id, password);

    return res.send('<a>구글 로그인 완료</a>');
};

exports.googleLogin = async function (req, res) {
    //const signInResponse = await userService.postSignIn(Id, password);

    return res.send('<a href="/auth/kakao/callback">KaKao login</a>');
};

/**
 * API No. 25
 * API Name : 댓글 쓰기 API
 * [POST] /housewarming/:storyId/comment
 */
exports.addComment = async function (req, res) {
    // jwt - userId, path variable - storyId, parentsCommentId, body - comment
    const userIdFromJWT = req.verifiedToken.userId;
    const comment = req.body.comment;
    const storyId = req.params.storyId;
    const parentsCommentId = req.params.parentsCommentId;

    if (!comment) {
        return res.send(errResponse(baseResponse.USER_COMMENT_EMPTY));
    }
    const addHousewarmingCommentResult = await userService.addHousewarmingComment(
        userIdFromJWT,
        comment,
        parentsCommentId,
        storyId,
    );
    return res.send(response(baseResponse.SUCCESS, addHousewarmingCommentResult));
};

/**
 * API No. 26
 * API Name : 집들이 게시물 쓰기 API
 * [POST] /housewarming/:storyId/comment
 */
exports.addHousewarming = async function (req, res) {
    // jwt - userId, path variable - storyId, body - contents, imageUrl
    const userIdFromJWT = req.verifiedToken.userId;
    const contents = req.body.contents;
    const storyId = req.params.storyId;
    const imageUrl = req.body.imageUrl;

    if (!contents) {
        return res.send(errResponse(baseResponse.USER_CONTENTS_EMPTY));
    }
    const addHousewarmingContentsResult = await userService.addHousewarmingContents(
        userIdFromJWT,
        contensts,
        imageUrl,
        storyId,
    );
    return res.send(response(baseResponse.SUCCESS, addHousewarmingContentsResult));
};

/**
 * API No. 27
 * API Name : 카카오 로그인 API
 * [GET] /app/login/kakao
 */
exports.loginKakao = async function (req, res) {
    const { accessToken } = req.body;
    try {
        let kakao_profile;
        try {
            kakao_profile = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            logger.error(`Can't get kakao profile\n: ${JSON.stringify(err)}`);
            return res.send(errResponse(baseResponse.USER_COMMENT_EMPTY));
        }

        const email = kakao_profile.data.kakao_account.profile.nickname;
        const Id = kakao_profile.data.kakao_account.email;
        const IdRows = await userProvider.IdCheck(Id);
        // 이미 존재하는 이메일인 경우 = 회원가입 되어 있는 경우 -> 로그인 처리
        if (IdRows.length > 0) {
            const userInfoRows = await userProvider.accountCheck(Id);
            const token = await jwt.sign(
                {
                    userId: userInfoRows[0].userId,
                },
                secret_config.jwtsecret,
                {
                    expiresIn: '365d',
                    subject: 'userId',
                },
            );

            const result = { jwt: token, userId: userInfoRows[0].userId };
            return res.send(response(baseResponse.SUCCESS, result));
            // 그렇지 않은 경우 -> 회원가입 처리
        } else {
            const result = {
                Id: Id,
                email: email,
                loginStatus: 'K',
            };
            const signUpResponse = await userService.createSocialUser(
                Id,
                email,
                result.loginStatus,
            );
            return res.send(response(baseResponse.SUCCESS, result));
        }
    } catch (err) {
        logger.error(`App - logInKakao Query error\n: ${JSON.stringify(err)}`);
        return res.send(errResponse(baseResponse.USER_CONTENTS_EMPTY));
    }
};
