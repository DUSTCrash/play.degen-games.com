import React, { useEffect, useMemo } from "react";

// import Navbar from './components/Navbar'
// import ActiveGames from './components/ActiveGames'

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import "./css/wallet.css";
import Navbar from "./components/Navbar";
import ActiveGames from "./components/ActiveGames";
import DiceGames from "./components/DiceGame";
import LotteryGame from "./components/LotteryGame";
import CoinFlipGames from "./components/CoinFlipGame";
import AdminPanelForStartLottery from "./components/AdminForStartLottery";
import LeaderBoard from "./components/LeaderBoard";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes, Navigate, Router, } from "react-router-dom";
import Profile from "./components/Profile";
import ScrollToTop from "./ScrollToTop";
import MyProfile from "./components/MyProfile";
import LeftSide from "./components/LeftSide";
import RightSide from "./components/RightSide";
import Dashboard from "./components/Dashboard";

import Svg from "react-inlinesvg";
import FullUserInfo from "./components/FullUserInfo";
import { Outlet } from 'react-router-dom';

const network = WalletAdapterNetwork.Testnet;

function App() {
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [getPhantomWallet(), getSlopeWallet(), getSolflareWallet()],
    [network]
  );

  const dispatch = useDispatch();

  window.addEventListener("load", function () {
    //@ts-ignore
    if (window.solana) {
      //@ts-ignore
      window.solana.on("accountChanged", function () {
        console.log("account has been changed");
      });
    }
  });

  useEffect(() => {
    const gameSocket = io("/game");
    const userSocket = io("/user");
    const lotterySocket = io("/lottery");
    const coinflipSocket = io("/coinflip");
    const messageSocket = io("/message");

    dispatch({ type: "LOAD_GAME_SOCKET", payload: gameSocket });
    dispatch({ type: "LOAD_USER_SOCKET", payload: userSocket });
    dispatch({ type: "LOAD_LOTTERY_SOCKET", payload: lotterySocket });
    dispatch({ type: "LOAD_COINFLIP_SOCKET", payload: coinflipSocket });
    dispatch({ type: "LOAD_MESSAGE_SOCKET", payload: messageSocket });
  }, []);

  const AppLayout = () => (
    <>
      <Navbar />
      <ScrollToTop />
      <div className="Body">
        <LeftSide />
        <Outlet />
        <RightSide />
      </div>
    </>
  );

  const DefaultLayout = () => (
    <>
      <Navbar />
      <ScrollToTop />
      <div className="Body">
        <Outlet />
      </div>
    </>
  );

  return (
    <div className="App">
      <Svg className="neoneffect" src="/img/neoneffect.svg" />
      <Svg className="neoneffect effectbottom" src="/img/neoneffect.svg" />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/dashboard" element={<DefaultLayout />} >
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                <Route path="/lottery" element={<DefaultLayout />} >
                  <Route path="/lottery" element={<LotteryGame />} />
                </Route>
                <Route path="/leaderboard" element={<DefaultLayout />} >
                  <Route path="/leaderboard" element={<LeaderBoard />} />
                </Route>
                <Route path="/coinflip" element={<DefaultLayout />} >
                  <Route path="/coinflip" element={<CoinFlipGames />} />
                </Route>
                <Route path="/" element={<AppLayout />} >
                  <Route path="/" element={<Navigate to="/rps" />} />
                  <Route path="/rps" element={<ActiveGames />} />
                  <Route path="/dice" element={<DiceGames />} />
                  <Route path="/u/:publicKey" element={<Profile />} />
                  <Route path="/uInfo/:publicKey" element={<FullUserInfo />} />
                  <Route path="/admin" element={<AdminPanelForStartLottery />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WalletModalProvider>
          <ToastContainer autoClose={1500} />
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
