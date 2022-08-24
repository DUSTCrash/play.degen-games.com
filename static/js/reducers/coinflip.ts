import { CoinflipStatus } from "../components/CoinFlipGame"
import Coinflip from "../interfaces/Coinflip"
import CoinflipGame from "../interfaces/CoinflipGame"


enum CoinflipActionTypes {
    SET_RECENT_ROUNDS = 'SET_RECENT_ROUNDS',
    SET_CURRENT_ROUND = 'SET_CURRENT_ROUND',
    SET_CURRENT_USERS_INFO = 'SET_CURRENT_USERS_INFO',
    UPDATE_CURRENT_USERS_INFO = 'UPDATE_CURRENT_USERS_INFO',
    UPDATE_CURRENT_ROUND = 'UPDATE_CURRENT_ROUND',
    UPDATE_RECENT_ROUNDS = 'UPDATE_RECENT_ROUNDS'
}

export interface ICoinflipInitialState {
    recentRounds: Coinflip[],
    currentRound: Coinflip,
    usersGameInfo: CoinflipGame[]
}

interface SetRecentRoundsAction {
    type: CoinflipActionTypes.SET_RECENT_ROUNDS,
    payload: Coinflip[]
}

interface SetCurrentRoundAction {
    type: CoinflipActionTypes.SET_CURRENT_ROUND,
    payload: Coinflip
}

interface SetCurrentUsersInfoAction {
    type: CoinflipActionTypes.SET_CURRENT_USERS_INFO,
    payload: CoinflipGame[]
}

interface UpdateCurrentUsersInfoAction {
    type: CoinflipActionTypes.UPDATE_CURRENT_USERS_INFO,
    payload: CoinflipGame
}

interface UpdateCurrentRound {
    type: CoinflipActionTypes.UPDATE_CURRENT_ROUND,
    payload: Coinflip
}

interface UpdateRecentRounds {
    type: CoinflipActionTypes.UPDATE_RECENT_ROUNDS,
    payload: Coinflip
}

type CoinflipAction = SetRecentRoundsAction | SetCurrentRoundAction | SetCurrentUsersInfoAction | UpdateCurrentUsersInfoAction | UpdateCurrentRound | UpdateRecentRounds;

const initialState: ICoinflipInitialState = {
    recentRounds: [],
    currentRound: {},
    usersGameInfo: []
}

export default (state = initialState, action: CoinflipAction): ICoinflipInitialState => {

    switch (action.type) {
        case CoinflipActionTypes.SET_RECENT_ROUNDS: {
            return { ...state, recentRounds: action.payload }
        }

        case CoinflipActionTypes.SET_CURRENT_ROUND: {
            return { ...state, currentRound: action.payload }
        }

        case CoinflipActionTypes.SET_CURRENT_USERS_INFO: {
            return { ...state, usersGameInfo: action.payload }
        }

        case CoinflipActionTypes.UPDATE_CURRENT_USERS_INFO: {
            return {
                ...state,
                usersGameInfo: [...state.usersGameInfo, action.payload]
            }
        }

        case CoinflipActionTypes.UPDATE_CURRENT_ROUND: {
            return {
                ...state,
                currentRound: action.payload
            }
        }

        case CoinflipActionTypes.UPDATE_RECENT_ROUNDS: {
            return {
                ...state,
                recentRounds: [...state.recentRounds.slice(1), action.payload]
            }
        }
        default:
            return state
    }
}