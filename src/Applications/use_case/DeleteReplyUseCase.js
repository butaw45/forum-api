class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const {
      id, threadId, commentId, owner,
    } = useCasePayload;
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    await this._replyRepository.verifyAvailableReply(id);
    await this._replyRepository.verifyReplyOwner(id, owner);
    await this._replyRepository.deleteReply(id);
  }

  _validatePayload({
    id, threadId, commentId, owner,
  }) {
    if (!id || !threadId || !commentId || !owner) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
    }

    if (typeof id !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
