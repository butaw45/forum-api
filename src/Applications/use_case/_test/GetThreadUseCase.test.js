const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload not contain threadId', async () => {
    const getThreadUserUseCase = new GetThreadUseCase({});
    await expect(getThreadUserUseCase.execute())
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if threadId not string', async () => {
    const useCasePayload = 123;
    const getThreadUserUseCase = new GetThreadUseCase({});
    await expect(getThreadUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly', async () => {
    const threadId = 'thread-123';
    const threadData = {
      id: threadId,
      title: 'ini title',
      body: 'ini body',
      date: '2021-08-08T07:22:33.555Z',
      username: 'budi',
    };
    const commentData = [
      {
        id: 'comment-123',
        username: 'bambang',
        date: '2021-08-08T07:22:33.555Z',
        content: 'ini content',
        is_deleted: false,
      },
    ];
    const replyData = [
      {
        id: 'thread-123',
        username: 'bambang',
        date: '2021-08-08T07:22:33.555Z',
        content: 'ini content',
        is_deleted: false,
      },
    ];
    const expectedValue = {
      id: threadId,
      title: 'ini title',
      body: 'ini body',
      date: '2021-08-08T07:22:33.555Z',
      username: 'budi',
      comments: [
        {
          id: 'comment-123',
          username: 'bambang',
          date: '2021-08-08T07:22:33.555Z',
          content: 'ini content',
          replies: [
            {
              id: 'thread-123',
              username: 'bambang',
              date: '2021-08-08T07:22:33.555Z',
              content: 'ini content',
            },
          ],
        },
      ],
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(threadData));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(commentData));
    mockRepliesRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(replyData));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockRepliesRepository,
    });

    const registeredThread = await getThreadUseCase.execute(threadId);

    expect(registeredThread).toStrictEqual(expectedValue);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockRepliesRepository.getRepliesByCommentId).toBeCalledWith(commentData[0].id);
  });
});
