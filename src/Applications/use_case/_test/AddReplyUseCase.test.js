const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi balasan',
      commentId: 'comment-123',
      ownerId: 'user-123',
    };

    const expectedAddedReply = {
      id: 'reply-123',
      content: 'Isi balasan',
      owner: 'user-123',
    };

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddReply.prototype, '_verifyPayload');

    // Mock dependencies
    const mockReplyRepository = {
      verifyComment: jest.fn().mockResolvedValue(),
      addReply: jest.fn().mockResolvedValue(expectedAddedReply),
    };

    // Act
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepository.verifyComment).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      { content: useCasePayload.content },
      useCasePayload.commentId,
      useCasePayload.ownerId
    );
    expect(addedReply).toEqual(expectedAddedReply);

    verifyPayloadSpy.mockRestore();
  });

  it('should throw error when payload is missing required properties', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Isi balasan',
      ownerId: 'user-123',
      // commentId missing
    };

    const mockReplyRepository = {
      verifyComment: jest.fn(),
      addReply: jest.fn(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Act & Assert
    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADDING_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');

    expect(mockReplyRepository.verifyComment).not.toHaveBeenCalled();
    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });
});
