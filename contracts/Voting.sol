// SPDX-License-Identifier: No
pragma solidity ^0.8.7;

import "./election.sol";
contract Voting {
    Election[] elections;

    struct ViewElection {
        string title;
        string description;
    }
    ViewElection[] viewElections;

    function AddElection(string memory _title, string memory _description, uint256 _durationInMinutes) public returns(uint256) {
        elections.push(new Election(_title, _description, _durationInMinutes));
        viewElections.push(ViewElection(_title,_description));
        return(elections.length-1);
    }

    function AddOption(uint256 electionId ,string memory _title, string memory _description) public {
        elections[electionId].AddOption(_title,_description);
    }

    function AddVoter(uint256 electionId ,address _addr) public {
        elections[electionId].AddVoter(_addr);
    }

    function GetResult(uint256 electionId) public view returns(Election.Option memory) {
        return elections[electionId].GetResult();
    }

    function Vote(uint256 electionId, uint256 optionId) public {
        elections[electionId].Vote(optionId);
    }

    function getRemainingTime(uint256 electionId) public view returns (uint256) {
        return elections[electionId].getRemainingTime();
    }

    function GetStatus(uint256 electionId) public view returns (uint256) {
        return elections[electionId].GetStatus();
    }

    function getAllElection() public view returns(ViewElection[] memory) {
        return viewElections;
    }

    function getOptions(uint256 _electionId) public view returns(Election.Option[] memory) {
        return elections[_electionId].getOptions();
    }
}