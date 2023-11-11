const RegisteredReply = require('../RegisteredReply');

describe('a RegisteredReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'ini content',
      owner: 'user-123',
    };
    expect(() => new RegisteredReply(payload)).toThrowError('REGISTERED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'ini content',
      owner: true,
    };
    expect(() => new RegisteredReply(payload)).toThrowError('REGISTERED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'ini content',
      owner: 'user-123',
    };
    const { id, content, owner } = new RegisteredReply(payload);
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
