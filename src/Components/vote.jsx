import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../Constant/constant";

const Vote = (props) => {
    useEffect(() => {
        getRemainingTime();
        GetLeader();
        GetStatus(props.election_id);
        let ignore = false;

        if (!ignore)  {
            GetOptions(props.election_id);
            
        }
        return () => { ignore = true; }
    },[])

    const [options, setOption] = useState([]);
    const [status, setStatus] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [r, reload] = useState(false);
    const [remainingTime, setremainingTime] = useState('');
    const [leader, setLeader] = useState('');
    
    var cur_description_id = null;
    var cur_description_title = null;

    const [totalVotes, setTotalVote] = useState(0);

    async function GetLeader() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
        const leader_ = await contractInstance.GetResult(props.election_id);
        
        setLeader(leader_.title);
    }

    async function GetOptions(_electionId) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts",[]);
        const signer = provider.getSigner();

        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
    
        const options =  await contractInstance.getOptions(_electionId);
        
        var totalVotes = 0;
        options.forEach(option => {
            totalVotes += parseInt(option.voteCount);
        });
        setTotalVote(totalVotes);

        setOption(options);
    }

    async function GetStatus(_electionId) {
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts",[]);
        const signer = provider.getSigner();

        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
    
        const status =  await contractInstance.GetStatus(_electionId);
        setStatus(status);
    }

    async function Vote(_optionId, _electionId) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
        
        setLoading(true);
        const tx = await contractInstance.Vote(_optionId, _electionId);

        await tx.wait();
        setLoading(false);
    }

    async function getRemainingTime() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
        try {
            const time = await contractInstance.getRemainingTime(props.election_id);
            setremainingTime("Remaining time:" + parseInt(time, 16).toString());
        }
        catch {
            setremainingTime("Voting is over");
        }
    }

    return (
        <div className="modal-voter">
            <a className="close" onClick={props.close}>
                &times;
            </a>
            <div className="header"> Vote for {props.election_title}</div>
            <p className="connected-account">{remainingTime}</p>
            {(remainingTime == "Voting is over") 
                ? (<p className="connected-account"> Winner is {leader} </p>) 
                : (totalVotes != 0)
                    ? (<p className="connected-account"> Current leader is {leader} </p>)
                    : (<></>)
                }
            
            
            { (remainingTime == "Voting is over") ? (<></>)
            :(status == 0) ? (<div className="center-text">You have already voted</div>) : ((status == 1) ? (<div className="center-text">You are not allowed to vote here</div>) : (<div className="center-text">Please choose one of flowing options bellow</div>))}
            {options.map((option,index) => (
                <div>
                    <div className="option" onClick={() => {
                        if (cur_description_id == index.toString()) {
                            document.getElementById(cur_description_id).innerHTML = cur_description_title;
                            cur_description_id = null;
                            cur_description_title = null;
                            return;
                        }

                        var doc = document.getElementById(index.toString());
                       
                        doc.innerHTML = '<b>' + option.title+ '(' +option.voteCount.toString()+'/'+totalVotes.toString()+ ')' + '</b>' + '\n'+option.description;

                        if (cur_description_id) {
                            document.getElementById(cur_description_id).innerHTML = cur_description_title;
                        } 
                        cur_description_id = index.toString();
                        cur_description_title = option.title+ '(' +option.voteCount.toString()+'/'+totalVotes.toString()+')';
        
                        
                    }}>
                        
                        {(status == 2) ? 
                            (<button className="vote-button" onClick={() => (
                                Vote(index, props.election_id)
                            )}>Vote</button>) :
                            (<></>)
                        }
                        <div id={index.toString()} className="option-content" >{option.title} ({option.voteCount.toString()}/{totalVotes})</div>
                    </div>
                    
                    </div>
                ))}
            { isLoading ? (<progress></progress>) : (<div></div>) }
        </div>
    )
}

export default Vote;