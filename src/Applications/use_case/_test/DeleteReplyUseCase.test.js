const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error if use case payload not contain valid payload', async () => {
    const getThreadUserUseCase = new DeleteReplyUseCase({});
    await expect(getThreadUserUseCase.execute({}))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
  });

  it('should throw error if valid payload not in correct type', async () => {
    const useCasePayload = {
      id: 123,
      threadId: true,
      commentId: true,
      owner: [],
    };
    const getThreadUserUseCase = new DeleteReplyUseCase({});
    await expect(getThreadUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      id: 'reply-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockReplyRepository.verifyAvailableReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute(useCasePayload);
    const {
      id, threadId, commentId, owner,
    } = useCasePayload;
    expect(mockReplyRepository.verifyAvailableReply).toBeCalledWith(id);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(id, owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(id);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(commentId);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(threadId);
  });
});
