const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
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

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.ownerId,
    });

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddReply.prototype, '_verifyPayload');

    // Mock dependencies
    const mockReplyRepository = {
      addReply: jest.fn((reply) =>
        Promise.resolve(new AddedReply({
          id: 'reply-123',
          content: reply.content,
          owner: reply.ownerId,
        }))
      ),
    };
    const mockCommentRepository = {
      verifyComment: jest.fn(() => Promise.resolve()),
    };
    const mockThreadRepository = {
      verifyAvailableThread: jest.fn(() => Promise.resolve()),
    };

    // Act
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith({
      content: useCasePayload.content,
      commentId: useCasePayload.commentId,
      ownerId: useCasePayload.ownerId,
    }); // threadId dihilangkan karena AddReply tidak pakai
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply)
      .toHaveBeenCalledWith(
        new AddReply({
          content: useCasePayload.content,
          commentId: useCasePayload.commentId,
          ownerId: useCasePayload.ownerId,
        }),
      );
    expect(result).toStrictEqual(expectedAddedReply);

    verifyPayloadSpy.mockRestore();
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
