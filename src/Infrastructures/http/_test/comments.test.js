const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async() => {
    await pool.end();
  });

  afterEach(async() => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async() => {
      const server = await createServer(container);

      // 1. Register user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' },
      });

      // 2. Login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // 3. Tambah thread dulu (karena comment butuh threadId)
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // 4. Tambah comment
      const requestPayload = { content: 'Ini komentar' };
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);

      // Pastikan comment tersimpan di DB
      const comments = await CommentsTableTestHelper.findCommentById(responseJson.data.addedComment.id);
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe(requestPayload.content);
    });

    it('should response 400 when payload missing property', async() => {
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

      // Tambah thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // Kirim comment tanpa content
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat membuat comment karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when content more than 500 characters', async() => {
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

      // Tambah thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // Kirim comment terlalu panjang
      const requestPayload = { content: 'a'.repeat(501) };
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat membuat comment karena karakter content melebihi batas limit');
    });
  });

  describe('/threads/{threadId}/comments endpoint (DELETE)', () => {
    it('should response 200 and delete comment successfully', async() => {
      const server = await createServer(container);

      // 1. Register + login user
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

      // 2. Tambah thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Thread Delete Test', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // 3. Tambah comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Comment akan dihapus' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // 4. Hapus comment
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(200);
      expect(deleteResponseJson.status).toEqual('success');

      // 5. Pastikan comment sudah soft delete
      const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);
      expect(comments[0].is_delete).toBe(true);
    });

    it('should response 403 when user is not the owner', async() => {
      const server = await createServer(container);

      // 1. Register user 1 + login
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' },
      });
      const loginResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { data: { accessToken: tokenOwner } } = JSON.parse(loginResponse1.payload);

      // 2. Register user 2 + login
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'budi', password: 'secret', fullname: 'Budi Santoso' },
      });
      const loginResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'budi', password: 'secret' },
      });
      const { data: { accessToken: tokenOther } } = JSON.parse(loginResponse2.payload);

      // 3. Tambah thread & comment oleh user 1
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Thread Test', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${tokenOwner}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Comment by owner' },
        headers: { Authorization: `Bearer ${tokenOwner}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // 4. Coba hapus comment dengan user 2
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: { Authorization: `Bearer ${tokenOther}` },
      });

      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(403);
      expect(deleteResponseJson.status).toEqual('fail');
      expect(deleteResponseJson.message).not.toBe('');
    });

    it('should response 404 when thread or comment not found', async() => {
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

      // Hapus comment/thread yang tidak ada
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-404/comments/comment-404',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(404);
      expect(deleteResponseJson.status).toEqual('fail');
      expect(deleteResponseJson.message).not.toBe('');
    });
  });
});
