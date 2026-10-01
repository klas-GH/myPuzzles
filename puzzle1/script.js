const board = document.getElementById("board");

const shuffleButton =
  document.getElementById("shuffle");

const moveCount =
  document.getElementById("moveCount");

const bestCount =
  document.getElementById("bestCount");

const winMessage =
  document.getElementById("winMessage");

const winMoves =
  document.getElementById("winMoves");

const winBest =
  document.getElementById("winBest");

const newPuzzleButton =
  document.getElementById("newPuzzle");

const unlockMessage =
  document.getElementById("unlockMessage");

const themes =
  document.getElementById("themes");

const difficultyButtons =
  document.querySelectorAll(".difficulty-button");

const themeButtons =
  document.querySelectorAll(".theme-button");


/* --------------------------------
   Game state
-------------------------------- */

let size = 4;

let tiles = [];

let moves = 0;

let best = 0;

let gameWon = false;
let mysteryMode = false;

let mysteryGoalRotation = 0;

let mysteryBoardRotation = 0;

let mysteryRotationMoves = 0;
const mysteryGoal =
  document.getElementById("mysteryGoal");



/* --------------------------------
   Theme / progression
-------------------------------- */

const themeUnlocks = {
  neon: 3,
  forest: 10,
  sunset: 25
};


let solvedCount =
  Number(
    localStorage.getItem("15puzzle-solved")
  ) || 0;


let unlockedThemes =
  JSON.parse(
    localStorage.getItem("15puzzle-themes") ||
    '["classic"]'
  );


/* --------------------------------
   Apply saved theme
-------------------------------- */

function applyTheme(theme) {

  if (!unlockedThemes.includes(theme)) {
    return;
  }

  document.body.dataset.theme = theme;

  localStorage.setItem(
    "15puzzle-theme",
    theme
  );


  themeButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.theme === theme
    );
  });
}


/* --------------------------------
   Update theme availability
-------------------------------- */

function updateThemes() {

  let hasExtraTheme = false;


  themeButtons.forEach(button => {

    const theme =
      button.dataset.theme;


    if (theme === "classic") {
      return;
    }


    const unlocked =
      unlockedThemes.includes(theme);


    button.disabled = !unlocked;

    button.classList.toggle(
      "locked",
      !unlocked
    );


    if (unlocked) {

      hasExtraTheme = true;

      button.textContent =
        theme.charAt(0).toUpperCase() +
        theme.slice(1);
    }
  });


  /*
    Show the selector once
    at least one extra theme exists.
  */

  themes.classList.toggle(
    "visible",
    hasExtraTheme
  );
}


/* --------------------------------
   Unlock new themes
-------------------------------- */

function checkThemeUnlocks() {

  let newlyUnlocked = null;


  Object.entries(themeUnlocks)
    .forEach(([theme, required]) => {

      if (
        solvedCount >= required &&
        !unlockedThemes.includes(theme)
      ) {

        unlockedThemes.push(theme);

        newlyUnlocked = theme;
      }

    });


  localStorage.setItem(
    "15puzzle-themes",
    JSON.stringify(unlockedThemes)
  );


  updateThemes();


  if (newlyUnlocked) {

    const name =
      newlyUnlocked.charAt(0).toUpperCase() +
      newlyUnlocked.slice(1);


    unlockMessage.textContent =
      `🎉 New theme unlocked: ${name}`;


    unlockMessage.style.display =
      "block";


    setTimeout(() => {

      unlockMessage.style.display =
        "none";

    }, 3000);
  }
}


/* --------------------------------
   Best score
   Separate for each difficulty
-------------------------------- */

function getBest() {

  const key =
    mysteryMode
      ? "15puzzle-best-mystery"
      : `15puzzle-best-${size}`;

  return Number(
    localStorage.getItem(key)
  ) || 0;
}


function saveBest() {

  const key =
    mysteryMode
      ? "15puzzle-best-mystery"
      : `15puzzle-best-${size}`;

  localStorage.setItem(key, best);
}

