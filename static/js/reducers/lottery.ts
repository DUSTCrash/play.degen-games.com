import Lottery from "../interfaces/Lottery"
import LotteryGame from "../interfaces/LotteryGame"


enum LotteryActionTypes {
    SET_FINISHED_ROUNDS = 'SET_FINISHED_ROUNDS',
    SET_LAST_ROUND = 'SET_LAST_ROUND',
    SET_USER_LOTTERY_INFO = 'SET_USER_LOTTERY_INFO',
    BOUGHT_TICKETS = 'BOUGHT_TICKETS',
    CLOSED_LOTTERY = 'CLOSED_LOTTERY'
}

export interface IInitialState {
    finishedRounds: Lottery[],
    lastRound: Lottery,
    userLotteryInfo: LotteryGame
}

export interface IBoughtTicket {
    price: number,
    boughtTickets: number[][]
}

interface GetFinishedRoundsAction {
    type: LotteryActionTypes.SET_FINISHED_ROUNDS,
    payload: Lottery[]
}

interface GetLastRound {
    type: LotteryActionTypes.SET_LAST_ROUND,
    payload: Lottery
}

interface GetUserLotteryInfo {
    type: LotteryActionTypes.SET_USER_LOTTERY_INFO,
    payload: LotteryGame
}

interface BoughtTickets {
    type: LotteryActionTypes.BOUGHT_TICKETS,
    payload: IBoughtTicket
}

interface ClosedLottery {
    type: LotteryActionTypes.CLOSED_LOTTERY,
    payload: Lottery
}

type LotteryAction = GetFinishedRoundsAction | GetLastRound | GetUserLotteryInfo | BoughtTickets | ClosedLottery;

const initialState: IInitialState = {
    finishedRounds: [],
    lastRound: {},
    userLotteryInfo: {
        buyer: {
            _id: '',
            publicKey: '',
            isAdmin: false,
            associatedKeypair: '',
            balance: 0,
            lastMessageAt: 0
        },
        lottery: {},
        boughtAmount: 0,
        boughtTickets: [],
        totalPrice: 0,
        matchingCountPerBracket: [],
        matchingTicketIdsPerBracket: [],
        matchingNumberIndexArray: []
    }
}

export default (state = initialState, action: LotteryAction): IInitialState => {

    switch (action.type) {
        case LotteryActionTypes.SET_FINISHED_ROUNDS: {
            return { ...state, finishedRounds: action.payload }
        }

        case LotteryActionTypes.SET_LAST_ROUND: {
            return { ...state, lastRound: action.payload }
        }

        case LotteryActionTypes.SET_USER_LOTTERY_INFO: {
            return { ...state, userLotteryInfo: action.payload }
        }

        case LotteryActionTypes.BOUGHT_TICKETS: {
            return {
                ...state,
                lastRound: {
                    ...state.lastRound,
                    amountCollectedInGame: (state.lastRound.amountCollectedInGame || 0) + action.payload.price
                },
                userLotteryInfo: {
                    ...state.userLotteryInfo,
                    boughtTickets: action.payload.boughtTickets
                }
            }
        }

        case LotteryActionTypes.CLOSED_LOTTERY: {
            return {
                ...state,
                finishedRounds: [...state.finishedRounds, action.payload],
                lastRound: {},
                userLotteryInfo: { ...state.userLotteryInfo, boughtTickets: [] }
            }
        }
        default:
            return state
    }
}