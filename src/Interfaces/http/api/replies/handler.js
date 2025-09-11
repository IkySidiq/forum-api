const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { content } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute({ content, commentId, ownerId, threadId });
    console.log('bara', addedReply);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { threadId, commentId, replyId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    // ambil instance use case dari container
    const deleteReplyUseCase = this._container.getInstance('DeleteReplyUseCase');

    // eksekusi use case
    await deleteReplyUseCase.execute({ threadId, commentId, replyId, ownerId });

    // kembalikan response sukses
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
