class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content, ownerId, commentId } = payload;

    this.content = content;
    this.ownerId = ownerId;
    this.commentId = commentId;
  }

  _verifyPayload({ content, ownerId, commentId }) {
    if (!content || !ownerId || !commentId) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof ownerId !== 'string' || typeof commentId !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (content.length > 500) {
      throw new Error('ADD_REPLY.CONTENT_LIMIT_CHAR');
    }
  }
}

module.exports = AddReply;
