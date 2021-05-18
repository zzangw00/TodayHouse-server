const { logger } = require('../../../config/winston');
const { pool } = require('../../../config/database');
const secret_config = require('../../../config/secret');
const postProvider = require('./postProvider');
const postDao = require('./postDao');
const baseResponse = require('../../../config/baseResponseStatus');
const { response } = require('../../../config/response');
const { errResponse } = require('../../../config/response');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { connect } = require('http2');

// Service: Create, Update, Delete 비즈니스 로직 처리

// 집들이 게시물 좋아요 처음 추가
exports.addLike = async function (userId, storyId) {
    const likeParams = [userId, storyId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addLikeResult = await postDao.addLike(connection, likeParams);

    connection.release();
    return addLikeResult;
};

// 집들이 게시물 좋아요 취소
exports.updateLikeDelete = async function (userId, storyId) {
    const likeParams = [userId, storyId];
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteLike = await postDao.updateLikeDelete(connection, likeParams);

    connection.release();
    return deleteLike;
};

// 집들이 게시물 좋아요 추가
exports.updateLikeAdd = async function (userId, storyId) {
    const likeParams = [userId, storyId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addLike = await postDao.updateLikeAdd(connection, likeParams);

    connection.release();
    return addLike;
};

// 댓글 좋아요 처음 추가
exports.addCommentLike = async function (userId, commentId) {
    const likeParams = [userId, commentId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addLikeResult = await postDao.addCommentLike(connection, likeParams);

    connection.release();
    return addLikeResult;
};

// 댓글 좋아요 취소
exports.updateCommentLikeDelete = async function (userId, commentId) {
    const likeParams = [userId, commentId];
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteLike = await postDao.updateCommentLikeDelete(connection, likeParams);

    connection.release();
    return deleteLike;
};

// 댓글 좋아요 추가
exports.updateCommentLikeAdd = async function (userId, commentId) {
    const likeParams = [userId, commentId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addLike = await postDao.updateCommentLikeAdd(connection, likeParams);

    connection.release();
    return addLike;
};

// 사진 게시물 좋아요 처음 추가
exports.addPictureLike = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addLikeResult = await postDao.addPictureLike(connection, likeParams);

    connection.release();
    return addLikeResult;
};

// 사진 게시물 좋아요 취소
exports.updatePictureLikeDelete = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteLike = await postDao.updatePictureLikeDelete(connection, likeParams);

    connection.release();
    return deleteLike;
};

// 사진 게시물 좋아요 추가
exports.updatePictureLikeAdd = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addLike = await postDao.updatePictureLikeAdd(connection, likeParams);

    connection.release();
    return addLike;
};

// 사진 게시물 스크랩 처음 추가
exports.addPictureScrap = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addScrapResult = await postDao.addPictureScrap(connection, likeParams);

    connection.release();
    return addScrapResult;
};

// 사진 게시물 스크랩 취소
exports.updatePictureScrapDelete = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteScrap = await postDao.updatePictureScrapDelete(connection, likeParams);

    connection.release();
    return deleteScrap;
};

// 사진 게시물 스크랩 추가
exports.updatePictureScrapAdd = async function (userId, pictureId) {
    const likeParams = [userId, pictureId];
    const connection = await pool.getConnection(async (conn) => conn);
    const addScrap = await postDao.updatePictureScrapAdd(connection, likeParams);

    connection.release();
    return addScrap;
};
