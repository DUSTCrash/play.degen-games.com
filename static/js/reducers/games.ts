import Game from "../interfaces/Game"


enum GamesActions {
    LOAD_GAMES = 'LOAD_GAMES',
    ADD_GAME = 'ADD_GAME',
    UPDATE_GAME = 'UPDATE_GAME'
}

interface LoadGamesAction {
    type: GamesActions.LOAD_GAMES,
    payload: Game[]
}

interface AddGameAction {
    type: GamesActions.ADD_GAME,
    payload: Game
}

interface UpdateGameAction {
    type: GamesActions.UPDATE_GAME,
    payload: Game
}


type GameAction = LoadGamesAction | AddGameAction | UpdateGameAction

export default (state: Game[] = [], action: GameAction): Game[] | Game => {

    switch (action.type) {
        case GamesActions.LOAD_GAMES: {
            return action.payload
        }
        case GamesActions.ADD_GAME: {
            if (state.find(game => game._id === action.payload._id)) return state

            return [...state, action.payload]
        }
        case GamesActions.UPDATE_GAME: {
            return state.map(game => {
                if (game._id === action.payload._id) {
                    if (action.payload.status === 'ended') {
                        action.payload.status = 'countdown'
                        action.payload.countDownEnd = Date.now() + 3000
                    }
                    return action.payload
                }
                return game
            })
        }
        default:
            return state
    }
}