/* =========================================================
   PATTERN MEMORY
   BUILD 5
   GAME LOGIC

   This file contains:
   - Game state
   - Pattern generation
   - Scoring
   - Streaks
   - Game over
   - Difficulty
   - LocalStorage persistence

   Visual styling is in style.css.
   Page structure is in index.html.
   ========================================================= */


/* =========================================================
   DIFFICULTY CONFIGURATION
   =========================================================

   Each difficulty has its own:
   - Grid size
   - Starting pattern size
   - Maximum pattern size
   - Display time
   - Base score
   ========================================================= */

const MODES = {

  easy: {
    size: 4,
    startingPattern: 4,
    maxPattern: 10,
    showTime: 1200,
    points: 10
  },

  normal: {
    size: 5,
    startingPattern: 6,
    maxPattern: 14,
    showTime: 1250,
    points: 20
  },

  hard: {
    size: 6,
    startingPattern: 8,
    maxPattern: 20,
    showTime: 1400,
    points: 35
  }

};


/* =========================================================
   LOCAL STORAGE
   =========================================================

   We keep all persistent records under ONE key.

   Example stored data:

   {
     easy: {
       bestScore: 420,
       bestStreak: 8
     },

     normal: {
       bestScore: 610,
       bestStreak: 7
     },

     hard: {
       bestScore: 950,
       bestStreak: 9
     }
   }

   This makes future additions easier.
   ========================================================= */

const STORAGE_KEY =
  "patternMemoryBest";


/* =========================================================
   DEFAULT BEST DATA
   ========================================================= */

const DEFAULT_BESTS = {

  easy: {
    bestScore: 0,
    bestStreak: 0
  },

  normal: {
    bestScore: 0,
    bestStreak: 0
  },

  hard: {
    bestScore: 0,
    bestStreak: 0
  }

};


/* =========================================================
   GAME STATE
   ========================================================= */

let mode = "easy";

let gridSize =
  MODES[mode].size;

let patternSize =
  MODES[mode].startingPattern;

let showTime =
  MODES[mode].showTime;

let basePoints =
  MODES[mode].points;


/* Current pattern */

let pattern = [];


/* Tiles selected by player */

let selected = [];


/* Is the pattern currently visible? */

let showingPattern = false;


/* Is the current run over? */

let gameOver = false;


/* Current run values */

let round = 1;

let score = 0;

let streak = 0;


/* Best streak reached during THIS run */

let bestRunStreak = 0;


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const grid =
  document.getElementById(
    "grid"
  );

const message =
  document.getElementById(
    "message"
  );

const roundValue =
  document.getElementById(
    "roundValue"
  );

const scoreValue =
  document.getElementById(
    "scoreValue"
  );

const streakValue =
  document.getElementById(
    "streakValue"
  );

const bestScoreValue =
  document.getElementById(
    "bestScoreValue"
  );

const bestStreakValue =
  document.getElementById(
    "bestStreakValue"
  );

const restart =
  document.getElementById(
    "restart"
  );

const playAgain =
  document.getElementById(
    "playAgain"
  );

const gameOverScreen =
  document.getElementById(
    "gameOver"
  );

const finalScore =
  document.getElementById(
    "finalScore"
  );

const finalStreak =
  document.getElementById(
    "finalStreak"
  );

const finalRound =
  document.getElementById(
    "finalRound"
  );

const newBest =
  document.getElementById(
    "newBest"
  );

const difficultyButtons =
  document.querySelectorAll(
    ".difficulty-button"
  );

/* =========================================================
   BUILD 7 — PROGRESSION DOM
   ========================================================= */

const progressionLabel =
  document.getElementById(
    "progressionLabel"
  );

const progressionRound =
  document.getElementById(
    "progressionRound"
  );

const progressBar =
  document.getElementById(
    "progressBar"
  );

const milestoneMessage =
  document.getElementById(
    "milestoneMessage"
  );

/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */


