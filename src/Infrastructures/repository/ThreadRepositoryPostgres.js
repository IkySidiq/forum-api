const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread({ title, body, ownerId }) {
    const id = `thread-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO threads (id, title, body, owner_id) VALUES($1, $2, $3, $4) RETURNING id, title, owner_id',
      values: [id, title, body, ownerId],
    };

    const result = await this._pool.query(query);
    console.log('[DEBUG Repo] result insert:', result.rows);

    return new AddedThread({
      id: result.rows[0].id,
      title: result.rows[0].title,
      owner: result.rows[0].owner_id,
    });
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, users.username
        FROM threads
        JOIN users ON users.id = threads.owner_id
        WHERE threads.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
