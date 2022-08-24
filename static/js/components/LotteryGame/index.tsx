import React, { useEffect, useState, useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import { Skeleton, Statistic } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  UpOutlined,
  DownOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Flex, useMatchBreakpoints } from "@pancakeswap/uikit";
import WinningNumbers from "./WinningNumbers";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import ReactGA from 'react-ga';

import "../../css/ActiveGames.scss";
import "../../css/Coin.css";
import "../../css/Modal.css";
import "./index.scss";
import User from "../../interfaces/User";
import { CombinedReducer } from "../../store";
import Game from "../../interfaces/Game";
import { toast } from "react-toastify";
import { Sockets } from "../../reducers/sockets";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ClipLoader from "react-spinners/ClipLoader";

import Lottery, { LotteryStatus } from "../../interfaces/Lottery";
import ILotteryGame from "../../interfaces/LotteryGame";
import { IInitialState } from "../../reducers/lottery";
import HowToPlay from "./HowToplay";
import AllHistory from "./FinishedRounds/AllHistory";
import UserHistory from "./FinishedRounds/UserHistory";

function LotteryGame() {
  const wallet = useWallet();
  const { Countdown } = Statistic;

  const [ticketCount, setTicketCount] = useState<number>(0);
  const [totalTicketPrice, setTotalTicketPrice] = useState<number>(0);
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [deltaPrice, setDeltaPrice] = useState<number>(0);
  const [isDisabledBuyBtn, setIsDisabledBuyBtn] = useState<boolean>(true);
  const [duplicatedStatus, setDuplicatedStatus] = useState<number[]>(
    new Array(7).fill(0)
  );
  const [errMsg, setErrMsg] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showMyTicketModal, setShowMyTicketModal] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [lastRound, setLastRound] = useState<Lottery>({});
  const [userLotteryInfo, setUserLotteryInfo] = useState<ILotteryGame>();

  const [latestLotteryId, setLatestLotteryId] = useState<number>(0);
  const [lotteryIndex, setLotteryIndex] = useState<number>(0);
  const [indexedLottery, setIndexedLottery] = useState<Lottery>({});

  const [tempOneTicket, setTempOneTicket] = useState<any>([
    ...Array(8).fill(""),
  ]);
  const [ticketArray, setTicketArray] = useState<any>([]);
  const [toggledBtn, setToggledBtn] = useState(0);
  const [isLoading, setLoading] = useState(false);

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

  const { isLg, isXl, isXxl } = useMatchBreakpoints();
  const isLargerScreen = isLg;
  const isXLargerScreen = isXl || isXxl;

  const buyTicketRef = React.useRef<any>(null);
  const ticketCountRef = React.useRef<any>(null);
  const virtuoso = useRef(null);

  const dispatch = useDispatch();

  const user = useSelector<CombinedReducer, User>((state) => state.user);
  const games = useSelector<CombinedReducer, Game[]>((state) => state.games);
  const sockets = useSelector<CombinedReducer, Sockets>(
    (state) => state.sockets
  );
  const lottery = useSelector<CombinedReducer, IInitialState>(
    (state) => state.lottery
  );

  const setInitState = () => {
    setTicketCount(0);
    setTotalTicketPrice(0);
    setBulkPrice(0);
    setDiscountRate(0);
    setDeltaPrice(0);
    setIsDisabledBuyBtn(true);
    setErrMsg("");
    setTempOneTicket([...Array(8).fill("")]);
    setTicketArray([]);
  };

  const handleSetToggleBtn = (toggle: number) => {
    setInitState();
    setToggledBtn(toggle);
  };

  const handleConfirmModal = async () => {
    if (!(wallet && wallet.publicKey)) {
      toast.warn("Please check wallet connection");

      return;
    }

    if (lastRound.status !== LotteryStatus.Open) {
      toast.warn("Not time to buy tickets");

      return;
    }

    if (ticketCount <= 0) {
      const errMsg = "Invalid amount";
      setIsDisabledBuyBtn(true);
      setErrMsg(errMsg);

      return;
    }

    if (isDisabledBuyBtn) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleBuyTickets = async () => {
    setIsBuying(true);

    try {
      const randomTickets = await Promise.all(
        new Array(ticketCount).fill(0).map(async (item, index) => {
          const rowData: number[] = [];
          for (let i = 1; i <= 8; i++) {
            let add = true;
            if (i < 8) {
              const randomNumber = Math.floor(Math.random() * 35) + 1;
              if (rowData.includes(randomNumber)) add = false;
              if (add) rowData.push(randomNumber);
              else i--;
            } else
              rowData
                .sort((a, b) => a - b)
                .push(Math.floor(Math.random() * 20) + 1);
          }

          return rowData;
        })
      );

      const tickets = toggledBtn == 0 ? randomTickets : ticketArray;
      await axios.post("/api/lottery-game/buy-tickets", {
        lotteryId: lastRound._id,
        tickets,
      });

      // google analytics event
      ReactGA.event({
        category: "LOTTERY",
        action: "BUY_TICKETS",
        label: "DEGEN_GAME"
      });

      toast.success("Success to buy tickets");
      if (toggledBtn == 0) ticketCountRef.current.value = 0;
      setInitState();
      setShowConfirmModal(false);
    } catch (e: any) {
      setShowConfirmModal(false);
      toast.error(e?.response?.data?.message?.toString());
    }

    setIsBuying(false);
  };

  const handleTicketCount = (e: any, value?: number) => {
    let amount = value !== undefined ? Number(value) : Number(e.target.value);

    const maxAmountPerBuy = lastRound?.maxAmountPerBuy || 0;
    if(!value && amount > maxAmountPerBuy) {
      ticketCountRef.current.value = maxAmountPerBuy;
    }
    amount = amount > maxAmountPerBuy ? maxAmountPerBuy : amount;
    setTicketCount(amount);

    const priceTicketInGame =
      (lastRound.priceTicketInGame || 0) / LAMPORTS_PER_SOL;
    const discountDivisor = lastRound.discountDivisor || 2000;

    const totalPrice = priceTicketInGame * amount;
    const bulkPrice =
      (priceTicketInGame * amount * (discountDivisor + 1 - amount)) /
      discountDivisor;
    const discountRate = amount == 0 ? 0 : (amount - 1) / discountDivisor;
    const deltaPrice = totalPrice * discountRate;

    setTotalTicketPrice(totalPrice);
    setBulkPrice(bulkPrice);
    setDiscountRate(discountRate);
    setDeltaPrice(deltaPrice);

    setIsDisabledBuyBtn(true);

    let errMsg = "";

    if (amount <= 0) {
      errMsg = "Invaild amount";
    } else if (amount > maxAmountPerBuy) {
      errMsg = "Exceed max amount per buy";
    } else if (bulkPrice <= 0) {
      errMsg = "Invaild ticket price";
    } else if (bulkPrice > user?.balance / LAMPORTS_PER_SOL) {
      errMsg = "Insufficient balance";
    } else {
      setIsDisabledBuyBtn(false);
    }

    setErrMsg(errMsg);
  };

  const handleTempTicket = (e: any, index: number) => {
    const inputObject = buyTicketRef.current?.getElementsByClassName(
      "buy-ticket-pick-input"
    );
    let value = Number(e.target.value);
    value = value > 35 ? 35 : value;
    if (value <= 0) {
      inputObject[index].style.borderColor = "#dc3545";
    } else {
      inputObject[index].style.borderColor = "rgb(118, 118, 118)";
    }

    if (index < 7) {
      if (tempOneTicket.includes(value.toString())) {
        inputObject[index].style.borderColor = "#dc3545";
        duplicatedStatus[index] = 1;
      } else {
        inputObject[index].style.borderColor = "rgb(118, 118, 118)";
        duplicatedStatus[index] = 0;
      }

      if (duplicatedStatus.includes(1)) {
        setErrMsg("You can't pick duplicated number");
      } else {
        setErrMsg("");
      }

      if (Number(e.target.value) > 35) e.target.value = 35;
    }

    if (index == 7 && value > 20) {
      e.target.value = 20;
    }
    const tempData = tempOneTicket;
    tempData[index] = e.target.value;
    setTempOneTicket(tempData);
    setDuplicatedStatus(duplicatedStatus);
  };

  const handleAddTicket = (e: any) => {
    let actionDisabled = false;

    if (tempOneTicket.length < 8 || tempOneTicket.includes()) {
      return;
    }
    const inputObject = buyTicketRef.current?.getElementsByClassName(
      "buy-ticket-pick-input"
    );
    for (let i = 0; i < inputObject.length; i++) {
      if (
        i < 7 &&
        (Number(inputObject[i].value) < 1 ||
          Number(inputObject[i].value) > 35 ||
          duplicatedStatus[i] == 1)
      ) {
        inputObject[i].style.borderColor = "#dc3545";

        actionDisabled = true;
      }

      if (
        i == 7 &&
        (Number(inputObject[i].value) < 1 || Number(inputObject[i].value) > 20)
      ) {
        inputObject[i].style.borderColor = "#dc3545";
        actionDisabled = true;
      }
    }

    if (actionDisabled) return;

    for (let i = 0; i < inputObject.length; i++) {
      inputObject[i].value = "";
    }

    setTicketCount(ticketCount + 1);
    handleTicketCount(e, ticketCount + 1);

    const sliceArray1 = tempOneTicket.slice(0, 7);
    const sliceArray2 = tempOneTicket.slice(7);
    sliceArray1.sort((a: any, b: any) => a - b);
    const tempArray = sliceArray1.concat(sliceArray2);

    ticketArray.push(tempArray);
    setTicketArray(ticketArray);
    setTempOneTicket([...Array(8).fill("")]);
  };

  const handleRemoveTicket = (e: any, index: number) => {
    ticketArray.splice(index, 1);

    setTicketCount(ticketCount - 1);
    handleTicketCount(e, ticketCount - 1);

    setTicketArray(ticketArray);
    setTempOneTicket([...Array(8).fill("")]);
  };

  const handleShowMyTicketModal = (status: boolean) => {
    setShowMyTicketModal(status);
  };

  const handleLotteryIndex = async (_lotteryIndex: number) => {
    if (latestLotteryId < 1) {
      return;
    }

    if (_lotteryIndex >= 1 && _lotteryIndex <= latestLotteryId) {
      setLoading(true);
      setIndexedLottery(lottery.finishedRounds[_lotteryIndex - 1]);
      setLotteryIndex(_lotteryIndex);
      setLoading(false);
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
    document.body.style.backgroundImage = "url('/img/b2.png')";
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    const getLotteries = async () => {
      const finishedRounds = await axios.get(
        "/api/lottery-game/finishedRounds"
      );
      const lastRound = await axios.get("/api/lottery-game/lastRound");

      if (lastRound.data && wallet && wallet.publicKey) {
        const config = {
          params: {
            lotteryId: lastRound.data._id,
          },
        };
        const currentLotteryUserInfo = await axios.get(
          "/api/lottery-game/userLotteryInfo",
          config
        );
        console.log("currentLotteryUserInfo", currentLotteryUserInfo.data);
        dispatch({
          type: "SET_USER_LOTTERY_INFO",
          payload: currentLotteryUserInfo.data,
        });
      }

      dispatch({ type: "SET_FINISHED_ROUNDS", payload: finishedRounds.data });
      dispatch({ type: "SET_LAST_ROUND", payload: lastRound.data });
    };

    getLotteries();
  }, [wallet]);

  useEffect(() => {
    if (!sockets.lottery) return;
    if (!(sockets && sockets.user)) return;

    sockets.lottery.on("newLottery", (lottery: Lottery) =>
      dispatch({ type: "SET_LAST_ROUND", payload: lottery })
    );
    sockets.user.on(
      "boughtTickets",
      (price: number, boughtTickets: number[][]) =>
        dispatch({ type: "BOUGHT_TICKETS", payload: { price, boughtTickets } })
    );
    sockets.lottery.on("closedLottery", (finishedLottery: Lottery) =>
      dispatch({ type: "CLOSED_LOTTERY", payload: finishedLottery })
    );
  }, [sockets.lottery]);

  useEffect(() => {
    const { lastRound, userLotteryInfo, finishedRounds } = lottery;
    setLastRound(lastRound);
    setUserLotteryInfo(userLotteryInfo);

    const latestLotteryId =
      finishedRounds.length > 0 ? finishedRounds.length : 0;
    const indexedLottery =
      latestLotteryId > 0 ? finishedRounds[latestLotteryId - 1] : {};

    setLotteryIndex(latestLotteryId);
    setLatestLotteryId(latestLotteryId);
    setIndexedLottery(indexedLottery);
  }, [user, lottery]);

  return (
    <div className={`Page ActiveGames w-100 ${isMobile && 'mobile-lottery-page'}`}>
      <h1 className="gameTitle">
        <span>Solanaball</span>
      </h1>

      <div className="prize-notification">
        {lastRound?.status === LotteryStatus.Open ? (
          <>
            <div className="gameTitle-container">
              <h2 className="prize-text-1">{`${(
                (lastRound?.amountCollectedInGame || 0) / LAMPORTS_PER_SOL
              ).toLocaleString()} SOL`}</h2>
              <h2 className="prize-text-2">in prizes!</h2>
            </div>
            {/* <h2 className="prize-text-3">Get your tickets now!</h2> */}

            <Countdown
              value={lastRound.endedAt}
              format="DD:HH:mm:ss"
              className="text-white"
              style={{ color: "white" }}
            />
          </>
        ) : (
          <h2 className="prize-text-1 lottery-ticket-ready-title">Tickets on sale soon</h2>
        )}
      </div>

      {
        isMobile && (
          <>
            <div className="row mb-3">
              <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                <div className="box buy-box mobile-buy-box">
                  <div className="buy-box-header justify-content-between">
                    <div className="primate-container">
                      <img src="img/primate.png" className="primate"></img>
                      <p>
                        Buy 5 Tickets or more and enter the raffle{" "}
                        <span>to win this exclusive Primate NFT!</span>
                      </p>
                    </div>
                    <div className="buy-box-title">Buy Tickets</div>
                    <div className="finished-rounds-switch-btn-container">
                      <div className="finished-rounds-switch-btn-box">
                        <button
                          className={`toggle-round-btn ${
                            toggledBtn == 0 ? "" : "toggle-non-active"
                          }`}
                          onClick={() => handleSetToggleBtn(0)}
                        >
                          Random
                        </button>
                        <button
                          className={`toggle-round-btn ${
                            toggledBtn == 0 ? "toggle-non-active" : ""
                          }`}
                          onClick={() => handleSetToggleBtn(1)}
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="buy-box-body">
                    {toggledBtn == 0 ? (
                      <div className="mb-3">
                        <div className="justify-content-between d-flex buy-ticket-font mb-1">
                          <div><b></b></div>
                          <div className="font-weight-bold"># Tickets</div>
                        </div>
                        <input
                          className="buy-ticket-amount-input text-end mb-1"
                          type="number"
                          ref={ticketCountRef}
                          defaultValue={0}
                          onInput={(e) => handleTicketCount(e)}
                        />
                        <div className="text-end buy-ticket-balance">
                          SOL Balance:{" "}
                          {user
                            ? Number((user?.balance / LAMPORTS_PER_SOL).toFixed(5)) *
                              1
                            : "-"}
                        </div>
                        {toggledBtn == 0 && isDisabledBuyBtn && (
                          <div className="text-end err-msg">{errMsg}</div>
                        )}
                      </div>
                    ) : (
                      <>
                        {ticketArray.map((item: any, index: number) => {
                          return (
                            <Flex
                              maxWidth={["100%", null, null, "500px"]}
                              justifyContent={["center", null, null, "flex-start"]}
                              position={["relative", null, null, "relative"]}
                              key={index}
                            >
                              <div className="icon-container">
                                {/* <EditOutlined /> */}
                                <MinusCircleOutlined
                                  className="control-icon"
                                  onClick={(e) => handleRemoveTicket(e, index)}
                                />
                              </div>

                              <WinningNumbers
                                rotateText={false || false}
                                numAsArray={item}
                                mr={[null, null, null, "null"]}
                                size="98%"
                                fontSize={
                                  isXLargerScreen
                                    ? "18px"
                                    : isLargerScreen
                                    ? "16px"
                                    : "12px"
                                }
                              />
                            </Flex>
                          );
                        })}

                        <div
                          className="buy-ticket-pick-container mt-1"
                          ref={buyTicketRef}
                        >
                          <div className="buy-ticket-pick-whiteball-container mb-1">
                            {[...Array(7)].map((_, index) => {
                              return (
                                <input
                                  key={index}
                                  min={1}
                                  max={25}
                                  type="number"
                                  className="buy-ticket-pick-input"
                                  onChange={(e) => handleTempTicket(e, index)}
                                />
                              );
                            })}
                          </div>
                          <div className="align-self-center mb-1">
                            <input
                              min={1}
                              max={20}
                              type="number"
                              className="buy-ticket-pick-input"
                              onChange={(e) => handleTempTicket(e, 7)}
                            />
                          </div>
                          <div className="align-self-center mb-1">
                            <PlusCircleOutlined
                              className="ticket-plus-icon"
                              onClick={(e) => handleAddTicket(e)}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {toggledBtn == 1 && isDisabledBuyBtn && (
                      <div className="text-end err-msg">{errMsg}</div>
                    )}

                    <div className="justify-content-between d-flex buy-ticket-font mt-3 mb-2">
                      <div><b>Ticket Price</b></div>
                      <div><b>
                        {Number(
                          (
                            (lastRound?.priceTicketInGame || 0) / LAMPORTS_PER_SOL
                          ).toLocaleString()
                        )}{" "}
                        SOL</b>
                      </div>
                    </div>

                    <div className="justify-content-between d-flex buy-ticket-font mt-3 mb-2">
                      <div><b>Total Cost</b></div>
                      <div><b>{Number(totalTicketPrice.toFixed(5)) * 1} SOL</b></div>
                    </div>

                    <div className="justify-content-between d-flex buy-ticket-font">
                      <div><b>{(discountRate*100).toFixed(2)}%</b> Bulk Purchase Discount.</div>
                      <div><b>{Number(deltaPrice.toFixed(5)) * 1} SOL</b></div>
                    </div>

                    <hr />
                    <div className="justify-content-between d-flex buy-ticket-font">
                      <div><b>You Pay</b></div>
                      <div className="font-weight-bold">
                        ~{Number(bulkPrice.toFixed(5)) * 1} SOL
                      </div>
                    </div>
                  </div>

                  <div className="buy-box-footer">
                    <div className="w-100 row">
                      <button className="buy-ticket-btn" onClick={handleConfirmModal}>
                        Buy Tickets
                      </button>
                    </div>

                    <div className="buy-ticket-description mb-3">
                      Random Ticket purchases are unique with no duplicates. Prices are set before each round starts. Purchases
                      are final. Thanks for playing.
                    </div>

                    <div>
                      {userLotteryInfo?.boughtTickets &&
                      userLotteryInfo.boughtTickets?.length > 0 ? (
                        <>
                          <h4 className="margin-none">{`You have ${userLotteryInfo?.boughtTickets?.length} tickets now`}</h4>
                          <span
                            onClick={() => handleShowMyTicketModal(true)}
                            className="ticket-link"
                          >
                            My Tickets
                          </span>
                        </>
                      ) : (
                        <h4 className="margin-none">You have no tickets yet</h4>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }

      <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-9 col-xl-9">
          <div className="history-card-header-bar mb-2 justify-content-between">
            <div className="drawn-date">
              {isLoading ? (
                <Skeleton.Input active={true} size={"default"} />
              ) : (
                <>
                  {indexedLottery &&
                    lotteryIndex > 0 &&
                    `#${lotteryIndex} | Draw: ${new Date(
                      indexedLottery?.endedAt || Date.now()
                    ).toLocaleString()}`}
                </>
              )}
            </div>
            <div className="d-flex">
              <div className="history-rounds-box">
                <h2 className="round-title">Round</h2>
                <input
                  className="round-number text-center"
                  value={lotteryIndex > 0 ? lotteryIndex : ""}
                  readOnly
                />
              </div>
              <div className="history-rounds-box ml-3">
                <>
                  <ArrowLeftOutlined
                    className={`${
                      (latestLotteryId == 0 || lotteryIndex == 1) &&
                      "disabled-btn disabled"
                    }`}
                    onClick={() => handleLotteryIndex(lotteryIndex - 1)}
                  />
                  <ArrowRightOutlined
                    className={`${
                      (latestLotteryId == 0 ||
                        lotteryIndex == latestLotteryId) &&
                      "disabled-btn disabled"
                    } ml-3`}
                    onClick={() => handleLotteryIndex(lotteryIndex + 1)}
                  />
                  <DoubleRightOutlined
                    className={`${
                      (latestLotteryId == 0 ||
                        lotteryIndex == latestLotteryId) &&
                      "disabled-btn disabled"
                    } ml-3`}
                    onClick={() => handleLotteryIndex(latestLotteryId)}
                  />
                </>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <AllHistory
                lottery={lottery}
                finishedLotteryInfo={{
                  latestLotteryId,
                  lotteryIndex,
                  indexedLottery,
                }}
              />
            </div>

            <div className="col-sm-6 col-md-6 col-lg-6">
              <UserHistory
                lottery={lottery}
                finishedLotteryInfo={{
                  latestLotteryId,
                  lotteryIndex,
                  indexedLottery,
                }}
              />
            </div>
          </div>
        </div>

        {
          !isMobile && (
            <div className="col-sm-12 col-md-12 col-lg-3 col-xl-3">
              <div className="box buy-box">
                <div className="buy-box-header justify-content-between">
                  <div className="primate-container">
                    <img src="img/primate.png" className="primate"></img>
                    <p>
                      Buy 5 Tickets or more and enter the raffle{" "}
                      <span>to win this exclusive Primate NFT!</span>
                    </p>
                  </div>
                  <div className="buy-box-title">Buy Tickets</div>
                  <div className="finished-rounds-switch-btn-container">
                    <div className="finished-rounds-switch-btn-box">
                      <button
                        className={`toggle-round-btn ${
                          toggledBtn == 0 ? "" : "toggle-non-active"
                        }`}
                        onClick={() => handleSetToggleBtn(0)}
                      >
                        Random
                      </button>
                      <button
                        className={`toggle-round-btn ${
                          toggledBtn == 0 ? "toggle-non-active" : ""
                        }`}
                        onClick={() => handleSetToggleBtn(1)}
                      >
                        Pick
                      </button>
                    </div>
                  </div>
                </div>

                <div className="buy-box-body">
                  {toggledBtn == 0 ? (
                    <div className="mb-3">
                      <div className="justify-content-between d-flex buy-ticket-font mb-1">
                        <div><b></b></div>
                        <div className="font-weight-bold"># Tickets</div>
                      </div>
                      <input
                        className="buy-ticket-amount-input text-end mb-1"
                        type="number"
                        ref={ticketCountRef}
                        defaultValue={0}
                        onInput={(e) => handleTicketCount(e)}
                      />
                      <div className="text-end buy-ticket-balance">
                        SOL Balance:{" "}
                        {user
                          ? Number((user?.balance / LAMPORTS_PER_SOL).toFixed(5)) *
                            1
                          : "-"}
                      </div>
                      {toggledBtn == 0 && isDisabledBuyBtn && (
                        <div className="text-end err-msg">{errMsg}</div>
                      )}
                    </div>
                  ) : (
                    <>
                      {ticketArray.map((item: any, index: number) => {
                        return (
                          <Flex
                            maxWidth={["100%", null, null, "500px"]}
                            justifyContent={["center", null, null, "flex-start"]}
                            position={["relative", null, null, "relative"]}
                            key={index}
                          >
                            <div className="icon-container">
                              {/* <EditOutlined /> */}
                              <MinusCircleOutlined
                                className="control-icon"
                                onClick={(e) => handleRemoveTicket(e, index)}
                              />
                            </div>

                            <WinningNumbers
                              rotateText={false || false}
                              numAsArray={item}
                              mr={[null, null, null, "null"]}
                              size="98%"
                              fontSize={
                                isXLargerScreen
                                  ? "18px"
                                  : isLargerScreen
                                  ? "16px"
                                  : "12px"
                              }
                            />
                          </Flex>
                        );
                      })}

                      <div
                        className="buy-ticket-pick-container mt-1"
                        ref={buyTicketRef}
                      >
                        <div className="buy-ticket-pick-whiteball-container mb-1">
                          {[...Array(7)].map((_, index) => {
                            return (
                              <input
                                key={index}
                                min={1}
                                max={25}
                                type="number"
                                className="buy-ticket-pick-input"
                                onChange={(e) => handleTempTicket(e, index)}
                              />
                            );
                          })}
                        </div>
                        <div className="align-self-center mb-1">
                          <input
                            min={1}
                            max={20}
                            type="number"
                            className="buy-ticket-pick-input"
                            onChange={(e) => handleTempTicket(e, 7)}
                          />
                        </div>
                        <div className="align-self-center mb-1">
                          <PlusCircleOutlined
                            className="ticket-plus-icon"
                            onClick={(e) => handleAddTicket(e)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {toggledBtn == 1 && isDisabledBuyBtn && (
                    <div className="text-end err-msg">{errMsg}</div>
                  )}

                  <div className="justify-content-between d-flex buy-ticket-font mt-3 mb-2">
                    <div><b>Ticket Price</b></div>
                    <div><b>
                      {Number(
                        (
                          (lastRound?.priceTicketInGame || 0) / LAMPORTS_PER_SOL
                        ).toLocaleString()
                      )}{" "}
                      SOL</b>
                    </div>
                  </div>

                  <div className="justify-content-between d-flex buy-ticket-font mt-3 mb-2">
                    <div><b>Total Cost</b></div>
                    <div><b>{Number(totalTicketPrice.toFixed(5)) * 1} SOL</b></div>
                  </div>

                  <div className="justify-content-between d-flex buy-ticket-font">
                    <div><b>{(discountRate*100).toFixed(2)}%</b> Bulk Purchase Discount.</div>
                    <div><b>{Number(deltaPrice.toFixed(5)) * 1} SOL</b></div>
                  </div>

                  <hr />
                  <div className="justify-content-between d-flex buy-ticket-font">
                    <div><b>You Pay</b></div>
                    <div className="font-weight-bold">
                      ~{Number(bulkPrice.toFixed(5)) * 1} SOL
                    </div>
                  </div>
                </div>

                <div className="buy-box-footer">
                  <div className="w-100 row">
                    <button className="buy-ticket-btn" onClick={handleConfirmModal}>
                      Buy Tickets
                    </button>
                  </div>

                  <div className="buy-ticket-description mb-3">
                    Random Ticket purchases are unique with no duplicates. Prices are set before each round starts. Purchases
                    are final. Thanks for playing.
                  </div>

                  <div>
                    {userLotteryInfo?.boughtTickets &&
                    userLotteryInfo.boughtTickets?.length > 0 ? (
                      <>
                        <h4 className="margin-none">{`You have ${userLotteryInfo?.boughtTickets?.length} tickets now`}</h4>
                        <span
                          onClick={() => handleShowMyTicketModal(true)}
                          className="ticket-link"
                        >
                          My Tickets
                        </span>
                      </>
                    ) : (
                      <h4 className="margin-none">You have no tickets yet</h4>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>

      <HowToPlay />

      <div
        className="modal"
        style={{ display: showConfirmModal ? "flex" : "none" }}
      >
        <div className="container">
          <div className="wrapper d-flex">
            <button
              className="closeB"
              disabled={isBuying}
              onClick={() => setShowConfirmModal(false)}
            >
              <svg width="14" height="14">
                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
              </svg>
            </button>
            <h1 className="title">Confirm to buy tickets</h1>
            <button
              className="actionB modalB"
              disabled={isBuying}
              onClick={() => handleBuyTickets()}
            >
              {isBuying ? "Buying..." : "Buy"}{" "}
              {isBuying ? <ClipLoader size={13} color="#27244f" /> : null}
            </button>
          </div>
        </div>
        <div className="overlay"></div>
      </div>

      {showMyTicketModal && (
        <div
          className="modal"
          style={{ display: showMyTicketModal ? "flex" : "none" }}
        >
          <div className="container my-ticket-modal-container">
            <div className="wrapper d-flex my-ticket-modal-wrap">
              <button
                className="closeB"
                onClick={() => setShowMyTicketModal(false)}
              >
                <svg width="14" height="14">
                  <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
                </svg>
              </button>
              <h1 className="title">My tickets bought</h1>
              <div className="ticket-numbers-wrap">
                {userLotteryInfo?.boughtTickets &&
                  userLotteryInfo.boughtTickets.length > 0 && (
                    <Virtuoso
                      data={userLotteryInfo?.boughtTickets}
                      ref={virtuoso}
                      itemContent={(index, item) => {
                        return (
                          <Flex
                            maxWidth={["240px", null, null, "100%"]}
                            justifyContent={[
                              "center",
                              null,
                              null,
                              "flex-start",
                            ]}
                            key={index}
                          >
                            <WinningNumbers
                              rotateText={false}
                              numAsArray={item}
                              mr={[null, null, null, "32px"]}
                              size="90%"
                              fontSize={
                                isXLargerScreen
                                  ? "24px"
                                  : isLargerScreen
                                  ? "16px"
                                  : "12px"
                              }
                            />
                          </Flex>
                        );
                      }}
                    />
                  )}
              </div>
            </div>
          </div>
          <div className="overlay"></div>
        </div>
      )}
    </div>
  );
}

export default LotteryGame;
