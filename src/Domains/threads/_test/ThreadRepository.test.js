const ThreadRepository = require('../ThreadRepository');

describe('threadRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.addThread({})).rejects.toThrow('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});