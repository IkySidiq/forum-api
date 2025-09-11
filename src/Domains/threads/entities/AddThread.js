class AddThread {
  constructor({ title, body, ownerId }) {
    this._verifyPayload({ title, body, ownerId });

    this.title = title;
    this.body = body;
    this.ownerId = ownerId;
  }

  _verifyPayload({ title, body, ownerId }) {
    if (!title || !body || !ownerId) {
      throw new Error('ADDING_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADDING_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 50) {
      throw new Error('ADDING_THREAD.TITLE_LIMIT_CHAR');
    }

    if (body.length > 500) {
      throw new Error('ADDING_THREAD.BODY_LIMIT_CHAR');
    }
  }
}

module.exports = AddThread;
