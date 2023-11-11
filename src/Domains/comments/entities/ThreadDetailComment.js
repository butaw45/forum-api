class ThreadDetailComment {
  constructor(comment) {
    this._verifyPayload(comment);
    this._comment = comment;
  }

  _verifyPayload({
    id, username, content, date, is_deleted,
  }) {
    if (!id || !username || !content || !date) {
      throw new Error('THREAD_DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof is_deleted !== 'boolean') {
      throw new Error('THREAD_DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  constructComment(replies) {
    const {
      id, username, content, date, is_deleted,
    } = this._comment;
    return {
      id,
      username,
      date,
      content: is_deleted ? '**komentar telah dihapus**' : content,
      replies,
    };
  }
}

module.exports = ThreadDetailComment;
