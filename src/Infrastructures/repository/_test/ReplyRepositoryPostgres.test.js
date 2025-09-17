const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

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

  // ========== addReply ==========
  describe('addReply', () => {
    it('should add reply and return AddedReply correctly', async () => {
      const newReply = new AddReply({
        content: 'Isi balasan',
        commentId: 'comment-123',
        ownerId: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepository.addReply(newReply);
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'Isi balasan',
          owner: 'user-123',
        }),
      );
    });
  });

  // ========== getRepliesByCommentId ==========
  describe('getRepliesByCommentId', () => {
    it('should return all replies with correct format', async () => {
      let counter = 1;
      const replyRepository = new ReplyRepositoryPostgres(pool, () => `reply-${counter++}`);

      const reply1 = new AddReply({
        content: 'Balasan pertama',
        commentId: 'comment-123',
        ownerId: 'user-123',
      });

      const reply2 = new AddReply({
        content: 'Balasan kedua',
        commentId: 'comment-123',
        ownerId: 'user-123',
      });

      await replyRepository.addReply(reply1);
      await replyRepository.addReply(reply2);

      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);

      expect(replies[0]).toStrictEqual({
        id: expect.any(String),
        content: 'Balasan pertama',
        date: expect.any(Date), 
        username: 'dicoding',
        isDelete: false,
      });

      expect(replies[1]).toStrictEqual({
        id: expect.any(String),
        content: 'Balasan kedua',
        date: expect.any(Date),
        username: 'dicoding',
        isDelete: false,
      });
    });

    it('should return reply with isDelete true if deleted', async () => {
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
      expect(replies[0]).toStrictEqual({
        id: 'reply-123',
        content: 'Balasan sensitif',
        date: expect.any(Date),
        username: 'dicoding',
        isDelete: true,
      });
    });

    it('should return empty array if no replies', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepository.getRepliesByCommentId('comment-123');
      expect(replies).toEqual([]);
    });
  });

  // ========== verifyReply ==========
  describe('verifyReply', () => {
    it('should throw NotFoundError if reply does not exist', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReply('reply-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error if reply exists', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan valid',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReply('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  // ========== verifyReplyOwner ==========
  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError if user is not the owner', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan milik user lain',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReplyOwner('reply-123', 'user-999')).rejects.toThrowError(
        AuthorizationError,
      );
    });

    it('should not throw error if user is the owner', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan milik user',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  // ========== deleteReply ==========
  describe('deleteReply', () => {
    it('should soft delete reply', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan yang akan dihapus',
        owner: 'user-123',
        commentId: 'comment-123',
        is_delete: false,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      const result = await replyRepository.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toBe(true);
      expect(result).toHaveProperty('rowCount', 1);
    });
  });
});
