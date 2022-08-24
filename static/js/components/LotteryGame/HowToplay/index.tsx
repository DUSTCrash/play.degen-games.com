import { NavLink } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import { Box, Flex, Text } from "@pancakeswap/uikit";
import { BallWithNumber } from "../svgs";

import Divider from "../Divider";
import "./index.scss";

const HowToPlay = () => {
  const ballSize = "28px";
  const fontSize = "18px";

  const winningCombination = [
    {
      level: 1,
      combination: "7 winning numbers + the Solanaball",
      odds: "1:134,490,400",
      division: "40% of the prize pool",
    },
    {
      level: 2,
      combination: "7 winning numbers",
      odds: "1:7,078,443",
      division: "1.1% of the prize pool",
    },
    {
      level: 3,
      combination: "6 winning numbers + the Solanaball",
      odds: "1:686,176",
      division: "1.1% of the prize pool",
    },
    {
      level: 4,
      combination: "6 winning numbers",
      odds: "1:36,115",
      division: "2% of the prize pool",
    },
    {
      level: 5,
      combination: "5 winning numbers",
      odds: "the Solanaball",
      division: "1.5% of the prize pool",
    },
    {
      level: 6,
      combination: "4 winning numbers + the Solanaball",
      odds: "1:1,173",
      division: "9.7% of the prize pool",
    },
    {
      level: 7,
      combination: "5 winning numbers",
      odds: "1:892",
      division: "7.6% of the prize pool",
    },
    {
      level: 8,
      combination: "3 winning numbers + the Solanaball",
      odds: "1:188",
      division: "15% of the prize pool",
    },
    {
      level: 9,
      combination: "2 winning numbers + the Solanaball",
      odds: "1:66",
      division: "22% of the prize pool",
    },
  ];

  return (
    <>
      <div className="how-to-play">
        <div className="how-to-play-container">
          {/* Title */}
          <div className="w-100 how-to-play-title">
            <h2>How To Play</h2>
            <div>
              If <b>your lucky numbers</b> match the winning numbers we draw, <b>You Win!</b>  
            </div>
            <div></div>
          </div>

          {/* Play Step */}
          <div className="how-to-play-step">
            <div className="how-to-play-step-card box">
              <div className="how-to-play-step-card-container">
                <div className="step-number">Step 1</div>
                <h2 className="step-title">Buy Tickets</h2>
                <div className="step-description">
                  Prices are set when the round starts.
                </div>
              </div>
            </div>
            <div className="how-to-play-step-card box">
              <div className="how-to-play-step-card-container">
                <div className="step-number">Step 2</div>
                <h2 className="step-title">Wait for the Draw</h2>
                <div className="step-description">
                  There is one draw every week.
                </div>
              </div>
            </div>
            <div className="how-to-play-step-card box">
              <div className="how-to-play-step-card-container">
                <div className="step-number">Step 3</div>
                <h2 className="step-title">Check for Prizes</h2>
                <div className="step-description">
                  Check your tickets to see if you won!
                  Balances will be added automatically.
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Winning Criteria */}
          <div className="winning-criteria">
            <div className="winning-criteria-description">
              <h2 className="winning-criteria-title-1">Winning Criteria</h2>
              {/* <h2 className="winning-criteria-title-2">The digits on your ticket must match in the correct order to win.</h2> */}
              <div className="winning-criteria-contents-mb">
                Solanaball has 7 main numbers and the unique Solanaball. The 7
                main numbers are randomly drawn from a a selection of balls
                numbered from 1 to 35. 
                
                The all-important Solanaball is chosen from a different random selection
                of balls numbered from 1 to 20. 
                
                To win Division 1, you must match all 7 main numbers and the
                Solanaball in any one game line.
                
                The numbers can be in any order, you just need to have them all to win.
                
                However, you don’t have to match every single number to win in another
                Division in Solanaball. 
                
                You just have to match at least 2 main numbers plus the Solanaball number
                and you could win a share in the Division 9 prize. 
                
                For more information on Solanaball winning combinations for all 9 Solanaball Divisions 
                take a look at the table below in the next section.
              </div>
            </div>
          </div>

          <Divider />

          <div className="winning-combination-container text-start">
            <h2 className="winning-combination-title">Winning combination</h2>
            <div className="winning-combination-container-level1 box">
              <div className="winning-combination-container-level2">
                <table className="winning-combination-table">
                  <tr>
                    <th>Division</th>
                    <th>Solanaball winning combination</th>
                    <th>Division Solanaball payouts</th>
                  </tr>
                  <tr>
                    <td>Division 1</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="plus-icon"></span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="power"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>40% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 2</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>1.1% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 3</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="plus-icon"></span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="power"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>1.1% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 4</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>2% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 5</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="plus-icon"></span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="power"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>1.5% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 6</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="plus-icon"></span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="power"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>9.7% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 7</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>7.6% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 8</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="plus-icon"></span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="power"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>15% of the prize pool</td>
                  </tr>
                  <tr>
                    <td>Division 9</td>
                    <td>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="teal"
                          number=""
                          rotationTransform={false}
                        />
                      </span>

                      <span className="plus-icon"></span>
                      <span className="prize-ball-container">
                        <BallWithNumber
                          size={ballSize}
                          fontSize={fontSize}
                          color="power"
                          number=""
                          rotationTransform={false}
                        />
                      </span>
                    </td>
                    <td>22% of the prize pool</td>
                  </tr>
                </table>
                {/* <div className="row">
                  {winningCombination.map((item, index) => {
                    return (
                      <div className="col-md-4" key={index}>
                        <div className="division-box">
                          <div className="division-number">{`Division ${item.level}`}</div>
                          <div className="division-matching-case">
                            {item.combination}
                          </div>
                          <div className="division-odds">{`Division: ${item.division}`}</div>
                        </div>
                      </div>
                    );
                  })}
                </div> */}

                <div className="mt-3">
                  In the above table, you may also be wondering why Division 9
                  pays out 22% of the prize pool while Division 7 pays out a
                  lower percentage. This is because the chances of winning
                  Division 9 are much higher than Division 7, so it’s expected
                  that if you win Division 9, you’ll be sharing your winnings
                  with other successful players.
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Prize Funds */}
          <div className="winning-criteria">
            <div className="winning-criteria-description">
              <h2 className="winning-criteria-title-1">Prize Funds</h2>
              <div className="winning-criteria-contents-mb">
                The prizes for each lottery round come from three sources:
              </div>
              <h2 className="winning-criteria-title-2">Ticket Purchases</h2>
              <ul>
                <li>
                  <div color="textSubtle">
                    80% of the SOL paid by people buying tickets that round
                    goes back into the prize pools.
                  </div>
                </li>
              </ul>
              <h2 className="winning-criteria-title-2">Rollover Prizes</h2>
              <ul>
                <li>
                  <div color="textSubtle">
                    After every round, if nobody wins in one of the prize
                    brackets, the unclaimed SOL for that bracket rolls over into
                    the next round and are redistributed among the prize pools.
                  </div>
                </li>
              </ul>
              <h2 className="winning-criteria-title-2">Rollover Injections</h2>
              <ul>
                <li>
                  <div color="textSubtle">
                    The pot will be restarted on any successful Division 1 win with
                    funds accumulated from previous prize pools. Funds may also be added to increase ticket sales.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowToPlay;
