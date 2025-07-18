// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MirrorPit
 * @notice A multiplayer game where players compete for prizes. Game logic handled off-chain.
 */
contract MirrorPit is ReentrancyGuard, AccessControl {
    // Custom errors
    error NotEnoughPlayers();
    error AlreadyJoined();
    error GameNotActive();
    error InvalidAmount();
    error TransferFailed();
    error GameFull();
    error InvalidGameId();

    // Events
    event LobbyCreated(uint256 indexed gameId, uint256 createdAt);
    event GameStarted(uint256 indexed gameId, uint256 startTime);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameEnded(
        uint256 indexed gameId,
        address[] winners,
        uint256 prizePerWinner
    );

    // Game state
    struct Game {
        bool active;
        bool exists;
        uint256 startTime;
        uint256 prizePool;
        uint256 playerCount;
        mapping(address => bool) players;
    }

    // Constants
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    uint256 public constant MIN_PLAYERS = 2;
    uint256 public constant MAX_PLAYERS = 8;
    uint256 public constant ENTRY_FEE = 0.01 ether;

    // State variables
    uint256 private _nextGameId = 1;
    mapping(uint256 => Game) public games;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function createLobby() external onlyRole(OPERATOR_ROLE) returns (uint256) {
        uint256 newGameId = _nextGameId++;

        Game storage game = games[newGameId];
        game.exists = true;
        game.active = true;

        emit LobbyCreated(newGameId, block.timestamp);
        return newGameId;
    }

    function joinGame(uint256 gameId) external payable nonReentrant {
        Game storage game = games[gameId];
        if (!game.exists) revert InvalidGameId();
        if (!game.active) revert GameNotActive();
        if (game.players[msg.sender]) revert AlreadyJoined();
        if (msg.value != ENTRY_FEE) revert InvalidAmount();
        if (game.playerCount >= MAX_PLAYERS) revert GameFull();

        game.players[msg.sender] = true;
        game.playerCount++;
        game.prizePool += msg.value;

        emit PlayerJoined(gameId, msg.sender);
    }

    function startGame(uint256 gameId) external onlyRole(OPERATOR_ROLE) {
        Game storage game = games[gameId];
        if (!game.exists) revert InvalidGameId();
        if (!game.active) revert GameNotActive();
        if (game.playerCount < MIN_PLAYERS) revert NotEnoughPlayers();

        game.startTime = block.timestamp;
        emit GameStarted(gameId, block.timestamp);
    }

    function endGameAndDistributePrizes(
        uint256 gameId,
        address[] calldata winners
    ) external onlyRole(OPERATOR_ROLE) {
        Game storage game = games[gameId];
        if (!game.exists) revert InvalidGameId();
        if (!game.active) revert GameNotActive();
        if (winners.length == 0 || winners.length > game.playerCount)
            revert NotEnoughPlayers();

        uint256 prizePerWinner = game.prizePool / winners.length;
        game.active = false;

        for (uint256 i = 0; i < winners.length; i++) {
            (bool success, ) = winners[i].call{value: prizePerWinner}("");
            if (!success) revert TransferFailed();
        }

        emit GameEnded(gameId, winners, prizePerWinner);
    }

    // View functions
    function isPlayerJoined(
        uint256 gameId,
        address player
    ) external view returns (bool) {
        if (!games[gameId].exists) revert InvalidGameId();
        return games[gameId].players[player];
    }

    function getGameInfo(
        uint256 gameId
    )
        external
        view
        returns (
            bool exists,
            bool active,
            uint256 startTime,
            uint256 prizePool,
            uint256 playerCount
        )
    {
        Game storage game = games[gameId];
        return (
            game.exists,
            game.active,
            game.startTime,
            game.prizePool,
            game.playerCount
        );
    }

    function getActiveGames() external view returns (uint256[] memory) {
        uint256 totalGames = _nextGameId - 1; // Calculate total games based on _nextGameId
        uint256[] memory activeGames = new uint256[](totalGames);
        uint256 count = 0;

        for (uint256 i = 1; i < _nextGameId; i++) {
            if (games[i].exists && games[i].active) {
                activeGames[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        assembly {
            mstore(activeGames, count)
        }

        return activeGames;
    }

    // Required override
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
