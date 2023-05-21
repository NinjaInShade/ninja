export type AcceptableSocketData = string | number | boolean | null | Date | { [property: string]: AcceptableSocketData } | AcceptableSocketData[];

type ObjectToEncode = {
    event: string;
    data?: AcceptableSocketData;
};

type DecodedObject = ObjectToEncode;

/**
 * Encodes and serializes data to be sent over the wire
 */
export function encode(toEncode: ObjectToEncode): string {
    const { event, data } = toEncode;

    try {
        const encodedString = JSON.stringify({ event, data });

        return encodedString;
    } catch (err) {
        throw new Error('Could not encode socket data');
    }
}

/**
 * Decodes an encoded string received over the wire
 *
 * @returns encoded object
 */
export function decode(toDecode: string): DecodedObject {
    let fromJSON: DecodedObject;

    try {
        fromJSON = JSON.parse(toDecode);
    } catch (err) {
        throw new Error('Could not decode socket data');
    }

    const event = fromJSON.event;
    const data = fromJSON.data;

    const decodedObject = { event, data };

    return decodedObject;
}
