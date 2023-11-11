class CommentDetailReplies {
  constructor(replies) {
    this._verifyPayload(replies);
    this._replies = replies;
  }

  _verifyPayload(payload) {
    if (!payload) {
      throw new Error('COMMENT_DETAIL_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (!Array.isArray(payload)) {
      throw new Error('COMMENT_DETAIL_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  constructReplies() {
    return this._replies.map((reply) => {
      const {
        id, username, content, date, is_deleted,
      } = reply;
      return {
        id,
        username,
        date,
        content: is_deleted ? '**balasan telah dihapus**' : content,
      };
    });
  }
}

module.exports = CommentDetailReplies;
