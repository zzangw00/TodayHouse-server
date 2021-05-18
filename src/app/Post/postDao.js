// 전반적인 집들이 화면 조회
async function housewarmingList(connection) {
    const housewarmingListQuery = `
    select thumbnailImageUrl,
    title,
    email,
    profileimageUrl,
    h.storyId,
    ifnull(w.viewCount, 0)  as viewCount,
    ifnull(z.scrapCount, 0) as scrapCount
from User u
      join Housewarming h on u.userId = h.userId
      left join (select storyId, count(storyId) as viewCount
                 from ScrapShare ss
                 where storyId != -1
                   and status = 'V'
                 group by storyId) as w on h.storyId = w.storyId
      left join (select storyId, count(storyId) as scrapCount
                 from ScrapDetail as sc
                 where storyId != -1
                   and status = 1
                 group by storyId) as z on h.storyId = z.storyId
order by h.storyId desc;
                  `;
    const [userRows] = await connection.query(housewarmingListQuery);
    return userRows;
}
// 집들이 전체 개수 조회
async function housewarmingCount(connection) {
    const storyIdCountQuery = `
  select count(storyId) as housewarmingCount
from Housewarming;
  `;
    const [userRows] = await connection.query(storyIdCountQuery);
    return userRows;
}
// 특정 집들이 게시물 화면 조회
async function housewarmingByStoryId(connection, storyId) {
    const housewarmingByStoryIdQuery = `
    select h.storyId,
       email,
       thema,
       title,
       date_format(h.createdAt, '%Y년 %m월 %d일') as date,
       building,
       acreage,
       style,
       work,
       field,
       period,
       familyform,
       location,
       thumbnailImageUrl,
       detailedProcess,
       ifnull(v.likeCount, 0)                  as likeCount,
       ifnull(w.scrapCount, 0)                 as scrapCount,
       ifnull(x.commentCount, 0)               as commentCount,
       ifnull(z.viewCount, 0)                  as viewCount
from User u
         join Housewarming h on u.userId = h.userId
         left join (select storyId, count(storyId) as likeCount
                    from LikeDetail ld
                    where storyId != -1
                      and status = 1
                    group by storyId) as v on h.storyId = v.storyId
         left join (select storyId, count(storyId) as scrapCount
                    from ScrapDetail sd
                    where storyId != -1
                      and status = 1
                    group by storyId) as w on h.storyId = w.storyId
         left join (select storyId, count(storyId) as viewCount
                    from ScrapShare ss
                    where storyId != -1
                      and status = 'V'
                    group by storyId) as z on h.storyId = z.storyId
         left join (select count(distinct parentsCommentId) as commentCount, parentsCommentId, storyId
                    from User u
                             join CommentPost CP on u.userId = CP.userId
                             join CommentDetail CD on CP.commentId = CD.commentId
                    where CD.commentId = parentsCommentId
                      and storyId = ?) as x on h.storyId = x.storyId
where h.storyId = ?;
                  `;
    const params = [storyId, storyId];
    const [userRows] = await connection.query(housewarmingByStoryIdQuery, params);
    return userRows;
}
async function housewarmingContentsBystoryId(connection, storyId) {
    const contentsQuery = `
  select cd.contents, id.imageUrl
from Housewarming h
         left join ImageDetail id on h.storyId = id.storyId
         left join ContentsDetail cd on h.storyId = cd.storyId
where h.storyId = ?
group by contentsId;
  `;
    const [userRow] = await connection.query(contentsQuery, storyId);
    return userRow;
}
// 몇 번 유저가 몇 번 게시물을 좋아요 눌렀는지 체크
async function existLike(connection, params) {
    const existFollowQuery = `
  select exists(select userId, storyId
    from LikeDetail
    where userId = ?
      and storyId= ?) as exist;
    `;
    const [userRows] = await connection.query(existFollowQuery, params);
    return userRows;
}

