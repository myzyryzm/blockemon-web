/** @format */

import bs58 from 'bs58'
import tweetnacl_1 from 'tweetnacl'

function baseDecode(value) {
    return Buffer.from(bs58.decode(value))
}

function uint8ToString(myUint8Arr) {
    return String.fromCharCode.apply(null, myUint8Arr)
}

export function verifyMessage(
    message: string,
    signedMessage: number[],
    publicKey: string
): boolean {
    const decodedPublic = baseDecode(publicKey)
    const signedMsgArray = new Uint8Array(signedMessage)
    const openedMessage = uint8ToString(
        tweetnacl_1.sign.open(signedMsgArray, decodedPublic)
    )
    console.log('other', tweetnacl_1.sign.open(signedMsgArray, decodedPublic))
    console.log('signedMsgArray', signedMsgArray)
    console.log('openedMessage', openedMessage)
    return message === openedMessage
}
