import React, { useState } from "react";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { shortenAddress } from "../utils/shortenAddress";
import Svg from "react-inlinesvg";

import "../css/ActiveGames.scss";
import "../css/Coin.css";
import "../css/Modal.css";
import Game from "../interfaces/Game";
import { Link } from "react-router-dom";
import moment from "moment";
import "../css/RecentGames.css";
import { displayName } from "../utils/displayName";
import { useSelector } from "react-redux";
import { CombinedReducer } from "../store";
import axios from "axios";
import { useEffect } from "react";
import games from "../reducers/games";

interface Props {
  games: Game[];
}

const validStatuses = ["removed", "revealed"];

function RecentGamesRPS() {
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const games = useSelector<CombinedReducer, Game[]>((state) => state.games);
  const loadRecentGames = async () => {
    const recentGames = (await axios.get("/api/game/recentGames")).data;
    setRecentGames(recentGames);
  };

  useEffect(() => {
    loadRecentGames();
  }, []);

  return (
    <div className="recentGamesWrapper box">
      <h2 className="recentGamesHeader">Recent Plays</h2>
      <div className="recentGames">
        {games
          .map((game) => {
            if (
              !validStatuses.includes(game.status) ||
              !game.opponent ||
              game.gameType != "rps"
            )
              return;
            return renderLine(game);
          })
          .reverse()}
        {recentGames.map((game) => {
          return renderLine(game);
        })}
      </div>
    </div>
  );

  function renderLine(game: Game) {
    if (!game.opponent) return;
    if (game.winner) {
      const loser =
        game.creator._id === game.winner._id ? game.opponent : game.creator;
      return (
        <div key={game._id} className="recentGame">
          <Link className="profileLink" to={`/u/${game.winner.publicKey}`}>
            {displayName(game.winner)}
          </Link>{" "}
          {/* 1.1. Added a class called block around "win" and "draw" to give it the style of "display:block" and changed "against" to "vs"*/}
          <span className="block">
            <span className="win">won</span> {game.amount / LAMPORTS_PER_SOL}{" "}
            SOL vs{" "}
          </span>
          <Link className="profileLink" to={`/u/${loser.publicKey}`}>
            {displayName(loser)}
          </Link>
        </div>
      );
    } else {
      return (
        <div key={game._id} className="recentGame">
          <Link className="profileLink" to={`/u/${game.creator.publicKey}`}>
            {displayName(game.creator)}
          </Link>{" "}
          <span className="block">
            <span className="draw">draw</span> vs{" "}
          </span>
          <Link className="profileLink" to={`/u/${game.opponent.publicKey}`}>
            {displayName(game.opponent)}
          </Link>
        </div>
      );
    }
  }
}

export default RecentGamesRPS;
