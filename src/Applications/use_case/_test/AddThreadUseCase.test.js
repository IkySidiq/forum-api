const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      ownerId: 'owner-123',
      title: 'Thread Title',
      body: 'Thread Body',
    };

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.ownerId,
    });

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddThread.prototype, '_verifyPayload');

    // Mock dependencies
    const mockThreadRepository = {
      addThread: jest.fn((thread) =>
        Promise.resolve(new AddedThread({
          id: 'thread-123',
          title: thread.title,
          owner: thread.ownerId,
        }))
      ),
    };

    // Act
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        ownerId: useCasePayload.ownerId,
      })
    );
    expect(result).toStrictEqual(expectedAddedThread);

    verifyPayloadSpy.mockRestore();
  });

  it('should throw error when payload is missing required properties', async () => {
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
