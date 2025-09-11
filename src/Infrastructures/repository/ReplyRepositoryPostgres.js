const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

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

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT replies.id, replies.content, replies.date, users.username, replies.is_delete
        FROM replies
        JOIN users ON users.id = replies.owner_id
        WHERE replies.comment_id = $1
        ORDER BY replies.date ASC
      `,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) return []; // tambahan untuk empty array branch
    return result.rows.map((row) => ({
      id: row.id,
      content: row.is_delete ? '**balasan telah dihapus**' : row.content,
      date: row.date,
      username: row.username,
    }));
  }

  // === Implementasi kontrak tambahan ===
  async verifyReply(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, ownerId) {
    const query = {
      text: 'SELECT owner_id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
    if (result.rows[0].owner_id !== ownerId) {
      throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };
    return this._pool.query(query); // tambahkan return supaya coverage 100%
  }
}

module.exports = ReplyRepositoryPostgres;
