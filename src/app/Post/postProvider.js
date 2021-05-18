const { pool } = require('../../../config/database');
const { logger } = require('../../../config/winston');

const postDao = require('./postDao');

// Provider: Read 비즈니스 로직 처리

// 집들이 전체 내용 조회
exports.retrieveHousewarmingList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const housewarmingListResult = await postDao.housewarmingList(connection);
    connection.release();

    return housewarmingListResult;
};

// 집들이 게시물 개수
exports.countingHousewarming = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const postResult = await postDao.housewarmingCount(connection);

    connection.release();
    return postResult;
};

// 특정 집들이 게시물 내용빼고 조회
exports.retrieveHousewarmingByStoryId = async function (storyId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const postResult = await postDao.housewarmingByStoryId(connection, storyId);

    connection.release();
    return postResult;
};

// 특정 집들이 게시물 내용 조회
exports.housewarmingContentsBystoryId = async function (storyId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const postResult = await postDao.housewarmingContentsBystoryId(connection, storyId);

    connection.release();
    return postResult;
};

// 좋아요를 눌렀던 적이 있는지 체크
exports.existLike = async function (userId, storyId) {
    const likeParams = [userId, storyId];
    const connection = await pool.getConnection(async (conn) => conn);
    const existLikeResult = await postDao.existLike(connection, likeParams);

    connection.release();
    return existLikeResult[0].exist;
};

// 좋아요 상태 조회
exports.likeStatus = async function (userId, storyId) {
    const likeParams = [userId, storyId];
    const connection = await pool.getConnection(async (conn) => conn);
    const likeStatusResult = await postDao.likeStatus(connection, likeParams);

    connection.release();
    return likeStatusResult;
};

// 특정 집들이 현황
exports.retrieveHousewarmingStatus = async function (storyId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const housewarmingStatusResult = await postDao.housewarmingStatus(connection, storyId);

    connection.release();
    return housewarmingStatusResult;
};

// 집들이 게시물 전반적인 댓글 현황
exports.retrieveHousewarmingComment = async function (storyId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const housewarmingCommentResult = await postDao.housewarmingComment(connection, storyId);

    connection.release();
    return housewarmingCommentResult;
};

// 집들이 게시물 댓글 개수
exports.retrieveHousewarmingCommentConunt = async function (storyId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const housewarmingCoCountResult = await postDao.housewarmingCommentCount(connection, storyId);

    connection.release();
    return housewarmingCoCountResult;
};

// 집들이 게시물 댓글 상세 화면
exports.retrieveHousewarmingCommentDetail = async function (storyId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const housewarmingCommentDetailResult = await postDao.housewarmingCommentDetail(
        connection,
        storyId,
    );

    connection.release();
    return housewarmingCommentDetailResult;
};

// 댓글 좋아요를 눌렀던 적이 있는지 체크
exports.existCommentLike = async function (userId, commentId) {
    const likeParams = [userId, commentId];
    const connection = await pool.getConnection(async (conn) => conn);
    const existLikeResult = await postDao.existCommentLike(connection, likeParams);

    connection.release();
    return existLikeResult[0].exist;
};

// 댓글 좋아요 상태 조회
exports.commentLikeStatus = async function (userId, comment) {
    const likeParams = [userId, comment];
    const connection = await pool.getConnection(async (conn) => conn);
    const likeStatusResult = await postDao.commentLikeStatus(connection, likeParams);

    connection.release();
    return likeStatusResult;
};

// 사진 게시물 전반적인 화면-사진 API
exports.pictureList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureListResult = await postDao.pictureList(connection);
    connection.release();

    return pictureListResult;
};

// 사진 게시물 전반적인 화면-내용 API
exports.pictureContents = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureContentsListResult = await postDao.pictureContents(connection);
    connection.release();

    return pictureContentsListResult;
};

// 특정 사진 게시물 화면-사진 API
exports.pictureListDetail = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureListResult = await postDao.pictureListDetail(connection, pictureId);
    connection.release();

    return pictureListResult;
};

// 특정 사진 게시물 화면-내용 API
exports.pictureContentsDetail = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureContentsListResult = await postDao.pictureContentsDetail(connection, pictureId);
    connection.release();

    return pictureContentsListResult;
};

// 특정 사진 게시물 분류 API
exports.pictureCf = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureContentsListResult = await postDao.pictureCf(connection, pictureId);
    connection.release();

    return pictureContentsListResult;
};

// 사진 게시물 좋아요를 눌렀던 적이 있는지 체크
exports.existPictureLike = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const existLikeResult = await postDao.existPictureLike(connection, likeParams);

    connection.release();
    return existLikeResult[0].exist;
};

// 사진 게시물 좋아요 상태 조회
exports.pictureLikeStatus = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const likeStatusResult = await postDao.pictureLikeStatus(connection, likeParams);

    connection.release();
    return likeStatusResult;
};

// 특정 사진 게시물 현황
exports.pictureStatus = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureStatusResult = await postDao.pictureStatus(connection, pictureId);

    connection.release();
    return pictureStatusResult;
};

// 사진 게시물 전반적인 댓글 현황
exports.pictureComment = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureCommentResult = await postDao.pictureComment(connection, pictureId);

    connection.release();
    return pictureCommentResult;
};

// 사진 게시물 댓글 개수
exports.pictureCommentConunt = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureCommentCountResult = await postDao.pictureCommentCount(connection, pictureId);

    connection.release();
    return pictureCommentCountResult;
};

// 사진 게시물 댓글 상세 화면
exports.pictureCommentDetail = async function (pictureId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pictureCommentDetailResult = await postDao.pictureCommentDetail(connection, pictureId);

    connection.release();
    return pictureCommentDetailResult;
};

// 사진 게시물 스크랩 한적이 있는지 체크
exports.existPictureScrap = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const existScrapResult = await postDao.existPictureScrap(connection, likeParams);

    connection.release();
    return existScrapResult[0].exist;
};

// 사진 게시물 스크랩 상태 조회
exports.pictureScrapStatus = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const scrapStatusResult = await postDao.pictureScrapStatus(connection, likeParams);

    connection.release();
    return scrapStatusResult;
};

// 오늘의 스토리
exports.todayBest = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const todayBestResult = await postDao.todayBest(connection);

    connection.release();
    return todayBestResult;
};
