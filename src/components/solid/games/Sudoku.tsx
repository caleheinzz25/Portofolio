import { createSignal, createEffect, For, onCleanup } from "solid-js";

type CellState = {
  value: number | null;
  isFixed: boolean;
  isHighlighted: boolean;
  isInvalid: boolean;
  notes: Set<number>;
};

export function Sudoku() {
  const [grid, setGrid] = createSignal<CellState[][]>([]);
  const [selectedCell, setSelectedCell] = createSignal<[number, number] | null>(null);
  const [difficulty, setDifficulty] = createSignal<"easy" | "medium" | "hard">("easy");
  const [gameComplete, setGameComplete] = createSignal(false);
  const [timeElapsed, setTimeElapsed] = createSignal(0);
  const [timerActive, setTimerActive] = createSignal(false);
  const [mistakes, setMistakes] = createSignal(0);
  const [noteMode, setNoteMode] = createSignal(false);
  const [confetti, setConfetti] = createSignal(false);

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
    const newGrid: CellState[][] = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => ({
        value: null,
        isFixed: false,
        isHighlighted: false,
        isInvalid: false,
        notes: new Set<number>(),
      }))
    );
    setGrid(newGrid);
    setSelectedCell(null);
    setGameComplete(false);
    setTimeElapsed(0);
    setTimerActive(false);
    setMistakes(0);
    setConfetti(false);
  };

  // Generate a new puzzle
  const generatePuzzle = () => {
    initializeGrid();
    
    // This is a simplified puzzle generator. In a real app, you'd want a more robust generator.
    // Here we'll use a pre-defined easy puzzle for demonstration.
    const puzzle = getPuzzleByDifficulty(difficulty());
    
    const newGrid = [...grid()];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle[i][j] !== 0) {
          newGrid[i][j] = {
            ...newGrid[i][j],
            value: puzzle[i][j],
            isFixed: true
          };
        }
      }
    }
    
    setGrid(newGrid);
    setTimerActive(true);
  };

  // Helper function to get puzzles by difficulty
  const getPuzzleByDifficulty = (level: "easy" | "medium" | "hard") => {
    // These are example puzzles (0 represents empty cells)
    const puzzles = {
      easy: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ],
      medium: [
        [0, 0, 0, 6, 0, 0, 4, 0, 0],
        [7, 0, 0, 0, 0, 3, 6, 0, 0],
        [0, 0, 0, 0, 9, 1, 0, 8, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 5, 0, 1, 8, 0, 0, 0, 3],
        [0, 0, 0, 3, 0, 6, 0, 4, 5],
        [0, 4, 0, 2, 0, 0, 0, 6, 0],
        [9, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 1, 0, 0]
      ],
      hard: [
        [8, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 6, 0, 0, 0, 0, 0],
        [0, 7, 0, 0, 9, 0, 2, 0, 0],
        [0, 5, 0, 0, 0, 7, 0, 0, 0],
        [0, 0, 0, 0, 4, 5, 7, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 3, 0],
        [0, 0, 1, 0, 0, 0, 0, 6, 8],
        [0, 0, 8, 5, 0, 0, 0, 1, 0],
        [0, 9, 0, 0, 0, 0, 4, 0, 0]
      ]
    };
    
    return puzzles[level];
  };

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    if (gameComplete() || grid()[row][col].isFixed) return;

    // Clear previous highlights
    const newGrid = grid().map(rowArr => 
      rowArr.map(cell => ({ ...cell, isHighlighted: false }))
    );

    // Highlight the selected cell and related cells
    newGrid[row][col].isHighlighted = true;
    
    // Highlight same row, column, and 3x3 box
    for (let i = 0; i < 9; i++) {
      // Same row
      if (i !== col) newGrid[row][i].isHighlighted = true;
      // Same column
      if (i !== row) newGrid[i][col].isHighlighted = true;
    }
    
    // Same 3x3 box
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    for (let i = boxRowStart; i < boxRowStart + 3; i++) {
      for (let j = boxColStart; j < boxColStart + 3; j++) {
        if (i !== row || j !== col) newGrid[i][j].isHighlighted = true;
      }
    }

    setGrid(newGrid);
    setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    const currentSelected = selectedCell();
    if (!currentSelected || gameComplete()) return;
    
    const [row, col] = currentSelected;
    if (grid()[row][col].isFixed) return;

    const newGrid = [...grid()];
    
    if (noteMode()) {
      // Toggle note
      const notes = new Set(newGrid[row][col].notes);
      if (notes.has(num)) {
        notes.delete(num);
      } else {
        notes.add(num);
      }
      newGrid[row][col].notes = notes;
      newGrid[row][col].value = null;
    } else {
      // Set value
      newGrid[row][col].value = num;
      newGrid[row][col].notes = new Set();
      
      // Check if the move is valid
      const isValid = validateMove(row, col, num);
      newGrid[row][col].isInvalid = !isValid;
      
      if (!isValid) {
        setMistakes(prev => prev + 1);
      }
    }

    setGrid(newGrid);
    
    // Check if the puzzle is complete
    checkCompletion();
  };

  // Validate a move
  const validateMove = (row: number, col: number, num: number) => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (i !== col && grid()[row][i].value === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid()[i][col].value === num) return false;
    }
    
    // Check 3x3 box
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    for (let i = boxRowStart; i < boxRowStart + 3; i++) {
      for (let j = boxColStart; j < boxColStart + 3; j++) {
        if ((i !== row || j !== col) && grid()[i][j].value === num) return false;
      }
    }
    
    return true;
  };

  // Check if the puzzle is complete
  const checkCompletion = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid()[i][j].value === null || grid()[i][j].isInvalid) {
          return false;
        }
      }
    }
    
    setGameComplete(true);
    setTimerActive(false);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 5000);
    return true;
  };

  // Clear the selected cell
  const handleClearCell = () => {
    const currentSelected = selectedCell();
    if (!currentSelected || gameComplete()) return;
    
    const [row, col] = currentSelected;
    if (grid()[row][col].isFixed) return;

    const newGrid = [...grid()];
    newGrid[row][col].value = null;
    newGrid[row][col].notes = new Set();
    newGrid[row][col].isInvalid = false;
    setGrid(newGrid);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cell component
  const Cell = (props: { row: number; col: number }) => {
    const cell = () => grid()[props.row][props.col];
    const isSelected = () => {
      const selected = selectedCell();
      return selected && selected[0] === props.row && selected[1] === props.col;
    };

    return (
      <div
        class={`w-10 h-10 border border-gray-300 flex items-center justify-center text-lg font-bold cursor-pointer select-none transition-colors ${
          cell().isFixed ? "bg-gray-100 text-gray-900" : 
          cell().isInvalid ? "bg-red-200 text-red-900" :
          isSelected() ? "bg-blue-200 text-blue-900" :
          cell().isHighlighted ? "bg-blue-50 text-gray-900" :
          "bg-white text-gray-900 hover:bg-gray-100"
        } ${
          (props.col + 1) % 3 === 0 && props.col < 8 ? "border-r-2 border-r-gray-500" : ""
        } ${
          (props.row + 1) % 3 === 0 && props.row < 8 ? "border-b-2 border-b-gray-500" : ""
        }`}
        onClick={() => handleCellClick(props.row, props.col)}
      >
        {cell().value ? cell().value : (
          <div class="grid grid-cols-3 w-full h-full text-xs text-gray-500">
            {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
              <div class="flex items-center justify-center">
                {cell().notes.has(num) ? num : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Number button component
  const NumberButton = (props: { num: number }) => {
    return (
      <button
        class="w-10 h-10 bg-gray-200 text-gray-900 rounded flex items-center justify-center text-lg font-bold hover:bg-gray-300 transition-colors"
        onClick={() => handleNumberInput(props.num)}
      >
        {props.num}
      </button>
    );
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen text-gray-100 p-4 bg-gray-900">
      <h1 class="text-3xl font-bold mb-4 text-white">Sudoku</h1>

      <div class="mb-6 flex gap-4 items-center justify-center flex-wrap">
        <div class="bg-gray-800 p-3 rounded-lg flex items-center gap-2">
          <div class="text-red-500">⏱️</div>
          <span>{formatTime(timeElapsed())}</span>
        </div>

        <div class="bg-gray-800 p-3 rounded-lg flex items-center gap-2">
          <div class="text-yellow-500">⚠️</div>
          <span>{mistakes()} mistakes</span>
        </div>

        <button
          onClick={generatePuzzle}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors h-fit"
        >
          New Game
        </button>
      </div>

      <div class="mb-4 flex gap-4 flex-wrap justify-center">
        <div class="bg-gray-800 p-3 rounded-lg">
          <label class="block mb-1 text-gray-300">Difficulty:</label>
          <select
            value={difficulty()}
            onChange={(e) => setDifficulty(e.target.value as any)}
            class="bg-gray-700 text-white rounded p-2"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-9 gap-px bg-gray-500 p-px rounded overflow-hidden shadow-lg mb-6">
        <For each={grid()}>
          {(row, rowIndex) => (
            <For each={row}>
              {(_, colIndex) => <Cell row={rowIndex()} col={colIndex()} />}
            </For>
          )}
        </For>
      </div>

      <div class="flex gap-2 mb-4">
        <button
          class={`px-4 py-2 rounded transition-colors ${
            noteMode()
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => setNoteMode(!noteMode())}
        >
          Notes {noteMode() ? "✓" : ""}
        </button>
        <button
          class="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
          onClick={handleClearCell}
        >
          Clear
        </button>
      </div>

      <div class="grid grid-cols-5 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <NumberButton num={num} />
        ))}
      </div>

      {gameComplete() && (
        <div class="mt-4 p-4 rounded-lg text-center bg-green-900/80">
          <div class="text-xl font-bold mb-2">Puzzle Complete!</div>
          <div class="mb-2">Time: {formatTime(timeElapsed())}</div>
          <div class="mb-2">Mistakes: {mistakes()}</div>
          <button
            onClick={generatePuzzle}
            class="px-4 py-2 bg-white/90 text-gray-900 rounded hover:bg-white transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {confetti() && (
        <div class="fixed inset-0 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              class="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${Math.random() * 3 + 2}s linear forwards`,
                "animation-delay": `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}