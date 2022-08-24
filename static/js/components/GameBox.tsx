import React, { useEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import Confetti from "react-confetti";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Countdown from "react-countdown";
import Svg from "react-inlinesvg";

import useSound from "use-sound";
import "../css/ActiveGames.scss";
import "../css/Coin.css";
import "../css/Modal.css";
import User from "../interfaces/User";
import { CombinedReducer } from "../store";
import Game from "../interfaces/Game";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { displayName } from "../utils/displayName";
import ReactGA from "react-ga";

import "animate.css";

interface Props {
  game: Game;
  removeGame: (game: Game) => void;
}

function GameBox(props: Props) {
  const [game, setGame] = useState<Game>();
  const [move, setMove] = useState(0);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const wallet = useWallet();
  const dispatch = useDispatch();
  const user = useSelector<CombinedReducer, User>((state) => state.user);
  const [playJoin] = useSound("/sound/join.mp3", { volume: 0.25 });
  const [playWin] = useSound("/sound/win.mp3", { volume: 0.25 });
  const [playLoss] = useSound("/sound/loss.mp3", { volume: 0.25 });
  const [playCountDown] = useSound("/sound/countdown.mp3", { volume: 0.25 });
  const [showConfetti, setshowConfetti] = useState(false);

  useEffect(() => {
    setGame(props.game);
  }, [props.game]);

  useEffect(() => {
    if (!game) return;

    applySound(game);
  }, [game]);

  const applySound = (game: Game) => {
    if (
      !(user?._id && [game.creator._id, game.opponent?._id].includes(user._id))
    )
      return;

    console.log(game.status)

    if (game.status === "ended") {
      playJoin();
    } else if (game.status === "revealed") {
      if (!game.winner) return;

      if (game.winner?._id === user._id) {
        playWin();
        setshowConfetti(true);
      } else {
        playLoss();
      }
    } else if (game.status === "countdown") {
      playCountDown();
    }
  };

  const changeGameStatus = (status: string) => {
    if (!game) return;
    if (game.status === status) return;

    setGame({ ...game, status });

    if (status === "revealed") {
      if (user !== null) {
        if (game.winner && game.winner?._id === user._id) {
          dispatch({ type: "UPDATE_USER_BALANCE", payload: game.amount * 2 });
        } else if (
          !game.winner &&
          [game.creator._id, game.opponent?._id].includes(user._id)
        ) {
          dispatch({
            type: "UPDATE_USER_BALANCE",
            payload: game.amount * (1 + game.fee / 100),
          });
        }
      }

      setTimeout(() => {
        game.status = "removed";
        dispatch({ type: "UPDATE_GAME", payload: game });
        setshowConfetti(false);
      }, 4500);
    }
  };

  const joinGame = async () => {
    if (!(wallet && wallet.publicKey && game)) return;

    if (user._id === game.creator._id)
      return toast.error("You can not join your game");
    if (user.balance < game.amount)
      return toast.error("Balance needs to be higher than the game bet");

    try {
      await axios.post("/api/game/join", {
        gameId: game._id,
        move,
      });

      // google analytics event
      ReactGA.event({
        category: "DICE",
        action: "JOIN_GAME",
        label: "DEGEN_GAME"
      });

      toast.success("Joined the game");

      setJoinModalOpen(false);
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
    }
  };

  const cancelGame = async () => {
    if (!(wallet && wallet.publicKey && game)) return;

    if (game.creator._id !== user._id)
      return toast.error("You can not cancel another person`s game");

    try {
      await axios.post("/api/game/cancel", {
        gameId: game._id,
      });

      // google analytics event
      ReactGA.event({
        category: "DICE",
        action: "CANCEL_GAME",
        label: "DEGEN_GAME"
      });

      toast.success("Game has been cancelled");
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
    }
  };

  return (
    <>
      {game && game.status !== "removed" ? (
        <div className="gameWrapper">
          {showConfetti === true ? (
            <Confetti width={800} height={1200} />
          ) : (
            <div></div>
          )}
          <div className="players">
            <div className="playerWrapper">
              {game.status === "revealed" ? (
                <div
                  className={
                    game.winner?._id == game.creator._id
                      ? "player winner"
                      : "player loser"
                  }
                >
                  <Svg
                    className="move flip"
                    src={`./img/move${game.creatorMove}.svg`}
                  />
                  <Link to={`/u/${game.creator.publicKey}`} className="address">
                    {displayName(game.creator)}
                  </Link>
                </div>
              ) : game.status === "flipping" ? (
                <div className="player">
                  <div className="flip">
                    <Svg
                      onAnimationEndCapture={() => changeGameStatus("revealed")}
                      className="move animate__animated animate__bounce"
                      src="./img/move0.svg"
                    />
                  </div>
                  <Link to={`/u/${game.creator.publicKey}`} className="address">
                    {displayName(game.creator)}
                  </Link>
                </div>
              ) : (
                <div className="player">
                  <Svg className="move flip" src="./img/move0.svg" />
                  <Link to={`/u/${game.creator.publicKey}`} className="address">
                    {displayName(game.creator)}
                  </Link>
                </div>
              )}
            </div>
            <div className="middle">
              {game.status === "countdown" ? (
                <Countdown
                  date={game.countDownEnd}
                  onComplete={() => changeGameStatus("flipping")}
                  renderer={(time) => <h3>{time.seconds}</h3>}
                />
              ) : (
                <h3 className="vsTag">VS</h3>
              )}
            </div>
            <div className="playerWrapper">
              {!game.opponent ? (
                !user || game.creator._id === user._id ? (
                  <div className="player">
                    <Svg
                      className="movePlaceholder"
                      src="/img/movePlaceholder.svg"
                    />
                    <h3 className="address">waiting...</h3>
                  </div>
                ) : (
                  <div className="player join">
                    <button
                      onClick={() => setJoinModalOpen(true)}
                      className="actionB"
                    >
                      Join
                    </button>{" "}
                  </div>
                )
              ) : game.status === "revealed" ? (
                <div
                  className={
                    game.winner?._id == game.opponent._id
                      ? "player winner"
                      : "player loser"
                  }
                >
                  <Svg
                    className="move"
                    src={`./img/move${game.opponentMove}.svg`}
                  />
                  <Link
                    to={`/u/${game.opponent.publicKey}`}
                    className="address"
                  >
                    {displayName(game.opponent)}
                  </Link>
                </div>
              ) : game.status === "flipping" ? (
                <div className="player">
                  <Svg
                    className="move animate__animated animate__bounce"
                    src="./img/move0.svg"
                  />
                  <Link
                    to={`/u/${game.opponent.publicKey}`}
                    className="address"
                  >
                    {displayName(game.opponent)}
                  </Link>
                </div>
              ) : (
                <div className="player">
                  <Svg className="move" src="./img/move0.svg" />
                  <Link
                    to={`/u/${game.opponent.publicKey}`}
                    className="address"
                  >
                    {displayName(game.opponent)}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="info">
            <div className="bet">
              <h3>{game.amount / LAMPORTS_PER_SOL} SOL</h3>
            </div>

            {!game.opponent && user ? (
              game.creator._id === user._id ? (
                <button className="deleteB" onClick={() => cancelGame()}>
                  <Svg src="/img/bin.svg" />
                </button>
              ) : null
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : null}
      <div
        className="modal"
        style={{ display: joinModalOpen ? "flex" : "none" }}
      >
        <div className="container">
          <div className="wrapper">
            <button className="closeB" onClick={() => setJoinModalOpen(false)}>
              <svg width="14" height="14">
                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
              </svg>
            </button>
            <h1 className="title">Join Game</h1>
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

            <button className="actionB modalB" onClick={() => joinGame()}>
              Join
            </button>
          </div>
        </div>
        <div className="overlay"></div>
      </div>
    </>
  );
}

export default GameBox;
