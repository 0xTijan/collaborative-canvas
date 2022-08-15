// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CanvasNFT is Initializable, UUPSUpgradeable, OwnableUpgradeable, ERC721Upgradeable {

  function initalize() initializer public {
    __Ownable_init();
    __ERC721_init("CanvasNFTs", "CNFT");
  }

  function _authorizeUpgrade(address newAddress) internal override onlyOwner {}

  function mint(address to, uint256 tokenId) public {
    _safeMint(to, tokenId, "");
  }

}