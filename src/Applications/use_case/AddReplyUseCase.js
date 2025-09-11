const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute({ content, commentId, ownerId }) {
    try {
      // Membuat entity AddReply untuk validasi payload
      const addReply = new AddReply({ content, commentId, ownerId });

      // Verifikasi apakah commentId valid
      await this._replyRepository.verifyComment(addReply.commentId);

      // Memanggil repository untuk menyimpan reply
      return this._replyRepository.addReply(
        { content: addReply.content },
        addReply.commentId,
        addReply.ownerId
      );
    } catch (error) {
      console.error('[AddReplyUseCase] Error:', error.message, error.stack);
      throw error; // dilempar lagi ke handler Hapi
    }
  }
}

module.exports = AddReplyUseCase;
