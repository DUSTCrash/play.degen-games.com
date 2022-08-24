import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';

import Svg from 'react-inlinesvg'

import '../css/Profile.scss'
import '../css/Coin.css'
import '../css/Modal.css'
import User from '../interfaces/User';
import Game from '../interfaces/Game';
import UserGames from './UserGames';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

function FullUserInfo() {
    const { publicKey } = useParams()
    const [user, setUser] = useState<User>()
    const [blocked, setBlocked] = useState(false)

    const getUser = async (publicKey: string) => {
        try {
            const responseUser = await axios.get(`/api/u/fullInfo/${publicKey}`)

            setUser(responseUser.data)

            console.log(responseUser.data)
        } catch (e) {
            setBlocked(true)
        }
    }

    useEffect(() => {
        if (!publicKey) return

        getUser(publicKey)
    }
        , [publicKey])

    return (
        <div className='Page Profile'>
            {blocked ? <h1>THIS PAGE IS FORBIDDEN FOR IMPOSTERS</h1>
                : user ? <div className='info'>
                    <h3><span className='tag'>PublicKey:</span> <a target='_blank' rel='noopener norefferer' href={`https://solscan.io/account/${user.publicKey}`}>{user.publicKey}</a></h3>
                    <h3><span className='tag'>Balance:</span> {user.balance / LAMPORTS_PER_SOL} SOL</h3>
                    <h3><span className='tag'>Associated Keypair:</span> <a target='_blank' rel='noopener norefferer' href={`https://solscan.io/account/${user.associatedKeypair.publicKey}`}>{user.associatedKeypair.publicKey}</a></h3>
                    <input type='number'></input>
                </div> : <h1>Loading...</h1>
            }
        </div>
    );
}

export default FullUserInfo;