/*
 * Load saved best scores.
 *
 * If nothing has been saved yet,
 * return a fresh copy of DEFAULT_BESTS.
 */

function loadBests() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {

      return structuredClone(
        DEFAULT_BESTS
      );

    }


    const parsed =
      JSON.parse(saved);


    /*
     * Merge saved data with defaults.
     *
     * This protects us if we add a new
     * difficulty or stat in a future build.
     */

    return {

      easy: {
        ...DEFAULT_BESTS.easy,
        ...parsed.easy
      },

      normal: {
        ...DEFAULT_BESTS.normal,
        ...parsed.normal
      },

      hard: {
        ...DEFAULT_BESTS.hard,
        ...parsed.hard
      }

    };

  }
  catch (error) {

    /*
     * If localStorage contains invalid
     * data, simply start with defaults.
     */

    console.warn(
      "Could not load saved scores.",
      error
    );

    return structuredClone(
      DEFAULT_BESTS
    );

  }

}


/*
 * Save best scores.
 */

function saveBests(bests) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(bests)
    );

  }
  catch (error) {

    /*
     * The game still works if storage
     * is unavailable.
     */

    console.warn(
      "Could not save scores.",
      error
    );

  }

}


/*
 * Return the saved record for
 * the currently selected difficulty.
 */

function getCurrentBest() {

  const bests =
    loadBests();


  return bests[mode];

}


/* =========================================================
   UPDATE CURRENT GAME STATS
   ========================================================= */

function updateStats() {

  roundValue.textContent =
    round;

  scoreValue.textContent =
    score;

  streakValue.textContent =
    streak;

}


/* =========================================================
   UPDATE BEST SCORE DISPLAY
   ========================================================= */

function updateBestDisplay() {

  const best =
    getCurrentBest();


  bestScoreValue.textContent =
    best.bestScore;

  bestStreakValue.textContent =
    best.bestStreak;

}


/* =========================================================
   SCORE POP ANIMATION
   ========================================================= */

function popScore() {

  scoreValue.classList.remove(
    "pop"
  );


  /*
   * Force the browser to restart
   * the CSS animation.
   */

  void scoreValue.offsetWidth;


  scoreValue.classList.add(
    "pop"
  );

}


/* =========================================================
   CREATE GRID
   ========================================================= */

function createGrid() {

  grid.innerHTML = "";


  /*
   * Set the number of columns
   * according to the selected difficulty.
   */

  grid.style.gridTemplateColumns =
    `repeat(${gridSize}, 1fr)`;


  const tileCount =
    gridSize * gridSize;


  /*
   * Create every tile.
   */

  for (
    let i = 0;
    i < tileCount;
    i++
  ) {

    const tile =
      document.createElement(
        "button"
      );


    tile.className =
      "tile";

    tile.type =
      "button";

    tile.dataset.index =
      i;


    /*
     * Each tile remembers its
     * own grid index.
     */

    tile.addEventListener(
      "click",
      () =>
        handleTile(i)
    );


    grid.appendChild(
      tile
    );

  }

}


/* =========================================================
   CALCULATE CURRENT PATTERN SIZE
   =========================================================

   Every two successful rounds add
   another tile to remember.

   Example Easy:

   Round 1 → 4
   Round 2 → 4
   Round 3 → 5
   Round 4 → 5
   Round 5 → 6
   ========================================================= */

function getPatternSize() {

  const config =
    MODES[mode];


  return Math.min(

    config.startingPattern +
    Math.floor(
      (round - 1) / 2
    ),

    config.maxPattern,

    /*
     * Leave at least two tiles
     * unselected.
     */

    (gridSize * gridSize) - 2

  );

}


/* =========================================================
   CALCULATE CURRENT DISPLAY TIME
   =========================================================

   Higher rounds slightly reduce the
   amount of time the player gets to
   memorize the pattern.
   ========================================================= */

function getCurrentShowTime() {

  const reduction =
    Math.min(
      (round - 1) * 25,
      350
    );


  return Math.max(
    650,
    showTime - reduction
  );

}