async function addLike(connection, storyId) {
    const addFQuery = `
  insert into LikeDetail (userId, storyId)
  values (?, ?);
    `;
    const params = [userId, storyId];
    const [userRows] = await connection.query(addFQuery, params);
}

async function likeStatus(connection, userId, storyId) {
    const statusQuery = `
  select status
from LikeDetail
where userId = ?
  and storyId = ?;
    `;
    const [userRows] = await connection.query(statusQuery, userId, storyId);
    return userRows;
}

async function updateLikeDelete(connection, userId, storyId) {
    const udQuery = `
  update LikeDetail
set status = 2
where userId = ?
  and storyId = ?;
    `;
    const [userRows] = await connection.query(udQuery, userId, storyId);
    return userRows;
}

async function updateLikeAdd(connection, userId, storyId) {
    const uaQuery = `
  update LikeDetail
set status = 1
where userId = ?
  and storyId = ?;
    `;
    const [userRows] = await connection.query(uaQuery, userId, storyId);
    return userRows;
}

async function housewarmingStatus(connection, storyId) {
    const housewarmingStatusQuery = `
  select ifnull(v.likeCount, 0)    as likeCount,
       ifnull(z.shareCount, 0)   as shareCount,
       ifnull(x.commentCount, 0) as commentCount,
       ifnull(w.scrapCount, 0)   as scrapCount
from User u
         join Housewarming h on u.userId = h.userId
         left join (select storyId, count(storyId) as likeCount
                    from LikeDetail
                    where storyId != -1
                      and status = 1
                    group by storyId) as v on h.storyId = v.storyId
         left join (select storyId, count(storyId) as scrapCount
                    from ScrapDetail
                    where storyId != -1
                      and status = 1
                    group by storyId) as w on h.storyId = w.storyId
         left join (select storyId, count(storyId) as shareCount
                    from ScrapShare ss
                    where storyId != -1
                      and status = 'S'
                    group by storyId) as z on h.storyId = z.storyId
         left join (select count(distinct parentsCommentId) as commentCount, parentsCommentId, storyId
                    from User u
                             join CommentPost CP on u.userId = CP.userId
                             join CommentDetail CD on CP.commentId = CD.commentId
                    where CD.commentId = parentsCommentId
                      and storyId = ?) as x on h.storyId = x.storyId
where h.storyId = ?;
    `;
    const params = [storyId, storyId];
    const [userRows] = await connection.query(housewarmingStatusQuery, params);
    return userRows;
}

async function housewarmingComment(connection, storyId) {
    const housewarmingCommentQuery = `
    select v.comment,
    v.email,
    v.profileimageUrl,
    ifnull(commentLikeCount, 0) as commentLikeCount,
    parentsCommentId,
    commentId,
    case
        when timestampdiff(minute, v.createdAt, current_timestamp) < 60
            then CONCAT(timestampdiff(minute, v.createdAt, current_timestamp), '분')
        when timestampdiff(hour, v.createdAt, current_timestamp) < 24
            then CONCAT(timestampdiff(hour, v.createdAt, current_timestamp), '시간')
        when timestampdiff(DAY, v.createdAt, current_timestamp) < 30
            then CONCAT(timestampdiff(DAY, v.createdAt, current_timestamp), '일')
        when timestampdiff(MONTH, v.createdAt, current_timestamp) < 12
            then CONCAT(timestampdiff(MONTH, v.createdAt, current_timestamp), '월')
        else CONCAT(timestampdiff(YEAR, v.createdAt, current_timestamp), '년')
        end                     as ago
from (select comment, email, profileimageUrl, commentLikeCount, CD.createdAt, parentsCommentId, CD.commentId
   from User u
            join CommentPost CP on u.userId = CP.userId
            join CommentDetail CD on CP.commentId = CD.commentId
            left join (select count(commentId) as commentLikeCount, commentId
                       from LikeDetail
                       where commentId != -1
                         and status = 1
                       group by commentId) as w on CD.commentId = w.commentId
   where storyId = ?
   order by parentsCommentId desc , createdAt) v;
  `;
    const [userRows] = await connection.query(housewarmingCommentQuery, storyId);
    return userRows;
}

