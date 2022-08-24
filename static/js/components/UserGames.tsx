import React, { useState } from 'react';

import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import Svg from 'react-inlinesvg'

import '../css/UserGames.css'
import '../css/Coin.css'
import '../css/Modal.css'
import User from '../interfaces/User';
import Game from '../interfaces/Game';
import moment from 'moment'
import { Link } from 'react-router-dom';
import { displayName } from '../utils/displayName';
import { shortenAddress } from '../utils/shortenAddress';
import { CoinflipFaceEnum } from './CoinFlipGame';
import { ga } from 'react-ga';

interface Props {
    user: User,
    games: Game[],
}

const NUM_RECENT_GAMES_SHOWN = 100;

function UserGames(props: Props) {
    var games = props.games;
    games.sort(function (a, b) {
        if (a.updatedAt < b.updatedAt)
            return 1
        else
            return -1
    });
    var games = games.slice(0, NUM_RECENT_GAMES_SHOWN);
    console.log("33333", games);

    return (
        <div>
            <table className='UserGames'>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Bet</th>
                        <th>Move</th>
                        <th>Opponent</th>
                        <th>Opponent Move</th>
                        <th>Win Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {

                        games.map((game, index) => {
                            let opponent: any;
                            let winAmount = 0;
                            if(game.gameType !== 'coinflip') {
                                if (game.status !== 'ended' || !game.opponent) return

                                const move = game.creator._id === props.user._id ? game.creatorMove : game.opponentMove
                                opponent = game.creator._id === props.user._id ? game.opponent : game.creator
                                const opponentMove = game.creator._id === props.user._id ? game.opponentMove : game.creatorMove
                                winAmount = game.winner ? game.winner._id === props.user._id ? game.amount / LAMPORTS_PER_SOL : -game.amount / LAMPORTS_PER_SOL : 0
                                var moveImg
                                var opponentMoveImg
                                if (game.gameType === "rps") {
                                    moveImg = "move" + move + ".png"
                                    opponentMoveImg = "move" + opponentMove + ".png"
                                }
                                if (game.gameType === "dice") {
                                    moveImg = "dice" + move + ".svg"
                                    opponentMoveImg = "dice" + opponentMove + ".svg"
                                }
                            } else {
                                let opponentFace: CoinflipFaceEnum;
                                if(props.user.publicKey?.toString() === game.player?.publicKey.toString()) {
                                    opponent = game.opponent;
                                    winAmount = game.bettingAmount ? (game.isWin ? game.bettingAmount / LAMPORTS_PER_SOL : -game.bettingAmount / LAMPORTS_PER_SOL) : 0;
                                    if(game.isWin) {
                                        opponentFace = game.bettingFace == CoinflipFaceEnum.Head ? CoinflipFaceEnum.Head : CoinflipFaceEnum.Tail;
                                    } else {
                                        opponentFace = game.bettingFace == CoinflipFaceEnum.Head ? CoinflipFaceEnum.Tail : CoinflipFaceEnum.Head;
                                    }
                                    moveImg = "coin-" + CoinflipFaceEnum[(game.bettingFace || 0)].toLowerCase() + "-small.svg";
                                    opponentMoveImg = "coin-" + CoinflipFaceEnum[opponentFace].toLowerCase() + "-small.svg";
                                } else {
                                    opponent = game.player;
                                    winAmount = game.bettingAmount ? (game.isWin ? -game.bettingAmount / LAMPORTS_PER_SOL : game.bettingAmount / LAMPORTS_PER_SOL) : 0;
                                    if(game.isWin) {
                                        opponentFace = game.bettingFace == CoinflipFaceEnum.Head ? CoinflipFaceEnum.Head : CoinflipFaceEnum.Tail;
                                    } else {
                                        opponentFace = game.bettingFace == CoinflipFaceEnum.Head ? CoinflipFaceEnum.Tail : CoinflipFaceEnum.Head;
                                    }
                                    opponentMoveImg = "coin-" + CoinflipFaceEnum[(game.bettingFace || 0)].toLowerCase() + "-small.svg";
                                    moveImg = "coin-" + CoinflipFaceEnum[opponentFace].toLowerCase() + "-small.svg";
                                }
                                game.amount = (game.bettingAmount || 0);
                            }

                            return <tr key={index} className='game' >
                                <td className='date'>{moment(game.updatedAt).format('MMM DD, h:mm A')}</td>
                                <td>{game.amount / LAMPORTS_PER_SOL} SOL</td>
                                <td className={`move ${game.gameType !== 'coinflip' && 'flip'}`}><img src={`/img/${moveImg}`} /></td>
                                <td><Link className='profileLink' to={`/u/${opponent?.publicKey}`}>{opponent && displayName(opponent)}</Link></td>
                                <td className='move'><img src={`/img/${opponentMoveImg}`} /></td>
                                <td><span className={winAmount === 0 ? '' : winAmount > 0 ? 'win' : 'lose'}>{winAmount} SOL</span></td>
                            </tr>
                        }
                        )
                    }
                </tbody>
            </table>
            <p>Showing most recent 100 games only.</p>
        </div>
    );
}

export default UserGames;