const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      owner: 'user-123',
    });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'Isi komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // ========== verifyComment ==========
  describe('verifyComment', () => {
    it('should throw NotFoundError if comment does not exist', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyComment('comment-xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error if comment exists', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyComment('comment-123'))
        .resolves.not.toThrowError();
    });
  });

  // ========== addReply ==========
  describe('addReply', () => {
    it('should add reply to database and return AddedReply correctly', async () => {
      const mockIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, mockIdGenerator);

      const newReply = {
        content: 'Isi balasan',
        commentId: 'comment-123',
        ownerId: 'user-123',
      };

      const addedReply = await replyRepository.addReply(
        { content: newReply.content },
        newReply.commentId,
        newReply.ownerId
      );

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(replies).toHaveLength(1);
      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply.id).toBe('reply-123');
      expect(addedReply.content).toBe(newReply.content);
      expect(addedReply.owner).toBe(newReply.ownerId);
    });
  });

  // ========== getRepliesByCommentId ==========
  describe('getRepliesByCommentId', () => {
    it('should return all replies for a comment with correct format', async () => {
      let idCounter = 1;
      const mockIdGenerator = () => `${idCounter++}`;
      const replyRepository = new ReplyRepositoryPostgres(pool, mockIdGenerator);

      await replyRepository.addReply({ content: 'Balasan pertama' }, 'comment-123', 'user-123');
      await replyRepository.addReply({ content: 'Balasan kedua' }, 'comment-123', 'user-123');

      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);
      expect(replies[0].content).toBe('Balasan pertama');
      expect(replies[1].content).toBe('Balasan kedua');
      expect(replies[0].username).toBe('dicoding');
      expect(replies[0]).toHaveProperty('date');
    });

    it('should replace content with "**balasan telah dihapus**" if reply is deleted', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan sensitif',
        owner: 'user-123',
        commentId: 'comment-123',
        is_delete: true,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(1);
      expect(replies[0].content).toBe('**balasan telah dihapus**');
    });
  });
});
