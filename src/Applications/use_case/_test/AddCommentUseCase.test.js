const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi komentar',
      threadId: 'thread-123',
      ownerId: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.ownerId,
    });

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddComment.prototype, '_verifyPayload');

    // Mock dependencies
    const mockCommentRepository = {
      addComment: jest.fn((comment) => 
        Promise.resolve(new AddedComment({
          id: 'comment-123',
          content: comment.content,
          owner: comment.ownerId,
        }))
      ),
    };

    const mockThreadRepository = {
      verifyAvailableThread: jest.fn(() => Promise.resolve()), // hanya resolve saja
    };

    // Act
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      ownerId: useCasePayload.ownerId,
    });
    expect(result).toStrictEqual(expectedAddedComment);

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
