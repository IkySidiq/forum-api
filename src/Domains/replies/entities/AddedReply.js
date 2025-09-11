class AddedReply {
  constructor({ id, content, owner }) {
    this._verifyPayload({ id, content, owner });

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ id, content, owner }) {
    if (!id || !content || !owner) {
      throw new Error('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    // opsional: batasi panjang content misalnya max 500 karakter
    if (content.length > 500) {
      throw new Error('ADDED_REPLY.CONTENT_LIMIT_CHAR');
    }
  }
}

module.exports = AddedReply;