/* =========================================================
   GENERATE RANDOM PATTERN
   ========================================================= */

function generatePattern() {

  const tileCount =
    gridSize * gridSize;


  /*
   * Create an array:
   *
   * [0, 1, 2, 3, ...]
   */

  const numbers =
    Array.from(
      {
        length: tileCount
      },
      (_, i) => i
    );


  /*
   * Fisher-Yates shuffle.
   *
   * This gives us a properly randomized
   * tile order.
   */

  for (
    let i = numbers.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    [
      numbers[i],
      numbers[j]
    ] = [
      numbers[j],
      numbers[i]
    ];

  }


  /*
   * Determine how many tiles the
   * player needs to remember.
   */

  patternSize =
    getPatternSize();


  /*
   * Keep only the required number.
   */

  pattern =
    numbers.slice(
      0,
      patternSize
    );

}


/* =========================================================
   SHOW PATTERN
   ========================================================= */

function showPattern() {

  showingPattern = true;

  selected = [];


  const tiles =
    document.querySelectorAll(
      ".tile"
    );


  /*
   * Clear old tile states.
   */

  tiles.forEach(
    tile => {

      tile.classList.remove(
        "pattern",
        "selected",
        "correct",
        "wrong"
      );

    }
  );


  /*
   * Highlight the generated pattern.
   */

  pattern.forEach(
    index => {

      tiles[index]
        .classList.add(
          "pattern"
        );

    }
  );


  message.textContent = "Watch carefully...";
message.classList.remove(
  "success-message",
  "fail-message"
);



  /*
   * Hide the pattern after
   * the configured amount of time.
   */

  setTimeout(
    hidePattern,
    getCurrentShowTime()
  );

}


/* =========================================================
   HIDE PATTERN
   ========================================================= */

function hidePattern() {

  /*
   * Don't reveal anything if the
   * player already lost the game.
   */

  if (gameOver) {

    return;

  }


  const tiles =
    document.querySelectorAll(
      ".tile"
    );


  tiles.forEach(
    tile => {

      tile.classList.remove(
        "pattern"
      );

    }
  );


  showingPattern = false;


  message.textContent =
    "Your turn!";

}


/* =========================================================
   HANDLE PLAYER TILE TAP
   ========================================================= */

function handleTile(index) {

  /*
   * Ignore taps while the pattern
   * is being shown or after game over.
   */

  if (
    showingPattern ||
    gameOver
  ) {

    return;

  }


  /*
   * Don't allow the same tile
   * to be selected twice.
   */

  if (
    selected.includes(index)
  ) {

    return;

  }


  selected.push(index);


  const tile =
    document.querySelector(
      `.tile[data-index="${index}"]`
    );


  /* =======================================================
     WRONG TILE
     ======================================================= */

  if (
    !pattern.includes(index)
  ) {

    tile.classList.add(
      "wrong"
    );


    /*
     * One mistake ends the run.
     */

    endGame();


    return;

  }


  /* =======================================================
     CORRECT TILE
     ======================================================= */

  tile.classList.add(
    "selected"
  );


  /*
   * If every pattern tile has been
   * correctly selected, the round wins.
   */

  if (
    selected.length ===
    pattern.length
  ) {

    finishRound();

  }

}


/* =========================================================
   CALCULATE ROUND SCORE
   ========================================================= */

function calculatePoints() {

  /*
   * Larger patterns are worth more.
   */

  const patternBonus =
    patternSize * 2;


  /*
   * Streak multiplier.
   */

  let multiplier = 1;


  if (
    streak >= 5
  ) {

    multiplier = 2;

  }
  else if (
    streak >= 3
  ) {

    multiplier = 1.5;

  }


  return Math.round(
    (
      basePoints +
      patternBonus
    ) *
    multiplier
  );

}


/* =========================================================
   FINISH SUCCESSFUL ROUND
   ========================================================= */

