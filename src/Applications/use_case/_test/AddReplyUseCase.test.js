const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi balasan',
      commentId: 'comment-123',
      ownerId: 'user-123',
      threadId: 'thread-123',
    };

    const expectedAddedReply = {
      id: 'reply-123',
      content: 'Isi balasan',
      owner: 'user-123',
    };

    // Mock dependencies
    const mockReplyRepository = {
      addReply: jest.fn().mockResolvedValue(expectedAddedReply),
    };
    const mockCommentRepository = {
      verifyComment: jest.fn().mockResolvedValue(),
    };
    const mockThreadRepository = {
      verifyAvailableThread: jest.fn().mockResolvedValue(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply)
      .toHaveBeenCalledWith(
        { content: useCasePayload.content },
        useCasePayload.commentId,
        useCasePayload.ownerId
      );
    expect(addedReply).toEqual(expectedAddedReply);
  });

  it('should throw error when payload is missing required properties', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi balasan',
      ownerId: 'user-123',
      threadId: 'thread-123',
      // commentId missing
    };

    const mockReplyRepository = { addReply: jest.fn() };
    const mockCommentRepository = { verifyComment: jest.fn() };
    const mockThreadRepository = { verifyAvailableThread: jest.fn() };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');

    expect(mockThreadRepository.verifyAvailableThread).not.toHaveBeenCalled();
    expect(mockCommentRepository.verifyComment).not.toHaveBeenCalled();
    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });
});
