const jwtMiddleware = require('../../../config/jwtMiddleware');
const postProvider = require('../../app/Post/postProvider');
const postService = require('../../app/Post/postService');
const baseResponse = require('../../../config/baseResponseStatus');
const { response, errResponse } = require('../../../config/response');

const regexEmail = require('regex-email');
const { emit } = require('nodemon');

/**
 * API No. 1
 * API Name : 집들이 전반적인 화면 API
 * [GET] /housewarming/post
 */
exports.getHousewarming = async function (req, res) {
    const housewarmingCountResult = await postProvider.countingHousewarming();
    const housewarmingListResult = await postProvider.retrieveHousewarmingList();
    const result = {
        contentsCount: housewarmingCountResult,
        contents: housewarmingListResult,
    };
    return res.send(response(baseResponse.SUCCESS, result));
};
/**
 * API No. 2
 * API Name : 특정 집들이 게시물 화면 API
 * [GET] /app/housewarming/{storyId}
 */
exports.getHousewarmingByStoryId = async function (req, res) {
    /**
     * Path Variable: storyId
     */
    const storyId = req.params.storyId;

    const housewarmingByStoryIdResult = await postProvider.retrieveHousewarmingByStoryId(storyId);
    const housewarmingContentsResult = await postProvider.housewarmingContentsBystoryId(storyId);
    const result = {
        contentInfo: housewarmingByStoryIdResult,
        contents: housewarmingContentsResult,
    };
    return res.send(response(baseResponse.SUCCESS_LOAD_STORY, result));
};
/**
 * API No. 4
 * API Name : 집들이 게시물 좋아요 누르기 API
 * [POST] /app/housewarming/{userId}/{storyId}/like
 */
exports.postLike = async function (req, res) {
    /**
     * Path Variable: userId, storyId
     */
    const userId = req.params.userId;
    const storyId = req.params.storyId;

    const checkStatus = await postProvider.existLike(userId, storyId);
    const likeStatus = await postProvider.likeStatus(userId, storyId);

    //if () exist 함수가 0이면 추가, 1이면 업데이트
    if (checkStatus == 0) {
        const result = {
            userId: userId,
            storyId: storyId,
        };
        await postService.addLike(userId, storyId);
        return res.send(response(baseResponse.ADD_LIKE, result));
    } else {
        if (likeStatus[0].status == 1) {
            const result = {
                userId: userId,
                storyId: storyId,
            };
            await postService.updateLikeDelete(userId, storyId);
            return res.send(response(baseResponse.DELETE_LIKE, result));
        } else {
            const result = {
                userId: userId,
                storyId: storyId,
            };
            await postService.updateLikeAdd(userId, storyId);
            return res.send(response(baseResponse.ADD_LIKE, result));
        }
    }
};

/**
 * API No. 5
 * API Name : 특정 집들이 게시물 좋아요, 스크랩, 댓글, 공유 현황 API
 * [GET] /housewarming/:storyId/status
 */
exports.getHousewarmingStatus = async function (req, res) {
    const storyId = req.params.storyId;
    const housewarmingStatustResult = await postProvider.retrieveHousewarmingStatus(storyId);

    return res.send(response(baseResponse.SUCCESS_LOAD_STORY_STATUS, housewarmingStatustResult));
};

/**
 * API No. 6
 * API Name : 특정 집들이 게시글 댓글 전반적인 화면 API
 * [GET] /housewarming/:storyId/comment
 */
exports.getHousewarmingComment = async function (req, res) {
    const storyId = req.params.storyId;
    const housewarmingCommentResult = await postProvider.retrieveHousewarmingComment(storyId);
    const housewarmingCommentCountResult = await postProvider.retrieveHousewarmingCommentConunt(
        storyId,
    );

    const result = {
        commentCount: housewarmingCommentCountResult,
        comment: housewarmingCommentResult,
    };

    return res.send(response(baseResponse.SUCCESS_LOAD_STORY_COMMENT, result));
};

