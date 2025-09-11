const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async() => {
    await pool.end();
  });

  afterEach(async() => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async() => {
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

      // 3. Tambah thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // 4. Tambah comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Ini komentar' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // 5. Tambah reply
      const replyPayload = { content: 'Ini balasan' };
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: replyPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(replyPayload.content);

      // Pastikan reply tersimpan di DB
      const replies = await RepliesTableTestHelper.findReplyById(responseJson.data.addedReply.id);
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toBe(replyPayload.content);
    });

    it('should response 400 when payload missing property', async() => {
      const server = await createServer(container);

      // Register + login
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

      // Tambah thread & comment
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Ini komentar' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Kirim reply tanpa content
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat membuat reply karena properti yang dibutuhkan tidak ada');
    });

    it('should response 404 when comment not found', async() => {
      const server = await createServer(container);

      // Register + login
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

      // Kirim reply ke comment yang tidak ada
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/comment-404/replies`,
        payload: { content: 'Isi balasan' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toBe('');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and soft delete the reply', async() => {
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

      // 3. Tambah thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // 4. Tambah comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Ini komentar' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // 5. Tambah reply
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: { content: 'Ini balasan' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedReply } } = JSON.parse(replyResponse.payload);

      // 6. Hapus reply
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(200);
      expect(deleteResponseJson.status).toEqual('success');

      // 7. Pastikan reply sudah soft delete di DB
      const replies = await RepliesTableTestHelper.findReplyById(addedReply.id);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBe(true);
    });

    it('should response 404 when reply not found', async() => {
      const server = await createServer(container);

      // Register + login
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

      // Tambah thread & comment
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Judul Thread', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'Ini komentar' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Hapus reply yang tidak ada
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/reply-404`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(404);
      expect(deleteResponseJson.status).toEqual('fail');
      expect(deleteResponseJson.message).not.toBe('');
    });
  });
});
