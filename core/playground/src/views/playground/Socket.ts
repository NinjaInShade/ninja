import core from '~/browser';

const client = core.getClient();

export async function checkHeartbeat() {
    const sent = new Date().getTime();
    client.emit('ping');

    return await new Promise<number>((resolve) => {
        const dispose = client.on('pong', () => {
            const received = new Date().getTime();
            const timeTaken = new Date(received - sent).getMilliseconds();
            dispose();
            return resolve(timeTaken);
        });
    });
}
