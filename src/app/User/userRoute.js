module.exports = function (app) {
    const user = require('./userController');
    const passport = require('passport');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const session = require('express-session');
    const KakaoStrategy = require('passport-kakao').Strategy;
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    app.use(session({ secret: 'SECRET_CODE', resave: true, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(
        new GoogleStrategy(
            {
                clientID:
                    '645142724394-j3nnkvs6i4oq1nod7fjifnohprdo611j.apps.googleusercontent.com',
                clientSecret: 'CR6KP_IopffUMJltlvPqmLZL',
                callbackURL: 'http://localhost:3000/auth/google/callback',
            },
            function (accessToken, refreshToken, profile, done) {
                result = {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                };
                console.log('GoogleStrategy', result);
                return done();
            },
        ),
    );
    passport.use(
        'kakao-login',
        new KakaoStrategy(
            {
                clientID: '46d6192de65b43f3c78e71e18a075ece',
                clientSecret: 'WRKbhPU8UKZJynb5ueoGqscOPVABYWPK',
                callbackURL: '/auth/kakao/callback',
            },
            function (accessToken, refreshToken, profile, done) {
                result = {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                };
                console.log('KakaoStrategy', result);
            },
        ),
    );
    passport.serializeUser((user, done) => {
        done(null, user); // user객체가 deserializeUser로 전달됨.
    });
    passport.deserializeUser((user, done) => {
        done(null, user); // 여기의 user가 req.user가 됨
    });
    // 3. 팔로우 누르기 API
    app.post('/User/:followingUserId/:followerUserId/follow', user.postFollower);

    // 9. 댓글 삭제 API
    app.route('/comment/:commentId/').post(user.commentDelete);

    // 17. 사진 게시물 좋아요 누른 사람 API
    app.get('/picture/:pictureId/like', user.getPictureLikeUser);

    // 18. 사진 게시물 스크랩한 사람 API
    app.get('/picture/:pictureId/scrap', user.getPictureScrapUser);

    // 20. 전체 스크랩북 화면 API
    app.get('/user/:userId/scrapBook', user.getScrapBook);

    // 21. 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 22. 로그인 API (JWT 생성)
    app.post('/app/login', user.login);

    // 23. 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/user/email', jwtMiddleware, user.patchUsers);

    // 24. 구글 로그인 API
    app.get('/', user.Login);
    app.get('/auth', user.googleLogin);
    app.get(
        '/auth/google',
        passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login', 'email'],
        }),
    );
    app.get(
        '/auth/kakao/callback',
        passport.authenticate('kakao-login', { failureRedirect: '/auth', successRedirect: '/' }),
    );

    // 25. 집들이 게시물 댓글 쓰기 API
    app.post('/comment/housewarming/:storyId/:parentsCommentId', jwtMiddleware, user.addComment);

    // 26. 집들이 게시물 쓰기 API
    app.post('/post/housewarming/:storyId', jwtMiddleware, user.addHousewarming);

    // 27. 카카오 로그인 API
    app.post('/app/login/kakao', user.loginKakao);
};
