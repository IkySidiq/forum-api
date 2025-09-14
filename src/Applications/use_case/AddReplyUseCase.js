const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ content, commentId, ownerId, threadId }) {
    try {
      const addReply = new AddReply({ content, commentId, ownerId });

      await this._threadRepository.verifyAvailableThread(threadId);
      await this._commentRepository.verifyComment(addReply.commentId);

      return await this._replyRepository.addReply(addReply);
    } catch (error) {
      console.error('[AddReplyUseCase] Error:', error.message, error.stack);
      throw error; // biar tetap dilempar ke handler Hapi
    }
  }
}

module.exports = AddReplyUseCase;
