const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    const requestPayload = {
      title: 'init title',
      body: 'ini body',
    };

    it('should response 201 and thread created', async () => {
      const { server, headers, userData } = await ServerTestHelper.useServerWithAuth();
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toStrictEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toStrictEqual(userData.id);
    });

    it('should response 401 when have not login', async () => {
      const server = await ServerTestHelper.useServer();
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const invalidRequestPayload = { ...requestPayload };
      delete invalidRequestPayload.body;
      const { server, headers } = await ServerTestHelper.useServerWithAuth();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: invalidRequestPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const invalidRequestPayload = { ...requestPayload, body: true };
      const { server, headers } = await ServerTestHelper.useServerWithAuth();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: invalidRequestPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads', () => {
    it('should response 200 and thread created', async () => {
      const {
        server, threadData, commentData, userData,
      } = await ServerTestHelper.useServerCreateComment();
      const { username } = userData;
      const { id: threadId, title } = threadData;
      const { id: commentId, content } = commentData;
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toStrictEqual(threadId);
      expect(responseJson.data.thread.title).toStrictEqual(title);
      expect(responseJson.data.thread.username).toStrictEqual(username);
      expect(responseJson.data.thread.comments[0].id).toStrictEqual(commentId);
      expect(responseJson.data.thread.comments[0].content).toStrictEqual(content);
    });

    it('should response 404 when thread not exist', async () => {
      const { server } = await ServerTestHelper.useServerCreateThread();

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-159',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak tersedia');
    });
  });
});
