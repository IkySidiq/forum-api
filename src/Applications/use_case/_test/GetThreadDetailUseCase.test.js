const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail with replies correctly', async () => {
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

    // mock data comment (sesuaikan property dengan isDelete)
    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:59:18.982Z',
        content: 'sebuah comment',
        isDelete: false,
      },
      {
        id: 'comment-124',
        username: 'johndoe',
        date: '2021-08-08T08:00:00.000Z',
        content: 'sebuah comment',
        isDelete: true,
      },
    ];

    // mock data replies
    const mockReplies = [
      {
        id: 'reply-123',
        content: 'sebuah reply',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        isDelete: false,
      },
      {
        id: 'reply-124',
        content: 'reply dihapus',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        isDelete: true,
      },
    ];

    // mock repository
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadbyId = jest.fn(() => Promise.resolve(mockThread));

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
          id: 'comment-123',
          username: 'dicoding',
          date: '2021-08-08T07:59:18.982Z',
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah reply',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            },
            // reply yang dihapus (reply-124) gak ikut
          ],
        },
        {
          id: 'comment-124',
          username: 'johndoe',
          date: '2021-08-08T08:00:00.000Z',
          content: '**komentar telah dihapus**', // comment dihapus
          replies: [],
        },
      ],
    });

    // cek pemanggilan repository
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getThreadbyId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-124');
  });
});
