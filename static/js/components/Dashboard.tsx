import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DatePickerProps, Spin } from 'antd';
import { Select, DatePicker, Space } from 'antd';
import axios from "axios";
import "../css/Dashboard.scss";
import User from "../interfaces/User";
import Game from "../interfaces/Game";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import moment from "moment";
import { useWallet } from "@solana/wallet-adapter-react";

const { Option } = Select;

interface IGetStatsProps {
  timeFilterType?: ETimeFilterType,
  timeFilterItem?: Date
}

export enum ETimeFilterType {
  Daily,
  Weekly,
  All
};

function Dashboard() {
  const [rpsVolume, setRpsVolume] = useState<number>(0);
  const [rpsGames, setRpsGames] = useState<number>(0);
  const [rpsFees, setRpsFees] = useState(0);
  const [diceVolume, setDiceVolume] = useState<number>(0);
  const [diceGames, setDiceGames] = useState<number>(0);
  const [diceFees, setDiceFees] = useState(0);
  const [coinflipVolume, setCoinflipVolume] = useState<number>(0);
  const [coinflipGames, setCoinflipGames] = useState<number>(0);
  const [coinflipFees, setCoinflipFees] = useState(0);
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [totalFees, setTotalFees] = useState(0);
  
  const [timeFilterType, setTimeFilterType] = useState<number>(ETimeFilterType.Daily);
  const [timeFilterItem, setTimeFilterItem] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const { wallet } = useWallet();

  const getStats = async (getStatsProps: IGetStatsProps) => {
    try {
      setIsLoading(true);

      let config = {
        params: {
          timeFilterType: (getStatsProps.timeFilterType || getStatsProps.timeFilterType == 0) ? getStatsProps.timeFilterType : Number(timeFilterType),
          timeFilterItem: getStatsProps.timeFilterItem ? getStatsProps.timeFilterItem : timeFilterItem
        }
      };
      const [responseStats] = await Promise.all([
        axios.get(`/api/stats`, config)
      ]);

      const {
        rpsVolume,
        rpsGames,
        rpsFees,
        diceVolume,
        diceGames,
        diceFees,
        coinflipVolume,
        coinflipGames,
        coinflipFees,
        totalVolume,
        totalGames,
        totalFees
      } = responseStats.data;
      
      setRpsVolume(rpsVolume);
      setRpsGames(rpsGames);
      setRpsFees(rpsFees);
      setDiceVolume(diceVolume);
      setDiceGames(diceGames);
      setDiceFees(diceFees);
      setCoinflipVolume(coinflipVolume);
      setCoinflipGames(coinflipGames);
      setCoinflipFees(coinflipFees);
      setTotalVolume(totalVolume);
      setTotalGames(totalGames);
      setTotalFees(totalFees);

      setIsLoading(false);
    } catch(_) {
      setIsLoading(false);
    }
  };

  const handleChangeTimeFilter = async (value: string) => {
    setTimeFilterType(Number(value));
    await getStats({ timeFilterType: Number(value), timeFilterItem});
  };

  const onChangeDatePicker: DatePickerProps['onChange'] = async (date, dateString) => {
    setTimeFilterItem(date?.toDate());
    await getStats({timeFilterType, timeFilterItem: date?.toDate()});
  };

  // get screeen size whenever resize window
  useEffect(() => {
    window.addEventListener('resize', setDimension);

    return (() => {
      window.removeEventListener('resize', setDimension);
    })
  }, [screenSize]);

  useEffect(() => {
    getStats({});
  }, [wallet]);

  return (
    <Spin spinning={isLoading}>
      <div className="Page Dashboard">
        <div className="dashboard-wrap">
          <div className="row">
            <div className="dashboard-top-bar">
              <div className="time-fliter-box">
                <div className="time-fliter-title">Filter Type: </div>
                <div className="time-filter-selector">
                  <Select 
                    defaultValue={ETimeFilterType.Daily.toString()} 
                    style={{ width: `${isMobile ? 'inherit' : '120px'}` }} 
                    onChange={handleChangeTimeFilter}
                  >
                    <Option value={ETimeFilterType.Daily.toString()}>Daily</Option>
                    <Option value={ETimeFilterType.Weekly.toString()}>Weekly</Option>
                    <Option value={ETimeFilterType.All.toString()}>All</Option>
                  </Select>
                </div>
                {
                  timeFilterType !== ETimeFilterType.All && (
                    <div className="time-filter-date-picker">
                      <DatePicker 
                        onChange={onChangeDatePicker}
                        defaultValue={moment(new Date())} 
                        picker={timeFilterType == ETimeFilterType.Daily ? 'date' : 'week'}
                      />
                    </div>
                  )
                }
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 col-lg-4 mb-3">
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total RPS Volume</div>
                <div className="dashboard-stats-box-item">{rpsVolume / LAMPORTS_PER_SOL} SOL</div>
              </div>
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total Dice Volume</div>
                <div className="dashboard-stats-box-item">{diceVolume / LAMPORTS_PER_SOL} SOL</div>
              </div>
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total Coinflip Volume</div>
                <div className="dashboard-stats-box-item">{coinflipVolume / LAMPORTS_PER_SOL} SOL</div>
              </div>
              <div className="stats-container w-100">
                <span className="stats-title">Total Volume</span>
                <span className="stats-number">
                  {totalVolume / LAMPORTS_PER_SOL} SOL
                </span>
              </div>
            </div>

            <div className="col-md-12 col-lg-4 mb-3">
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total RPS Games</div>
                <div className="dashboard-stats-box-item">{rpsGames}</div>
              </div>
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total Dice Games</div>
                <div className="dashboard-stats-box-item">{diceGames}</div>
              </div>
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total Coinflip Games</div>
                <div className="dashboard-stats-box-item">{coinflipGames}</div>
              </div>
              <div className="stats-container w-100">
                <span className="stats-title">Total Games</span>
                <span className="stats-number">
                  {totalGames}
                </span>
              </div>
            </div>

            <div className="col-md-12 col-lg-4">
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total RPS Fees</div>
                <div className="dashboard-stats-box-item">{rpsFees / LAMPORTS_PER_SOL} SOL</div>
              </div>
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total Dice Fees</div>
                <div className="dashboard-stats-box-item">{diceFees / LAMPORTS_PER_SOL} SOL</div>
              </div>
              <div className="dashboard-stats-box ">
                <div className="dashboard-stats-box-title">Total Coinflip Fees</div>
                <div className="dashboard-stats-box-item">{coinflipFees / LAMPORTS_PER_SOL} SOL</div>
              </div>
              <div className="stats-container w-100">
                <span className="stats-title">Total Fees</span>
                <span className="stats-number">
                  {totalFees / LAMPORTS_PER_SOL} SOL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default Dashboard;
