import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useEffect } from "react";
import Svg from "react-inlinesvg";
import { CoinflipFaceEnum } from ".";
import CoinflipGame from "../../interfaces/CoinflipGame";

interface IProps {
  position: string;
  currentUsersInfo: CoinflipGame[] | undefined;
  isCompleted: boolean;
  winningFace: CoinflipFaceEnum;
  isMobile?: boolean;
}

const SideBar = (props: IProps) => {
  const { position, currentUsersInfo, isCompleted, winningFace, isMobile } = props;
  const itemFilter =
    position == "left" ? CoinflipFaceEnum.Head : CoinflipFaceEnum.Tail;
  const filteredUsersInfo = (currentUsersInfo || []).filter(
    (x) => x.bettingFace == itemFilter
  );
  useEffect(() => {
    console.log("init sidebar in coinflip");
  }, []);

  return (
    <div
      className={`coinflip-sidebar ${position} ${
        itemFilter == winningFace && "win-board"
      }`}
    >
      <div className="total-status-bar">
        <div className="player-avatar-container">
          <Svg src={`./img/user-group-${position}.svg`} />
        </div>
        <div
          className={`player-name player-list-font side-bar-${position}-font`}
        >
          {filteredUsersInfo.length}
        </div>
        <div
          className={`player-betting-amount player-list-font side-bar-${position}-font`}
        >
          {filteredUsersInfo.reduce(
            (total, obj) => total + obj.bettingAmount,
            0
          ) / LAMPORTS_PER_SOL}
        </div>
        <div className="sol-logo-container">
          <Svg src={`./img/sol-logo-${position}.svg`} />
        </div>
      </div>
      <div className="coinflip-player-group">
        {filteredUsersInfo &&
          filteredUsersInfo.map((item, index) => {
            return (
              <div className="coinflip-player-list" key={index}>
                <div className="player-avatar-container">
                  <Svg src="./img/user-avatar.svg" />
                </div>
                <div
                  className={`player-name player-list-font ${
                    isCompleted &&
                    item.bettingFace == winningFace &&
                    "green-color"
                  }`}
                >
                  {
                    isMobile ? (
                      item.player.username
                        ? item.player.username.length > 4
                          ? String(item.player.username).substring(0, 4) + "..."
                          : item.player.username
                        : String(item.player.publicKey).substring(0, 2) +
                          "..." +
                          String(item.player.publicKey).substring(42)
                    ) : (
                      item.player.username
                        ? item.player.username.length > 12
                          ? String(item.player.username).substring(0, 12) + "..."
                          : item.player.username
                        : String(item.player.publicKey).substring(0, 4) +
                          "..." +
                          String(item.player.publicKey).substring(40)
                    )
                  }
                </div>
                <div className="player-betting-amount player-list-font">
                  {(item.bettingAmount || 0) / LAMPORTS_PER_SOL}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SideBar;
