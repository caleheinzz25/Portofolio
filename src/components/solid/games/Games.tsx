import { createSignal, Show, Switch, Match } from "solid-js";
import { Minesweeper } from "./MIneSweeperGames";

type GameType = "minesweeper" | "sudoku" | "memory";

interface Props {
  onClose: () => void;
}

export function GameWrapper({ onClose }: Props) {
  const [showGameSelector, setShowGameSelector] = createSignal(true);
  const [selectedGame, setSelectedGame] = createSignal<GameType | null>(null);

  const startGame = (game: GameType) => {
    setSelectedGame(game);
    setShowGameSelector(false);
  };

  const returnToMenu = () => {
    setShowGameSelector(true);
    setSelectedGame(null);
  };

  return (
    <div class="min-h-screen bg-gray-900 text-white p-4">
      {/* Game Selector Popup */}
      <Show when={showGameSelector()}>
        <div class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
            <h2 class="text-2xl font-bold mb-6 text-center text-white">
              Select a Game
            </h2>

            <div class="grid gap-4">
              <GameOption
                title="Minesweeper"
                description="Find all the mines without triggering them"
                onClick={() => startGame("minesweeper")}
                icon="💣"
              />

              <GameOption
                title="Sudoku"
                description="Fill the grid with numbers 1-9 (Coming Soon)"
                onClick={() => {}}
                icon="🧩"
                disabled
              />

              <GameOption
                title="Memory Game"
                description="Match pairs of cards (Coming Soon)"
                onClick={() => {}}
                icon="🧠"
                disabled
              />
            </div>

            <div class="mt-6 text-center text-gray-400 text-sm">
              More games coming soon!
            </div>
          </div>
        </div>
      </Show>

      {/* Game Content */}
      <div class="max-w-4xl mx-auto mt-10">
        <Switch>
          <Match when={selectedGame() === "minesweeper"}>
            <div class="relative">
              <button
                onClick={returnToMenu}
                class="absolute top-0 right-0 px-4 py-2 bg-gray-700 text-sm rounded hover:bg-gray-600 transition"
              >
                ← Back to Menu
              </button>
              <Minesweeper />
            </div>
          </Match>

          <Match when={!selectedGame()}>
            <div class="text-center py-24">
              <h2 class="text-3xl font-bold mb-4">Welcome to Game Hub</h2>
              <p class="text-gray-400 text-sm">
                Please select a game to start playing.
              </p>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
}

// Game Option Component
function GameOption(props: {
  title: string;
  description: string;
  onClick: () => void;
  icon: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      class={`p-4 text-left rounded-lg w-full transition-all duration-200 ${
        props.disabled
          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
          : "bg-gray-700 hover:bg-gray-600 hover:scale-[1.02]"
      }`}
    >
      <div class="flex items-center gap-4">
        <div class="text-3xl">{props.icon}</div>
        <div>
          <h3 class="font-bold text-lg text-white">{props.title}</h3>
          <p class="text-gray-400 text-sm">{props.description}</p>
        </div>
      </div>
    </button>
  );
}
