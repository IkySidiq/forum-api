class AddReply {
  constructor({ content, ownerId, commentId }) {
    this._verifyPayload({ content, ownerId, commentId });

    this.content = content;
    this.ownerId = ownerId;
    this.commentId = commentId;
  }

  _verifyPayload({ content, ownerId, commentId }) {
    if (!content || !ownerId || !commentId) {
      throw new Error('ADDING_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string' ||
      typeof ownerId !== 'string' ||
      typeof commentId !== 'string'
    ) {
      throw new Error('ADDING_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (content.length > 500) {
      throw new Error('ADDING_REPLY.CONTENT_LIMIT_CHAR');
    }
  }
}

module.exports = AddReply;
