import { Keypair } from "@solana/web3.js"


enum AssociatedKeypairActions {
    LOAD_ASSOCIATED_KEYPAIR = 'LOAD_ASSOCIATED_KEYPAIR'
}

interface LoadAssociatedKeypairAction {
    type: AssociatedKeypairActions.LOAD_ASSOCIATED_KEYPAIR,
    payload: Keypair
}


type AssociatedKeypairAction = LoadAssociatedKeypairAction

export default (state: Keypair | null = null, action: AssociatedKeypairAction): Keypair | null => {

    switch (action.type) {
        case AssociatedKeypairActions.LOAD_ASSOCIATED_KEYPAIR: {
            return action.payload
        }
        default:
            return state
    }
}