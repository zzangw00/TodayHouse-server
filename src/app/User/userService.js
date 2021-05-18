const { logger } = require('../../../config/winston');
const { pool } = require('../../../config/database');
const secret_config = require('../../../config/secret');
const userProvider = require('./userProvider');
const userDao = require('./userDao');
const baseResponse = require('../../../config/baseResponseStatus');
const { response } = require('../../../config/response');
const { errResponse } = require('../../../config/response');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { connect } = require('http2');

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (Id, password, email) {
    try {
        // Id 중복 확인
        const IdRows = await userProvider.IdCheck(Id);
        if (IdRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_ID);

        // email 중복 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');

        const insertUserInfoParams = [Id, hashedPassword, email];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createSocialUser = async function (Id, email, loginStatus) {
    try {
        // Id 중복 확인
        const IdRows = await userProvider.IdCheck(Id);
        if (IdRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_ID);

        // email 중복 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        const insertSocialUserInfoParams = [Id, email, loginStatus];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertSocialUserInfo(
            connection,
            insertSocialUserInfoParams,
        );
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.addFollow = async function (followingUserId, followerUserId) {
    const followParams = [followingUserId, followerUserId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addFollowResult = await userDao.addF(connection, followParams);

    connection.release();
    return addFollowResult;
};

exports.updateFollowDelete = async function (followingUserId, followerUserId) {
    const followParams = [followingUserId, followerUserId];
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteFollow = await userDao.updateFollowDelete(connection, followParams);

    connection.release();
    return deleteFollow;
};

exports.updateFollowAdd = async function (followingUserId, followerUserId) {
    const followParams = [followingUserId, followerUserId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addFollow = await userDao.updateFollowAdd(connection, followParams);
    connection.release();
    return addFollow;
};

// 댓글 입력
exports.deleteComment = async function (commentId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteCommentResult = await userDao.deleteComment(connection, commentId);

    connection.release();
    return deleteCommentResult;
};

// 로그인 인증 방법 (JWT)
exports.postSignIn = async function (Id, password) {
    try {
        // 아이디 여부 확인
        const IdRows = await userProvider.IdCheck(Id);
        if (IdRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);
        const selectId = IdRows[0].Id;

        // 비밀번호 확인
        const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
        const selectUserPasswordParams = [selectId, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].password != hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(Id);

        if (userInfoRows[0].status == 2) {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        }
        console.log(userInfoRows[0].userId); // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].userId,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: '365d',
                subject: 'userInfo',
            }, // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, { userId: userInfoRows[0].userId, jwt: token });
    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
// 유저 정보 수정
exports.editUser = async function (userIdFromJWT, email) {
    try {
        // email 중복 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0) return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.updateUserInfo(connection, userIdFromJWT, email);
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 집들이 게시물 댓글 입력
exports.addHousewarmingComment = async function (
    userIdFromJWT,
    comment,
    parentsCommentId,
    storyId,
) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction(); // 트랜잭션 적용 시작
        const a = await userDao.commentDetail(connection, comment, parentsCommentId);
        const b = await userDao.commentPost(connection, userIdFromJWT, storyId, a.insertId);
        await connection.commit(); // 커밋
        connection.release(); // conn 회수
    } catch (err) {
        await connection.rollback(); // 롤백
        connection.release(); // conn 회수
        return errResponse(baseResponse.DB_ERROR);
    }
};
