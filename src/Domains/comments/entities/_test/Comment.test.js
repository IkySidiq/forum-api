const Comment = require('../Comment.Js');

describe('Comment entity', () => {
  it('should return content as is when isDelete is false', () => {
    const payload = {
      id: 'comment-123',
      content: 'Isi komentar asli',
      username: 'dicoding',
      date: '2025-09-13T12:00:00.000Z',
      isDelete: false,
    };

    const comment = new Comment(payload);

    expect(comment.id).toBe(payload.id);
    expect(comment.username).toBe(payload.username);
    expect(comment.date).toBe(payload.date);
    expect(comment.content).toBe('Isi komentar asli');
  });

  it('should return "**komentar telah dihapus**" when isDelete is true', () => {
    const payload = {
      id: 'comment-123',
      content: 'Isi komentar yang dihapus',
      username: 'dicoding',
      date: '2025-09-13T12:00:00.000Z',
      isDelete: true,
    };

    const comment = new Comment(payload);

    expect(comment.content).toBe('**komentar telah dihapus**');
  });
});
