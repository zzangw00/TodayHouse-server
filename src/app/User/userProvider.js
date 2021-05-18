const { pool } = require('../../../config/database');
const { logger } = require('../../../config/winston');

const userDao = require('./userDao');

// Provider: Read 비즈니스 로직 처리

// 팔로우했던 적이 있는지 체크
exports.existFollow = async function (followingUserId, followerUserId) {
    const followParams = [followingUserId, followerUserId];
    const connection = await pool.getConnection(async (conn) => conn);
    const existFollowResult = await userDao.existFollow(connection, followParams);

    return existFollowResult[0].exist;
};

// 현재 팔로우 상태 확인
exports.followStatus = async function (followingUserId, followerUserId) {
    const followParams = [followingUserId, followerUserId];
    const connection = await pool.getConnection(async (conn) => conn);
    const followStatusResult = await userDao.followStatus(connection, followParams);

    connection.release();
    return followStatusResult;
};

// 좋아요 누른 사람들 확인
exports.pictureLikeUser = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const likeUserResult = await userDao.pictureLikeUser(connection, pictureId);

    connection.release();
    return likeUserResult;
};

// 스크랩한 사람들 확인
exports.pictureScrapUser = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const scrapUserResult = await userDao.pictureScrapUser(connection, pictureId);

    connection.release();
    return scrapUserResult;
};

// 전체 스크랩북 화면
exports.scrapBookUser = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const scrapBookUserResult = await userDao.scrapBookUser(connection, userId);

    connection.release();
    return scrapBookUserResult;
};

// 특정 유저 이메일 조회
exports.getUserEmail = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userEmailResult = await userDao.userEmail(connection, userId);

    connection.release();
    return userEmailResult;
};
// 아이디 중복 체크
exports.IdCheck = async function (Id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const IdCheckResult = await userDao.selectId(connection, Id);
    connection.release();

    return IdCheckResult;
};

// email 중복 체크
exports.emailCheck = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const emailCheckResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return emailCheckResult;
};
// 회원 정보 수정할 때 email 중복 체크
exports.emailFind = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const emailCheckResult = await userDao.findUserEmail(connection, email);
    connection.release();

    return emailCheckResult;
};
// 비밀번호가 맞는지 체크
exports.passwordCheck = async function (selectUserPasswordParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const passwordCheckResult = await userDao.selectUserPassword(
        connection,
        selectUserPasswordParams,
    );
    connection.release();
    return passwordCheckResult[0];
};

// 계정상태 체크
exports.accountCheck = async function (Id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userAccountResult = await userDao.selectUserAccount(connection, Id);
    connection.release();

    return userAccountResult;
};