function finishRound() {

  /*
   * Increase streak FIRST.
   *
   * This means the points earned
   * benefit from the new streak.
   */

  streak++;


  /*
   * Remember the highest streak
   * reached during this run.
   */

  bestRunStreak =
    Math.max(
      bestRunStreak,
      streak
    );


  /*
   * Calculate and add points.
   */

  const earned =
    calculatePoints();


  score += earned;


  updateStats();

  popScore();


  message.textContent = `✓ +${earned} points`;

message.classList.remove(
  "fail-message"
);

message.classList.add(
  "success-message"
);



  grid.classList.add(
    "success"
  );


  /*
   * Show the correctly remembered
   * pattern briefly.
   */

  pattern.forEach(
    index => {

      const tile =
        document.querySelector(
          `.tile[data-index="${index}"]`
        );


      tile.classList.remove(
        "selected"
      );


      tile.classList.add(
        "correct"
      );

    }
  );


  /*
   * Start the next round after
   * a short success animation.
   */

  setTimeout(
    () => {

      if (gameOver) {

        return;

      }


      grid.classList.remove(
        "success"
      );


      round++;
     checkMilestone();

updateProgression();


      updateStats();


      startRound();

    },
    700
  );

}
/* =========================================================
   BUILD 7 — PROGRESSION
   ========================================================= */


/*
 * Milestones happen every 5 rounds.
 *
 * Example:
 *
 * Round 1 → milestone at 5
 * Round 2 → milestone at 5
 * Round 3 → milestone at 5
 * Round 4 → milestone at 5
 * Round 5 → milestone reached
 * Round 6 → milestone at 10
 */

function getNextMilestone() {

  return (
    Math.ceil(round / 5) * 5
  );

}


/*
 * Update the progression bar.
 */

function updateProgression() {

  const next =
    getNextMilestone();


  /*
   * The progress inside the
   * current five-round block.
   */

  const blockStart =
    next - 5;


  const progress =
    Math.min(
      100,
      Math.max(
        0,
        (
          (round - blockStart) /
          5
        ) * 100
      )
    );


  progressBar.style.width =
    `${progress}%`;


  progressionRound.textContent =
    `Round ${next}`;


  /*
   * Change the text as the player
   * gets closer to the milestone.
   */

  if (
    round >= next - 1
  ) {

    progressionLabel.textContent =
      "Almost there!";

  }
  else {

    progressionLabel.textContent =
      "Next milestone";

  }

}


/*
 * Check whether the current round
 * has just reached a milestone.
 */

function checkMilestone() {

  if (
    round === 1
  ) {

    return;

  }


  if (
    round % 5 !== 0
  ) {

    return;

  }


  showMilestone();

}


/*
 * Show milestone celebration.
 */

function showMilestone() {

  milestoneMessage.textContent =
    `🏆 Round ${round} milestone!`;


  milestoneMessage.classList.remove(
    "show"
  );


  /*
   * Restart the animation.
   */

  void milestoneMessage.offsetWidth;


  milestoneMessage.classList.add(
    "show"
  );


  grid.classList.remove(
    "milestone"
  );


  void grid.offsetWidth;


  grid.classList.add(
    "milestone"
  );


  /*
   * Remove the temporary message
   * after the celebration.
   */

  setTimeout(
    () => {

      milestoneMessage.classList.remove(
        "show"
      );

    },
    1300
  );

}


/*
 * Describe how difficult the
 * current round has become.
 */

function getDifficultyMessage() {

  if (
    patternSize >=
    MODES[mode].maxPattern
  ) {

    return "Maximum pattern size";

  }


  if (
    round >= 10
  ) {

    return "Pattern getting harder";

  }


  if (
    round >= 5
  ) {

    return "Pattern growing";

  }


  return "Build your memory";

}


/* =========================================================
   START ROUND
   ========================================================= */