function createMysteryGoal() {

  const solved = createSolvedBoard();

  const rotations = [0, 90, 180, 270];

  mysteryGoalRotation =
    rotations[
      Math.floor(
        Math.random() * rotations.length
      )
    ];

  return rotateArray(
    solved,
    mysteryGoalRotation
  );
}

function rotateArray(array, degrees) {

  const result = [...array];

  const turns = degrees / 90;

  for (let t = 0; t < turns; t++) {

    const rotated = new Array(
      size * size
    );

    for (let row = 0; row < size; row++) {

      for (let col = 0; col < size; col++) {

        const oldIndex =
          row * size + col;

        const newRow = col;

        const newCol =
          size - 1 - row;

        const newIndex =
          newRow * size + newCol;

        rotated[newIndex] =
          result[oldIndex];
      }
    }

    result.splice(
      0,
      result.length,
      ...rotated
    );
  }

  return result;
}

function updateMysteryGoal() {

  if (!mysteryMode) {
    mysteryGoal.classList.remove("visible");
    return;
  }

  mysteryGoal.classList.add("visible");

  const direction = {

    0: "→ left to right",

    90: "↓ top to bottom",

    180: "← right to left",

    270: "↑ bottom to top"

  }[mysteryGoalRotation];

  mysteryGoal.textContent =
    `🎲 Mystery goal: ${direction}`;
}




/* --------------------------------
   Create solved board
-------------------------------- */

function createSolvedBoard() {

  const total = size * size;

  const solved = [];


  for (let i = 1; i < total; i++) {
    solved.push(i);
  }


  solved.push(null);

  return solved;
}


/* --------------------------------
   Possible moves
-------------------------------- */

function getPossibleMoves() {

  const emptyIndex =
    tiles.indexOf(null);

  const row =
    Math.floor(emptyIndex / size);

  const col =
    emptyIndex % size;

  const possible = [];


  if (row > 0) {
    possible.push(emptyIndex - size);
  }

  if (row < size - 1) {
    possible.push(emptyIndex + size);
  }

  if (col > 0) {
    possible.push(emptyIndex - 1);
  }

  if (col < size - 1) {
    possible.push(emptyIndex + 1);
  }


  return possible;
}


/* --------------------------------
   Guaranteed-solvable shuffle
-------------------------------- */

function shuffle() {

  tiles = createSolvedBoard();

  let previousMove = -1;

  gameWon = false;

  mysteryBoardRotation = 0;
  mysteryRotationMoves = 0;

  board.classList.remove(
    "mystery-rotating"
  );


  if (mysteryMode) {
    createMysteryGoal();
  }


  updateMysteryGoal();

  const shuffleMoves =
    size === 3 ? 80 :
    size === 4 ? 200 :
    350;


  for (
    let i = 0;
    i < shuffleMoves;
    i++
  ) {

    const possibleMoves =
      getPossibleMoves();


    const filteredMoves =
      possibleMoves.filter(
        index => index !== previousMove
      );


    const choices =
      filteredMoves.length > 0
        ? filteredMoves
        : possibleMoves;


    const randomIndex =
      choices[
        Math.floor(
          Math.random() * choices.length
        )
      ];


    const emptyIndex =
      tiles.indexOf(null);


    [
      tiles[randomIndex],
      tiles[emptyIndex]
    ] =
    [
      tiles[emptyIndex],
      tiles[randomIndex]
    ];


    previousMove = emptyIndex;
  }


  moves = 0;

  moveCount.textContent = moves;

  winMessage.style.display = "none";

  unlockMessage.style.display = "none";

  drawBoard();
}


/* --------------------------------
   Draw board
-------------------------------- */

function drawBoard() {

  board.innerHTML = "";


  board.style.gridTemplateColumns =
    `repeat(${size}, 1fr)`;


  tiles.forEach((value, index) => {

    const tile =
      document.createElement("div");


    tile.className = "tile";


    if (value === null) {

      tile.classList.add("empty");

    } else {

      tile.textContent = value;


      tile.addEventListener(
        "click",
        () => moveTile(index)
      );
    }


    board.appendChild(tile);
  });
}


