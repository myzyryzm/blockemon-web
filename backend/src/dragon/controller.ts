/** @format */
import HttpError from '../common/http-error'
import { verifyMessage } from '../common/utils'
import { config, contract } from '../common/near-contract'
import { IDragon, IDragonResponse } from './models'
import { getDragonPayload } from './utils'

// bodyBase (8) => ABC (ABC => scales; aBC => no scales; AbC => alt1; abC => alt2; ABc => alt3; aBc => alt4; Abc => alt5; abc => alt6)
// bodyUnder (8) => DEF (DEF => no belly; dEF => belly; DeF => alt1; deF => alt2; DEf => alt3; dEf => alt4; Def => alt5; def => alt6)
// markings (9) => GHIJ (G => no markings; gHIJ => spots1; ghIJ => spots2; gHiJ => spots3; ghiJ => alt1; gHIj => alt2; ghIj => alt3; gHij => alt4; ghij => alt5)
// horns (8) => KLM (KLM => Horn1; kLM => Horn2; KlM => Horn3; klM => Horn4; KLm => Horn5; kLm => Horn6; Klm => Horn7; klm => Horn8)
// hornStyle (8) => NOP (NOP => solid; nOP => striped; NoP => alt1; noP => alt2; NOp => alt3; nOp => alt4; Nop => alt5; nop => alt6)
// wingStyle (8) => QRS (QRS => 1 color; qRS => 2 color; QrS => alt1; qrS => alt2; QRs => alt3; qRs => alt4; Qrs => alt5; qrs => alt6)
// TUVWX => tbd (just use them as fillers for rn)

export async function getDragons(req, res, next) {
    const message = req.params.message
    const signedMessage = req.params.message
    const publicKey = req.params.publicKey
    const accountId = req.params.accountId
    if (!verifyMessage(message, signedMessage, publicKey)) {
        return next(new HttpError('Not signed', 403))
    }
    // @ts-ignore
    const dragons: IDragon[] = await contract.getDragonsForOwner(
        { owner: accountId },
        config.GAS
    )
    const dragonResponse: Array<IDragonResponse> = dragons.map((dragon) => {
        return getDragonPayload(dragon)
    })

    res.status(200).send({ dragons: dragonResponse })
}

export async function breedDragons(req, res, next) {
    const dragon1Id = req.params.dragon1Id
    const dragon2Id = req.params.dragon2Id
    const message = req.params.message
    const signedMessage = req.params.message
    const publicKey = req.params.publicKey
    const accountId = req.params.accountId
    if (!verifyMessage(message, signedMessage, publicKey)) {
        return next(new HttpError('Not signed', 403))
    }
    // @ts-ignore
    const newDragon: IDragon = await contract.breedDragons(
        { owner: accountId, dragon1Id, dragon2Id },
        config.GAS
    )

    res.status(200).send({ dragon: getDragonPayload(newDragon) })
}
