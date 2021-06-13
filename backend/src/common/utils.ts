/** @format */

import bs58 from 'bs58'
import tweetnacl_1 from 'tweetnacl'

function baseDecode(value) {
    return Buffer.from(bs58.decode(value))
}

function string2ArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
    var bufView = new Uint8Array(buf)
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i)
    }
    return buf
}

function uint8ToString(myUint8Arr) {
    return String.fromCharCode.apply(null, myUint8Arr)
}

export function verifyMessage(
    message: string,
    signedMessage: string,
    publicKey: string
): boolean {
    const decodedPublic = baseDecode(publicKey)
    const signedMsgArray = new Uint8Array(string2ArrayBuffer(signedMessage))
    const openedMessage = uint8ToString(
        tweetnacl_1.sign.open(signedMsgArray, decodedPublic)
    )
    return message === openedMessage
}
