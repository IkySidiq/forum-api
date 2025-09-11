const AddReply = require('../AddReply');

describe('an AddReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      ownerId: 'user-123',
      // commentId missing
      content: 'balasan saya',
    };

    // Action & Assert
    expect(() => new AddReply({ ...payload })).toThrow(
      'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 12345,
      ownerId: true,
      commentId: {},
    };

    // Action & Assert
    expect(() => new AddReply({ ...payload })).toThrow(
      'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw error when content contains more than 500 characters', () => {
    // Arrange
    const payload = {
      content: 'a'.repeat(501),
      ownerId: 'user-123',
      commentId: 'comment-123',
    };

    // Action & Assert
    expect(() => new AddReply({ ...payload })).toThrow(
      'ADD_REPLY.CONTENT_LIMIT_CHAR',
    );
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'ini balasan saya',
      ownerId: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const { content, ownerId, commentId } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(ownerId).toEqual(payload.ownerId);
    expect(commentId).toEqual(payload.commentId);
  });
});
