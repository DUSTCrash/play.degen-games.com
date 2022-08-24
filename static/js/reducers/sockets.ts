import { Socket } from "socket.io-client"

enum SocketActionTypes {
    LOAD_GAME_SOCKET = 'LOAD_GAME_SOCKET',
    LOAD_USER_SOCKET = 'LOAD_USER_SOCKET',
    LOAD_LOTTERY_SOCKET = 'LOAD_LOTTERY_SOCKET',
    LOAD_COINFLIP_SOCKET = 'LOAD_COINFLIP_SOCKET',
    LOAD_MESSAGE_SOCKET = 'LOAD_MESSAGE_SOCKET',
}

interface LoadGameSocketAction {
    type: SocketActionTypes.LOAD_GAME_SOCKET,
    payload: Socket
}

interface LoadUserSocketAction {
    type: SocketActionTypes.LOAD_USER_SOCKET,
    payload: Socket
}

interface LoadLotterySocketAction {
    type: SocketActionTypes.LOAD_LOTTERY_SOCKET,
    payload: Socket
}

interface LoadCoinflipSocketAction {
    type: SocketActionTypes.LOAD_COINFLIP_SOCKET,
    payload: Socket
}

interface LoadMessageSocketAction {
    type: SocketActionTypes.LOAD_MESSAGE_SOCKET,
    payload: Socket
}

type SocketsAction = LoadGameSocketAction | LoadUserSocketAction | LoadMessageSocketAction | LoadLotterySocketAction | LoadCoinflipSocketAction;
export type Sockets = { 'user'?: Socket, 'game'?: Socket, 'message'?: Socket, 'lottery'?: Socket, 'coinflip'?: Socket }

const defaultSockets = { 'user': undefined, 'game': undefined, 'message': undefined, 'lottery': undefined, 'coinflip': undefined }

export default (state: Sockets = defaultSockets, action: SocketsAction): Sockets => {
    switch (action.type) {
        case SocketActionTypes.LOAD_GAME_SOCKET: {
            return { ...state, 'game': action.payload }
        }
        case SocketActionTypes.LOAD_USER_SOCKET: {
            return { ...state, 'user': action.payload }
        }
        case SocketActionTypes.LOAD_LOTTERY_SOCKET: {
            return { ...state, 'lottery': action.payload }
        }
        case SocketActionTypes.LOAD_COINFLIP_SOCKET: {
            return { ...state, 'coinflip': action.payload }
        }
        case SocketActionTypes.LOAD_MESSAGE_SOCKET: {
            return { ...state, 'message': action.payload }
        }
        default:
            return state
    }
}