class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    // pastikan thread ada
    await this._threadRepository.verifyAvailableThread(threadId);

    // ambil data thread
    const thread = await this._threadRepository.getThreadById(threadId);

    // ambil semua comment di thread
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // mapping comment + ambil replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const rawReplies = await this._replyRepository.getRepliesByCommentId(comment.id);

        const replies = rawReplies.map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        }));

        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
          replies,
        };
      })
    );

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: commentsWithReplies,
    };
  }
}

module.exports = GetThreadDetailUseCase;
