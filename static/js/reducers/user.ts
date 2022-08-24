import User from '../interfaces/User'

enum UserActions {
    LOAD_USER = 'LOAD_USER',
    UPDATE_USER_BALANCE = 'UPDATE_USER_BALANCE',
    UPDATE_USER_LAST_MESSAGE_AT = 'UPDATE_USER_LAST_MESSAGE_AT'
}

interface LoadUserAction {
    type: UserActions.LOAD_USER,
    payload: User
}

interface UpdateBalanceAction {
    type: UserActions.UPDATE_USER_BALANCE,
    payload: number
}

interface UpdateUserLastMessageAt {
    type: UserActions.UPDATE_USER_LAST_MESSAGE_AT,
    payload: number
}


type UserAction = LoadUserAction | UpdateBalanceAction | UpdateUserLastMessageAt

export default (state: User | null = null, action: UserAction): User | null => {

    switch (action.type) {
        case UserActions.LOAD_USER: {
            return action.payload
        }
        case UserActions.UPDATE_USER_BALANCE: {
            return state && { ...state, balance: state.balance + action.payload }
        }
        case UserActions.UPDATE_USER_LAST_MESSAGE_AT: {
            return state && { ...state, lastMessageAt: Date.now() }
        }
        default:
            return state
    }
}