function startRound() {

  if (gameOver) {

    return;

  }
grid.classList.remove("round-start");

/*
 * Force the animation to restart
 * for every new round.
 */
void grid.offsetWidth;

grid.classList.add("round-start");


  showingPattern = true;


  generatePattern();
  updateProgression();


  showPattern();

}


/* =========================================================
   END GAME
   ========================================================= */

function endGame() {

  gameOver = true;

  showingPattern = false;


  /*
   * Save the streak BEFORE resetting
   * the current streak.
   */

  const finishedStreak =
    streak;


  /*
   * Check whether this run created
   * new personal records.
   */

  const bests =
    loadBests();


  const currentBest =
    bests[mode];


  const isNewScore =
    score >
    currentBest.bestScore;


  const isNewStreak =
    finishedStreak >
    currentBest.bestStreak;


  /*
   * Update persistent records.
   */

  if (isNewScore) {

    currentBest.bestScore =
      score;

  }


  if (isNewStreak) {

    currentBest.bestStreak =
      finishedStreak;

  }


  /*
   * Save to localStorage.
   */

  saveBests(bests);


  /*
   * Update the visible best values.
   */

  updateBestDisplay();


  /*
   * Populate game-over screen.
   */

  finalScore.textContent =
    score;

  finalStreak.textContent =
    finishedStreak;

  finalRound.textContent =
    round;


  /*
   * Show "New Best" if either
   * record was beaten.
   */

  newBest.classList.toggle(
    "show",
    isNewScore ||
    isNewStreak
  );


message.textContent = "Game over";

message.classList.remove(
  "success-message"
);

message.classList.add(
  "fail-message"
);



  /*
   * Give the wrong tile a moment
   * before opening the overlay.
   */

  setTimeout(
    () => {

      gameOverScreen.classList.add(
        "show"
      );

      gameOverScreen.setAttribute(
        "aria-hidden",
        "false"
      );

    },
    350
  );

}


/* =========================================================
   HIDE GAME OVER
   ========================================================= */

function hideGameOver() {

  gameOverScreen.classList.remove(
    "show"
  );

  gameOverScreen.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   START A COMPLETELY NEW GAME
   ========================================================= */

function restartGame() {

  hideGameOver();


  gameOver = false;

  showingPattern = false;

  selected = [];

  pattern = [];


  /*
   * Reset current run.
   *
   * Persistent best scores are NOT reset.
   */

  round = 1;

  score = 0;

  streak = 0;

  bestRunStreak = 0;

  updateProgression();

  updateStats();

  updateBestDisplay();


  message.textContent =
    "Watch carefully...";

message.classList.remove(
  "success-message",
  "fail-message"
);



  createGrid();

  startRound();

}


/* =========================================================
   CHANGE DIFFICULTY
   ========================================================= */

function changeDifficulty(
  newMode
) {

  mode = newMode;


  /*
   * Load the new mode's configuration.
   */

  gridSize =
    MODES[mode].size;

  patternSize =
    MODES[mode].startingPattern;

  showTime =
    MODES[mode].showTime;

  basePoints =
    MODES[mode].points;


  /*
   * Update active button.
   */

  difficultyButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );

    }
  );


  /*
   * Start a completely new run
   * using the selected difficulty.
   */

  restartGame();

}


/* =========================================================
   DIFFICULTY BUTTON EVENTS
   ========================================================= */

difficultyButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const newMode =
          button.dataset.mode;


        /*
         * Don't restart if the player
         * taps the already active mode.
         */

        if (
          newMode === mode
        ) {

          return;

        }


        changeDifficulty(
          newMode
        );

      }
    );

  }
);


/* =========================================================
   RESTART BUTTON
   ========================================================= */

restart.addEventListener(
  "click",
  restartGame
);


/* =========================================================
   PLAY AGAIN BUTTON
   ========================================================= */

playAgain.addEventListener(
  "click",
  restartGame
);


/* =========================================================
   INITIAL GAME START
   ========================================================= */

createGrid();

updateStats();

updateBestDisplay();

updateProgression();

startRound();
