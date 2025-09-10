const AddedThread = require('../AddedThread'); // sesuaikan path

describe('AddedThread entity', () => {
  it('should create AddedThread object correctly when given valid payload', () => {
    const payload = {
      id: 'thread-123',
      title: 'Judul Thread',
      owner: 'user-123',
    };

    const addedThread = new AddedThread(payload);

    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    const payloads = [
      { title: 'Judul Thread', owner: 'user-123' }, // missing id
      { id: 'thread-123', owner: 'user-123' },      // missing title
      { id: 'thread-123', title: 'Judul Thread' },    // missing owner
    ];

    payloads.forEach((payload) => {
      expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });

  it('should throw error when payload does not meet data type specification', () => {
    const payloads = [
      { id: 123, title: 'Judul Thread', owner: 'user-123' },
      { id: 'thread-123', title: {}, owner: 'user-123' },
      { id: 'thread-123', title: 'Judul Thread', owner: 456 },
    ];

    payloads.forEach((payload) => {
      expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD._NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });
});
