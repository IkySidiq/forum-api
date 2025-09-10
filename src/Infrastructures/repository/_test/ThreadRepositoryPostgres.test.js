const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();

    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // ========== addThread ==========
  describe('addThread', () => {
    it('should add thread to database and return AddedThread correctly', async () => {
      const mockIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(pool, mockIdGenerator);

      const newThread = {
        title: 'Judul Thread',
        body: 'Isi Thread',
        ownerId: 'user-123',
      };

      const addedThread = await threadRepository.addThread(newThread);
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');

      expect(threads).toHaveLength(1);
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toBe('thread-123');
      expect(addedThread.title).toBe(newThread.title);
      expect(addedThread.owner).toBe(newThread.ownerId);
    });
  });

  // ========== verifyAvailableThread ==========
  describe('verifyAvailableThread', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(threadRepository.verifyAvailableThread('thread-xxx'))
        .rejects.toThrowError('Thread tidak ditemukan');
    });

    it('should not throw error when thread exists', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => '123');
      const uniqueThreadId = 'thread-verify-123';

      await ThreadsTableTestHelper.addThread({
        id: uniqueThreadId,
        title: 'Judul Thread',
        body: 'Isi Thread',
        owner: 'user-123',
      });

      await expect(threadRepository.verifyAvailableThread(uniqueThreadId))
        .resolves.not.toThrowError();
    });
  });

  // ========== getThreadById ==========
  describe('getThreadById', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(threadRepository.getThreadById('thread-xxx'))
        .rejects.toThrowError('Thread tidak ditemukan');
    });

    it('should return thread data correctly', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => '123');
      const uniqueThreadId = 'thread-get-123';

      await ThreadsTableTestHelper.addThread({
        id: uniqueThreadId,
        title: 'Judul Thread',
        body: 'Isi Thread',
        owner: 'user-123',
      });

      const thread = await threadRepository.getThreadById(uniqueThreadId);

      expect(thread.id).toBe(uniqueThreadId);
      expect(thread.title).toBe('Judul Thread');
      expect(thread.body).toBe('Isi Thread');
      expect(thread.username).toBe('dicoding');
    });
  });
});
