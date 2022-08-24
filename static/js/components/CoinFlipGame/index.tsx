import React, { useEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import Countdown from "react-countdown";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import useSound from "use-sound";

import "../../css/ActiveGames.scss";
import "../../css/Coin.css";
import "../../css/Modal.css";
import User from "../../interfaces/User";
import { CombinedReducer } from "../../store";
import Game from "../../interfaces/Game";
import { toast } from "react-toastify";
import { Sockets } from "../../reducers/sockets";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import Svg from "react-inlinesvg";
import ReactGA from "react-ga";
import "./index.scss";
import SideBar from "./SideBar";
// import Chat from "../Chat";
import Chat from "../Chat_coinflip";
import Coinflip from "../../interfaces/Coinflip";
import { ICoinflipInitialState } from "../../reducers/coinflip";
import CoinflipGame from "../../interfaces/CoinflipGame";

const amountOptions = [0.05, 0.1, 0.25, 0.5, 1, 2];

export enum CoinflipFaceEnum {
  Head,
  Tail,
  None,
}

export enum CoinflipStatus {
  Pending,
  Open,
  Close,
}

interface IBettingProps {
  bettingAmount: number;
  bettingFace: CoinflipFaceEnum;
}

const GAME_FEE = 4;

function CoinFlipGames() {
  const wallet = useWallet();
  const [playCoinflip] = useSound("/sound/pokerchipsound.mp3", { volume: 1 });

  const [currentRound, setCurrentRound] = useState<Coinflip>();
  const [recentRounds, setRecentRounds] = useState<Coinflip[]>();
  const [currentUsersInfo, setCurrentUsersInfo] = useState<CoinflipGame[]>();

  const [bettingFace, setBettingFace] = useState<CoinflipFaceEnum>(
    CoinflipFaceEnum.None
  );
  const [bettingAmount, setBettingAmount] = useState<number>(0);
  const [currentCoinflipStatus, setCurrentCoinflipStatus] =
    useState<CoinflipStatus>();
  const [endTime, setEndtime] = useState<number>(Date.now());
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isHead, setIsHead] = useState<boolean>(false);
  const [winningFace, setWinningFace] = useState<CoinflipFaceEnum>(
    CoinflipFaceEnum.None
  );

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
  const coinflip = useSelector<CombinedReducer, ICoinflipInitialState>(
    (state) => state.coinflip
  );
  const sockets = useSelector<CombinedReducer, Sockets>(
    (state) => state.sockets
  );

  const validateBetting = async (bettingAmount: number) => {
    if (!user) {
      toast.warn("Please connect wallet!");
      return false;
    }

    if (
      user.balance == 0 ||
      user.balance / LAMPORTS_PER_SOL < bettingAmount * (1 + GAME_FEE / 100)
    ) {
      toast.warn("Insufficient balance");
      return false;
    }

    return true;
  };

  const handleSetBettingAmount = async (amount: number) => {
    const isValid = await validateBetting(amount);
    if (!isValid) return;

    setBettingAmount(amount);
    await bettingGame({ bettingAmount: amount, bettingFace });
  };

  const handleSetBettingFace = async (face: CoinflipFaceEnum) => {
    const isValid = await validateBetting(bettingAmount);
    if (!isValid) return;

    setBettingFace(face);
    await bettingGame({ bettingAmount, bettingFace: face });
  };

  const handleSetMaxAmount = async () => {
    const maxAmount = Math.max(...amountOptions);
    const isValid = await validateBetting(maxAmount);
    if (!isValid) return;

    setBettingAmount(maxAmount);
    await bettingGame({ bettingAmount: maxAmount, bettingFace });
  };

  const onComplete = () => {
    setEndtime(Date.now());
    setTimeout(playCoinflip, 1000);
  };

  const bettingGame = async (bettingProps: IBettingProps) => {
    const { bettingAmount, bettingFace } = bettingProps;
    if (!(wallet && wallet.publicKey)) return;
    if (bettingAmount <= 0 || bettingFace == CoinflipFaceEnum.None) return;

    if (!(currentRound && currentRound.status == CoinflipStatus.Open)) return;

    const isValid = await validateBetting(bettingAmount);
    if (!isValid) return;

    setIsDisabled(true);
    try {
      await axios.post("/api/coinflip-game/betting", {
        roundId: currentRound._id,
        bettingAmount: bettingAmount,
        bettingFace: bettingFace,
      });

      // google analytics event
      ReactGA.event({
        category: "COINFLIP",
        action: "BETTING",
        label: "DEGEN_GAME",
      });
    } catch (e: any) {
      setIsDisabled(false);
      toast.error(e.response.data.message.toString());
    }
  };

  // get screeen size whenever resize window
  useEffect(() => {
    window.addEventListener('resize', setDimension);

    return (() => {
      window.removeEventListener('resize', setDimension);
    })
  }, [screenSize]);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    const getCoinflipGameInfo = async () => {
      const recentRounds: Coinflip[] = (
        await axios.get("/api/coinflip-game/recentRounds")
      ).data;
      const currentRound: Coinflip = (
        await axios.get("/api/coinflip-game/currentRound")
      ).data;

      if (currentRound && currentRound.status == CoinflipStatus.Open) {
        const config = {
          params: {
            coinflipId: currentRound._id,
          },
        };
        const currentUsersInfo: CoinflipGame[] = (
          await axios.get("/api/coinflip-game/currentUsersInfo", config)
        ).data;
        const currentUserInfo = currentUsersInfo.find(
          (x) => x.player.publicKey.toString() === wallet.publicKey?.toString()
        );
        if (currentUserInfo) {
          setIsDisabled(true);
          setBettingAmount(
            (currentUserInfo.bettingAmount || 0) / LAMPORTS_PER_SOL
          );
          setBettingFace(currentUserInfo.bettingFace);
        }
        dispatch({ type: "SET_CURRENT_USERS_INFO", payload: currentUsersInfo });
      }

      dispatch({ type: "SET_RECENT_ROUNDS", payload: recentRounds.reverse() });
      dispatch({ type: "SET_CURRENT_ROUND", payload: currentRound });
    };

    getCoinflipGameInfo();
  }, [wallet]);

  useEffect(() => {
    if (!sockets.coinflip) return;
    if (!(sockets && sockets.user)) return;

    sockets.coinflip.on("newCoinflip", (coinflip: Coinflip) => {
      setIsCompleted(false);
      setIsDisabled(false);
      setBettingAmount(0);
      setBettingFace(CoinflipFaceEnum.None);
      setWinningFace(CoinflipFaceEnum.None);

      dispatch({ type: "SET_CURRENT_USERS_INFO", payload: [] });
      dispatch({ type: "SET_CURRENT_ROUND", payload: coinflip });
    });
    sockets.coinflip.on("newBetting", (newBetting: CoinflipGame) =>
      dispatch({ type: "UPDATE_CURRENT_USERS_INFO", payload: newBetting })
    );
    sockets.coinflip.on("updateCoinflip", (updatedCoinflip: Coinflip) => {
      dispatch({ type: "UPDATE_CURRENT_ROUND", payload: updatedCoinflip });
      if (updatedCoinflip.status == CoinflipStatus.Pending) {
        setIsCompleted(true);
        setIsHead(updatedCoinflip.winningFace == CoinflipFaceEnum.Head);
      } else setWinningFace(updatedCoinflip.winningFace!);
    });
    sockets.coinflip.on("updateRecentRounds", (oldCoinflip: Coinflip) =>
      dispatch({ type: "UPDATE_RECENT_ROUNDS", payload: oldCoinflip })
    );
  }, [sockets.coinflip]);

  useEffect(() => {
    const { currentRound, recentRounds, usersGameInfo } = coinflip;
    const bar: any = document.querySelector(".coinflip-countdown-bar");
    document.documentElement.style.setProperty("--initial", "15000");
    if (currentRound && currentRound.endedAt) {
      setCurrentCoinflipStatus(currentRound.status);
      setEndtime(currentRound.endedAt);
      document.documentElement.style.setProperty(
        "--duration",
        (currentRound.endedAt - Date.now()).toString()
      );
      bar.classList.remove("coinflip-countdown-bar");
      const offsetWidth = bar.offsetWidth;
      bar.classList.add("coinflip-countdown-bar");
    } else {
      setCurrentCoinflipStatus(CoinflipStatus.Close);
      setEndtime(Date.now());
      document.documentElement.style.setProperty("--duration", "0");
    }
    setCurrentRound(currentRound);
    setRecentRounds(recentRounds);
    setCurrentUsersInfo(usersGameInfo);
  }, [user, coinflip]);

  return (
    <div className="coinflip-page">
      {
        !isMobile && (
          <SideBar
            position={"left"}
            currentUsersInfo={currentUsersInfo}
            isCompleted={isCompleted}
            winningFace={winningFace}
          />
        )
      }
      
      <div className="coinflip-main">
        <div className="coinflip-countdown-bar">
          <div className="progress-bar"></div>
          <div className="coinflip-countdown-box">
            Next Round in :
            {endTime > Date.now() ? (
              <Countdown
                date={endTime}
                intervalDelay={0}
                precision={1}
                renderer={(time: any) => (
                  <h3>{`${time.seconds.toString().padStart(2, "0")}.${
                    time.milliseconds / 100
                  }`}</h3>
                )}
                onComplete={() => onComplete()}
              />
            ) : (
              "00.0"
            )}
          </div>
        </div>

        <div className="coinflip-main-body-wrap">
          <div className="last-flips-box  mt-4 mb-4">
            <div className="last-flips-title">Last Flips</div>
            <div className="last-flips-container">
              {recentRounds?.map((item, index) => {
                return (
                  <img
                    key={index}
                    className={`ml-2 mr-2`}
                    src={`./img/coin-${
                      item?.winningFace != undefined &&
                      CoinflipFaceEnum[item?.winningFace].toLowerCase()
                    }-small.svg`}
                  />
                );
              })}
            </div>
          </div>

          {!isCompleted && (
            <div className={`flip-status`}>
              <img src="./img/coin-standard-large.svg" />
            </div>
          )}

          {isCompleted && (
            <div
              id="coin"
              className={`flip-status ${isHead ? "heads" : "tails"}`}
            >
              <div className="side-a"></div>
              <div className="side-b"></div>
            </div>
          )}

          <div className="betting-amount-box">
            {/* <div className="betting-amount-title-container">
              <div className="betting-amount-title">
                Enter bet amount...
              </div>
              <img src="./img/solanaicon.svg" />
            </div> */}
            <div className="betting-amount-container">
              {amountOptions.map((item, index) => (
                <div
                  key={index}
                  className={`betting-amount-div ${
                    bettingAmount === item && "active"
                  } ${
                    (currentCoinflipStatus !== CoinflipStatus.Open ||
                      isDisabled) &&
                    "disabled"
                  }`}
                  onClick={() => handleSetBettingAmount(item)}
                >
                  {item}
                  <img src="./img/solanaicon.svg" />
                </div>
              ))}
              {/* <div
                className={`betting-amount-div ${
                  (currentCoinflipStatus !== CoinflipStatus.Open ||
                    isDisabled) &&
                  "disabled"
                }`}
                onClick={handleSetMaxAmount}
              >
                Max
              </div> */}
            </div>
          </div>

          <div className="bet-box">
            <div
              className={`bet-type-box bet-type-head ${
                bettingFace === CoinflipFaceEnum.Head && "active"
              } ${
                (currentCoinflipStatus !== CoinflipStatus.Open || isDisabled) &&
                "disabled"
              }`}
              onClick={() => handleSetBettingFace(CoinflipFaceEnum.Head)}
            >
              <img src="./img/coin-head-small.svg" />
              <div className="bet-type-title">Heads</div>
            </div>
            <div
              className={`bet-type-box bet-type-tail ${
                bettingFace === CoinflipFaceEnum.Tail && "active"
              } ${
                (currentCoinflipStatus !== CoinflipStatus.Open || isDisabled) &&
                "disabled"
              }`}
              onClick={() => handleSetBettingFace(CoinflipFaceEnum.Tail)}
            >
              <img src="./img/coin-tail-small.svg" />
              <div className="bet-type-title">Tails</div>
            </div>
          </div>

          {
            !isMobile && (
              <div className="coinflip-chatbox">
                <Chat />
              </div>
            )
          }

          {
            isMobile && (
              <div className="mobile-coinflip-sidebar">
                <SideBar
                  position={"left"}
                  currentUsersInfo={currentUsersInfo}
                  isCompleted={isCompleted}
                  winningFace={winningFace}
                  isMobile
                />
                <SideBar
                  position={"right"}
                  currentUsersInfo={currentUsersInfo}
                  isCompleted={isCompleted}
                  winningFace={winningFace}
                  isMobile
                />
              </div>
            )
          }
        </div>
      </div>
      {
        !isMobile && (
          <SideBar
            position={"right"}
            currentUsersInfo={currentUsersInfo}
            isCompleted={isCompleted}
            winningFace={winningFace}
          />
        )
      }
    </div>
  );
}

export default CoinFlipGames;
