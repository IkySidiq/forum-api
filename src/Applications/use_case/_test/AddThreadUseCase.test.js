const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

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

    // Creating Dependency of UseCase
    const mockThreadRepository = new ThreadRepository();

    // Mocking Needed Functions
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    // Spy pada _verifyPayload
    const verifyPayloadSpy = jest.spyOn(AddThread.prototype, '_verifyPayload');

    // Act
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(verifyPayloadSpy).toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith({
      title: useCasePayload.title,
      body: useCasePayload.body,
      ownerId: useCasePayload.ownerId,
    });
    expect(result).toStrictEqual(expectedAddedThread);

    verifyPayloadSpy.mockRestore();
  });
});
