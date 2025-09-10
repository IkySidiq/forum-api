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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const server = await createServer(container);

      // Register + login user
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

      // Action: tambah thread
      const requestPayload = { title: 'Judul Thread', body: 'Isi thread' };
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 when request payload missing property', async () => {
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

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Hanya title' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat membuat thread karena properti yang dibutuhkan tidak ada');
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

    // tambah comment
    const commentPayload = { content: 'Ini komentar pertama' };
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${addedThread.id}/comments`,
      payload: commentPayload,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data: { addedComment } } = JSON.parse(commentResponse.payload);

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

    // cek comment
    expect(responseJson.data.thread.comments).toHaveLength(1);
    expect(responseJson.data.thread.comments[0].id).toEqual(addedComment.id);
    expect(responseJson.data.thread.comments[0].content).toEqual(commentPayload.content);
    expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
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
