const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async() => {
    await pool.end();
  });

  afterEach(async() => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail including comments and replies', async() => {
      const server = await createServer(container);

      // Register + login user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' },
      });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Buat thread
      const requestPayload = { title: 'Judul Thread', body: 'Isi thread' };
      const postResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(postResponse.payload);

      // Tambah comment normal
      const comment1Response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Ini komentar pertama' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const comment1Id = JSON.parse(comment1Response.payload).data.addedComment.id;

      // Tambah comment kedua (akan dihapus)
      const comment2Response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Komentar kedua' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const comment2Id = JSON.parse(comment2Response.payload).data.addedComment.id;

      // Tandai comment kedua sebagai deleted
      await pool.query('UPDATE comments SET is_delete = true WHERE id = $1', [comment2Id]);

      // Tambah reply untuk comment pertama
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${comment1Id}/replies`,
        payload: { content: 'Balasan pertama' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${comment1Id}/replies`,
        payload: { content: 'Balasan kedua' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Ambil detail thread
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const thread = responseJson.data.thread;
      expect(thread.id).toEqual(addedThread.id);
      expect(thread.title).toEqual(requestPayload.title);
      expect(thread.body).toEqual(requestPayload.body);
      expect(thread.username).toEqual('dicoding');

      // cek comments
      expect(thread.comments).toHaveLength(2);

      // comment pertama
      expect(thread.comments[0].content).toEqual('Ini komentar pertama');
      expect(thread.comments[0].replies).toHaveLength(2);
      expect(thread.comments[0].replies[0].content).toEqual('Balasan pertama');
      expect(thread.comments[0].replies[1].content).toEqual('Balasan kedua');

      // comment kedua (deleted)
      expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(thread.comments[1].replies).toEqual([]);
    });

    it('should response 404 when thread not found', async() => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-999',
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 400 when title more than 50 characters', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' },
      });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const requestPayload = { title: 'a'.repeat(51), body: 'Isi thread' };
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat membuat thread baru karena karakter title melebihi batas limit');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail including comments', async () => {
      const server = await createServer(container);

      // register + login
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // buat thread
      const requestPayload = { title: 'Judul Thread', body: 'Isi thread' };
      const postResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(postResponse.payload);

      // tambah comment normal
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Ini komentar pertama' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // tambah comment yang dihapus
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Komentar kedua' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // tandai comment kedua sebagai deleted langsung di database
      const comments = await pool.query('SELECT * FROM comments WHERE thread_id = $1 ORDER BY date ASC', [addedThread.id]);
      const deletedCommentId = comments.rows[1].id;
      await pool.query('UPDATE comments SET is_delete = true WHERE id = $1', [deletedCommentId]);

      // ambil detail thread
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(addedThread.id);
      expect(responseJson.data.thread.title).toEqual(requestPayload.title);
      expect(responseJson.data.thread.body).toEqual(requestPayload.body);
      expect(responseJson.data.thread.username).toEqual('dicoding');

      // cek comments
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual('Ini komentar pertama');
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
    });

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-999',
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
