const RegisterReply = require('../RegisterReply');

describe('a RegisterReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'ini content',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    expect(() => new RegisterReply(payload)).toThrowError('REGISTER_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: true,
      commentId: [],
      owner: 'user-123',
    };
    expect(() => new RegisterReply(payload)).toThrowError('REGISTER_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerReply object correctly', () => {
    const payload = {
      content: 'ini content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const {
      content, threadId, commentId, owner,
    } = new RegisterReply(payload);
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
