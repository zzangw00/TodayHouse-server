module.exports = function (app) {
    const post = require('./postController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 1. 집들이 전반적인 화면 API
    app.get('/housewarming/post', post.getHousewarming);

    // 19. 오늘의 스토리 API
    app.get('/housewarming/todayBest', post.getTodayBest);

    // 2. 특정 집들이 게시물 화면 API
    app.get('/housewarming/:storyId', post.getHousewarmingByStoryId);

    // 4. 집들이 게시글 좋아요 누르기 API
    app.route('/housewarming/:userId/:storyId/like').post(post.postLike);

    // 5. 특정 집들이 게시글 좋아요, 스크랩, 댓글, 공유 현황 API
    app.get('/housewarming/:storyId/status', post.getHousewarmingStatus);

    // 6. 특정 집들이 게시글 댓글 전반적인 화면 API
    app.get('/housewarming/:storyId/comment', post.getHousewarmingComment);

    // 7. 특정 집들이 게시물 댓글 상세 화면 API
    app.get('/housewarming/:storyId/commentDetail', post.getHousewarmingCommentDetail);

    // 8. 댓글 좋아요 누르기 API
    app.route('/comment/:userId/:commentId/like').post(post.commentLike);

    // 10. 사진 게시물 전반적인 화면 API
    app.get('/picture/post', post.getPicture);

    // 11. 특정 사진 게시물 화면 API
    app.get('/picture/:pictureId', post.getPictureByPictureId);

    // 12. 사진 게시물 좋아요 누르기 API
    app.route('/user/:userId/picture/:pictureId/like').post(post.pictureLike);

    // 13. 특정 사진 게시글 좋아요, 스크랩, 댓글, 공유 현황 API
    app.get('/picture/:pictureId/status', post.getPictureStatus);

    // 14. 특정 사진 게시물 댓글 전반적인 화면 API
    app.get('/picture/:pictureId/comment', post.getPictureComment);

    // 15. 특정 사진 게시물 댓글 상세 화면 API
    app.get('/picture/:pictureId/commentDetail', post.getPictureCommentDetail);

    // 16. 사진 게시물 스크랩 누르기 API
    app.route('/user/:userId/picture/:pictureId/scrap').post(post.pictureScrap);
};
