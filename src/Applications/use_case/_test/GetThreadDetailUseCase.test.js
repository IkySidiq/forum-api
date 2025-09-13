const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail with replies correctly', async() => {
    // payload use case
    const useCasePayload = { threadId: 'thread-123' };

    // mock data thread
    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    // mock data comment
    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:59:18.982Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'johndoe',
        date: '2021-08-08T08:00:00.000Z',
        content: '**komentar telah dihapus**',
        is_delete: true,
      },
    ];

    // mock data replies
    const mockReplies = [
      {
        id: 'reply-123',
        content: '**komentar telah dihapus**',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        is_delete: false,
      },
      {
        id: 'reply-124',
        content: '**balasan telah dihapus**',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        is_delete: true,
      },
    ];

    // mock repository
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByCommentId = jest.fn((commentId) => {
      if (commentId === 'comment-123') return Promise.resolve(mockReplies);
      return Promise.resolve([]);
    });

    // instance use case
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // execute use case
    const result = await getThreadDetailUseCase.execute(useCasePayload);

    // assertion
    expect(result).toStrictEqual({
      id: mockThread.id,
      title: mockThread.title,
      body: mockThread.body,
      date: mockThread.date,
      username: mockThread.username,
      comments: [
        {
          id: mockComments[0].id,
          username: mockComments[0].username,
          date: mockComments[0].date,
          content: mockComments[0].content,
          replies: [
            {
              id: mockReplies[0].id,
              content: mockReplies[0].content,
              date: mockReplies[0].date,
              username: mockReplies[0].username,
            },
            // ⚠️ reply yang dihapus (mockReplies[1]) gak ikut
          ],
        },
        {
          id: mockComments[1].id,
          username: mockComments[1].username,
          date: mockComments[1].date,
          content: '**komentar telah dihapus**',
          replies: [],
        },
      ],
    });

    // cek pemanggilan repository
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(mockComments[0].id);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(mockComments[1].id);
  });
});
