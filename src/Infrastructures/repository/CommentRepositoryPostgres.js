const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ content, ownerId, threadId }) {
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments (id, content, owner_id, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner_id',
      values: [id, content, ownerId, threadId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner_id,
    });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async verifyAvailableComment(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, ownerId) {
    const query = {
      text: 'SELECT owner_id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      console.log('TAH ERROR');
    }

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    const comment = result.rows[0];
    if (comment.owner_id !== ownerId) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = CommentRepositoryPostgres;
