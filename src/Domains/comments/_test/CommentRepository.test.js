const CommentRepository = require('../CommentRepository'); // sesuaikan path

describe('CommentRepository interface', () => {
  it('should throw error when invoke abstract behavior addComment', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(commentRepository.addComment({}))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
