const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async() => {
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
  });

  afterEach(async() => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async() => {
    await pool.end();
  });

  // ========== addComment ==========
  describe('addComment', () => {
    it('should add comment to database and return AddedComment correctly', async() => {
      const mockIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(pool, mockIdGenerator);

      const newComment = {
        content: 'Ini komentar',
        threadId: 'thread-123',
        ownerId: 'user-123',
      };

      const addedComment = await commentRepository.addComment(newComment);
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');

      expect(comments).toHaveLength(1);
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toBe('comment-123');
      expect(addedComment.content).toBe(newComment.content);
      expect(addedComment.owner).toBe(newComment.ownerId);
    });
  });

  // ========== deleteComment ==========
  describe('deleteComment', () => {
    it('should throw NotFoundError when comment does not exist', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.deleteComment('comment-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should mark comment as deleted when comment exists', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'isi komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.deleteComment('comment-123'))
        .resolves.not.toThrowError(NotFoundError);
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  // ========== verifyAvailableComment ==========
  describe('verifyAvailableComment', () => {
    it('should throw NotFoundError when comment does not exist', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.verifyAvailableComment('comment-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error when comment exists', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'isi komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyAvailableComment('comment-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  // ========== verifyCommentOwner ==========
  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError when comment does not exist', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.verifyCommentOwner('comment-xxx', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not the same', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-xxx'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw error when owner matches', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow(NotFoundError);
      
      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  // ========== getCommentsByThreadId ==========
  describe('getCommentsByThreadId', () => {
    it('should return all comments with proper raw data', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Tambah komentar normal
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Ini adalah komentar asli dan tidak akan dihapus karena berguna untuk audit',
        threadId: 'thread-123',
        owner: 'user-123',
        date: '2025-09-10T10:50:10.302Z',
      });

      // Tambah komentar yang dihapus
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        content: 'komentar normal',
        threadId: 'thread-123',
        owner: 'user-123',
        is_delete: true,
        date: '2025-09-10T10:55:10.302Z',
      });

      const comments = await commentRepository.getCommentsByThreadId('thread-123');

      // Uji semua atribut komentar mentah
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          content: 'Ini adalah komentar asli dan tidak akan dihapus karena berguna untuk audit',
          date: '2025-09-10T10:50:10.302Z',
          username: 'dicoding',
          isDelete: false,
        },
        {
          id: 'comment-124',
          content: 'komentar normal', // ❌ tetap raw, tidak diubah
          date: '2025-09-10T10:55:10.302Z',
          username: 'dicoding',
          isDelete: true,
        },
      ]);
    });

    it('should return empty array when no comments', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      const comments = await commentRepository.getCommentsByThreadId('thread-123');
      expect(comments).toEqual([]);
    });
  });

  // ========== verifyComment ==========
  describe('verifyComment', () => {
    it('should throw NotFoundError when comment does not exist', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.verifyComment('comment-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error when comment exists', async() => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komen test',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyComment('comment-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
