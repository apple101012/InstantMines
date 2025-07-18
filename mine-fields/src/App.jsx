import React, { useState, useEffect } from "react";
import odds from "./odds";
import "./App.css";

const generateBombs = (bombCount) => {
  const positions = new Set();
  while (positions.size < bombCount) {
    const pos = Math.floor(Math.random() * 25);
    positions.add(pos);
  }
  console.log("[generateBombs] Bomb positions:", positions);
  return Array.from(positions);
};

export default function App() {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [mines, setMines] = useState(3);
  const [board, setBoard] = useState(Array(25).fill(null));
  const [bombPositions, setBombPositions] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [gameState, setGameState] = useState("idle");

  const diamondsClicked = revealed.length;
  const multiplier = getMultiplier(diamondsClicked, mines);
  const cashoutValue = (bet * multiplier).toFixed(2);

  function getMultiplier(diamondCount, bombCount) {
    const entry = odds.find(
      (o) => o.diamonds === diamondCount && o.bomb === bombCount
    );
    console.log(
      `[getMultiplier] Diamonds: ${diamondCount}, Bombs: ${bombCount}, Multiplier: ${
        entry ? entry.multiplier : "1.0 (default)"
      }`
    );
    return entry ? entry.multiplier : 1.0;
  }

  const startGame = () => {
    if (bet <= 0 || bet > balance) return alert("Invalid bet");
    setBalance((prev) => prev - bet);
    const bombs = generateBombs(mines);
    setBombPositions(bombs);
    setRevealed([]);
    setBoard(Array(25).fill(null));
    setGameState("playing");
    console.log("[startGame] Game started with bet:", bet, "mines:", mines);
  };

  const resetGame = () => {
    setGameState("idle");
    setBoard(Array(25).fill(null));
    setRevealed([]);
    setBombPositions([]);
    console.log("[resetGame] Game reset.");
  };

  const handleClick = (index) => {
    if (gameState !== "playing" || revealed.includes(index)) return;

    console.log(`[handleClick] Clicked cell: ${index}`);

    if (bombPositions.includes(index)) {
      console.log("[handleClick] Bomb hit!");
      const newBoard = [...board];
      newBoard[index] = "💥";
      setBoard(newBoard);
      setGameState("lost");
    } else {
      const newBoard = [...board];
      newBoard[index] = "💎";
      setBoard(newBoard);
      setRevealed((prev) => {
        const updated = [...prev, index];
        console.log("[handleClick] Diamonds clicked:", updated.length);
        return updated;
      });
    }
  };

  const handleCashOut = () => {
    const payout = bet * multiplier;
    setBalance((prev) => prev + payout);
    setGameState("won");
    console.log("[handleCashOut] Cashout:", payout);
  };

  return (
    <div className="app">
      <h1>💣 Mines Game</h1>

      <div className="control-panel">
        <div>💰 Balance: ${balance.toFixed(2)}</div>
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
          if (value === "💥") className += " bomb";
          else if (value === "💎") className += " diamond";

          return (
            <div key={i} className={className} onClick={() => handleClick(i)}>
              {value}
            </div>
          );
        })}
      </div>

      {gameState === "lost" && (
        <div className="end-text">💥 You hit a bomb! Game over.</div>
      )}
      {gameState === "won" && (
        <div className="end-text">
          💰 You cashed out and won ${cashoutValue}!
        </div>
      )}
    </div>
  );
}
