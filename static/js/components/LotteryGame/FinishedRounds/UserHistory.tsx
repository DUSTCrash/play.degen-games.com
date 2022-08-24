import { useState, useEffect, useRef, Fragment } from "react";
import { Virtuoso } from "react-virtuoso";
import { Skeleton } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  UpOutlined,
  DownOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

import { Flex, useMatchBreakpoints } from "@pancakeswap/uikit";
import WinningNumbers from "../WinningNumbers";
import { IInitialState } from "../../../reducers/lottery";

import "./index.scss";
import Lottery from "../../../interfaces/Lottery";
import LotteryGame from "../../../interfaces/LotteryGame";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface IProps {
  lottery: IInitialState;
  finishedLotteryInfo: {
    latestLotteryId: number;
    lotteryIndex: number;
    indexedLottery: Lottery;
  };
}

const UserHistory = (props: IProps) => {
  const [userLotteryInfo, setUserLotteryInfo] = useState<LotteryGame>();
  const [isLoading, setLoading] = useState(false);

  const { isLg, isXl, isXxl } = useMatchBreakpoints();
  const isLargerScreen = isLg;
  const isXLargerScreen = isXl || isXxl;

  const { lottery, finishedLotteryInfo } = props;
  const { finishedRounds } = lottery;
  const { latestLotteryId, lotteryIndex, indexedLottery } = finishedLotteryInfo;
  const wallet = useWallet();

  const virtuoso = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setLoading(false);
      } catch (_) {
        setLoading(false);
      }
    };

    initialize();
  }, [finishedRounds, finishedLotteryInfo]);

  useEffect(() => {
    const getUserLotteryInfo = async () => {
      try {
        if (indexedLottery._id && wallet && wallet.publicKey) {
          setLoading(true);

          const config = {
            params: {
              lotteryId: indexedLottery._id,
            },
          };
          const userLotteryInfo = await axios.get(
            "/api/lottery-game/userLotteryInfo",
            config
          );

          setUserLotteryInfo(userLotteryInfo.data);

          setLoading(false);
        }
      } catch (_) {
        setLoading(false);
      }
    };

    getUserLotteryInfo();
  }, [indexedLottery, wallet]);

  return (
    <div className="finished-rounds align-self-center">
      <div className="finished-rounds-container">
        <div className="finished-rounds-box">
          <div className="finished-rounds-history-container box">
            <div className="finished-rounds-history-box users-history-box">
              <div className="history-card-header">
                <div className="history-card-header-bar">
                  <div className="history-rounds-box">
                    <h2 className="round-title">Your History</h2>
                  </div>
                </div>
              </div>

              <div
                className="history-card-footer"
                style={{ borderTop: "none" }}
              >
                <div className="history-card-details">
                  <div className="row text-start justify-content-center scroll-over-y-1">
                    <h2 className="text-center">Your winning tickets</h2>
                    {isLoading ? (
                      <Skeleton.Input active={true} size={"large"} />
                    ) : userLotteryInfo?.matchingTicketIdsPerBracket &&
                      userLotteryInfo.matchingCountPerBracket.reduce(
                        (p, c) => p + c,
                        0
                      ) > 0 ? (
                      userLotteryInfo.matchingCountPerBracket.map(
                        (item, index) => {
                          return (
                            item > 0 && (
                              <Fragment key={index}>
                                <div>
                                  <h3 className="margin-none">{`Division ${
                                    index + 1
                                  }: `}</h3>
                                </div>

                                {userLotteryInfo.matchingTicketIdsPerBracket[
                                  index
                                ].map((ticket, i) => {
                                  return (
                                    userLotteryInfo?.matchingNumberIndexArray[
                                      index
                                    ] &&
                                    userLotteryInfo?.matchingNumberIndexArray[
                                      index
                                    ].length > 0 && (
                                      <Flex
                                        maxWidth={["240px", null, null, "100%"]}
                                        justifyContent={[
                                          "center",
                                          null,
                                          null,
                                          "flex-start",
                                        ]}
                                        key={i}
                                      >
                                        <WinningNumbers
                                          rotateText={false}
                                          numAsArray={ticket}
                                          indexArray={
                                            userLotteryInfo
                                              ?.matchingNumberIndexArray[index][
                                              i
                                            ]
                                          }
                                          mr={[null, null, null, "32px"]}
                                          size="95%"
                                          fontSize={
                                            isXLargerScreen
                                              ? "24px"
                                              : isLargerScreen
                                              ? "16px"
                                              : "12px"
                                          }
                                        />
                                      </Flex>
                                    )
                                  );
                                })}
                              </Fragment>
                            )
                          );
                        }
                      )
                    ) : (
                      <h3 className="text-center dark-color margin-none">
                        Nothing
                      </h3>
                    )}
                  </div>
                </div>
              </div>

              <div className="history-card-body">
                <div
                  className={
                    userLotteryInfo?.boughtTickets
                      ? "ticket-bought-container w-100 mb-5"
                      : ""
                  }
                >
                  <div>
                    <h2 className="winning-number-title-text-2 margin-top-none">
                      Tickets you bought
                    </h2>
                  </div>

                  {isLoading ? (
                    <Skeleton.Input active={true} size={"large"} />
                  ) : userLotteryInfo?.boughtTickets ? (
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
                              size="95%"
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
                  ) : (
                    // userLotteryInfo?.boughtTickets.map((item, index) => {
                    //   return (
                    //     <Flex
                    //       maxWidth={["240px", null, null, "100%"]}
                    //       justifyContent={[
                    //         "center",
                    //         null,
                    //         null,
                    //         "flex-start",
                    //       ]}
                    //       key={index}
                    //     >
                    //       <WinningNumbers
                    //         rotateText={false}
                    //         numAsArray={item}
                    //         mr={[null, null, null, "32px"]}
                    //         size="80%"
                    //         fontSize={
                    //           isXLargerScreen
                    //             ? "24px"
                    //             : isLargerScreen
                    //               ? "16px"
                    //               : "12px"
                    //         }
                    //       />
                    //     </Flex>
                    //   );
                    // })
                    <h3 className="dark-color">Nothing</h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
