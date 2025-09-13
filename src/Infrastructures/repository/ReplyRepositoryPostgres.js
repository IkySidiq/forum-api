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

  async addReply(addReply) {
    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO replies (id, content, owner_id, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner_id',
      values: [id, addReply.content, addReply.ownerId, addReply.commentId], // langsung ambil properti
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
        SELECT replies.id, replies.content, replies.date, replies.is_delete, users.username
        FROM replies
        JOIN users ON users.id = replies.owner_id
        WHERE replies.comment_id = $1
        ORDER BY replies.date ASC
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((reply) => ({
      id: reply.id,
      content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
      date: reply.date,
      username: reply.username,
    }));
  }

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
    if (result.rows[0].owner_id !== ownerId) {
      throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };
    return this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
