const RegisterReply = require('../../Domains/replies/entities/RegisterReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);
    await this._commentRepository.verifyAvailableComment(useCasePayload.commentId);
    const registerReply = new RegisterReply(useCasePayload);
    return this._replyRepository.addReply(registerReply);
  }
}

module.exports = AddReplyUseCase;
