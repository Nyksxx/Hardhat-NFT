// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    // token URI //
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    uint256 private tokenIdCount;

    constructor() ERC721("Dogie", "DOG") {}

    // mint //

    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, tokenIdCount);
        tokenIdCount++;
        return tokenIdCount;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return TOKEN_URI;
    }

    // getters //

    function getTokenIdCount() public view returns (uint256) {
        return tokenIdCount;
    }
}
