import React from 'react';

import '../css/Socials.css'
import Svg from 'react-inlinesvg'

function Socials() {

    return (
        <div className='Socials' >
            <div className='community'>
                <div className='socialMedia'>
                    <a target='_blank' rel="noopener noreferrer" href='https://discord.gg/pZZWHsRKaJ'><img src='/img/discord.png' /></a>
                </div>
                <div className='socialMedia'>
                    <a target='_blank' rel="noopener noreferrer" href='https://twitter.com/degen_games_sol'><img src='/img/twitter.png' /></a>
                </div>
                <div className='socialMedia'>
                    <a target='_blank' rel="noopener noreferrer" href='https://magiceden.io/marketplace/degengames'><img src='/img/magiceden.png' /></a>
                </div>
            </div>
        </div >
    );
}

export default Socials;