async function housewarmingCommentCount(connection, storyId) {
    const uaQuery = `
  select ifnull(x.commentCount, 0) as commentCount
  from User u
           join Housewarming h on u.userId = h.userId
           left join (select count(distinct parentsCommentId) as commentCount, parentsCommentId, storyId
                      from User u
                               join CommentPost CP on u.userId = CP.userId
                               join CommentDetail CD on CP.commentId = CD.commentId
                      where CD.commentId = parentsCommentId
                        and storyId = ?) as x on h.storyId = x.storyId
  where h.storyId = ?;
  `;
    const params = [storyId, storyId];
    const [userRows] = await connection.query(uaQuery, params);
    return userRows;
}

async function housewarmingCommentDetail(connection, storyId) {
    const housewarmingCommentDetailQuery = `
  select x.email,
  x.comment,
  x.parentsCommentId,
  x.commentId,
  ifnull(x.commentLikeCount, 0) as commentLikeCount,
  case
      when timestampdiff(minute, x.createdAt, current_timestamp) < 60
          then CONCAT(timestampdiff(minute, x.createdAt, current_timestamp), '분')
      when timestampdiff(hour, x.createdAt, current_timestamp) < 24
          then CONCAT(timestampdiff(hour, x.createdAt, current_timestamp), '시간')
      when timestampdiff(DAY, x.createdAt, current_timestamp) < 30
          then CONCAT(timestampdiff(DAY, x.createdAt, current_timestamp), '일')
      when timestampdiff(MONTH, x.createdAt, current_timestamp) < 12
          then CONCAT(timestampdiff(MONTH, x.createdAt, current_timestamp), '월')
      else CONCAT(timestampdiff(YEAR, x.createdAt, current_timestamp), '년')
      end                       as ago
from (select comment, cd.createdAt, parentsCommentId, w.commentLikeCount, email, cd.commentId
 from User u
          join CommentPost cp on u.userId = cp.userId
          join CommentDetail cd on cp.commentId = cd.commentId
          left join (select count(commentId) as commentLikeCount, commentId
                     from LikeDetail
                     where commentId != -1
                       and status = 1
                     group by commentId) as w on cd.commentId = w.commentId
 where storyId = ?) as x
order by parentsCommentId, x.createdAt;
`;
    const [userRows] = await connection.query(housewarmingCommentDetailQuery, storyId);
    return userRows;
}

async function existCommentLike(connection, params) {
    const existFollowQuery = `
select exists(select userId, commentId
  from LikeDetail
  where userId = ?
    and commentId= ?) as exist;
  `;
    const [userRows] = await connection.query(existFollowQuery, params);
    return userRows;
}

async function addCommentLike(connection, params) {
    const addFQuery = `
insert into LikeDetail (userId, commentId)
values (?, ?);
  `;
    const [userRows] = await connection.query(addFQuery, params);
}

async function commentLikeStatus(connection, userId, storyId) {
    const statusQuery = `
select status
from LikeDetail
where userId = ?
and commentId = ?;
  `;
    const [userRows] = await connection.query(statusQuery, userId, storyId);
    return userRows;
}

async function updateCommentLikeDelete(connection, userId, storyId) {
    const udQuery = `
update LikeDetail
set status = 2
where userId = ?
and commentId = ?;
  `;
    const [userRows] = await connection.query(udQuery, userId, storyId);
    return userRows;
}

async function updateCommentLikeAdd(connection, userId, storyId) {
    const uaQuery = `
update LikeDetail
set status = 1
where userId = ?
and commentId = ?;
  `;
    const [userRows] = await connection.query(uaQuery, userId, storyId);
    return userRows;
}

async function pictureList(connection) {
    const pictureListQuery = `
    select b.pictureId, imageUrl, imageUrlId
    from ImageDetail i
             join (select pictureId, min(imageUrlId) as a
                   from ImageDetail i
                   group by pictureId) b
    where a = imageUrlId
    and i.pictureId != -1;
                `;
    const [userRows] = await connection.query(pictureListQuery);
    return userRows;
}