/**
 * API No. 7
 * API Name : 특정 집들이 게시물 댓글 전반적인 화면 API
 * [GET] /housewarming/:storyId/commentDetail
 */
exports.getHousewarmingCommentDetail = async function (req, res) {
    const storyId = req.params.storyId;
    const housewarmingCommentDetailResult = await postProvider.retrieveHousewarmingCommentDetail(
        storyId,
    );
    const housewarmingCommentCountResult = await postProvider.retrieveHousewarmingCommentConunt(
        storyId,
    );
    const result = {
        commentCount: housewarmingCommentCountResult,
        comment: housewarmingCommentDetailResult,
    };
    return res.send(response(baseResponse.SUCCESS_LOAD_STORY_COMMENT_DETAIL, result));
};

/**
 * API No. 8
 * API Name : 댓글 좋아요 누르기 API
 * [POST] /housewarming/{userId}/{commentId}/like
 */
exports.commentLike = async function (req, res) {
    /**
     * Path Variable: userId, commentId
     */
    const userId = req.params.userId;
    const commentId = req.params.commentId;

    const checkStatus = await postProvider.existCommentLike(userId, commentId);
    const likeStatus = await postProvider.commentLikeStatus(userId, commentId);
    //if () exist 함수가 0이면 추가, 1이면 업데이트
    if (checkStatus == 0) {
        const addCommentLike = await postService.addCommentLike(userId, commentId);
        return res.send(response(baseResponse.ADD_LIKE_COMMENT, addCommentLike));
    } else {
        if (likeStatus[0].status == 1) {
            const updateCommentLikeDelete = await postService.updateCommentLikeDelete(
                userId,
                commentId,
            );
            return res.send(response(baseResponse.DELETE_LIKE_COMMENT, updateCommentLikeDelete));
        } else {
            const updateCommentLikeAdd = await postService.updateCommentLikeAdd(userId, commentId);
            return res.send(response(baseResponse.ADD_LIKE_COMMENT, updateCommentLikeAdd));
        }
    }
};

/**
 * API No. 10
 * API Name : 사진 게시물 전반적인 화면 API
 * [GET] /picture/post
 */
exports.getPicture = async function (req, res) {
    const pictureListResult = await postProvider.pictureList();
    const pictureContentsListResult = await postProvider.pictureContents();

    const result = {
        picture: pictureListResult,
        pictureContents: pictureContentsListResult,
    };

    return res.send(response(baseResponse.SUCCESS_LOAD_PICTURE, result));
};

/**
 * API No. 11
 * API Name : 특정 사진 게시물 화면 API
 * [GET] /picture/:pictureId
 */
exports.getPictureByPictureId = async function (req, res) {
    const pictureId = req.params.pictureId;
    const pictureCf = await postProvider.pictureCf(pictureId);
    const pictureListResult = await postProvider.pictureListDetail(pictureId);
    const pictureContentsListResult = await postProvider.pictureContentsDetail(pictureId);

    const result = {
        classification: pictureCf,
        picture: pictureListResult,
        pictureContents: pictureContentsListResult,
    };

    return res.send(response(baseResponse.SUCCESS_LOAD_PICTURE, result));
};

/**
 * API No. 12
 * API Name : 사진 게시물 좋아요 누르기 API
 * [POST] /picture/{userId}/{pictureId}/like
 */
exports.pictureLike = async function (req, res) {
    /**
     * Path Variable: userId, pictureId
     */
    const userId = req.params.userId;
    const pictureId = req.params.pictureId;

    const checkStatus = await postProvider.existPictureLike(userId, pictureId);
    const likeStatus = await postProvider.pictureLikeStatus(userId, pictureId);

    //if () exist 함수가 0이면 추가, 1이면 업데이트
    if (checkStatus == 0) {
        const addLike = await postService.addPictureLike(userId, pictureId);
        return res.send(response(baseResponse.ADD_LIKE_PICTURE, addLike));
    } else {
        if (likeStatus[0].status == 1) {
            const updateLikeDelete = await postService.updatePictureLikeDelete(userId, pictureId);
            return res.send(response(baseResponse.DELETE_LIKE_PICTURE, updateLikeDelete));
        } else {
            const updateLikeAdd = await postService.updatePictureLikeAdd(userId, pictureId);
            return res.send(response(baseResponse.ADD_LIKE_PICTURE, updateLikeAdd));
        }
    }
};

