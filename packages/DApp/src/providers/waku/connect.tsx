import { Waku, getStatusFleetNodes } from 'js-waku'

export async function connectWaku(setWaku: (waku: Waku) => void) {
  const newWaku = await Waku.create()
  const nodes = await getStatusFleetNodes()

  await Promise.all(
    nodes.map((addr) => {
      return newWaku.dial(addr)
    })
  )

  setWaku(newWaku)
}
