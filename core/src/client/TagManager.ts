import { type Client, type Observable, observable } from '~/browser';

type Disposer = () => void;
type TagValue = any;

export class ClientTag {
    private name: string;

    public subscribed = false;
    public value: TagValue;

    constructor(name: string) {
        this.name = name;
    }
}

export class TagManager {
    private tagsByName: Map<string, Observable<ClientTag>> = new Map();

    constructor(private client: Client) {
        // client.on('tag:data', (tagName: string, value: TagValue) => {});
    }

    public getTag(name: string): Observable<ClientTag> {
        const existing = this.tagsByName.get(name);
        if (existing) {
            return existing;
        }

        const tag = new ClientTag(name);
        const tagObs = observable(tag);
        this.tagsByName.set(name, tagObs);
        // tagObs.on('listenerCount', (count: number) => {
        //     if (count && !tag.subscribed) {
        //         this.subscribeTag(name);
        //     } else if (!count && tag.subscribed) {
        //         this.unsubscribeTag(name);
        //     }
        // })
        return tagObs;
    }

    private subscribeTag(name: string): Disposer {
        const tag = this.tagsByName.get(name);
        if (!tag) {
            throw new Error(`Failed to subscribe to tag '${name}' - it does not exist in memory`);
        }
        const tagObs = tag();
        if (tagObs.subscribed) {
            throw new Error(`Tag '${name}' is already subscribed`);
        }
        this.client.emit('tag:subscribe', name);
        tagObs.subscribed = true;
        return () => {
            this.unsubscribeTag(name);
        };
    }

    private unsubscribeTag(name: string) {
        const tag = this.tagsByName.get(name);
        if (!tag) {
            throw new Error(`Failed to unsubscribe to tag '${name}' - it does not exist in memory`);
        }
        const tagObs = tag();
        if (!tagObs.subscribed) {
            throw new Error(`Tag '${name}' is not subscribed so cannot unsubscribe it`);
        }
        this.client.emit('tag:unsubscribe', name);
        tagObs.subscribed = false;
    }

    public dispose() {
        for (const [tagName] of this.tagsByName.entries()) {
            this.unsubscribeTag(tagName);
        }
    }
}
