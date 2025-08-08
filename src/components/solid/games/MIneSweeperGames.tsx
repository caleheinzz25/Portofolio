import { createSignal, createEffect, For, onCleanup } from "solid-js";

type CellState = {
  revealed: boolean;
  hasMine: boolean;
  flagged: boolean;
  adjacentMines: number;
};

export function Minesweeper() {
  const [gridSize, setGridSize] = createSignal(10);
  const [mineCount, setMineCount] = createSignal(15);
  const [gameOver, setGameOver] = createSignal(false);
  const [gameWon, setGameWon] = createSignal(false);
  const [grid, setGrid] = createSignal<CellState[][]>([]);
  const [firstClick, setFirstClick] = createSignal(true);
  const [flagsUsed, setFlagsUsed] = createSignal(0);
  const [timeElapsed, setTimeElapsed] = createSignal(0);
  const [timerActive, setTimerActive] = createSignal(false);

  // Timer logic
  createEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (timerActive()) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    onCleanup(() => clearInterval(timer));
  });

  // Initialize the grid
  const initializeGrid = () => {
    const newGrid: CellState[][] = [];
    for (let i = 0; i < gridSize(); i++) {
      newGrid[i] = [];
      for (let j = 0; j < gridSize(); j++) {
        newGrid[i][j] = {
          revealed: false,
          hasMine: false,
          flagged: false,
          adjacentMines: 0,
        };
      }
    }
    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
    setFlagsUsed(0);
    setTimeElapsed(0);
    setTimerActive(false);
  };

  // Place mines randomly
  const placeMines = (clickRow: number, clickCol: number) => {
    const newGrid = [...grid()];
    let minesPlaced = 0;

    while (minesPlaced < mineCount()) {
      const row = Math.floor(Math.random() * gridSize());
      const col = Math.floor(Math.random() * gridSize());

      // Don't place a mine on the first clicked cell or adjacent cells
      const isFirstClickArea =
        Math.abs(row - clickRow) <= 1 && Math.abs(col - clickCol) <= 1;

      if (!newGrid[row][col].hasMine && !isFirstClickArea) {
        newGrid[row][col].hasMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let i = 0; i < gridSize(); i++) {
      for (let j = 0; j < gridSize(); j++) {
        if (!newGrid[i][j].hasMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 &&
                ni < gridSize() &&
                nj >= 0 &&
                nj < gridSize() &&
                newGrid[ni][nj].hasMine
              ) {
                count++;
              }
            }
          }
          newGrid[i][j].adjacentMines = count;
        }
      }
    }

    setGrid(newGrid);
    setTimerActive(true);
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameOver() || gameWon()) return;

    if (firstClick()) {
      placeMines(row, col);
      setFirstClick(false);
    }

    const cell = grid()[row][col];
    if (cell.flagged || cell.revealed) return;

    const newGrid = [...grid()];

    if (newGrid[row][col].hasMine) {
      // Reveal all mines on game over
      for (let i = 0; i < gridSize(); i++) {
        for (let j = 0; j < gridSize(); j++) {
          if (newGrid[i][j].hasMine) {
            newGrid[i][j].revealed = true;
          }
        }
      }
      setGrid(newGrid);
      setGameOver(true);
      setTimerActive(false);
      return;
    }

    // Reveal the cell
    const revealCells = (r: number, c: number) => {
      if (
        r < 0 ||
        r >= gridSize() ||
        c < 0 ||
        c >= gridSize() ||
        newGrid[r][c].revealed ||
        newGrid[r][c].flagged
      ) {
        return;
      }

      newGrid[r][c].revealed = true;

      if (newGrid[r][c].adjacentMines === 0) {
        // Reveal adjacent cells if this is an empty cell
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            revealCells(r + di, c + dj);
          }
        }
      }
    };

    revealCells(row, col);
    setGrid(newGrid);

    // Check for win condition
    checkWinCondition();
  };

  // Handle right click (flag)
  const handleRightClick = (e: MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver() || gameWon() || grid()[row][col].revealed) return;

    const cell = grid()[row][col];
    const newGrid = [...grid()];

    if (cell.flagged) {
      newGrid[row][col].flagged = false;
      setFlagsUsed((prev) => prev - 1);
    } else if (flagsUsed() < mineCount()) {
      newGrid[row][col].flagged = true;
      setFlagsUsed((prev) => prev + 1);
    }

    setGrid(newGrid);
  };

  // Check if player has won
  const checkWinCondition = () => {
    let unrevealedSafeCells = 0;
    for (let i = 0; i < gridSize(); i++) {
      for (let j = 0; j < gridSize(); j++) {
        if (!grid()[i][j].revealed && !grid()[i][j].hasMine) {
          unrevealedSafeCells++;
        }
      }
    }
    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      setTimerActive(false);

      // Flag all mines when won
      const newGrid = [...grid()];
      for (let i = 0; i < gridSize(); i++) {
        for (let j = 0; j < gridSize(); j++) {
          if (newGrid[i][j].hasMine) {
            newGrid[i][j].flagged = true;
          }
        }
      }
      setGrid(newGrid);
      setFlagsUsed(mineCount());
    }
  };

  // Reset the game
  const resetGame = () => {
    initializeGrid();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Initialize the game on component mount
  createEffect(() => {
    initializeGrid();
  });

  // Cell component
  const Cell = (props: { row: number; col: number }) => {
    const cell = () => grid()[props.row][props.col];

    // Color mapping for adjacent mine numbers
    const numberColors = [
      "text-transparent", // 0 (hidden)
      "text-blue-400", // 1
      "text-green-400", // 2
      "text-red-400", // 3
      "text-purple-400", // 4
      "text-yellow-400", // 5
      "text-teal-400", // 6
      "text-gray-400", // 7
      "text-pink-400", // 8
    ];

    return (
      <div
        class={`w-8 h-8 border border-gray-700 flex items-center justify-center text-sm font-bold cursor-pointer select-none transition-colors ${
          cell().revealed
            ? cell().hasMine
              ? "bg-red-900/80"
              : "bg-gray-800"
            : "bg-gray-900 hover:bg-gray-700"
        } ${
          cell().revealed && !cell().hasMine && cell().adjacentMines > 0
            ? numberColors[cell().adjacentMines]
            : "text-gray-100"
        }`}
        onClick={() => handleCellClick(props.row, props.col)}
        onContextMenu={(e) => handleRightClick(e, props.row, props.col)}
      >
        {cell().revealed
          ? cell().hasMine
            ? "💣"
            : cell().adjacentMines > 0
            ? cell().adjacentMines
            : ""
          : cell().flagged
          ? "🚩"
          : ""}
      </div>
    );
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen text-gray-100 p-4 bg-gray-900">
      <h1 class="text-3xl font-bold mb-4 text-white">Minesweeper</h1>

      <div class="mb-6 flex gap-4 items-center justify-center flex-wrap">
        <div class="bg-gray-800 p-3 rounded-lg flex items-center gap-2">
          <div class="text-red-500">🚩</div>
          <span>
            {flagsUsed()} / {mineCount()}
          </span>
        </div>

        <div class="bg-gray-800 p-3 rounded-lg flex items-center gap-2">
          <div class="text-blue-500">⏱️</div>
          <span>{formatTime(timeElapsed())}</span>
        </div>

        <button
          onClick={resetGame}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors h-fit self-end"
        >
          New Game
        </button>
      </div>

      <div class="mb-4 flex gap-4 flex-wrap justify-center">
        <div class="bg-gray-800 p-3 rounded-lg">
          <label class="block mb-1 text-gray-300">Grid Size:</label>
          <div class="flex items-center">
            <input
              type="range"
              min="5"
              max="20"
              value={gridSize()}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              class="w-32 accent-blue-500"
              disabled={!firstClick()}
            />
            <span class="ml-2 w-8 text-center">{gridSize()}</span>
          </div>
        </div>

        <div class="bg-gray-800 p-3 rounded-lg">
          <label class="block mb-1 text-gray-300">Mines:</label>
          <div class="flex items-center">
            <input
              type="range"
              min="1"
              max={Math.floor(gridSize() * gridSize() * 0.35)}
              value={mineCount()}
              onChange={(e) => setMineCount(parseInt(e.target.value))}
              class="w-32 accent-blue-500"
              disabled={!firstClick()}
            />
            <span class="ml-2 w-8 text-center">{mineCount()}</span>
          </div>
        </div>
      </div>

      <div
        class="grid gap-px bg-gray-700 p-px rounded overflow-hidden shadow-lg"
        style={{
          "grid-template-columns": `repeat(${gridSize()}, minmax(0, 1fr))`,
        }}
      >
        <For each={grid()}>
          {(row, rowIndex) => (
            <For each={row}>
              {(_, colIndex) => <Cell row={rowIndex()} col={colIndex()} />}
            </For>
          )}
        </For>
      </div>

      {(gameOver() || gameWon()) && (
        <div
          class={`mt-4 p-4 rounded-lg text-center ${
            gameOver() ? "bg-red-900/80" : "bg-green-900/80"
          }`}
        >
          <div class="text-xl font-bold mb-2">
            {gameOver() ? "Game Over!" : "You Won!"}
          </div>
          <div class="mb-2">Time: {formatTime(timeElapsed())}</div>
          <button
            onClick={resetGame}
            class="px-4 py-2 bg-white/90 text-gray-900 rounded hover:bg-white transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      <div class="mt-4 text-gray-400 text-sm">
        Left click to reveal, Right click to flag
      </div>
    </div>
  );
}
