declare module 'protons' {
    export type WakuVote = {
        address: string
        vote: string
        sntAmount: Uint8Array
        sign: string
        timestamp: number
        roomID: number
    }

    export type WakuFeature = {
        voter: string
        sntAmount: Uint8Array
        publicKey: string
        timestamp: Date
        sign: string
    }

    function protons(init: string): {
        WakuVote: {
            encode: (wakuVote: WakuVote) => Uint8Array,
            decode: (payload: Uint8Array) => WakuVote
        },
        WakuFeature: {
            encode: (wakuFeature: WakuFeature) => Uint8Array,
            decode: (payload: Uint8Array) => WakuFeature
        }
    }
    export = protons
}
