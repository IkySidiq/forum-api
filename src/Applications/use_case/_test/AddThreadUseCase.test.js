const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async() => {
    // Arrange
    const useCasePayload = {
      ownerId: 'owner-123',
      title: 'Thread Title',
      body: 'Thread Body',
    };

    const expectedAddedThread = {
      id: 'thread-123',
    };

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddThread.prototype, '_verifyPayload');

    // Mock dependencies
    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(expectedAddedThread),
    };

    // Act
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
    // TODO: Ini seperti pemanggilan dari handler yang menjalankan addThreadUseCase.execute(useCasePayload);
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith({
      title: useCasePayload.title,
      body: useCasePayload.body,
      ownerId: useCasePayload.ownerId,
    });
    expect(addedThread).toEqual(expectedAddedThread);
    verifyPayloadSpy.mockRestore();
  });

  it('should throw error when payload is missing required properties', async() => {
    // Arrange
    const useCasePayload = {
      ownerId: 'owner-123',
      title: 'Thread Title',
      // body missing
    };

    const mockThreadRepository = {
      addThread: jest.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADDING_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');

    expect(mockThreadRepository.addThread).not.toHaveBeenCalled();
  });
});
