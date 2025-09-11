const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface (all methods)', () => {
  let replyRepository;

  beforeEach(() => {
    replyRepository = new ReplyRepository();
  });

  it('should throw error when invoke abstract behavior addReply', async () => {
    await expect(replyRepository.addReply({ content: 'test' }, 'comment-123', 'user-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyComment', async () => {
    await expect(replyRepository.verifyComment('comment-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior getRepliesByCommentId', async () => {
    await expect(replyRepository.getRepliesByCommentId('comment-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyReply', async () => {
    await expect(replyRepository.verifyReply('reply-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyReplyOwner', async () => {
    await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior deleteReply', async () => {
    await expect(replyRepository.deleteReply('reply-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
