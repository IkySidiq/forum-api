const AddThread = require('../AddThread'); // sesuaikan path jika perlu

describe('addThread entity', () => {
  it('should create addThread object correctly when given valid payload', () => {
    const payload = {
      title: 'Judul Thread',
      body: 'Isi dari thread',
      ownerId: 'user-123',
    };

    const addThread = new AddThread(payload);

    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.ownerId).toEqual(payload.ownerId);
  });

  it('should throw error when payload does not contain needed property', () => {
    const payloads = [
      { body: 'Isi', ownerId: 'user-123' }, // missing title
      { title: 'Judul', ownerId: 'user-123' }, // missing body
      { title: 'Judul', body: 'Isi' }, // missing ownerId
    ];

    payloads.forEach((payload) => {
      expect(() => new AddThread(payload)).toThrow('ADDING_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });

  it('should throw error when payload does not meet data type specification', () => {
    const payloads = [
      { title: 123, body: 'Isi', ownerId: 'user-123' },
      { title: 'Judul', body: {}, ownerId: 'user-123' },
      { title: 'Judul', body: 'Isi', ownerId: 456 },
    ];

    payloads.forEach((payload) => {
      expect(() => new AddThread(payload)).toThrow('ADDING_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  it('should throw error when title exceeds 50 characters', () => {
    const payload = {
      title: 'a'.repeat(51),
      body: 'Isi',
      ownerId: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrow('ADDING_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should throw error when body exceeds 500 characters', () => {
    const payload = {
      title: 'Judul',
      body: 'a'.repeat(501),
      ownerId: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrow('ADDING_THREAD.BODY_LIMIT_CHAR');
  });
});
