const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail including comments and replies', async () => {
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
