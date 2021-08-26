import { utils } from 'ethers'

export const packAndArrayify = (types: string[], msg: any[]) => {
  return utils.arrayify(utils.solidityPack(types, msg))
}

export function recoverAddress(types: string[], msg: any[], signature: string) {
  return utils.verifyMessage(packAndArrayify(types, msg), signature)
}