async function pictureContents(connection) {
    const pictureContentsListQuery = `
    select b.pictureId, contents, contentsId
    from ContentsDetail c
             join (select pictureId, min(contentsId) as a
                   from ContentsDetail
                   group by pictureId) b
    where a = contentsId
    and c.pictureId != -1;
              `;
    const [userRows] = await connection.query(pictureContentsListQuery);
    return userRows;
}

async function pictureListDetail(connection, pictureId) {
    const pictureListQuery = `
    select pictureId, imageUrl, imageUrlId
    from ImageDetail
    where pictureId = ?;
              `;
    const [userRows] = await connection.query(pictureListQuery, pictureId);
    return userRows;
}

async function pictureContentsDetail(connection, pictureId) {
    const pictureContentsListQuery = `
    select pictureId, contents, contentsId
    from ContentsDetail c
    where pictureId = ?;
            `;
    const [userRows] = await connection.query(pictureContentsListQuery, pictureId);
    return userRows;
}

async function pictureCf(connection, pictureId) {
    const pictureContentsListQuery = `
    select email,
    acreage,
    housingtype,
    case
        when timestampdiff(MONTH, p.createdAt, current_timestamp) = 0
            then CONCAT(timestampdiff(DAY, p.createdAt, current_timestamp), '일 전')
        when timestampdiff(YEAR, p.createdAt, current_timestamp) = 0
            then CONCAT(timestampdiff(MONTH, p.createdAt, current_timestamp), '월 전')
        else CONCAT(timestampdiff(YEAR, p.createdAt, current_timestamp), '년 전')
        end                   as ago,
    style,
    pictureId
from Picture p
join User u on p.userId = u.userId
where pictureId = ?
          `;
    const [userRows] = await connection.query(pictureContentsListQuery, pictureId);
    return userRows;
}

// 몇 번 유저가 몇 번 게시물을 좋아요 눌렀는지 체크
async function existPictureLike(connection, params) {
    const existFollowQuery = `
select exists(select userId, pictureId
  from LikeDetail
  where userId = ?
    and pictureId= ?) as exist;
  `;
    const [userRows] = await connection.query(existFollowQuery, params);
    return userRows;
}

async function addPictureLike(connection, userId, pictureId) {
    const addFQuery = `
insert into LikeDetail (userId, pictureId)
values (?, ?);
  `;
    const [userRows] = await connection.query(addFQuery, userId, pictureId);
    return userRows;
}

async function pictureLikeStatus(connection, userId, pictureId) {
    const statusQuery = `
select status
from LikeDetail
where userId = ?
and pictureId = ?;
  `;
    const [userRows] = await connection.query(statusQuery, userId, pictureId);
    return userRows;
}

async function updatePictureLikeDelete(connection, userId, pictureId) {
    const udQuery = `
update LikeDetail
set status = 2
where userId = ?
and pictureId = ?;
  `;
    const [userRows] = await connection.query(udQuery, userId, pictureId);
    return userRows;
}

async function updatePictureLikeAdd(connection, userId, pictureId) {
    const uaQuery = `
update LikeDetail
set status = 1
where userId = ?
and pictureId = ?;
  `;
    const [userRows] = await connection.query(uaQuery, userId, pictureId);
    return userRows;
}

