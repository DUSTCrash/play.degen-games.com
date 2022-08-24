import { useState, useEffect } from "react";
import { Skeleton } from "antd";

import { Flex, useMatchBreakpoints } from "@pancakeswap/uikit";
import WinningNumbers from "../WinningNumbers";
import { IInitialState } from "../../../reducers/lottery";

import "./index.scss";
import Lottery from "../../../interfaces/Lottery";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface IProps {
  lottery: IInitialState;
  finishedLotteryInfo: {
    latestLotteryId: number;
    lotteryIndex: number;
    indexedLottery: Lottery;
  };
}

const AllHistory = (props: IProps) => {
  const [isLoading, setLoading] = useState(false);

  const { isLg, isXl, isXxl } = useMatchBreakpoints();
  const isLargerScreen = isLg;
  const isXLargerScreen = isXl || isXxl;

  const { lottery, finishedLotteryInfo } = props;
  const { finishedRounds } = lottery;
  const { latestLotteryId, lotteryIndex, indexedLottery } = finishedLotteryInfo;

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

  return (
    <div className="finished-rounds align-self-center">
      <div className="finished-rounds-container">
        <div className="finished-rounds-box">
          <div className="finished-rounds-history-container box">
            <div className="finished-rounds-history-box">
              <div className="history-card-header">
                <div className="history-card-header-bar">
                  <div className="history-rounds-box">
                    <h2 className="round-title">All History</h2>
                  </div>
                </div>
              </div>

              <div className="history-card-body">
                {latestLotteryId > 0 ? (
                  <>
                    {lotteryIndex >= 1 && lotteryIndex == latestLotteryId && (
                      <div className="history-card-ribbon">
                        <div>Latest</div>
                      </div>
                    )}
                    <div className={"winning-number-container"}>
                      <div className="winning-number-title">
                        <h2 className="winning-number-title-text-1">
                          Winning Number
                        </h2>
                      </div>

                      {isLoading ? (
                        <Skeleton.Input active={true} size={"large"} />
                      ) : indexedLottery ? (
                        <Flex
                          maxWidth={["100%", null, null, "500px"]}
                          justifyContent={["center", null, null, "flex-start"]}
                        >
                          <WinningNumbers
                            rotateText={false || false}
                            numAsArray={indexedLottery.winningNumber}
                            mr={[null, null, null, "32px"]}
                            size="100%"
                            fontSize={
                              isXLargerScreen
                                ? "24px"
                                : isLargerScreen
                                ? "16px"
                                : "12px"
                            }
                          />
                        </Flex>
                      ) : (
                        <h3 className="dark-color">Nothing</h3>
                      )}
                    </div>
                  </>
                ) : (
                  <h3>No Data</h3>
                )}
              </div>

              <div className="history-card-footer">
                <div className="history-card-details">
                  <div className="row mb-4 text-center">
                    <div>
                      <h2 className="margin-none">
                        Prize Pot:{" "}
                        <span className="default-font-color2">
                          {(indexedLottery.ticketCount || 0) > 0
                            ? (
                                ((indexedLottery.amountCollectedInGame || 0) -
                                  ((indexedLottery.amountCollectedInGame || 0) -
                                    (indexedLottery.startLotteryAmount || 0)) *
                                    0.2) /
                                LAMPORTS_PER_SOL
                              ).toLocaleString()
                            : (
                                (indexedLottery.amountCollectedInGame || 0) /
                                LAMPORTS_PER_SOL
                              ).toLocaleString()}
                          SOL
                        </span>
                      </h2>
                    </div>
                    <div className="roboto">
                      Match the winning number to share prizes.
                    </div>
                  </div>
                  <div className="row text-center">
                    {indexedLottery &&
                      Array.isArray(indexedLottery?.rewardBreadkdown) && indexedLottery?.rewardBreadkdown?.map((item, index) => {
                        return (
                          <div
                            className="mb-3 col-lg-4 col-md-6 col-sm-6"
                            key={index}
                          >
                            <div className="ticket-match-category">{`Division ${
                              index + 1
                            } (${item}%)`}</div>
                            <div className="reward-ticket-amount">
                              <span>
                                {(indexedLottery?.ticketCount || 0) > 0
                                  ? (
                                      (((indexedLottery?.amountCollectedInGame ||
                                        0) -
                                        ((indexedLottery?.amountCollectedInGame ||
                                          0) -
                                          (indexedLottery?.startLotteryAmount ||
                                            0)) *
                                          0.2) *
                                        item) /
                                      100 /
                                      LAMPORTS_PER_SOL
                                    ).toLocaleString()
                                  : (
                                      ((indexedLottery?.amountCollectedInGame ||
                                        0) *
                                        item) /
                                      100 /
                                      LAMPORTS_PER_SOL
                                    ).toLocaleString()}
                              </span>
                            </div>
                            <div className="reward-per-bracket">
                              <span>
                                {(
                                  (indexedLottery?.solPerBracket || [
                                    ...Array(
                                      indexedLottery?.rewardBreadkdown?.length
                                    ).fill(0),
                                  ])[index] / LAMPORTS_PER_SOL
                                ).toLocaleString()}{" "}
                                SOL each
                              </span>
                            </div>
                            <div className="count-winners-per-bracket">
                              <span>
                                {
                                  (indexedLottery?.countWinnersPerBracket || [
                                    ...Array(
                                      indexedLottery?.rewardBreadkdown?.length
                                    ).fill(0),
                                  ])[index]
                                }{" "}
                                Winners
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllHistory;
