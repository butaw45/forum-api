const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  const requestPostPayload = {
    content: 'ini content',
  };

  describe('when POST /comments', () => {
    it('should response 201 and comment created', async () => {
      const {
        server, headers, userData, threadData,
      } = await ServerTestHelper.useServerCreateThread();
      const { id: userId } = userData;
      const { id: threadId } = threadData;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPostPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toStrictEqual(requestPostPayload.content);
      expect(responseJson.data.addedComment.owner).toStrictEqual(userId);
    });

    it('should response 401 when have not login', async () => {
      const server = await ServerTestHelper.useServer();
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-159/comments',
        payload: requestPostPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const invalidRequestPayload = {};
      const {
        server, headers, threadData,
      } = await ServerTestHelper.useServerCreateThread();
      const { id: threadId } = threadData;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: invalidRequestPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const invalidRequestPayload = { content: true };
      const {
        server, headers, threadData,
      } = await ServerTestHelper.useServerCreateThread();
      const { id: threadId } = threadData;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: invalidRequestPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread not exist', async () => {
      const { server, headers } = await ServerTestHelper.useServerWithAuth();

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPostPayload,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak tersedia');
    });
  });

  describe('when DELETE /comments', () => {
    it('should response 201 and comment deleted', async () => {
      const {
        server, headers, threadData, commentData,
      } = await ServerTestHelper.useServerCreateComment();
      const { id: threadId } = threadData;
      const { id: commentId } = commentData;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when have not login', async () => {
      const server = await ServerTestHelper.useServer();
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-159/comments/comment-159',
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread id is invalid', async () => {
      const { server, headers } = await ServerTestHelper.useServerWithAuth();

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-159/comments/comment-123',
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak tersedia');
    });

    it('should response 404 when comment id is invalid', async () => {
      const {
        server, headers, threadData,
      } = await ServerTestHelper.useServerCreateComment();
      const { id: threadId } = threadData;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak tersedia');
    });

    it('should response 403 when delete others comment id', async () => {
      // Comment created by other user
      const { threadData, commentData } = await ServerTestHelper.useServerCreateComment();
      const { id: threadId } = threadData;
      const { id: commentId } = commentData;

      // current user
      const { server, headers } = await ServerTestHelper.useServerWithAuth({
        username: 'jono',
        password: 'jonoSecret',
        fullname: 'jonoaja',
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak memiliki akses ke komentar ini');
    });
  });
});