/**
 * API No. 13
 * API Name : 특정 사진 게시물 좋아요, 스크랩, 댓글, 공유 현황 API
 * [GET] /picture/:picture/status
 */
exports.getPictureStatus = async function (req, res) {
    const pictureId = req.params.pictureId;
    const pictureStatustResult = await postProvider.pictureStatus(pictureId);

    return res.send(response(baseResponse.SUCCESS_LOAD_PICTURE_STATUS, pictureStatustResult));
};

/**
 * API No. 14
 * API Name : 특정 사진 게시물 댓글 전반적인 화면 API
 * [POST] /picture/{pictureId}/comment
 */
exports.getPictureComment = async function (req, res) {
    const pictureId = req.params.pictureId;
    const pictureCommentResult = await postProvider.pictureComment(pictureId);
    const pictureCommentCountResult = await postProvider.pictureCommentConunt(pictureId);

    const result = {
        commentCount: pictureCommentCountResult,
        comment: pictureCommentResult,
    };

    return res.send(response(baseResponse.SUCCESS, result));
};

/**
 * API No. 15
 * API Name : 특정 사진 게시물 댓글 상세 화면 API
 * [GET] /picture/{pictureId}/commentDetail
 */
exports.getPictureCommentDetail = async function (req, res) {
    const pictureId = req.params.pictureId;
    const pictureCommentDetailResult = await postProvider.pictureCommentDetail(pictureId);
    const pictureCommentCountResult = await postProvider.pictureCommentConunt(pictureId);
    const result = {
        commentCount: pictureCommentCountResult,
        comment: pictureCommentDetailResult,
    };
    return res.send(response(baseResponse.SUCCESS, result));
};

/**
 * API No. 16
 * API Name : 사진 게시물 스크랩 누르기 API
 * [POST] /user/{userId}/picture/{pictureId}/scrap
 */
exports.pictureScrap = async function (req, res) {
    /**
     * Path Variable: userId, pictureId
     */
    const userId = req.params.userId;
    const pictureId = req.params.pictureId;
    const checkStatus = await postProvider.existPictureScrap(userId, pictureId);
    const scrapStatus = await postProvider.pictureScrapStatus(userId, pictureId);

    //if () exist 함수가 0이면 추가, 1이면 업데이트
    if (checkStatus == 0) {
        await postService.addPictureScrap(userId, pictureId);
        const params = {
            userId: userId,
            pictureId: pictureId,
            comment: '스크랩 하였습니다.',
        };
        return res.send(response(baseResponse.SUCCESS, params));
    } else {
        if (scrapStatus[0].status == 1) {
            await postService.updatePictureScrapDelete(userId, pictureId);
            const params = {
                userId: userId,
                pictureId: pictureId,
                comment: '스크랩 취소 하였습니다.',
            };
            return res.send(response(baseResponse.SUCCESS, params));
        } else {
            await postService.updatePictureScrapAdd(userId, pictureId);
            const params = {
                userId: userId,
                pictureId: pictureId,
                comment: '스크랩 하였습니다.',
            };
            return res.send(response(baseResponse.SUCCESS, params));
        }
    }
};

/**
 * API No. 19
 * API Name : 오늘의 스토리 API
 * [GET] /housewarming/todayBest
 */
exports.getTodayBest = async function (req, res) {
    const todayBestResult = await postProvider.todayBest();
    return res.send(response(baseResponse.SUCCESS, todayBestResult));
};
