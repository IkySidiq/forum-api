const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

async execute({ content, threadId, ownerId }) {
  // Buat objek comment → otomatis _verifyPayload dijalankan
  const addComment = new AddComment({ content, threadId, ownerId });

  // Verifikasi apakah thread tersedia
  await this._threadRepository.verifyAvailableThread(addComment.threadId);

  // Tambahkan comment
  return this._commentRepository.addComment({
    content: addComment.content,
    threadId: addComment.threadId,
    ownerId: addComment.ownerId,
  });
}
}

module.exports = AddCommentUseCase;
