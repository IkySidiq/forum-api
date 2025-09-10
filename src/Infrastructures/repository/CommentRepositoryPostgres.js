// const InvariantError = require('../../Commons/exceptions/InvariantError');
// const NotFoundError = require('../../Commons/exceptions/NotFoundError');
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
    console.log('[DEBUG Repo] result insert comment:', result.rows);

    return new AddedComment({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner_id,
    });
  }
}

module.exports = CommentRepositoryPostgres;
