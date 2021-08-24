// 모든 유저 조회
async function selectUser(connection) {
    const selectUserListQuery = `
                SELECT email, nickname 
                FROM UserInfo;
                `;
    const [userRows] = await connection.query(selectUserListQuery);
    return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
    const selectUserEmailQuery = `
                SELECT Id, email 
                FROM User
                WHERE email = ?;
                `;
    const [emailRows] = await connection.query(selectUserEmailQuery, email);
    return emailRows;
}

// Id로 회원 조회
async function selectId(connection, Id) {
    const selectIdQuery = `
              SELECT Id, email 
              FROM User
              WHERE Id = ?;
              `;
    const [emailRows] = await connection.query(selectIdQuery, Id);
    return emailRows;
}

// userId 회원 조회
async function selectUserId(connection, userId) {
    const selectUserIdQuery = `
                 SELECT userId, email, phoneNumber 
                 FROM User 
                 WHERE userId = ?;
                 `;
    const [userRow] = await connection.query(selectUserIdQuery, userId);
    return userRow;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
    const insertUserInfoQuery = `
        INSERT INTO User(Id, password, email)
        VALUES (?, ?, ?);
    `;
    const insertUserInfoRow = await connection.query(insertUserInfoQuery, insertUserInfoParams);
    return insertUserInfoRow;
}

// 소셜로그인 유저 생성
async function insertSocialUserInfo(connection, insertUserInfoParams) {
    const insertUserInfoQuery = `
        INSERT INTO User(Id, email, loginStatus)
        VALUES (?, ?, ?);
    `;
    const insertUserInfoRow = await connection.query(insertUserInfoQuery, insertUserInfoParams);
    return insertUserInfoRow;
}

// 몇 번 유저가 몇 번 유저를 팔로잉했는지 체크
async function existFollow(connection, params) {
    const existFollowQuery = `
  select exists (select followingUserId, followerUserId from Followers where followingUserId = ? and followerUserId = ?) as exist;
    `;
    const [userRows] = await connection.query(existFollowQuery, params);
    return userRows;
}

//팔로우 추가
async function addF(connection, params) {
    const addFQuery = `
  insert into Followers (followingUserId, followerUserId)
  values (?, ?);
    `;
    const [userRows] = await connection.query(addFQuery, params);
}
//
async function followStatus(connection, followingUserId, followerUserId) {
    const statusQuery = `
  select status from Followers where followingUserId = ? and followerUserId = ?;
    `;
    const [userRows] = await connection.query(statusQuery, followingUserId, followerUserId);
    return userRows;
}

async function updateFollowDelete(connection, followingUserId, followerUserId) {
    const udQuery = `
  update Followers set status = 2 where followingUserId = ? and followerUserId = ?;
    `;
    const [userRows] = await connection.query(udQuery, followingUserId, followerUserId);
    return userRows;
}

async function updateFollowAdd(connection, followingUserId, followerUserId) {
    const uaQuery = `
  update Followers set status = 1 where followingUserId = ? and followerUserId = ?;
    `;
    const [userRows] = await connection.query(uaQuery, followingUserId, followerUserId);
    return userRows;
}

async function deleteComment(connection, commentId) {
    const deleteCommentQuery = `
  update CommentDetail set status = 2 where commentId = ?;
    `;
    const [userRows] = await connection.query(deleteCommentQuery, commentId);
    return userRows;
}

async function pictureLikeUser(connection, pictureId) {
    const likeUserQuery = `
    select pictureId, email, profileimageUrl
    from User u
             join LikeDetail l on u.userId = l.userId
    where pictureId = ?
    and l.status = 1
    
  `;
    const [userRows] = await connection.query(likeUserQuery, pictureId);
    return userRows;
}

async function pictureScrapUser(connection, pictureId) {
    const scrapUserQuery = `
  select pictureId, email, profileimageUrl
  from User u
           join ScrapDetail l on u.userId = l.userId
  where pictureId = ?
  and l.status = 1
  
`;
    const [userRows] = await connection.query(scrapUserQuery, pictureId);
    return userRows;
}

async function scrapBookUser(connection, userId) {
    const scrapBookUserQuery = `
  select ab.thumbnailImageUrl, ab.status, ab.pictureId as postId
  from (
           select p.thumbnailImageUrl, p.pictureId, p.createdAt, 'Picture' as status, s.userId
           from Picture p
                    join ScrapDetail s on p.pictureId = s.pictureId
           where s.pictureId != -1
           union
           select h.thumbnailImageUrl, h.storyId, h.createdAt, 'Housewarming' as status, s.userId
           from Housewarming h
                    join ScrapDetail s on h.storyId = s.storyId
           where s.storyId != -1
           union
           select k.thumbnailImageUrl, k.knowhowId, k.createdAt, 'Knowhow' as status, s.userId
           from Knowhow k
                    join ScrapDetail s on k.knowhowId = s.storyId
           where s.knowhowId != -1) as ab
  where userId = ?
  order by ab.createdAt desc;
`;
    const [userRows] = await connection.query(scrapBookUserQuery, userId);
    return userRows;
}

async function userEmail(connection, userId) {
    const userEmailQuery = `
    
  select email
  from User
  where userId = ?;
`;
    const [userRows] = await connection.query(userEmailQuery, userId);
    return userRows;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
    const selectUserPasswordQuery = `
        SELECT Id, email, password
        FROM User
        WHERE Id = ?;`;
    const selectUserPasswordRow = await connection.query(
        selectUserPasswordQuery,
        selectUserPasswordParams,
    );
    return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, Id) {
    const selectUserAccountQuery = `
        SELECT status, userId
        FROM User 
        WHERE Id = ?;`;
    const selectUserAccountRow = await connection.query(selectUserAccountQuery, Id);
    return selectUserAccountRow[0];
}

async function updateUserInfo(connection, userIdFromJWT, email) {
    const updateUserQuery = `
    UPDATE User
    SET email = ?
    WHERE userId = ?;`;
    const updateUserRow = await connection.query(updateUserQuery, [email, userIdFromJWT]);
    return updateUserRow[0];
}

// 이메일로 회원 조회
async function findUserEmail(connection, email) {
    const selectUserEmailQuery = `
                SELECT email 
                FROM User
                WHERE email = ?;
                `;
    const [emailRows] = await connection.query(selectUserEmailQuery, email);
    return emailRows;
}

async function commentDetail(connection, comment, parentsCommentId) {
    const aQuery = `
    insert into CommentDetail(comment, parentsCommentId)
    values (?, ?);
    `;
    const [userRows] = await connection.query(aQuery, [comment, parentsCommentId]);
    return userRows;
}

async function commentPost(connection, userIdFromJWT, storyId, value) {
    const bQuery = `
    insert into CommentPost(userId, storyId, commentId)
    values (?, ?, ?);
    `;
    const [userRows] = await connection.query(bQuery, [userIdFromJWT, storyId, value]);
}

module.exports = {
    selectUser,
    selectUserEmail,
    selectUserId,
    insertUserInfo,
    existFollow,
    addF,
    followStatus,
    updateFollowDelete,
    updateFollowAdd,
    deleteComment,
    pictureLikeUser,
    pictureScrapUser,
    scrapBookUser,
    userEmail,
    selectId,
    selectUserPassword,
    selectUserAccount,
    updateUserInfo,
    findUserEmail,
    commentDetail,
    commentPost,
    insertSocialUserInfo,
};
