class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ replyId, commentId, threadId, ownerId }) {
    try {
      // cek thread ada
      await this._threadRepository.verifyAvailableThread(threadId);

      // cek komentar ada
      await this._commentRepository.verifyAvailableComment(commentId);

      // cek reply ada
      await this._replyRepository.verifyReply(replyId);

      // cek pemilik reply
      await this._replyRepository.verifyReplyOwner(replyId, ownerId);

      // hapus reply (soft delete)
      await this._replyRepository.deleteReply(replyId);
    } catch (error) {
      console.error('[DeleteReplyUseCase] Error:', error.message, error.stack);
      throw error; // dilempar ke handler Hapi
    }
  }
}

module.exports = DeleteReplyUseCase;
