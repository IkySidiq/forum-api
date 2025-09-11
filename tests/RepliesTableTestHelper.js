/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'Default reply content',
    owner = 'user-123',
    commentId = 'comment-123',
    is_delete = false,
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO replies (id, content, owner_id, comment_id, is_delete, date) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, commentId, is_delete, date],
    };
    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
