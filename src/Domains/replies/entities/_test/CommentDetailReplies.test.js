const CommentDetailReplies = require('../CommentDetailReplies');

describe('a CommentDetailReplies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = undefined;
    expect(() => new CommentDetailReplies(payload)).toThrowError('COMMENT_DETAIL_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {};
    expect(() => new CommentDetailReplies(payload)).toThrowError('COMMENT_DETAIL_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerComment object correctly', () => {
    const payload = [
      {
        id: 'comment-123',
        username: 'bambang',
        date: '2021-08-08T07:22:33.555Z',
        content: 'ini content',
        is_deleted: false,
      },
      {
        id: 'comment-124',
        username: 'jono',
        date: '2021-08-08T07:22:33.555Z',
        content: 'ini content',
        is_deleted: true,
      },
    ];
    const expectedValue = [
      {
        id: 'comment-123',
        username: 'bambang',
        date: '2021-08-08T07:22:33.555Z',
        content: 'ini content',
      },
      {
        id: 'comment-124',
        username: 'jono',
        date: '2021-08-08T07:22:33.555Z',
        content: '**balasan telah dihapus**',
      },
    ];
    const replies = new CommentDetailReplies(payload).constructReplies();
    expect(replies).toStrictEqual(expectedValue);
  });
});
