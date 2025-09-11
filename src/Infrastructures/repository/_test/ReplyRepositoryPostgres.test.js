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

    // Tambahkan user
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

    // Tambahkan thread
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      owner: 'user-123',
    });

    // Tambahkan comment
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
});
