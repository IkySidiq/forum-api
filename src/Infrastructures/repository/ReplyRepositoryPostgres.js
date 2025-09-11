const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyComment(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async addReply({ content }, commentId, ownerId) {
    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO replies (id, content, owner_id, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner_id',
      values: [id, content, ownerId, commentId],
    };

    const result = await this._pool.query(query);

    return new AddedReply({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner_id,
    });
  }
}

module.exports = ReplyRepositoryPostgres;
