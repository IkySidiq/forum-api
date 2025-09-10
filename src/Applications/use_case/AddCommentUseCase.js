const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute({ content, threadId, ownerId }) {
    const addComment = new AddComment({ content, threadId, ownerId });
    return this._commentRepository.addComment({
      content: addComment.content,
      threadId: addComment.threadId,
      ownerId: addComment.ownerId,
    });
  }
}

module.exports = AddCommentUseCase;
