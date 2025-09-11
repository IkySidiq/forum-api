const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke abstract behavior addComment', async() => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.addComment({}))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior deleteComment', async() => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.deleteComment('comment-123'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyAvailableComment', async() => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.verifyAvailableComment('comment-123'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyCommentOwner', async() => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior getCommentsByThreadId', async() => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.getCommentsByThreadId('thread-123'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyComment', async() => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.verifyComment('comment-123'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
