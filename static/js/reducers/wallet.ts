import { WalletContextState } from "@solana/wallet-adapter-react"

enum WalletActions {
    LOAD_WALLET = 'LOAD_WALLET'
}

interface LoadWalletAction {
    type: WalletActions.LOAD_WALLET,
    payload: WalletContextState
}

type WalletAction = LoadWalletAction



export default (state: WalletContextState | null = null, action: WalletAction): WalletContextState | null => {
    switch (action.type) {
        case WalletActions.LOAD_WALLET: {
            return action.payload
        }
        default:
            return state
    }
}