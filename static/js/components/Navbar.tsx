import React, { useEffect, useState } from "react";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import axios from "axios";
import Confetti from "react-confetti";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Message,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "../css/Navbar.scss";
import "../css/Modal.css";
import "../css/Dropdown.css";
import User from "../interfaces/User";
import { CombinedReducer } from "../store";
import Svg from "react-inlinesvg";

import { Sockets } from "../reducers/sockets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { NavLink } from "react-router-dom";
import Socials from "./Socials";
import { shortenAddress } from "../utils/shortenAddress";
import { displayName } from "../utils/displayName";

const messageToSign = Uint8Array.from(Buffer.from("Login to the Degen Games"));

const connection = new Connection(
  "https://floral-fragrant-dew.solana-mainnet.quiknode.pro/a283c07ef8da1becc2b27461514aed301e81ee60/",
  "confirmed"
);

const PUB_KEY = process.env.REACT_APP_PUBKEY || "";

const servicePublicKey = new PublicKey(
  //"Degend6MwnmmXx1uiFPp9UqURUN95BZxUYKLUHZnqUHq"
  PUB_KEY
);

function Navbar() {
  const wallet = useWallet();
  const [isAskedToVerify, setIsAskedToVerify] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [nicknameModalOpen, setnicknameModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | null>(0);
  const [depositStatus, setDepositStatus] = useState("none");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [balanceChanged, setBalanceChanged] = useState("0");
  const [withdrawStatus, setWithdrawStatus] = useState("none");
  const [withdrawTxHash, setWithdrawTxHash] = useState("");
  const [prevBalance, setPrevBalance] = useState<number | null>(null);

  const [seconds, setSeconds] = useState<number>(0);
  const [isWithdrawTimerStarted, setIsWithdrawTimerStarted] = useState<boolean>(false);

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
  const sockets = useSelector<CombinedReducer, Sockets>(
    (state) => state.sockets
  );

  const connectUser = async (user: User) => {
    dispatch({ type: "LOAD_WALLET", payload: wallet });
    dispatch({ type: "LOAD_USER", payload: user });
    connectSocket(user);
    return setIsLoggedIn(true);
  };

  const connectSocket = (user: User) => {
    if (!(sockets && sockets.user)) return;

    sockets.user.emit("subscribeToProfile", user._id);
    sockets.user.on("balanceChange", (amount: number, fromDeposit: boolean) => {
      dispatch({ type: "UPDATE_USER_BALANCE", payload: amount });

      if (fromDeposit) {
        setMenuOpen(false);
        setDepositStatus("validated");
      }
    });
  };

  const inputDepositAmount = (input: string) => {
    if (!input) return setDepositAmount(null);

    if (Number(input) >= 0) setDepositAmount(Number(input) * LAMPORTS_PER_SOL);
    else setDepositAmount(0);
  };
  const inputWithdrawAmount = (input: string) => {
    if (Number(input) >= 0) setWithdrawAmount(Number(input) * LAMPORTS_PER_SOL);
    else setWithdrawAmount(0);
  };

  const inputNickname = (input: string) => {
    setNickname(input);
  };

  const deposit = async () => {
    if (!(wallet && wallet.publicKey && depositAmount)) return;

    if (depositAmount < 0.01 * LAMPORTS_PER_SOL)
      return toast.error("Minimum deposit amount is 0.01");

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: servicePublicKey,
          lamports: depositAmount,
        })
      );
      await wallet.sendTransaction(transaction, connection);
      console.log({ transaction });
      setDepositStatus("sent");
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
      setDepositStatus("failed");
    }
  };

  const requestWithdraw = async () => {
    if (!(wallet && wallet.publicKey && withdrawAmount)) return;

    if (withdrawAmount < 0.01 * LAMPORTS_PER_SOL)
      return toast.error("Minimum withdraw is 0.01 SOLs");
    if (withdrawAmount > user.balance)
      return toast.error("Balance needs to be higher than the withdraw amount");

    try {
      setWithdrawStatus("withdrawing");
      setIsWithdrawTimerStarted(true);
      setSeconds(60);
      const { txhash } = (
        await axios.post("/api/u/requestWithdraw", { amount: withdrawAmount })
      ).data;
      setWithdrawStatus("withdrawn");
      setWithdrawTxHash(txhash);
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
    }
  };

  const changeNickname = async () => {
    if (nickname.length > 20) return toast.error("Maximum charachter is 20");

    try {
      await axios.post("/api/u/edit", { username: nickname });
      setNickname(nickname);
      setnicknameModalOpen(false);
      toast.success("Nickname changed");
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
    }
  };

  const openWithdrawModel = async () => {
    setWithdrawModalOpen(true);
  };

  const opennicknameModalOpen = async () => {
    setnicknameModalOpen(true);
  };

  const onCompleteTimer = () => {
    if(isWithdrawTimerStarted) {
      if(withdrawStatus !== "withdrawn") {
        setWithdrawStatus("unknown");
      }
    }
  }

  // get screeen size whenever resize window
  useEffect(() => {
    window.addEventListener('resize', setDimension);

    return (() => {
      window.removeEventListener('resize', setDimension);
    })
  }, [screenSize]);

  useEffect(() => {
    let myInterval: any;

    if(isWithdrawTimerStarted) {
      myInterval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }

        if (seconds == 0) {
          clearInterval(myInterval);
          onCompleteTimer();
        }
      }, 1000)
    } else {
      clearInterval(myInterval);
    }

    return () => {
      clearInterval(myInterval);
    };
  }, [seconds]);

  useEffect(() => {
    const signAndAuth = async (wallet: WalletContextState) => {
      try {
        if (
          !wallet ||
          !wallet.signMessage ||
          !wallet.publicKey ||
          isAskedToVerify
        )
          return;
        setIsAskedToVerify(true);

        let { authenticated, user } = (await axios.get("/api/auth/state")).data;
        console.log({ authenticated });
        if (authenticated) {
          if (user.publicKey === wallet.publicKey.toBase58()) {
            await connectUser(user);
            return;
          }
          console.log("PUBLIC KEYS ARE NOT THE SAME!");
          await axios.get("/api/auth/logout");
        }

        const publicKey = wallet.publicKey.toBytes();
        const signedMessage = await wallet.signMessage(messageToSign);

        user = (
          await axios.post(
            "/api/auth/login",
            {
              publicKey: Array.from(publicKey),
              signedMessage: Array.from(signedMessage),
            },
            { withCredentials: true }
          )
        ).data;

        await connectUser(user);
      } catch (e: any) {
        toast.error(e?.response?.data?.message?.toString());
        console.log(e);
      }
    };

    signAndAuth(wallet);
  }, [wallet]);

  useEffect(() => {
    if (!user) return;
    if (prevBalance != null) {
      console.log("Balance Update!", user.balance - prevBalance);
      if (user.balance - prevBalance >= 0) {
        setBalanceChanged("1");
      } else {
        setBalanceChanged("-1");
      }
    }
    setPrevBalance(user.balance);
    setNickname(user.username || "");
  }, [user?.balance]);

  return (
    <div className={`Navbar ${isMobile ? 'Mobile-Navbar' : ''}`}>
      {
        isMobile && (
          <a href="https://www.degen-games.com" className="logo">
            <img src="/logo.png" />
          </a>
        )
      }

      <div className={`nav-left ${isMobile && 'mobile-nav-left'}`}>
        {
          !isMobile && (
            <a href="https://www.degen-games.com" className="logo">
              <img src="/logo.png" />
            </a>
          )
        }

        {/* 1.1. Added two images with a class "NavbarGamesIcon" */}
        <div className={`GameSwitcher ${isMobile && 'mobile-game-switcher'}`}>
          <img className="NavbarGamesIcon" src="/img/rock_mirrored.png"></img>
          <a href="/rps">RPS</a>
          <img className="NavbarGamesIcon" src="/img/Dice4.png"></img>
          <a href="/dice">DICE</a>
          <img
            className="NavbarGamesIcon"
            src="/img/solballnumber.png"
            id="powerball"
          ></img>
          <a href="/lottery">Solanaball</a>

          <img className="NavbarGamesIcon" src="/img/coin-standard-large.svg" />
          <a href="/coinflip">Coinflip</a>
        </div>
      </div>

      <div className={`navbar ${isMobile && 'mobile-status-bar'}`}>
        <Link to={"/leaderboard"}>
          <div>
            <img
              src="/img/leaderboard-icon2.png"
              className="leaderboard-icon"
            />
          </div>
        </Link>
        <Link to={"/dashboard"}>
          <div className="dashboard-icon">
            <img src="/img/Dashboard_Icon.png" />
          </div>
        </Link>

        {user ? (
          <div className="balance">
            <h4
              data-balancechanged={balanceChanged}
              onAnimationEnd={() => setBalanceChanged("0")}
              className="amount"
            >
              {Number((user?.balance / LAMPORTS_PER_SOL).toFixed(5))} SOL
            </h4>
          </div>
        ) : null}
        {user ? (
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className={menuOpen ? "toggleMenu open" : "toggleMenu"}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : null}
        {isLoggedIn && user ? (
          <div className="user">
            <button
              onClick={() => {
                setDepositModalOpen(true);
                setDepositStatus("none");
              }}
              className="depositB"
            >
              Deposit
            </button>
            <button
              onClick={() => {
                openWithdrawModel();
                setWithdrawStatus("none");
              }}
              className="withdrawB"
            >
              Withdraw
            </button>
            <button
              onClick={() => opennicknameModalOpen()}
              className="withdrawB"
            >
              Nickname
            </button>
            <Link to={`/u/${user.publicKey.toString()}`} className="profile">
              <h4 className="name">{displayName(user)}</h4>
            </Link>
          </div>
        ) : (
          <div className="multiButton">
            <WalletMultiButton />
          </div>
        )}
      </div>
      {depositStatus === "validated" && depositModalOpen === true ? (
        <Confetti tweenDuration={1000} width={screenSize.dynamicWidth} height={screenSize.dynamicHeight} />
      ) : (
        ""
      )}

      {
        depositModalOpen && (
          <div
            className="modal"
            style={{ display: depositModalOpen ? "flex" : "none" }}
          >
            <div className="container">
              <div className="wrapper">
                <button
                  className="closeB"
                  onClick={() => setDepositModalOpen(false)}
                >
                  <svg width="14" height="14">
                    <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
                  </svg>
                </button>
                <h1 className="title">Deposit</h1>
                {depositStatus === "none" ? (
                  <>
                    <input
                      autoFocus
                      type="number"
                      value={
                        depositAmount === null
                          ? ""
                          : depositAmount / LAMPORTS_PER_SOL
                      }
                      onChange={(event) =>
                        inputDepositAmount((event.target as HTMLInputElement).value)
                      }
                    />
                    <button className="actionB modalB" onClick={() => deposit()}>
                      Deposit
                    </button>
                  </>
                ) : depositStatus === "sent" ? (
                  <>
                    <h3 className="status">
                      Validating <ClipLoader size={13} color="#443f89" />
                    </h3>
                  </>
                ) : depositStatus === "validated" ? (
                  <div>
                    <h3 className="status">Successfully validated</h3>
                  </div>
                ) : (
                  <h3 className="status">Failed</h3>
                )}
              </div>
            </div>
            <div className="overlay"></div>
          </div>
        )
      }

      {
        withdrawModalOpen && (
          <div
            className="modal"
            style={{ display: withdrawModalOpen ? "flex" : "none" }}
          >
            <div className="container">
              <div className="wrapper">
                <button
                  className="closeB"
                  onClick={() => { setWithdrawModalOpen(false); setIsWithdrawTimerStarted(false); }}
                >
                  <svg width="14" height="14">
                    <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
                  </svg>
                </button>
                {
                  withdrawStatus !== 'unknown' ? (
                    <h1 className="title">Withdraw</h1>
                  ) : (
                    <h1 className="title">Withdraw<br />Unknown</h1>
                  )
                }

                {withdrawStatus === "none" ? (
                  <div className="withdrawBox">
                    <input
                      autoFocus
                      type="number"
                      value={withdrawAmount / LAMPORTS_PER_SOL}
                      onChange={(event) =>
                        inputWithdrawAmount(
                          (event.target as HTMLInputElement).value
                        )
                      }
                    />
                    <button
                      className="actionB modalB"
                      onClick={() => requestWithdraw()}
                    >
                      Withdraw
                    </button>
                  </div>
                ) : withdrawStatus === "withdrawing" ? (
                  <div className="withdrawBox">
                    <h2>Withdrawing:<br />{withdrawAmount / LAMPORTS_PER_SOL} SOL</h2>
                    <button className="actionB" disabled>
                      <span className="withdrawLabel">Withdraw</span>{" "}
                      <ClipLoader size={13} color="#27244f" />
                    </button>
                  </div>
                ) : withdrawStatus === "withdrawn" ? (
                  <div className="withdrawBox">
                    <h2 className="green-color">
                      Successfully <br />
                    </h2>
                    <h2>Withdrawn: <br />{withdrawAmount / LAMPORTS_PER_SOL} SOL</h2>
                    <a
                      target="_blank"
                      href={`https://solscan.io/tx/${withdrawTxHash}`}
                    >
                      See the transaction
                    </a>
                  </div>
                ) : withdrawStatus === "unknown" ? (
                  <div className="withdrawBox">
                    <h3>Please check your<br /> transactions.</h3>
                    <h3>Open a ticket if you<br /> require support</h3>
                  </div>
                ) : (
                  <h3 className="status">Failed</h3>
                )}
              </div>
            </div>
            <div className="overlay"></div>
          </div>
        )
      }

      {
        nicknameModalOpen && (
          <div
            className="modal"
            style={{ display: nicknameModalOpen ? "flex" : "none" }}
          >
            <div className="container">
              <div className="wrapper">
                <button
                  className="closeB"
                  onClick={() => setnicknameModalOpen(false)}
                >
                  <svg width="14" height="14">
                    <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
                  </svg>
                </button>
                <h1 className="title"> Nickname</h1>

                <div className="withdrawBox">
                  <input
                    type="text"
                    value={nickname}
                    // autoFocus
                    onChange={e => setNickname(e.target.value)
                    }
                  />
                  <button
                    className="actionB modalB"
                    onClick={() => changeNickname()}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
            <div className="overlay"></div>
          </div>
        )
      }

      <div style={{ display: menuOpen ? "flex" : "none" }} className="menu">
        {user ? (
          <div className="navLinks">
            <button
              onClick={() => {
                setDepositModalOpen(true);
                setDepositStatus("none");
              }}
              className="mobile-nav-button"
            >
              <img className="icon" src="/img/deposit.png" />
              <p className="title">Deposit</p>
            </button>
            <button
              onClick={() => {
                setWithdrawModalOpen(true);
                setWithdrawStatus("none");
              }}
              className="mobile-nav-button"
            >
              <img className="icon" src="/img/withdraw.png" />
              <p className="title">Withdraw</p>
            </button>
            <button
              onClick={() => setnicknameModalOpen(true)}
              className="mobile-nav-button"
            >
              <p className="title">Nickname</p>
            </button>
          </div>
        ) : null}
        <Socials />
      </div>
    </div>
  );
}

export default Navbar;
function useWindowSize(): { width: any; height: any } {
  throw new Error("Function not implemented.");
}
