const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();

    // tambah user & thread untuk foreign key
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should add comment to database and return AddedComment correctly', async () => {
      // Arrange
      const mockIdGenerator = () => '123'; // comment-123
      const commentRepository = new CommentRepositoryPostgres(pool, mockIdGenerator);

      const newComment = {
        content: 'Ini komentar',
        threadId: 'thread-123',
        ownerId: 'user-123',
      };

      // Act
      const addedComment = await commentRepository.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toBe('comment-123');
      expect(addedComment.content).toBe(newComment.content);
      expect(addedComment.owner).toBe(newComment.ownerId);
    });
  });

  describe('deleteComment', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.deleteComment('comment-xxx'))
        .rejects.toThrowError('Comment tidak ditemukan');
    });

    it('should mark comment as deleted when comment exists', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'isi komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await commentRepository.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('verifyAvailableComment', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.verifyAvailableComment('comment-xxx'))
        .rejects.toThrowError('Comment tidak ditemukan');
    });

    it('should not throw error when comment exists', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'isi komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyAvailableComment('comment-123'))
        .resolves.not.toThrowError();
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await expect(commentRepository.verifyCommentOwner('comment-xxx', 'user-123'))
        .rejects.toThrowError('Comment tidak ditemukan');
    });

    it('should throw AuthorizationError when owner is not the same', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-xxx'))
        .rejects.toThrowError('anda tidak berhak mengakses resource ini');
    });

    it('should not throw error when owner matches', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komen',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrowError();
    });
  });
});
