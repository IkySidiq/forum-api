class AddComment {
  constructor({ content, ownerId, threadId }) {
    this._verifyPayload({ content, ownerId, threadId });

    this.content = content;
    this.ownerId = ownerId;
    this.threadId = threadId;
  }

  _verifyPayload({ content, ownerId, threadId }) {
    if (!content || !ownerId || !threadId) {
      throw new Error('ADDING_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof ownerId !== 'string' || typeof threadId !== 'string') {
      throw new Error('ADDING_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (content.length > 500) {
      throw new Error('ADDING_COMMENT.CONTENT_LIMIT_CHAR');
    }
  }
}

module.exports = AddComment;