async function pictureStatus(connection, pictureId) {
    const pictureStatusQuery = `
select ifnull(v.likeCount, 0)    as likeCount,
     ifnull(z.shareCount, 0)   as shareCount,
     ifnull(x.commentCount, 0) as commentCount,
     ifnull(w.scrapCount, 0)   as scrapCount
from User u
       join Picture p on u.userId = p.userId
       left join (select pictureId, count(pictureId) as likeCount
                  from LikeDetail
                  where pictureId != -1
                    and status = 1
                  group by pictureId) as v on p.pictureId = v.pictureId
       left join (select pictureId, count(pictureId) as scrapCount
                  from ScrapDetail
                  where pictureId != -1
                    and status = 1
                  group by pictureId) as w on p.pictureId = w.pictureId
       left join (select pictureId, count(pictureId) as shareCount
                  from ScrapShare ss
                  where pictureId != -1
                    and status = 'S'
                  group by pictureId) as z on p.pictureId = z.pictureId
       left join (select count(distinct parentsCommentId) as commentCount, parentsCommentId, pictureId
                  from User u
                           join CommentPost CP on u.userId = CP.userId
                           join CommentDetail CD on CP.commentId = CD.commentId
                  where CD.commentId = parentsCommentId
                    and pictureId = ?) as x on p.pictureId= x.pictureId
where p.pictureId = ?;
  `;
    const params = [pictureId, pictureId];
    const [userRows] = await connection.query(pictureStatusQuery, params);
    return userRows;
}

async function pictureComment(connection, pictureId) {
    const housewarmingCommentQuery = `
  select v.comment,
  v.email,
  v.profileimageUrl,
  ifnull(commentLikeCount, 0) as commentLikeCount,
  parentsCommentId,
  commentId,
  case
      when timestampdiff(minute, v.createdAt, current_timestamp) < 60
          then CONCAT(timestampdiff(minute, v.createdAt, current_timestamp), '분')
      when timestampdiff(hour, v.createdAt, current_timestamp) < 24
          then CONCAT(timestampdiff(hour, v.createdAt, current_timestamp), '시간')
      when timestampdiff(DAY, v.createdAt, current_timestamp) < 30
          then CONCAT(timestampdiff(DAY, v.createdAt, current_timestamp), '일')
      when timestampdiff(MONTH, v.createdAt, current_timestamp) < 12
          then CONCAT(timestampdiff(MONTH, v.createdAt, current_timestamp), '월')
      else CONCAT(timestampdiff(YEAR, v.createdAt, current_timestamp), '년')
      end                     as ago
from (select comment, email, profileimageUrl, commentLikeCount, CD.createdAt, parentsCommentId, CD.commentId
 from User u
          join CommentPost CP on u.userId = CP.userId
          join CommentDetail CD on CP.commentId = CD.commentId
          left join (select count(commentId) as commentLikeCount, commentId
                     from LikeDetail
                     where commentId != -1
                       and status = 1
                     group by commentId) as w on CD.commentId = w.commentId
 where pictureId = ?
 order by parentsCommentId desc , createdAt) v;
`;
    const [userRows] = await connection.query(housewarmingCommentQuery, pictureId);
    return userRows;
}

async function pictureCommentCount(connection, pictureId) {
    const uaQuery = `
select ifnull(x.commentCount, 0) as commentCount
from User u
         join Picture p on u.userId = p.userId
         left join (select count(distinct parentsCommentId) as commentCount, parentsCommentId, pictureId
                    from User u
                             join CommentPost CP on u.userId = CP.userId
                             join CommentDetail CD on CP.commentId = CD.commentId
                    where CD.commentId = parentsCommentId
                      and pictureId = ?) as x on p.pictureId = x.pictureId
where p.pictureId= ?;
`;
    const params = [pictureId, pictureId];
    const [userRows] = await connection.query(uaQuery, params);
    return userRows;
}

