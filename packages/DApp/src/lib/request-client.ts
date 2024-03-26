import { RequestClient } from '@status-im/js'
import { LightNode } from '@waku/interfaces'

let client: RequestClient

export function getRequestClient(waku: LightNode): RequestClient {
  if (!client) {
    return new RequestClient(waku, { environment: process.env.ENV, ethProviderApiKey: process.env.INFURA_API_KEY! })
  }

  return client
}
