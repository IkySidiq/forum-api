const AddedComment = require('../AddedComment'); // sesuaikan path

describe('AddedComment entity', () => {
  it('should create AddedComment object correctly when given valid payload', () => {
    const payload = {
      id: 'comment-123',
      content: 'Isi comment',
      owner: 'user-123',
    };

    const addedComment = new AddedComment(payload);

    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    const payloads = [
      { content: 'Isi comment', owner: 'user-123' }, // missing id
      { id: 'comment-123', owner: 'user-123' },      // missing content
      { id: 'comment-123', content: 'Isi comment' }, // missing owner
    ];

    payloads.forEach((payload) => {
      expect(() => new AddedComment(payload))
        .toThrow('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });

  it('should throw error when payload does not meet data type specification', () => {
    const payloads = [
      { id: 123, content: 'Isi comment', owner: 'user-123' },
      { id: 'comment-123', content: {}, owner: 'user-123' },
      { id: 'comment-123', content: 'Isi comment', owner: 456 },
    ];

    payloads.forEach((payload) => {
      expect(() => new AddedComment(payload))
        .toThrow('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });
});
