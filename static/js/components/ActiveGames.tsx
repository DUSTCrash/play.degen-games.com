import React, { useEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import "../css/ActiveGames.scss";
import "../css/Coin.css";
import "../css/Modal.css";
import User from "../interfaces/User";
import { CombinedReducer } from "../store";
import Game from "../interfaces/Game";
import { toast } from "react-toastify";
import { Sockets } from "../reducers/sockets";
import GameBox from "./GameBox";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ClipLoader from "react-spinners/ClipLoader";

import Svg from "react-inlinesvg";
import ReactGA from "react-ga";

const activeStatuses = ["active", "countdown", "flipping"];

const amountOptions = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5];

function ActiveGames() {
  const wallet = useWallet();
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [openGames, setOpenGames] = useState<Game[]>([]);
  const [createGameModalOpen, setCreateGameModalOpen] = useState(false);
  const [creatingGame, setCreatingGame] = useState(false);
  const [gameAmount, setGameAmount] = useState<number | null>(0.05);
  const [move, setMove] = useState(0);

  // set innerWidth and innerHeight dynamically
  const [screenSize, getDimension] = useState({
    dynamicWidth: window.innerWidth,
    dynamicHeight: window.innerHeight
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const setDimension = () => {
    setIsMobile(window.innerWidth <= 768);
    getDimension({
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight
    });
  }

  const dispatch = useDispatch();

  const user = useSelector<CombinedReducer, User>((state) => state.user);
  const games = useSelector<CombinedReducer, Game[]>((state) => state.games);
  const sockets = useSelector<CombinedReducer, Sockets>(
    (state) => state.sockets
  );

  const createGame = async () => {
    if (!(wallet && wallet.publicKey && gameAmount && !creatingGame)) return;
    setCreatingGame(true);

    if (user.balance < gameAmount)
      return toast.error("Balance needs to be higher than the game bet");

    try {
      await axios.post("/api/game", {
        amount: gameAmount * LAMPORTS_PER_SOL,
        creatorMove: move,
      });

      // google analytics event
      ReactGA.event({
        category: "RPS",
        action: "CREATE_GAME",
        label: "DEGEN_GAME"
      });

      toast.success("Game created");
      setCreateGameModalOpen(false);
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
    }

    setCreatingGame(false);
  };

  const gameUpdate = (game: Game) => {
    dispatch({ type: "UPDATE_GAME", payload: game });
  };

  const removeGame = (game: Game) => {
    game.status = "ended";
    dispatch({ type: "UPDATE_GAME", payload: game });
  };

  // get screeen size whenever resize window
  useEffect(() => {
    window.addEventListener('resize', setDimension);

    return (() => {
      window.removeEventListener('resize', setDimension);
    })
  }, [screenSize]);

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);

    const getGamesData = async () => {
      const activeGames = await axios.get("/api/game/allActive");

      dispatch({ type: "LOAD_GAMES", payload: activeGames.data });
    };

    getGamesData();
  }, []);

  useEffect(() => {
    if (!sockets.game) return;

    sockets.game.on("newGame", (game: Game) =>
      dispatch({ type: "ADD_GAME", payload: game })
    );
    sockets.game.on("gameUpdate", (updatedGame: Game) =>
      gameUpdate(updatedGame)
    );
  }, [sockets.game]);

  useEffect(() => {
    let userGames: Game[] = [];
    let openGames: Game[] = [];
    games.forEach((game) => {
      if (game.gameType === "rps" && game.status !== "removed" && game.status !== "cancelled") {
        if (game.creator._id === user?._id) userGames.push(game);
        else if (game.opponent && game.opponent._id === user?._id)
          userGames.push(game);
        else openGames.push(game);
      }
    });

    //userGames = userGames.sort(game => -game.amount)
    userGames = userGames.sort(gameSort);
    //openGames = openGames.sort(game => -game.amount)
    openGames = openGames.sort(gameSort);
    setUserGames(userGames);
    setOpenGames(openGames);

    function gameSort(a: Game, b: Game) {
      if (b.amount === a.amount) {
        return b.createdAt < a.createdAt ? 1 : -1;
      }
      return b.amount - a.amount;
    }

  }, [user, games]);

  return (
    <div className="Page ActiveGames">
      <div className="typeWrapper">
        <div className="type">
          <h2 className="typeHeader">My Games</h2>
          <h2 className="gamesCounter">{userGames.length}</h2>
        </div>
        {user ? (
          <button
            className="createGameB"
            onClick={() => setCreateGameModalOpen(true)}
          >
            NEW GAME +
          </button>
        ) : null}
      </div>
      {userGames.length > 0 ? (
        <div className={`box games ${isMobile && 'mobile-game-box'}`}>
          {userGames.map((game) => {
            return activeStatuses.includes(game.status) ? (
              <div key={game._id}>
                <GameBox game={game} removeGame={removeGame} />
              </div>
            ) : null;
          })}
        </div>
      ) : (
        <div className="box typePlaceHolder">
          <p>Your games will appear here</p>
        </div>
      )}
      {
        isMobile && (
          <div className="mobile-divider"></div>
        )
      }
      <div className="type">
        <h2 className="typeHeader">Open Games</h2>
        <h2 className="gamesCounter">{openGames.length}</h2>
      </div>
      {openGames.length > 0 ? (
        <div className={`box games ${isMobile && 'mobile-game-box'}`}>
          {openGames.map((game) => {
            return activeStatuses.includes(game.status) ? (
              <div key={game._id}>
                <GameBox game={game} removeGame={removeGame} />
              </div>
            ) : null;
          })}
        </div>
      ) : (
        <div className="box typePlaceHolder">
          <p>No open games at the moment</p>
        </div>
      )}
      <div className="modal" style={{ display: createGameModalOpen ? "flex" : "none" }}>
        <div className="container">
          <div className={`wrapper ${isMobile && 'mobile-wrapper'}`}>
            <button
              className="closeB"
              onClick={() => setCreateGameModalOpen(false)}
            >
              <svg width="14" height="14">
                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
              </svg>
            </button>
            <h1 className="title">Create Game</h1>
            <h3 className="subtitle">Choose Move</h3>
            <div className="coinChooser">
              <Svg
                onClick={() => setMove(0)}
                className={move === 0 ? "chosen flip" : "flip"}
                src="./img/move0.svg"
              />
              <Svg
                onClick={() => setMove(1)}
                className={move === 1 ? "chosen flip" : "flip"}
                src="./img/move1.svg"
              />
              <Svg
                onClick={() => setMove(2)}
                className={move === 2 ? "chosen flip" : "flip"}
                src="./img/move2.svg"
              />
            </div>
            <h3 className="subtitle">Choose Amount</h3>
            <div className="amounts">
              {amountOptions.map((amount) => (
                <div
                  className={gameAmount === amount ? "amountChosen" : "amount"}
                  onClick={() => setGameAmount(amount)}
                  key={amount}
                >
                  {amount}
                </div>
              ))}
            </div>
            <button
              className="actionB modalB"
              disabled={creatingGame}
              onClick={() => createGame()}
            >
              {creatingGame ? "Creating..." : "Create"}{" "}
              {creatingGame ? <ClipLoader size={13} color="#27244f" /> : null}
            </button>
          </div>
        </div>
        <div className="overlay"></div>
      </div>
    </div>
  );
}

export default ActiveGames;
