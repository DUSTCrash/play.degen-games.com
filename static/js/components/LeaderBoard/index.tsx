import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { Spin } from "antd";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useSelector } from "react-redux";

import User from "../../interfaces/User";
import { CombinedReducer } from "../../store";
import Game from "../../interfaces/Game";
import { toast } from "react-toastify";
import { Sockets } from "../../reducers/sockets";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ClipLoader from "react-spinners/ClipLoader";
import Svg from "react-inlinesvg";

import "./index.scss";

export enum GameTypeEnum {
  Rps,
  Dice,
  Solanaball,
  Coinflip
}

export enum TimeFilterEnum {
  Today,
  ThisWeek,
  All
}

export enum PlaceEnum {
  First,
  Second,
  Third,
}

export interface IUserRankInfo {
  _id?: { username?: string; publicKey?: string };
  userProfit?: number;
  maxReward?: number;
  volume?: number;
  winCount?: number;
  loseCount?: number;
  count?: number;
}

function LeaderBoard() {
  const [gameType, setGameType] = useState<GameTypeEnum | null>(null);
  const [timeFilterType, setTimeFilterType] = useState<TimeFilterEnum>(
    TimeFilterEnum.All
  );
  const [userRankInfo, setUserRankInfo] = useState<IUserRankInfo[]>();
  const [currentUserRank, setCurrentUserRank] = useState<IUserRankInfo>();
  const [currentUserRankIndex, setCurrentUserRankIndex] = useState<number>(-1);
  const [isLoading, setLoading] = useState<boolean>(false);

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

  const navigate = useNavigate();
  const virtuoso = useRef(null);
  const user = useSelector<CombinedReducer, User>((state) => state.user);

  const handleNavigateUserInfo = (userPubkey: any) => {
    navigate(`/u/${userPubkey}`);
  };

  const getUserRank = async () => {
    try {
      setLoading(true);
      let config = {};

      config = {
        params: {
          timeFilterType,
        },
      };

      if (gameType !== null) {
        config = {
          params: {
            timeFilterType,
            gameType,
          },
        };
      }

      const userRank = await axios.get("/api/leaderboard", config);

      let currentUserRankInfo;
      let currentUserRankIndex = -1;
      if (userRank.data && userRank.data.length) {
        currentUserRankInfo = userRank.data.find(
          (x: any) => x._id?.publicKey == user.publicKey
        );
        currentUserRankIndex = userRank.data.findIndex(
          (x: any) => x._id?.publicKey == user.publicKey
        );
      }

      setUserRankInfo(userRank.data);
      setCurrentUserRank(currentUserRankInfo);
      setCurrentUserRankIndex(currentUserRankIndex);
      setLoading(false);
    } catch (_) {
      setLoading(false);
    }
  };

  const handleSetGameType = (step: number) => {
    let currentGameType = gameType == null ? -1 : gameType;
    currentGameType += step;
    if (currentGameType <= -2) currentGameType = 3;
    if (currentGameType >= 4) currentGameType = -1;

    if (currentGameType === -1) setGameType(null);
    if (currentGameType >= 0 && currentGameType <= 3)
      setGameType(currentGameType);
  };

  // get screeen size whenever resize window
  useEffect(() => {
    window.addEventListener('resize', setDimension);

    return (() => {
      window.removeEventListener('resize', setDimension);
    })
  }, [screenSize]);

  useEffect(() => {
    (async () => {
      await getUserRank();
    })();
  }, [timeFilterType, gameType, user]);

  return (
    <div className={`leaderboard ${isMobile && 'mobile-leaderboard'}`}>
      <h1 className="leaderboard-title">
        <span>Leaderboard</span>
      </h1>

      <div className="leaderboard-date-filter">
        <div className="row leaderboard-date-filter-container">
          <div className="col-md-4 filter-item">
            <span
              onClick={() => setTimeFilterType(TimeFilterEnum.Today)}
              className="filter-item-text"
            >
              <div
                className={`filter-item-text-blur ${
                  timeFilterType == TimeFilterEnum.Today && "active"
                }`}
              ></div>
              Today
            </span>
          </div>
          <div className="col-md-4 filter-item">
            <span
              onClick={() => setTimeFilterType(TimeFilterEnum.ThisWeek)}
              className="filter-item-text"
            >
              <div
                className={`filter-item-text-blur ${
                  timeFilterType == TimeFilterEnum.ThisWeek && "active"
                }`}
              ></div>
              This Week
            </span>
          </div>
          <div className="col-md-4 filter-item">
            <span
              onClick={() => setTimeFilterType(TimeFilterEnum.All)}
              className="filter-item-text"
            >
              <div
                className={`filter-item-text-blur ${
                  timeFilterType == TimeFilterEnum.All && "active"
                }`}
              ></div>
              All Time
            </span>
          </div>
        </div>
      </div>

      <div className="leaderboard-game-filter">
        <div className="leaderboard-boxes row">
          {
            isMobile ? (
              <>
                <div className="leaderboard-box rps-box col-md-6">
                  <h2>
                    <Svg src="./img/leaderboard-rps.svg" />
                    <span>1</span>
                  </h2>
                  <div className="space_holder rps-border-color"></div>
                  <h3 className="font-size-2">
                    {userRankInfo && userRankInfo.length > 0
                      ? userRankInfo[0]._id?.username
                        ? userRankInfo[0]._id?.username.length > 8
                          ? String(userRankInfo[0]?._id?.username).substring(0, 8) +
                            "..."
                          : userRankInfo[0]._id?.username
                        : String(userRankInfo[0]?._id?.publicKey).substring(0, 4) +
                          "..." +
                          String(userRankInfo[0]?._id?.publicKey).substring(40)
                      : "-"}
                  </h3>
                </div>

                <div className="leaderboard-box dice-box col-md-3">
                  <h2>
                    <Svg src="./img/leaderboard-dice.svg" />
                    <span>2</span>
                  </h2>
                  <div className="space_holder dice-border-color"></div>
                  <h3 className="font-size-1">
                    {userRankInfo && userRankInfo.length > 1
                      ? userRankInfo[1]._id?.username
                        ? userRankInfo[1]._id?.username.length > 12
                          ? String(userRankInfo[1]?._id?.username).substring(0, 12) +
                            "..."
                          : userRankInfo[1]._id?.username
                        : String(userRankInfo[1]?._id?.publicKey).substring(0, 4) +
                          "..." +
                          String(userRankInfo[1]?._id?.publicKey).substring(40)
                      : "-"}
                  </h3>
                </div>

                <div className="leaderboard-box lottery-box col-md-3">
                  <h2>
                    <Svg src="./img/leaderboard-lottery.svg" />
                    <span>3</span>
                  </h2>
                  <div className="space_holder lottery-border-color"></div>
                  <h3 className="font-size-1">
                    {userRankInfo && userRankInfo.length > 2
                      ? userRankInfo[2]._id?.username
                        ? userRankInfo[2]._id?.username.length > 12
                          ? String(userRankInfo[2]?._id?.username).substring(0, 12) +
                            "..."
                          : userRankInfo[2]._id?.username
                        : String(userRankInfo[2]?._id?.publicKey).substring(0, 4) +
                          "..." +
                          String(userRankInfo[2]?._id?.publicKey).substring(40)
                      : "-"}
                  </h3>
                </div>
              </>
            ) : (
              <>
                <div className="leaderboard-box dice-box col-md-3">
                  <h2>
                    <Svg src="./img/leaderboard-dice.svg" />
                    <span>2</span>
                  </h2>
                  <div className="space_holder dice-border-color"></div>
                  <h3 className="font-size-1">
                    {userRankInfo && userRankInfo.length > 1
                      ? userRankInfo[1]._id?.username
                        ? userRankInfo[1]._id?.username.length > 12
                          ? String(userRankInfo[1]?._id?.username).substring(0, 12) +
                            "..."
                          : userRankInfo[1]._id?.username
                        : String(userRankInfo[1]?._id?.publicKey).substring(0, 4) +
                          "..." +
                          String(userRankInfo[1]?._id?.publicKey).substring(40)
                      : "-"}
                  </h3>
                </div>

                <div className="leaderboard-box rps-box col-md-6">
                  <h2>
                    <Svg src="./img/leaderboard-rps.svg" />
                    <span>1</span>
                  </h2>
                  <div className="space_holder rps-border-color"></div>
                  <h3 className="font-size-2">
                    {userRankInfo && userRankInfo.length > 0
                      ? userRankInfo[0]._id?.username
                        ? userRankInfo[0]._id?.username.length > 8
                          ? String(userRankInfo[0]?._id?.username).substring(0, 8) +
                            "..."
                          : userRankInfo[0]._id?.username
                        : String(userRankInfo[0]?._id?.publicKey).substring(0, 4) +
                          "..." +
                          String(userRankInfo[0]?._id?.publicKey).substring(40)
                      : "-"}
                  </h3>
                </div>

                <div className="leaderboard-box lottery-box col-md-3">
                  <h2>
                    <Svg src="./img/leaderboard-lottery.svg" />
                    <span>3</span>
                  </h2>
                  <div className="space_holder lottery-border-color"></div>
                  <h3 className="font-size-1">
                    {userRankInfo && userRankInfo.length > 2
                      ? userRankInfo[2]._id?.username
                        ? userRankInfo[2]._id?.username.length > 12
                          ? String(userRankInfo[2]?._id?.username).substring(0, 12) +
                            "..."
                          : userRankInfo[2]._id?.username
                        : String(userRankInfo[2]?._id?.publicKey).substring(0, 4) +
                          "..." +
                          String(userRankInfo[2]?._id?.publicKey).substring(40)
                      : "-"}
                  </h3>
                </div>
              </>
            )
          }
        </div>
      </div>

      <div className="leaderboard-table-wrapper">
        <div className="leaderboard-table">
          <div className="leaderboard-table-header leaderboard-table-main">
            <div className="rank-width">
              <span>Rank</span>
            </div>
            <div className="name-width">
              <span>Name</span>
            </div>
            <div className="games-width d-flex justify-content-center">
              <Svg
                className="align-self-center cursor-pointer"
                src={"/img/arrow-left.svg"}
                onClick={() => handleSetGameType(-1)}
              />
              <span className="mrl-05">Games</span>
              <Svg
                className="align-self-center cursor-pointer"
                src={"/img/arrow-right.svg"}
                onClick={() => handleSetGameType(1)}
              />
            </div>
            <div className="total-games-width">
              <span>Total Games</span>
            </div>
            {gameType !== GameTypeEnum.Solanaball && (
              <>
                <div className="win-loss-width">
                  <span>Win/Loss/draw</span>
                </div>
                <div className="win-rate-width">
                  <span>Win %</span>
                </div>
              </>
            )}
            <div className="volume-width">
              <span>Volume</span>
            </div>
            {gameType !== GameTypeEnum.Solanaball && (
              <div className="profit-width">
                <span>Profit</span>
              </div>
            )}
            {gameType === GameTypeEnum.Solanaball && (
              <>
                <div className="max-profit-width">
                  <span>Max Reward</span>
                </div>
                <div className="total-winning-width">
                  <span>Total Winnings</span>
                </div>
              </>
            )}
          </div>
          <div className="leaderboard-table-body">
            <Spin spinning={isLoading}>
              {currentUserRankIndex >= 0 && (
                <div
                  className={`leaderboard-table-row leaderboard-table-main mb-5`}
                >
                  <div className="rank-width">
                    <span>{currentUserRankIndex + 1}</span>
                  </div>
                  <div className="name-width cursor-pointer">
                    <span
                      onClick={() =>
                        handleNavigateUserInfo(currentUserRank?._id?.publicKey)
                      }
                    >
                      You
                    </span>
                  </div>
                  <div className="games-width">
                    <span>
                      {gameType !== null ? GameTypeEnum[gameType] : "All"}
                    </span>
                  </div>
                  <div className="total-games-width">
                    <span>{currentUserRank?.count}</span>
                  </div>
                  {gameType !== GameTypeEnum.Solanaball && (
                    <>
                      <div className="win-loss-width">
                        <span>{`${currentUserRank?.winCount}/${
                          currentUserRank?.loseCount
                        }/${
                          (currentUserRank?.count || 0) -
                          (currentUserRank?.winCount || 0) -
                          (currentUserRank?.loseCount || 0)
                        }`}</span>
                      </div>
                      <div className="win-rate-width">
                        <span>
                          {(
                            ((currentUserRank?.winCount || 0) /
                              (currentUserRank?.count || 1)) *
                            100
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </>
                  )}
                  <div className="volume-width">
                    <span>
                      {(
                        (currentUserRank?.volume || 0) / LAMPORTS_PER_SOL
                      ).toLocaleString()}
                    </span>
                  </div>
                  {gameType !== GameTypeEnum.Solanaball && (
                    <div className="profit-width">
                      <span>
                        {(
                          (currentUserRank?.userProfit || 0) / LAMPORTS_PER_SOL
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {gameType === GameTypeEnum.Solanaball && (
                    <>
                      <div className="max-profit-width">
                        <span>
                          {(
                            (currentUserRank?.maxReward || 0) / LAMPORTS_PER_SOL
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="total-winning-width">
                        <span>{currentUserRank?.winCount}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              {userRankInfo && userRankInfo.length > 0 ? (
                <Virtuoso
                  data={userRankInfo}
                  ref={virtuoso}
                  style={{ minHeight: "500px", maxHeight: "500px" }}
                  itemContent={(index, item) => {
                    return (
                      <div
                        key={index}
                        className={`leaderboard-table-row leaderboard-table-main ${
                          index <= 2 && PlaceEnum[index].toLowerCase()
                        }-place-table-border-color`}
                      >
                        <div className="rank-width">
                          <span>{index + 1}</span>
                        </div>
                        <div className="name-width cursor-pointer">
                          <span
                            onClick={() =>
                              handleNavigateUserInfo(item?._id?.publicKey)
                            }
                          >
                            {item?._id?.username
                              ? item?._id?.username
                              : String(item?._id?.publicKey).substring(0, 4) +
                                "..." +
                                String(item?._id?.publicKey).substring(40)}
                          </span>
                        </div>
                        <div className="games-width">
                          <span>
                            {gameType !== null ? GameTypeEnum[gameType] : "All"}
                          </span>
                        </div>
                        <div className="total-games-width">
                          <span>{item?.count}</span>
                        </div>
                        {gameType !== GameTypeEnum.Solanaball && (
                          <>
                            <div className="win-loss-width">
                              <span>{`${item?.winCount}/${
                                item?.loseCount
                              }/${
                                (item?.count || 0) -
                                (item?.winCount || 0) -
                                (item?.loseCount || 0)
                              }`}</span>
                            </div>
                            <div className="win-rate-width">
                              <span>
                                {(
                                  ((item?.winCount || 0) / (item?.count || 1)) *
                                  100
                                ).toFixed(2)}
                                %
                              </span>
                            </div>
                          </>
                        )}
                        <div className="volume-width">
                          <span>
                            {(
                              (item?.volume || 0) / LAMPORTS_PER_SOL
                            ).toLocaleString()}
                          </span>
                        </div>
                        {gameType !== GameTypeEnum.Solanaball && (
                          <div className="profit-width">
                            <span>
                              {(
                                (item?.userProfit || 0) / LAMPORTS_PER_SOL
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {gameType === GameTypeEnum.Solanaball && (
                          <>
                            <div className="max-profit-width">
                              <span>
                                {(
                                  (item?.maxReward || 0) / LAMPORTS_PER_SOL
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="total-winning-width">
                              <span>{item?.winCount}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              ) : (
                <div className="user-rank-no-data">No Data</div>
              )}
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderBoard;
