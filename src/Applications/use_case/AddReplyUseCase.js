const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ content, commentId, ownerId, threadId }) {
    try {
      // Membuat entity AddReply untuk validasi payload
      const addReply = new AddReply({ content, commentId, ownerId });

      // pastikan thread ada
      await this._threadRepository.verifyAvailableThread(threadId);

      // Verifikasi apakah commentId valid
      await this._commentRepository.verifyComment(addReply.commentId);

      // Memanggil repository untuk menyimpan reply
      return this._replyRepository.addReply(
        { content: addReply.content },
        addReply.commentId,
        addReply.ownerId,
      );
    } catch (error) {
      console.error('[AddReplyUseCase] Error:', error.message, error.stack);
      throw error; // dilempar lagi ke handler Hapi
    }
  }
}

module.exports = AddReplyUseCase;
