import React, { useState } from "react";
import { ODDS_TABLE } from "./odds";
import "./App.css";
import "./index.css";

const GRID_SIZE = 5;

const generateBombs = (numBombs) => {
  const totalTiles = GRID_SIZE * GRID_SIZE;
  const bombIndices = new Set();
  while (bombIndices.size < numBombs) {
    const idx = Math.floor(Math.random() * totalTiles);
    bombIndices.add(idx);
  }
  return bombIndices;
};

function App() {
  const [bombCount, setBombCount] = useState(1);
  const [bombs, setBombs] = useState(new Set());
  const [revealed, setRevealed] = useState(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState("Pick a number of bombs and start!");
  const [gameOver, setGameOver] = useState(false);

  const handleStart = () => {
    const newBombs = generateBombs(bombCount);
    setBombs(newBombs);
    setRevealed(new Set());
    setGameStarted(true);
    setGameOver(false);
    setMessage("Click tiles to find diamonds 💎");
  };

  const handleClick = (idx) => {
    if (!gameStarted || gameOver || revealed.has(idx)) return;

    if (bombs.has(idx)) {
      setMessage("💣 Boom! You hit a bomb.");
      setGameOver(true);
    } else {
      const newRevealed = new Set(revealed);
      newRevealed.add(idx);
      setRevealed(newRevealed);

      const diamondsFound = newRevealed.size;
      const odds = ODDS_TABLE[bombCount]?.find(
        (row) => row.diamonds === diamondsFound
      );

      if (odds) {
        setMessage(
          `💎 Safe! Diamonds: ${diamondsFound} | x${odds.multiplier} | ${(
            odds.chance * 100
          ).toFixed(2)}% chance`
        );
      } else {
        setMessage("💎 Keep going!");
      }
    }
  };

  const renderGrid = () => {
    const tiles = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const isRevealed = revealed.has(i);
      const isBomb = bombs.has(i);
      const content = gameOver && isBomb ? "💣" : isRevealed ? "💎" : "";
      tiles.push(
        <div
          key={i}
          className={`tile ${isRevealed ? "revealed" : ""}`}
          onClick={() => handleClick(i)}
        >
          {content}
        </div>
      );
    }
    return tiles;
  };

  const renderOddsTable = () => {
    return (
      <div className="odds-table">
        <h3>
          📊 Odds for {bombCount} Bomb{bombCount > 1 ? "s" : ""}
        </h3>
        <table>
          <thead>
            <tr>
              <th>Diamonds</th>
              <th>Multiplier</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            {(ODDS_TABLE[bombCount] || []).map((row) => (
              <tr key={row.diamonds}>
                <td>{row.diamonds}</td>
                <td>x{row.multiplier}</td>
                <td>{(row.chance * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="app">
      <h1>💣 Minefield Game</h1>

      <div className="controls">
        <label>
          Bombs:
          <select
            value={bombCount}
            onChange={(e) => setBombCount(parseInt(e.target.value))}
            disabled={gameStarted}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleStart} disabled={gameStarted}>
          START
        </button>
      </div>

      <p>{message}</p>

      <div className="grid">{renderGrid()}</div>

      {renderOddsTable()}
    </div>
  );
}

export default App;
