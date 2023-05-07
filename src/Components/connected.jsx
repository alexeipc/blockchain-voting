import React from "react";
import Popup from "reactjs-popup";
import AddElection from "./add_election";
import Vote from "./vote";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../Constant/constant";
import { useState } from "react";

const Connected = (props) => {
    
    
    const [reload, setreload] = useState(false);

    const ReloadConnect = () => setreload(!reload);

    return (

        <div className='login-container'>
            <h1 className='connected-header'> You are connected to Metamask </h1>
            <p className="connected-account"> Metamask Account: {props.account} </p>
            <Popup modal trigger={<button className="add-button">+ Add new election</button>}>
                {close => <AddElection close={close} addr={props.account}  />}
            </Popup>
            {props.elections.map((election, index) => (
                <Popup modal trigger={<button className="election">{election.title}</button>}>
                    {close => <Vote close={close} addr={props.account}  ReloadConnect={ReloadConnect} election_title ={election.title} election_id = {index} />}
                </Popup>
        
            ))}
        </div>

    )
}

export default Connected;