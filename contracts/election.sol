// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Election {
    address[] owners;
    mapping(address => bool) public isVoter;

    string public title;
    string public description;

    uint256 public votingStart;
    uint256 public votingEnd;

    constructor(string memory _title, string memory _description, uint256 _durationInMinutes) {
        title = _title;
        description = _description;
        owners.push(msg.sender);
        AddVoter(msg.sender); 

        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    modifier onlyOwners {
        bool flag = false;

        for (uint256 i=0; i<owners.length; ++i)
            if (owners[i] == msg.sender) flag = true;

        require (flag == true);
        _;
    }

    function AddVoter(address _addr) public onlyOwners {
        isVoter[_addr] = true;
        votingStart = block.timestamp;
    }

    struct Option {
        string title;
        string description;
        uint256 voteCount;
    }

    struct Ballot {
        address voter;
        uint256 optionId;
    }

    mapping(address => bool) isVoted;

    Option[] options;
    Ballot[] ballots;

    function getOptions() public view returns(Option[] memory) {
        return options;
    }

    function AddOption(string memory _title, string memory _description) public onlyOwners {
        votingStart = block.timestamp;
        options.push(Option(_title,_description,0)); // At first there is no vote for that option
    }

    function GetStatus() public view returns(uint256) {
        if (isVoted[msg.sender]) {
            return 0; 
        }
        else if (!isVoter[msg.sender]) {
            return 1;
        }
        else return 2;
    }

    function Vote(uint256 _optionId) public {
        require(!isVoted[msg.sender],"You have already voted!");
        require(isVoter[msg.sender],"You are not allowed to vote here");
        require(_optionId < options.length, "Invalid option");

        ballots.push(Ballot(msg.sender, _optionId));
        options[_optionId].voteCount++;
        isVoted[msg.sender] = true;
    }

    function GetResult() public view returns(Option memory) {
        Option memory result;
        uint256 maxx = 0;

        for (uint256 i = 0; i < options.length; ++i)
            if (maxx < options[i].voteCount) {
                result = options[i];
                maxx = options[i].voteCount;
            }

        return result;
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp <= votingEnd, "Voting is over");
        
        return votingEnd - block.timestamp;
    }

}