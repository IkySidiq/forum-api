const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior addReply', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.addReply({}))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyComment', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.verifyComment('comment-123'))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
