import '../css/RightSide.css'
import RecentGamesRPS from './RecentGamesRPS';
import RecentGamesDice from './RecentGamesDice';
import PoweredBy from './PoweredBy';

function RightSide() {

    const path = window.location.pathname
    console.log("path: " + path);
    if(path == '/rps') {
        return (
            <div className='RightSide'>
                <RecentGamesRPS />
                {/* <PoweredBy /> */}
            </div>
        );
    }

    else if(path == '/dice') {
        return (
            <div className='RightSide'>
                <RecentGamesDice />
                {/* <PoweredBy /> */}
            </div>
        );
    }
    return (<div></div>)
   
}

export default RightSide;