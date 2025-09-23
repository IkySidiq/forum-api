class Comment {
  constructor({ id, content, username, date, isDelete }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this._content = content;
    this.isDelete = isDelete;
  }

  get content() {
    return this.isDelete ? '**komentar telah dihapus**' : this._content;
  }
}

module.exports = Comment;
