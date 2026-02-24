// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocTimestamp {
    struct Proof {
        address owner;
        uint256 timestamp;
    }

    mapping(bytes32 => Proof) private proofs;

    event Registered(bytes32 indexed docHash, address indexed owner, uint256 timestamp);

    function register(bytes32 docHash) external {
        require(docHash != 0, "Invalid docHash");
        require(proofs[docHash].timestamp == 0, "Already registered");

        proofs[docHash] = Proof(msg.sender, block.timestamp);
        emit Registered(docHash, msg.sender, block.timestamp);
    }

    function verify(bytes32 docHash) external view returns (bool exists, address owner, uint256 timestamp) {
        Proof memory proof = proofs[docHash];
        if (proof.timestamp != 0) {
            return (true, proof.owner, proof.timestamp);
        }
        return (false, address(0), 0);
    }
}
