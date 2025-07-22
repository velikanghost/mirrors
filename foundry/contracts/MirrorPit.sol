// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract MirrorPit is AccessControl, ReentrancyGuard {
    using Address for address payable;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct Game {
        bool exists;
        bool active;
        uint256 prizePool;
        uint256 entryFee;
        address creator;
        uint256 minPlayers;
        mapping(address => bool) hasJoined;
        mapping(address => bool) isPlayerReady;
        uint256 readyPlayersCount;
    }

    // Game state
    mapping(uint256 => Game) public games;
    uint256 public activeGamesCount;
    uint256 public maxLobbies = 3;

    // Events
    event LobbyCreated(
        uint256 indexed gameId,
        address indexed creator,
        uint256 entryFee,
        uint256 minPlayers
    );
    event PlayerJoined(
        uint256 indexed gameId,
        address indexed player,
        uint256 amount
    );
    event PlayerReady(uint256 indexed gameId, address indexed player);
    event PlayerUnready(uint256 indexed gameId, address indexed player);
    event PrizesDistributed(
        uint256 indexed gameId,
        address[] winners,
        uint256 prizePerWinner
    );
    event MaxLobbiesUpdated(uint256 newMaxLobbies);
    event LobbyDeleted(uint256 indexed gameId, address indexed deleter);

    // Errors
    error GameNotActive();
    error InvalidGameId();
    error InvalidAmount();
    error TransferFailed();
    error MaxLobbiesReached();
    error PlayerNotJoined();
    error NotAllPlayersReady();
    error InvalidMinPlayers();
    error NotAuthorized();
    error GameHasPlayers();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function setMaxLobbies(
        uint256 _maxLobbies
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxLobbies = _maxLobbies;
        emit MaxLobbiesUpdated(_maxLobbies);
    }

    function createLobby(
        uint256 entryFee,
        uint256 minPlayers
    ) external returns (uint256) {
        if (activeGamesCount >= maxLobbies) revert MaxLobbiesReached();
        if (minPlayers < 2) revert InvalidMinPlayers();

        uint256 gameId = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    activeGamesCount
                )
            )
        );

        Game storage game = games[gameId];
        game.exists = true;
        game.active = true;
        game.prizePool = 0;
        game.entryFee = entryFee;
        game.creator = msg.sender;
        game.minPlayers = minPlayers;
        game.readyPlayersCount = 0;

        activeGamesCount++;
        emit LobbyCreated(gameId, msg.sender, entryFee, minPlayers);
        return gameId;
    }

    function joinGame(uint256 gameId) external payable nonReentrant {
        Game storage game = games[gameId];
        if (!game.exists) revert InvalidGameId();
        if (!game.active) revert GameNotActive();
        if (msg.value != game.entryFee) revert InvalidAmount();
        if (game.hasJoined[msg.sender]) revert InvalidAmount();

        game.hasJoined[msg.sender] = true;
        game.prizePool += msg.value;

        emit PlayerJoined(gameId, msg.sender, msg.value);
    }

    function getGameInfo(
        uint256 gameId
    )
        external
        view
        returns (
            bool exists,
            bool active,
            uint256 prizePool,
            uint256 entryFee,
            address creator,
            uint256 minPlayers
        )
    {
        Game storage game = games[gameId];
        return (
            game.exists,
            game.active,
            game.prizePool,
            game.entryFee,
            game.creator,
            game.minPlayers
        );
    }

    function hasPlayerJoined(
        uint256 gameId,
        address player
    ) external view returns (bool) {
        return games[gameId].hasJoined[player];
    }

    function distributePrizes(
        uint256 gameId,
        address[] calldata winners
    ) external onlyRole(OPERATOR_ROLE) nonReentrant {
        Game storage game = games[gameId];
        if (!game.exists) revert InvalidGameId();
        if (!game.active) revert GameNotActive();
        if (winners.length == 0) revert InvalidAmount();

        uint256 prizePerWinner = game.prizePool / winners.length;
        game.active = false;
        activeGamesCount--;

        for (uint256 i = 0; i < winners.length; i++) {
            payable(winners[i]).sendValue(prizePerWinner);
        }

        emit PrizesDistributed(gameId, winners, prizePerWinner);
    }

    function deleteLobby(uint256 gameId) external {
        Game storage game = games[gameId];
        if (!game.exists) revert InvalidGameId();
        if (!game.active) revert GameNotActive();

        // Only creator or admin can delete
        if (
            msg.sender != game.creator &&
            !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
        ) {
            revert NotAuthorized();
        }

        // Check if any players have joined and paid
        if (game.prizePool > 0) {
            revert GameHasPlayers();
        }

        game.active = false;
        activeGamesCount--;

        emit LobbyDeleted(gameId, msg.sender);
    }
}
