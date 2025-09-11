const AddedReply = require('../AddedReply');

describe('AddedReply entity', () => {
  it('should create AddedReply object correctly when given valid payload', () => {
    const payload = {
      id: 'reply-123',
      content: 'Isi balasan',
      owner: 'user-123',
    };

    const addedReply = new AddedReply(payload);

    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    const payloads = [
      { content: 'Isi balasan', owner: 'user-123' }, // missing id
      { id: 'reply-123', owner: 'user-123' },        // missing content
      { id: 'reply-123', content: 'Isi balasan' },   // missing owner
    ];

    payloads.forEach((payload) => {
      expect(() => new AddedReply(payload))
        .toThrow('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });

  it('should throw error when payload does not meet data type specification', () => {
    const payloads = [
      { id: 123, content: 'Isi balasan', owner: 'user-123' },
      { id: 'reply-123', content: {}, owner: 'user-123' },
      { id: 'reply-123', content: 'Isi balasan', owner: 456 },
    ];

    payloads.forEach((payload) => {
      expect(() => new AddedReply(payload))
        .toThrow('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  it('should throw error when content exceeds 500 characters', () => {
    const longContent = 'a'.repeat(501);

    expect(() => new AddedReply({
      id: 'reply-123',
      content: longContent,
      owner: 'user-123',
    })).toThrowError('ADDED_REPLY.CONTENT_LIMIT_CHAR');
  });
});
