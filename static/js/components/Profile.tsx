import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import Svg from "react-inlinesvg";

import "../css/Profile.scss";
import "../css/Coin.css";
import "../css/Modal.css";
import User from "../interfaces/User";
import Game from "../interfaces/Game";
import UserGames from "./UserGames";
import { displayName } from "../utils/displayName";

function Profile() {
  const { publicKey } = useParams();
  const [user, setUser] = useState<User>();
  const [games, setGames] = useState<Game[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesDrawn, setGamesDrawn] = useState(0);
  const [gamesLost, setGamesLost] = useState(0);

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

  const getUser = async (publicKey: string) => {
    const [responseUser, responseGameRPS, responseGameDice, responseCoinflipGame] = await Promise.all([
      axios.get(`/api/u/${publicKey}`),
      axios.get(`/api/game/u/${publicKey}`),
      axios.get(`/api/game-dice/u/${publicKey}`),
      axios.get(`/api/coinflip-game/u/${publicKey}`),
    ]);
    const [user, games, gamesDice, coinflipGame] = [responseUser.data, responseGameRPS.data, responseGameDice.data, responseCoinflipGame.data];
    console.log("======", coinflipGame);

    if (!user) setNotFound(true);

    for (let i = 0; i < games.length; i++) {
      games[i].gameType = "rps";
    }
    for (let i = 0; i < gamesDice.length; i++) {
      gamesDice[i].gameType = "dice";
    }
    for (let i = 0; i < coinflipGame.length; i++) {
      coinflipGame[i].gameType = "coinflip";
    }

    const gamesMerged = (games.concat(gamesDice)).concat(coinflipGame);
    console.log("22222", gamesMerged);

    setUser(user);
    setGames(gamesMerged);
  };

  // get screeen size whenever resize window
  useEffect(() => {
    window.addEventListener('resize', setDimension);

    return (() => {
      window.removeEventListener('resize', setDimension);
    })
  }, [screenSize]);

  useEffect(() => {
    setUser(undefined);
    if (!publicKey) return;

    getUser(publicKey);
  }, [publicKey]);

  useEffect(() => {
    if (!games || !user) return;
    let gamesWon = 0;
    let gamesLost = 0;
    let gamesDrawn = 0;
    games.forEach((game) => {
      if (game.gameType == "coinflip") {
        if (game.isWin) {
          gamesWon++;
        } else {
          gamesLost++;
        }
      } else {
        if (!game.winner) {
          gamesDrawn++;
        } else if (game.winner._id === user._id) {
          gamesWon++;
        } else {
          gamesLost++;
        }
      }
    });

    setGamesWon(gamesWon);
    setGamesDrawn(gamesDrawn);
    setGamesLost(gamesLost);
  }, [user, games]);

  return (
    <div className="Page Profile">
      {user ? (
        <>
          <div className={`box profileBox ${isMobile && 'mobile-profile-box'}`}>
            <img className="avatar" src="/img/masterchip.png" />
            <div className="rightInfo">
              <div className="address">
                <h2 className="publicKey">{displayName(user)}</h2>
                {/* <a className='scanLink' target="_blank" rel="noopener noreferrer" href={`https://solscan.io/account/${user.publicKey.toString()}`}><img src='/img/solscan.png' /></a> */}
              </div>
              <div className="gameStats">
                <div className="gameStat gameStat-win">
                  <h2 className="counter">{gamesWon}</h2>
                  <h2 className="tag">Win</h2>
                </div>
                <div className="statSeparator">/</div>
                <div className="gameStat gameStat-loss">
                  <h2 className="counter">{gamesLost}</h2>
                  <h2 className="tag">Loss</h2>
                </div>
                <div className="statSeparator">/</div>
                <div className="gameStat gameStat-draw">
                  <h2 className="counter">{gamesDrawn}</h2>
                  <h2 className="tag">Draw</h2>
                </div>
                <div className="gameStat gameStat-total">
                  <h2 className="counter">{games.length}</h2>
                  <h2 className="tag">Total</h2>
                </div>
              </div>
            </div>
          </div>
          <UserGames user={user} games={games} />
        </>
      ) : !notFound ? (
        <h1>Loading user...</h1>
      ) : (
        <h1>User was not found</h1>
      )}
    </div>
  );
}

export default Profile;
