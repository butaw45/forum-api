const ThreadDetailComment = require('../../Domains/comments/entities/ThreadDetailComment');
const CommentDetailReplies = require('../../Domains/replies/entities/CommentDetailReplies');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    this._validatePayload(threadId);
    await this._threadRepository.verifyAvailableThread(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    thread.comments = await Promise.all(comments.map(async (comment) => {
      const threadDetailComment = new ThreadDetailComment(comment);
      const { id: commentId } = comment;
      const replies = await this._replyRepository.getRepliesByCommentId(commentId);
      const normalizeReplies = new CommentDetailReplies(replies).constructReplies();
      return threadDetailComment.constructComment(normalizeReplies);
    }));
    return thread;
  }

  _validatePayload(threadId) {
    if (!threadId) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadUseCase;
