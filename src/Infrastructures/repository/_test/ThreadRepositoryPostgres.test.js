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

  describe('addThread', () => {
    it('should add thread to database and return AddedThread correctly', async () => {
      // Arrange
      const mockIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(pool, mockIdGenerator);

      const newThread = {
        title: 'Judul Thread',
        body: 'Isi Thread',
        ownerId: 'user-123',
      };

      // Act
      const addedThread = await threadRepository.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toBe('thread-123');
      expect(addedThread.title).toBe(newThread.title);
      expect(addedThread.owner).toBe(newThread.ownerId);
    });
  });
});
