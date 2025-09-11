const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  it('should create instance of ReplyRepositoryPostgres', () => {
    const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
    expect(replyRepository).toBeInstanceOf(ReplyRepositoryPostgres);
  });

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

  describe('addReply', () => {
    it('should add reply and return AddedReply correctly', async () => {
      const mockIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, mockIdGenerator);

      const newReply = { content: 'Isi balasan' };
      const addedReply = await replyRepository.addReply(newReply, 'comment-123', 'user-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(replies).toHaveLength(1);
      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply.id).toBe('reply-123');
      expect(addedReply.content).toBe('Isi balasan');
      expect(addedReply.owner).toBe('user-123');
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return all replies with correct format', async () => {
      let idCounter = 1;
      const replyRepository = new ReplyRepositoryPostgres(pool, () => `${idCounter++}`);

      await replyRepository.addReply({ content: 'Balasan pertama' }, 'comment-123', 'user-123');
      await replyRepository.addReply({ content: 'Balasan kedua' }, 'comment-123', 'user-123');

      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);
      expect(replies[0].content).toBe('Balasan pertama');
      expect(replies[1].content).toBe('Balasan kedua');
      expect(replies[0].username).toBe('dicoding');
      expect(replies[0]).toHaveProperty('date');
    });

    it('should return reply with content replaced if deleted', async () => {
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

    it('should return empty array if no replies', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepository.getRepliesByCommentId('comment-123');
      expect(replies).toEqual([]);
    });
  });

  describe('verifyReply', () => {
    it('should throw NotFoundError if reply does not exist', async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReply('reply-xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error if reply exists', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan valid',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReply('reply-123'))
        .resolves.not.toThrowError();
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError if user is not the owner', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan milik user lain',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReplyOwner('reply-123', 'user-999'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error if user is the owner', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Balasan milik user',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.not.toThrowError();
    });
  });

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
