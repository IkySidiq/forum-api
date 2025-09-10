const AddComment = require('../AddComment');

describe('an AddingComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      ownerId: 'user-123',
      threadId: 'thread-123',
    };

    // Action & Assert
    expect(() => new AddComment({ ...payload })).toThrow('ADDING_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 12345, 
      ownerId: true,
      threadId: {},
    };

    // Action & Assert
    expect(() => new AddComment({ ...payload })).toThrow('ADDING_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when content contains more than 500 characters', () => {
    // Arrange
    const payload = {
      content: 'a'.repeat(501),
      ownerId: 'user-123',
      threadId: 'thread-123',
    };

    // Action & Assert
    //TODO: Destructuring payload
    expect(() => new AddComment({ ...payload })).toThrow('ADDING_COMMENT.CONTENT_LIMIT_CHAR');
  });

  it('should create AddingComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'ini komentar saya',
      ownerId: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const { content, ownerId, threadId } = new AddComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(ownerId).toEqual(payload.ownerId);
    expect(threadId).toEqual(payload.threadId);
  });
});
