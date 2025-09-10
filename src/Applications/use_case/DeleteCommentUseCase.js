class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ commentId, threadId, ownerId }) {
    try {
      await this._threadRepository.verifyAvailableThread(threadId);
      await this._commentRepository.verifyAvailableComment(commentId);
      await this._commentRepository.verifyCommentOwner(commentId, ownerId);
      await this._commentRepository.deleteComment(commentId);
    } catch (error) {
      console.error('[DeleteCommentUseCase] Error:', error.message, error.stack);
      throw error; // biar tetap dilempar ke handler Hapi
    }
  }
}

module.exports = DeleteCommentUseCase;
