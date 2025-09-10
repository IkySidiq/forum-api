class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    console.log('babi', threadId);

    try {
      await this._threadRepository.verifyAvailableThread(threadId);
      const thread = await this._threadRepository.getThreadById(threadId);
      let comments = await this._commentRepository.getCommentsByThreadId(threadId);
      comments = comments.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      }));

      return {
        id: thread.id,
        title: thread.title,
        body: thread.body,
        date: thread.date,
        username: thread.username,
        comments,
      };
    } catch (error) {
      console.error('[GetThreadDetailUseCase] Error:', error.message, error.stack);
      throw error; // biar dilempar ke handler Hapi
    }
  }
}

module.exports = GetThreadDetailUseCase;
