import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, Spin, Statistic } from "antd";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import "../../css/ActiveGames.scss";
import "../../css/Coin.css";
import "../../css/Modal.css";
import "./index.scss";
import User from "../../interfaces/User";
import { CombinedReducer } from "../../store";
import { toast } from "react-toastify";
import { Sockets } from "../../reducers/sockets";
import Lottery, { LotteryStatus } from "../../interfaces/Lottery";
import { IInitialState } from "../../reducers/lottery";
import { Button, Form, Space, InputNumber, Input } from "antd";

function AdminPanelForStartLottery() {
  const [form] = Form.useForm();
  const { Countdown } = Statistic;
  const [lastRound, setLastRound] = useState<Lottery>({});
  const [visible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector<CombinedReducer, User>((state) => state.user);
  const sockets = useSelector<CombinedReducer, Sockets>(
    (state) => state.sockets
  );
  const lottery = useSelector<CombinedReducer, IInitialState>(
    (state) => state.lottery
  );

  interface IPrams {
    priceTicketInGame: number;
    discountDivisor: number;
    lotteryLength: number;
  }

  const hide = () => {
    setVisible(false);
  };

  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible);
  };

  const handleInitializeLeaderboard = async () => {
    try {
      if (!user.isAdmin) {
        toast.warn("Permission denied. Please select admin wallet");
        return;
      }

      setVisible(false);
      setLoading(true);
      await axios.post("/api/leaderboard/initialize");
      toast.success("Success to initialize leaderboard collection");
      setLoading(false);
    } catch(_) {
      toast.error("Failed to initialize leaderboard collection");
      setVisible(false);
      setLoading(false);
    }
  }

  const onFinish = async (params: IPrams) => {
    const { priceTicketInGame, discountDivisor, lotteryLength } = params;

    try {
      if (!user.isAdmin) {
        toast.warn("Permission denied. Please select admin wallet");
        return;
      }

      if (lastRound?.status === LotteryStatus.Open) {
        toast.warn("Not time to start lottery");
        return;
      }

      await axios.post("/api/lottery-game", {
        priceTicketInGame,
        discountDivisor,
        lotteryLength,
      });

      toast.success("Success to start new lottery");
    } catch (err) {
      toast.error("Failed to start new lottery");
    }
  };

  const onFinishFailed = () => {};

  useEffect(() => {
    const getLotteries = async () => {
      const lastRound = await axios.get("/api/lottery-game/lastRound");
      dispatch({ type: "SET_LAST_ROUND", payload: lastRound.data });
    };

    getLotteries();
  }, []);

  useEffect(() => {
    if (!sockets.lottery) return;

    sockets.lottery.on("newLottery", (lottery: Lottery) =>
      dispatch({ type: "SET_LAST_ROUND", payload: lottery })
    );
    sockets.lottery.on("closedLottery", (finishedLottery: Lottery) =>
      dispatch({ type: "CLOSED_LOTTERY", payload: finishedLottery })
    );
  }, [sockets.lottery]);

  useEffect(() => {
    setLastRound(lottery.lastRound);
  }, [user, lottery]);

  return (
    <div className="Page ActiveGames">
      {user?.isAdmin ? (
        <>
          <h1 className="gameTitle">
            <span>Start Lottery</span>
          </h1>
          <div className="prize-notification">
            {lastRound?.status === LotteryStatus.Open ? (
              <>
                <Countdown
                  value={lastRound.endedAt}
                  format="DD:HH:mm:ss"
                  className="text-white"
                  style={{ color: "white" }}
                />
              </>
            ) : (
              <h1>Tickets on sale soon</h1>
            )}
          </div>

          <div className="box buy-box">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              className="start-lottery-form"
            >
              <Form.Item
                name="priceTicketInGame"
                label="Ticket Price"
                rules={[
                  {
                    required: true,
                  },
                  { type: "number", min: 0 },
                ]}
              >
                <InputNumber className="w-100" placeholder="price" />
              </Form.Item>
              <Form.Item
                name="discountDivisor"
                label="Discount Divisor"
                rules={[
                  {
                    required: true,
                  },
                  { type: "number", min: 500 },
                ]}
              >
                <InputNumber className="w-100" placeholder="2000" />
              </Form.Item>
              <Form.Item
                name="lotteryLength"
                label="Lottery Length(Day)"
                rules={[{ type: "number", min: 0 }]}
              >
                <InputNumber className="w-100" placeholder="7" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Start Lottery
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>

          <Spin spinning={isLoading}>
            <h1 className="gameTitle mt-5 mb-2">
              <span>Leaderboard</span>
            </h1>
            <Popover 
              placement="topLeft" 
              title="Confirm to initialize" 
              content={
                <>
                  <button className="mr-2" onClick={handleInitializeLeaderboard}>Yes</button>
                  <button onClick={hide}>No</button>
                </>
              }
              trigger="click"
              visible={visible}
              onVisibleChange={handleVisibleChange}
            >
              <Button type="primary">
                Initialize Leaderboard Collection
              </Button>
            </Popover>
          </Spin>
        </>
      ) : (
        <h2>Access denied!</h2>
      )}
    </div>
  );
}

export default AdminPanelForStartLottery;
