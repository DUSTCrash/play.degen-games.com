import { WalletContextState } from '@solana/wallet-adapter-react'
import { combineReducers, createStore } from 'redux'
import User from './interfaces/User'
import userReducer from './reducers/user'
import gamesReducer from './reducers/games'
import associatedKeypairReducer from './reducers/associatedKeypair'
import walletReducer from './reducers/wallet'
import socketsReducer, { Sockets } from './reducers/sockets'
import lotteryReducer, { IInitialState } from './reducers/lottery'
import CoinflipReducer, { ICoinflipInitialState } from './reducers/coinflip'
import Game from './interfaces/Game'
import Lottery from './interfaces/Lottery'
import { Keypair } from '@solana/web3.js'

const combined = combineReducers({
    user: userReducer,
    wallet: walletReducer,
    associatedKeypair: associatedKeypairReducer,
    games: gamesReducer,
    sockets: socketsReducer,
    lottery: lotteryReducer,
    coinflip: CoinflipReducer
})

export interface CombinedReducer {
    user: User,
    wallet: WalletContextState,
    games: Game[],
    associatedKeypair: Keypair,
    sockets: Sockets,
    lottery: IInitialState,
    coinflip: ICoinflipInitialState
}

export default createStore(combined)