async function pictureCommentDetail(connection, pictureId) {
    const pictureCommentDetailQuery = `
select x.email,
x.comment,
x.profileimageUrl,
x.parentsCommentId,
x.commentId,
ifnull(x.commentLikeCount, 0) as commentLikeCount,
case
    when timestampdiff(minute, x.createdAt, current_timestamp) < 60
        then CONCAT(timestampdiff(minute, x.createdAt, current_timestamp), '분')
    when timestampdiff(hour, x.createdAt, current_timestamp) < 24
        then CONCAT(timestampdiff(hour, x.createdAt, current_timestamp), '시간')
    when timestampdiff(DAY, x.createdAt, current_timestamp) < 30
        then CONCAT(timestampdiff(DAY, x.createdAt, current_timestamp), '일')
    when timestampdiff(MONTH, x.createdAt, current_timestamp) < 12
        then CONCAT(timestampdiff(MONTH, x.createdAt, current_timestamp), '월')
    else CONCAT(timestampdiff(YEAR, x.createdAt, current_timestamp), '년')
    end                       as ago
from (select comment, cd.createdAt, parentsCommentId, w.commentLikeCount, email, cd.commentId, profileimageUrl
from User u
        join CommentPost cp on u.userId = cp.userId
        join CommentDetail cd on cp.commentId = cd.commentId
        left join (select count(commentId) as commentLikeCount, commentId
                   from LikeDetail
                   where commentId != -1
                     and status = 1
                   group by commentId) as w on cd.commentId = w.commentId
where pictureId = ?) as x
order by parentsCommentId, x.createdAt;
`;
    const [userRows] = await connection.query(pictureCommentDetailQuery, pictureId);
    return userRows;
}

async function existPictureScrap(connection, params) {
    const existFollowQuery = `
select exists(select userId, pictureId
from ScrapDetail
where userId = ?
  and pictureId= ?) as exist;
`;
    const [userRows] = await connection.query(existFollowQuery, params);
    return userRows;
}

async function addPictureScrap(connection, userId, pictureId) {
    const addFQuery = `
insert into ScrapDetail (userId, pictureId)
values (?, ?);
`;
    const [userRows] = await connection.query(addFQuery, userId, pictureId);
    return userRows;
}

async function pictureScrapStatus(connection, userId, pictureId) {
    const statusQuery = `
select status
from ScrapDetail
where userId = ?
and pictureId = ?;
`;
    const [userRows] = await connection.query(statusQuery, userId, pictureId);
    return userRows;
}

async function updatePictureScrapDelete(connection, userId, pictureId) {
    const udQuery = `
update ScrapDetail
set status = 2
where userId = ?
and pictureId = ?;
`;
    const [userRows] = await connection.query(udQuery, userId, pictureId);
    return userRows;
}

async function updatePictureScrapAdd(connection, userId, pictureId) {
    const uaQuery = `
update ScrapDetail
set status = 1
where userId = ?
and pictureId = ?;
`;
    const [userRows] = await connection.query(uaQuery, userId, pictureId);
    return userRows;
}

async function todayBest(connection) {
    const tbQuery = `
  select h.storyId, thumbnailImageUrl, keyword, title, ifnull(z.likeCount, 0) as likeCount
  from Housewarming h
           left join (select storyId, count(storyId) as likeCount
                      from LikeDetail
                      where storyId != -1
                        and status = 1
                      group by storyId) as z on h.storyId = z.storyId
  order by createdAt, z.likeCount desc
  limit 10;
`;
    const [userRows] = await connection.query(tbQuery);
    return userRows;
}

module.exports = {
    housewarmingList,
    housewarmingByStoryId,
    existLike,
    addLike,
    likeStatus,
    updateLikeDelete,
    updateLikeAdd,
    housewarmingContentsBystoryId,
    housewarmingCount,
    housewarmingStatus,
    housewarmingComment,
    housewarmingCommentCount,
    housewarmingCommentDetail,
    existCommentLike,
    addCommentLike,
    commentLikeStatus,
    updateCommentLikeDelete,
    updateCommentLikeAdd,
    pictureList,
    pictureContents,
    pictureContentsDetail,
    pictureCf,
    pictureListDetail,
    existPictureLike,
    addPictureLike,
    pictureLikeStatus,
    updatePictureLikeDelete,
    updatePictureLikeAdd,
    pictureStatus,
    pictureCommentCount,
    pictureComment,
    pictureCommentDetail,
    existPictureScrap,
    addPictureScrap,
    pictureScrapStatus,
    updatePictureScrapDelete,
    updatePictureScrapAdd,
    todayBest,
};
