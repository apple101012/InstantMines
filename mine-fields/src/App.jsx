import React, { useState, useEffect } from "react";
import odds from "./odds";
import "./App.css";

const generateBombs = (bombCount) => {
  const positions = new Set();
  while (positions.size < bombCount) {
    const pos = Math.floor(Math.random() * 25);
    positions.add(pos);
  }
  return Array.from(positions);
};

export default function App() {
  const [startBalance, setStartBalance] = useState(50);
  const [balance, setBalance] = useState(startBalance);
  const [bet, setBet] = useState(10);
  const [mines, setMines] = useState(3);
  const [board, setBoard] = useState(Array(25).fill(null));
  const [bombPositions, setBombPositions] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [gameState, setGameState] = useState("idle"); // idle, playing, won, lost

  const diamondsClicked = revealed.length;
  const multiplier = getMultiplier(diamondsClicked, mines);
  const cashoutValue = (bet * multiplier).toFixed(2);

  function getMultiplier(diamondCount, bombCount) {
    const entry = odds.find(
      (o) => o.diamonds === diamondCount && o.bomb === bombCount
    );
    return entry ? entry.multiplier : 1.0;
  }

  const startGame = () => {
    if (bet <= 0 || bet > balance) return alert("Invalid bet");
    setBalance((prev) => prev - bet);
    setBombPositions(generateBombs(mines));
    setRevealed([]);
    setBoard(Array(25).fill(null));
    setGameState("playing");
  };

  const resetGame = () => {
    setGameState("idle");
    setBoard(Array(25).fill(null));
    setRevealed([]);
    setBombPositions([]);
  };

  const handleClick = (index) => {
    if (gameState !== "playing" || revealed.includes(index)) return;

    if (bombPositions.includes(index)) {
      const newBoard = [...board];
      bombPositions.forEach((pos) => {
        newBoard[pos] = "💣";
      });

      setBoard(newBoard);
      setGameState("lost");
    } else {
      const newBoard = [...board];
      newBoard[index] = "💎";
      setBoard(newBoard);
      setRevealed([...revealed, index]);
    }
  };

  const handleCashOut = () => {
    const payout = bet * multiplier;
    setBalance((prev) => prev + payout);
    setGameState("won");

    // Reveal all bombs visually
    const newBoard = [...board];
    bombPositions.forEach((index) => {
      if (newBoard[index] === null) newBoard[index] = "💣";
    });
    setBoard(newBoard);
  };

  const applyStartBalance = () => {
    setBalance(startBalance);
    resetGame();
  };

  return (
    <div className="app">
      <h1>💣 Mines Game</h1>

      <div className="control-panel">
        <div>
          💰 Balance: ${balance.toFixed(2)}
          <br />
          <input
            type="number"
            value={startBalance}
            onChange={(e) => setStartBalance(parseFloat(e.target.value))}
            style={{ width: "100px", marginRight: "10px" }}
          />
          <button onClick={applyStartBalance}>Set Balance</button>
        </div>

        <label>
          Bet:
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Mines:
          <select
            value={mines}
            onChange={(e) => setMines(parseInt(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>

        <button onClick={startGame} disabled={gameState === "playing"}>
          Start Game
        </button>

        <button onClick={resetGame}>Reset</button>
      </div>

      {gameState === "playing" && (
        <div className="cashout-panel">
          <div>
            Multiplier: {multiplier.toFixed(2)}x | 💎 Diamonds:{" "}
            {diamondsClicked}
          </div>
          <div>💸 Cashout: ${cashoutValue}</div>
          <button className="cashout-btn" onClick={handleCashOut}>
            🪙 Cash Out
          </button>
        </div>
      )}

      <div className="board">
        {board.map((value, i) => {
          let className = "cell";
          if (value === "💣") className += " bomb";
          else if (value === "💎") className += " diamond";

          return (
            <div key={i} className={className} onClick={() => handleClick(i)}>
              {value}
            </div>
          );
        })}
      </div>

      {gameState === "lost" && (
        <div className="end-text">💣 You hit a bomb! Game over.</div>
      )}
      {gameState === "won" && (
        <div className="end-text">
          💰 You cashed out and won ${cashoutValue}!
        </div>
      )}
    </div>
  );
}
