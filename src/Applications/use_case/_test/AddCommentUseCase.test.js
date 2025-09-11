const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi komentar',
      threadId: 'thread-123',
      ownerId: 'user-123',
    };

    const expectedAddedComment = {
      id: 'comment-123',
      content: 'Isi komentar',
      owner: 'user-123',
    };

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddComment.prototype, '_verifyPayload');

    // Mock dependencies
    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue(expectedAddedComment),
    };
    const mockThreadRepository = {
      verifyAvailableThread: jest.fn().mockResolvedValue(), // hanya resolve saja
    };

    // Act
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      ownerId: useCasePayload.ownerId,
    });
    expect(addedComment).toEqual(expectedAddedComment);

    verifyPayloadSpy.mockRestore();
  });

  it('should throw error when payload is missing required properties', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi komentar',
      ownerId: 'user-123',
      // threadId missing
    };

    const mockCommentRepository = {
      addComment: jest.fn(),
    };
    const mockThreadRepository = {
      verifyAvailableThread: jest.fn(),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADDING_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');

    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
    expect(mockThreadRepository.verifyAvailableThread).not.toHaveBeenCalled();
  });
});
