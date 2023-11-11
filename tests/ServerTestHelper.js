/* istanbul ignore file */
// Implementation of Design Principles DRY for Testing
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const ServerTestHelper = {
  async useServer() {
    return createServer(container);
  },

  async useServerWithAuth(args) {
    // create user -> auth
    const userPayload = {
      username: args?.username || 'myUsername',
      password: args?.password || 'mySecret',
      fullname: args?.fullname || 'myFullName',
    };

    const server = await createServer(container);
    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });
    const userResponseJson = JSON.parse(userResponse.payload);
    const userData = userResponseJson.data.addedUser;

    const authPayload = {
      username: userPayload.username,
      password: userPayload.password,
    };
    const authResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: authPayload,
    });
    const authResponseJson = JSON.parse(authResponse.payload);
    const headers = { Authorization: `Bearer ${authResponseJson.data.accessToken}` };
    return { server, headers, userData };
  },

  async useServerCreateThread(args) {
    // create user -> auth -> thread
    const { threadData = {}, userData = {} } = args || {};
    const serverData = await this.useServerWithAuth(userData);
    const { server, headers } = serverData;
    const threadPayload = {
      title: threadData?.title || 'ini title',
      body: threadData?.body || 'ini body',
    };
    const thread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: threadPayload,
      headers,
    });
    const threadResponse = JSON.parse(thread.payload);
    const resThreadData = threadResponse.data.addedThread;
    return {
      ...serverData, threadData: resThreadData,
    };
  },

  async useServerCreateComment(args) {
    // create user -> auth -> thread -> comments
    const { threadData = {}, userData = {}, commentData = {} } = args || {};
    const serverData = await this.useServerCreateThread({
      threadData,
      userData,
    });
    const { server, headers, threadData: resThreadData } = serverData;
    const { id: threadId } = resThreadData;
    const commentPayload = {
      content: commentData?.content || 'ini content',
    };
    const comment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: commentPayload,
      headers,
    });

    const commentResponse = JSON.parse(comment.payload);
    const resCommentData = commentResponse.data.addedComment;
    return {
      ...serverData, commentData: resCommentData,
    };
  },

  async useServerCreateReply(args) {
    // create user -> auth -> thread -> comments -> reply
    const {
      threadData = {}, userData = {}, commentData = {}, replyData = {},
    } = args || {};
    const serverData = await this.useServerCreateComment({
      threadData,
      commentData,
      userData,
    });
    const {
      server, headers, threadData: resThreadData, commentData: resCommentData,
    } = serverData;
    const { id: threadId } = resThreadData;
    const { id: commentId } = resCommentData;
    const replyPayload = {
      content: replyData?.content || 'ini content',
    };
    const reply = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: replyPayload,
      headers,
    });

    const replyResponse = JSON.parse(reply.payload);
    const resReplyData = replyResponse.data.addedReply;
    return {
      ...serverData, replyData: resReplyData,
    };
  },
};

module.exports = ServerTestHelper;