/* --------------------------------
   Move tile
-------------------------------- */

function moveTile(index) {

  /*
    Don't allow movement after winning.
  */

  if (gameWon) {
    return;
  }


  const emptyIndex =
    tiles.indexOf(null);


  const row =
    Math.floor(index / size);

  const col =
    index % size;


  const emptyRow =
    Math.floor(emptyIndex / size);

  const emptyCol =
    emptyIndex % size;


  const distance =
    Math.abs(row - emptyRow) +
    Math.abs(col - emptyCol);


  /* Legal move */

  if (distance === 1) {

    [
      tiles[index],
      tiles[emptyIndex]
    ] =
    [
      tiles[emptyIndex],
      tiles[index]
    ];


    moves++;

    moveCount.textContent = moves;

    if (mysteryMode) {

  mysteryRotationMoves++;

  if (
    mysteryRotationMoves === 10
  ) {

    mysteryBoardRotation = 90;

    board.classList.add(
      "mystery-rotating"
    );
  }

  if (
    mysteryRotationMoves === 15
  ) {

    mysteryRotationMoves = 0;

    mysteryBoardRotation = 0;

    board.classList.remove(
      "mystery-rotating"
    );
  }
}


    drawBoard();

    checkWin();

    return;
  }


  /* Illegal move */

  const tile =
    board.children[index];


  if (tile) {

    tile.classList.remove("shake");

    void tile.offsetWidth;

    tile.classList.add("shake");
  }
}


/* --------------------------------
   Check win
-------------------------------- */

function checkWin() {

  const winningOrder =
  mysteryMode
    ? rotateArray(
        createSolvedBoard(),
        mysteryGoalRotation
      )
    : createSolvedBoard();



  const won =
    tiles.every(
      (value, index) =>
        value === winningOrder[index]
    );


  if (!won) {
    return;
  }


  gameWon = true;


  /* Update Best */

  if (
    best === 0 ||
    moves < best
  ) {

    best = moves;

    saveBest();

    bestCount.textContent = best;
  }


  /* Count completed puzzle */

  solvedCount++;


  localStorage.setItem(
    "15puzzle-solved",
    solvedCount
  );


  /* Check for theme unlock */

  checkThemeUnlocks();


  /* Win statistics */

  winMoves.textContent = moves;

  winBest.textContent = best;


  /* Celebrate tiles */

  Array.from(board.children)
    .forEach((tile, index) => {

      if (tiles[index] !== null) {

        tile.classList.add("win");
      }

    });


  /* Show win panel */

  winMessage.style.display =
    "block";
}


/* --------------------------------
   Difficulty selection
-------------------------------- */

difficultyButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const newSize =
        Number(button.dataset.size);

      const newMystery =
        button.dataset.mystery === "true";


      /*
        Don't restart if exactly
        the same mode is selected.
      */

      if (
        newSize === size &&
        newMystery === mysteryMode
      ) {
        return;
      }


      size = newSize;

      mysteryMode = newMystery;


      difficultyButtons.forEach(
        item =>
          item.classList.remove("active")
      );


      button.classList.add("active");


      /*
        Mystery has its own Best.
      */

      best = getBest();

      bestCount.textContent = best;


      shuffle();
    }
  );
});


/* --------------------------------
   Theme selection
-------------------------------- */

themeButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const theme =
        button.dataset.theme;


      if (
        !unlockedThemes.includes(theme)
      ) {
        return;
      }


      applyTheme(theme);
    }
  );
});


/* --------------------------------
   Buttons
-------------------------------- */

shuffleButton.addEventListener(
  "click",
  shuffle
);


newPuzzleButton.addEventListener(
  "click",
  shuffle
);


/* --------------------------------
   Start
-------------------------------- */

const savedTheme =
  localStorage.getItem(
    "15puzzle-theme"
  );


if (
  savedTheme &&
  unlockedThemes.includes(savedTheme)
) {

  applyTheme(savedTheme);

} else {

  applyTheme("classic");
}


updateThemes();

best = getBest();

bestCount.textContent = best;

shuffle();
