// import { describe, it, beforeEach, afterEach } from 'node:test';
// import assert from 'node:assert';
// import project from '~/index';

// describe('[server]', () => {
//     let server: project.Server;
//     let client: project.Client;

//     beforeEach(async () => {
//         server = await project.server();
//         client = project.client({
//             serverUrl: 'localhost:1337',
//         });
//     });

//     afterEach(async () => {
//         await server.dispose();
//         client.dispose();
//     });

//     it('should error if calling startServer() more than once', async () => {
//         await assert.rejects(
//             async () => {
//                 await server.startServer();
//             },
//             { message: 'HTTP server cannot be started more than once' }
//         );
//     });

//     it('should ...', async () => {
//         await client.connect();
//     });
// });
