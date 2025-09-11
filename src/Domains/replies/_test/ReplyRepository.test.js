const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior addReply', async() => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.addReply({}, 'comment-123', 'user-123'))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior getRepliesByCommentId', async() => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.getRepliesByCommentId('comment-123'))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyReply', async() => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.verifyReply('reply-123'))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyReplyOwner', async() => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123'))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior deleteReply', async() => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.deleteReply('reply-123'))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
