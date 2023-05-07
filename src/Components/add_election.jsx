import React from "react";
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../Constant/constant";


const AddElection = (props) => {
    
    const [electionName, AddElection] = useState(null);
    const [options, AddOption] = useState([]);
    const [voters, AddVoter] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [curElectionId, setElectionId] = useState(-1);

    var cur_description_id = null;
    var cur_description_title = null;
    var addr = props.addr;

    async function CreateElection(_title, _description, _duration) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
        
        setLoading(true);
        const tx = await contractInstance.AddElection(_title,_description,_duration);

        await tx.wait();
        setLoading(false);
            
        const len = await contractInstance.getAllElection();
        setElectionId(len.length-1);
    }
    
    async function Add() {
        var _title = document.getElementById("electionName").value;
        var _description = document.getElementById("electionDescription").value;
        var _duration = parseInt( document.getElementById("electionDuration").value);

        await CreateElection(_title,_description,_duration);

        document.getElementById("electionName").value = "";
        document.getElementById("electionDescription").value = "";
        AddElection(_title);
    }

    

    async function AddOption_ToContract() {
        var _title = document.getElementById("optionName").value;
        document.getElementById("optionName").value = "";
        var _description = document.getElementById("optionDescription").value;
        document.getElementById("optionDescription").value = "";
        var _id = `option-${options.length}`
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );

        console.log(curElectionId,_title,_description);
        
        setLoading(true);
        const tx = await contractInstance.AddOption(curElectionId,_title,_description);

        await tx.wait();
        setLoading(false);
        
        AddOption(arr => [...arr, {'id': _id,'title':_title, 'description':_description}])      
    }

    async function AddVoter_ToContract() {
        var _addr = document.getElementById("voter-addr").value;
        document.getElementById("voter-addr").value = "";

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
        
        setLoading(true);
        const tx = await contractInstance.AddVoter(curElectionId,_addr);

        await tx.wait();
        setLoading(false);

        AddVoter(arr => [...arr, {'address':_addr}]) 
    }

    async function AddVoter_() {
        AddVoter(arr => [...arr, {'address':addr}])
    }

    async function DisplayDetail(_id) {
        var a = document.getElementById(_id);
        a.value = "hello";
    }

    async function Close() {
        props.close();   
        props.ReloadConnect();
    }

    if (!electionName) {
        return (
        <div className="modal">
            <a className="close" onClick={props.close}>
                &times;
            </a>
            <div className="header"> New Election </div>
            <input id="electionName" type="text" placeholder="Election's name"></input>
            <input id="electionDuration" type="text" placeholder="Election's duration in minutes"></input>
            <br></br>
            <textarea id="electionDescription" type="text" placeholder="Election's detail"></textarea>
            <button className="add-button" onClick={Add}>Add</button>
            <button className="cancel-button" onClick={props.close}>Cancel</button>
            { isLoading ? (<progress></progress>) : (<div></div>) }
        </div>    
        )
    }

    else if (voters.length==0) {
        return (
        <div className="modal-options">
            <a className="close" onClick={Close}>
                &times;
            </a>
            <div className="header"> Add options for {electionName} </div>
            <input id="optionName" type="text" placeholder="Option's name"></input>
            <br></br>
            <textarea id="optionDescription" type="text" placeholder="Option's detail"></textarea>
            <button className="add-button" onClick={AddOption_ToContract}>Add</button>
            <div className="options">
                {options.map(option => (
                    <div id={option.id} className="option" onClick={() => {
                        if (cur_description_id == option.id) {
                            document.getElementById(cur_description_id).innerHTML = cur_description_title;
                            cur_description_id = null;
                            cur_description_title = null;
                            return;
                        }

                        var doc = document.getElementById(option.id);
                        console.log(option.id);
                        doc.innerHTML = '<b>' + option.title+'</b>'+ '\n'+option.description;

                        if (cur_description_id) {
                            document.getElementById(cur_description_id).innerHTML = cur_description_title;
                        } 
                        cur_description_id = option.id;
                        cur_description_title = option.title;
                            
                        
                    }}>{option.title}</div>
                ))}
            </div>
            { isLoading ? (<progress></progress>) : (<div></div>) }
            <button className="cancel-button" onClick={AddVoter_}>Finnish</button>
        </div>    
        )
    }
    else {
        return(
        <div className="modal-voter">
            <a className="close" onClick={props.close}>
                &times;
            </a>
            <div className="header"> Add voters for {electionName}</div>
            <input id="voter-addr" type="text" placeholder="Voter's address"></input>
            <button className="add-button" onClick={AddVoter_ToContract}>Add</button>

            <div className="voters">
            {voters.map(voter => (
                    <div className="voter"> {voter.address} </div>
                ))}
            </div>

            <button className="cancel-button" onClick={Close}>Finnish</button>
            
        </div>   
        )
    }
}

export default AddElection;