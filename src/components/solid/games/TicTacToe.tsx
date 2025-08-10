import { createSignal, createEffect, For, onCleanup } from "solid-js";

type CellValue = "X" | "O" | null;

export function TicTacToe() {
  const [gridSize, setGridSize] = createSignal(3);
  const [board, setBoard] = createSignal<CellValue[][]>([]);
  const [currentPlayer, setCurrentPlayer] = createSignal<"X" | "O">("X");
  const [winner, setWinner] = createSignal<CellValue | "draw">(null);
  const [score, setScore] = createSignal({ X: 0, O: 0, draws: 0 });
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

  // Initialize the board
  const initializeBoard = () => {
    const newBoard: CellValue[][] = [];
    for (let i = 0; i < gridSize(); i++) {
      newBoard[i] = [];
      for (let j = 0; j < gridSize(); j++) {
        newBoard[i][j] = null;
      }
    }
    setBoard(newBoard);
    setCurrentPlayer("X");
    setWinner(null);
    setTimeElapsed(0);
    setTimerActive(true);
  };

  // Check for winner
  const checkWinner = (board: CellValue[][]) => {
    const size = gridSize();

    // Check rows
    for (let i = 0; i < size; i++) {
      const firstCell = board[i][0];
      if (firstCell && board[i].every((cell) => cell === firstCell)) {
        return firstCell;
      }
    }

    // Check columns
    for (let j = 0; j < size; j++) {
      const firstCell = board[0][j];
      if (firstCell && board.every((row) => row[j] === firstCell)) {
        return firstCell;
      }
    }

    // Check diagonals
    const diag1 = board[0][0];
    if (diag1 && board.every((row, idx) => row[idx] === diag1)) {
      return diag1;
    }

    const diag2 = board[0][size - 1];
    if (diag2 && board.every((row, idx) => row[size - 1 - idx] === diag2)) {
      return diag2;
    }

    // Check for draw
    if (board.flat().every((cell) => cell !== null)) {
      return "draw";
    }

    return null;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (winner() !== null || board()[row][col] !== null) return;

    const newBoard = [...board()];
    newBoard[row][col] = currentPlayer();
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setTimerActive(false);
      if (gameWinner === "X") {
        setScore((prev) => ({ ...prev, X: prev.X + 1 }));
      } else if (gameWinner === "O") {
        setScore((prev) => ({ ...prev, O: prev.O + 1 }));
      } else {
        setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      }
    } else {
      setCurrentPlayer(currentPlayer() === "X" ? "O" : "X");
    }
  };

  // Reset the game
  const resetGame = () => {
    initializeBoard();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Initialize the game on component mount or when grid size changes
  createEffect(() => {
    initializeBoard();
  });

  // Cell component
  const Cell = (props: { row: number; col: number }) => {
    const cell = () => board()[props.row][props.col];

    return (
      <div
        class={`w-16 h-16 border border-gray-700 flex items-center justify-center text-3xl font-bold cursor-pointer select-none transition-colors ${
          cell()
            ? cell() === "X"
              ? "text-blue-400"
              : "text-red-400"
            : "hover:bg-gray-800"
        } ${winner() ? "cursor-not-allowed" : ""}`}
        onClick={() => handleCellClick(props.row, props.col)}
      >
        {cell()}
      </div>
    );
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen text-gray-100 p-4 bg-gray-900">
      <h1 class="text-4xl font-bold mb-6 text-white">Tic Tac Toe</h1>

      <div class="mb-8 flex gap-4 items-center justify-center flex-wrap">
        <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-3 shadow-md">
          <div class="text-blue-400 font-bold">X</div>
          <span class="text-xl">{score().X}</span>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-3 shadow-md">
          <div class="text-red-400 font-bold">O</div>
          <span class="text-xl">{score().O}</span>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-3 shadow-md">
          <div class="text-gray-300 font-bold">Draws</div>
          <span class="text-xl">{score().draws}</span>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-3 shadow-md">
          <div class="text-yellow-400">⏱️</div>
          <span class="text-xl">{formatTime(timeElapsed())}</span>
        </div>

        <button
          onClick={resetGame}
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit shadow-md font-medium"
        >
          New Game
        </button>
      </div>

      <div class="mb-6 flex gap-4 flex-wrap justify-center">
        <div class="bg-gray-800 p-4 rounded-lg shadow-md">
          <label class="block mb-2 text-gray-300 font-medium">Grid Size:</label>
          <div class="flex items-center gap-3">
            <input
              type="range"
              min="3"
              max="5"
              value={gridSize()}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              class="w-32 accent-blue-500"
              disabled={winner() === null}
            />
            <span class="ml-2 w-8 text-center text-xl">{gridSize()}</span>
          </div>
        </div>
      </div>

      <div class="mb-6 text-2xl font-medium">
        {winner()
          ? winner() === "draw"
            ? "It's a draw!"
            : `Player ${winner()} wins!`
          : `Current Player: ${currentPlayer()}`}
      </div>

      <div
        class="grid gap-1 bg-gray-800 p-2 rounded-lg shadow-xl"
        style={{
          "grid-template-columns": `repeat(${gridSize()}, minmax(0, 1fr))`,
        }}
      >
        <For each={board()}>
          {(row, rowIndex) => (
            <For each={row}>
              {(_, colIndex) => <Cell row={rowIndex()} col={colIndex()} />}
            </For>
          )}
        </For>
      </div>

      <div class="mt-6 text-gray-400 text-sm">
        Click on a cell to place your mark
      </div>
    </div>
  );
}