/* =========================================================
   BOX PUSH — BUILD 3
   Main game logic

   Responsibilities:
   - Level data
   - Player movement
   - Box pushing
   - Rendering
   - Level completion
   - Progression
   - Keyboard controls
   - Touch/swipe controls
   ========================================================= */


/* =========================================================
   LEVEL DATA
   =========================================================

   Symbols:

   # = wall
   . = floor
   @ = player
   $ = box
   o = target

   Each level currently contains:
   - one player
   - one box
   - one target
   ========================================================= */

/* =========================================================
   BOX PUSH — BUILD 4
   Hand-designed difficulty progression

   Level 1-2 : EASY
   Level 3-4 : NORMAL
   Level 5   : NORMAL+
   Level 6   : HARD

   Symbols:
   # = wall
   . = floor
   @ = player
   $ = box
   o = target

   Design goals:
   - No accidental non-goal corners for boxes
   - Compact boards
   - Clear introduction of positioning
   - Gradual difficulty increase
   - Level 6 introduces a second box
   ========================================================= */
/* =========================================================
   BOX PUSH — BUILD 9
   EASY LEVELS 1–6

   Playable area:
   6 x 6

   Total board:
   8 x 8

   The outer # row/column is the permanent boundary.

   Difficulty progression:
   1 = basic push
   2 = horizontal positioning
   3 = obstacle introduction
   4 = route planning
   5 = restricted positioning
   6 = advanced easy
   ========================================================= */

/* =========================================================
   BOX PUSH — BUILD 10
   EASY + NORMAL

   Levels 1–6:
   EASY
   6 x 6 playable area
   8 x 8 total board

   Levels 7–12:
   NORMAL
   7 x 7 playable area
   9 x 9 total board

   Difficulty now increases through:
   - tighter routes
   - obstacles
   - different approach directions
   - multiple boxes
   - deliberate push ordering
   ========================================================= */


/* =========================================================
   BOX PUSH — BUILD 11
   FULL 18-LEVEL SET

   EASY
   Levels 1–6
   6 x 6 playable area
   8 x 8 total board

   NORMAL
   Levels 7–12
   7 x 7 playable area
   9 x 9 total board

   HARD
   Levels 13–18
   8 x 8 playable area
   10 x 10 total board

   Hard-set design:
   - More constrained routes
   - Multiple boxes
   - More obstacles
   - Box ordering
   - Restricted access to pushing sides
   - Deliberate planning before pushing
   ========================================================= */

const LEVELS = [

  [
    "########",
    "#......#",
    "#......#",
    "#..o...#",
    "#..$...#",
    "#..@...#",
    "#......#",
    "########"
  ],

  [
    "########",
    "#......#",
    "#.o....#",
    "#..##..#",
    "#..$...#",
    "#..@...#",
    "#..#...#",
    "########"
  ],

  [
    "########",
    "#..#...#",
    "#.o...##",
    "#.#.#..#",
    "#...$..#",
    "#..@#..#",
    "#..##..#",
    "########"
  ],

  [
    "########",
    "#....###",
    "#.o....#",
    "#.###..#",
    "##.$..##",
    "#..@...#",
    "#..#...#",
    "########"
  ],

  [
    "########",
    "#...#..#",
    "#.#o..##",
    "#..#...#",
    "#.$..#.#",
    "#..@...#",
    "#.###..#",
    "########"
  ],

  [
    "########",
    "##...#.#",
    "#..#...#",
    "#.####.#",
    "#.$....#",
    "#.#@.#o#",
    "#..#..##",
    "########"
  ],

  [
    "##########",
    "#........#",
    "##..o...o#",
    "#...$....#",
    "#.####...#",
    "#.#....#.#",
    "#...#..$.#",
    "#...$....#",
    "#...@o...#",
    "##########"
  ],

  [
    "##########",
    "#..#.....#",
    "#..o...o.#",
    "#..$.....#",
    "#..###...#",
    "#.....#..#",
    "#.$...$.##",
    "#.#...o..#",
    "#..@...#.#",
    "##########"
  ],

  [
    "##########",
    "#...#..###",
    "#..o...#.#",
    "#..$....##",
    "#...###..#",
    "#...#o...#",
    "#..###...#",
    "#.$...$#.#",
    "##.@..o..#",
    "##########"
  ],

  [
    "##########",
    "#.#......#",
    "#..o.....#",
    "#..$.....#",
    "##.###...#",
    "#....#...#",
    "#....$...#",
    "#....o.###",
    "#..@o$...#",
    "##########"
  ],

  [
    "##########",
    "#.#.##...#",
    "#..o#...##",
    "#..$.....#",
    "##.###$#.#",
    "#........#",
    "#..o###..#",
    "#....$o..#",
    "#..@...#.#",
    "##########"
  ],

  [
    "##########",
    "###.....##",
    "#..o...o.#",
    "#.$##.#..#",
    "#..###.#.#",
    "#....$...#",
    "#...###.##",
    "#....$o..#",
    "#..@#..#.#",
    "##########"
  ],

  [
    "##########",
    "##o......#",
    "#.#....#o#",
    "#...$....#",
    "#..###.#.#",
    "#.##.#...#",
    "#.#.#..$##",
    "#...$....#",
    "#...@o#..#",
    "##########"
  ],

  [
    "##########",
    "###.....##",
    "#.#o.....#",
    "#..$.....#",
    "#...###..#",
    "#....o...#",
    "#..###...#",
    "#.$...$..#",
    "#..@..o..#",
    "##########"
  ],

  [
    "##########",
    "#.......##",
    "#.#o$....#",
    "###...$.##",
    "##.$###..#",
    "#....o#..#",
    "#..###...#",
    "#........#",
    "#..@..o.##",
    "##########"
  ],

  [
    "##########",
    "#.......##",
    "#.#o....##",
    "###.$.$.##",
    "##..###..#",
    "#....o##.#",
    "#.####...#",
    "#...#....#",
    "#..@$.o.##",
    "##########"
  ],

  [
    "##########",
    "#...#...##",
    "#.$o..#.##",
    "##.......#",
    "#.#.###..#",
    "#....o...#",
    "#.$###...#",
    "#....$...#",
    "#..@#.o..#",
    "##########"
  ],



[
"##########",
"#..#.....#",
"#..#.$...#",
"#....#.#.#",
"###..#.#.#",
"#o.$...$.#",
"#.#.###..#",
"#o...#...#",
"#..@...o.#",
"##########"
],

[
"##########",
"#..#.....#",
"#.$...#..#",
"#..##.#$.#",
"#o...#...#",
"###.$...##",
"#...##...#",
"#.#...#o.#",
"#@..o....#",
"##########"
],

  [
    "##########",
    "#.##.#...#",
    "#.#o...#.#",
    "#.#.$.$.##",
    "#...###..#",
    "#....o##.#",
    "#.#.##..o#",
    "#..##@$.##",
    "##......##",
    "##########"
  ]

];


/* =========================================================
   GAME STATE
   ========================================================= */

let currentLevel = 0;

let map = [];

let player = {
  row: 0,
  col: 0
};

let boxes = [];

let targets = [];

let moves = 0;

let gameWon = false;


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const board =
  document.getElementById("board");

const movesElement =
  document.getElementById("moves");

const levelElement =
  document.getElementById("level");

const progressText =
  document.getElementById("progressText");

const progressBar =
  document.getElementById("progressBar");

const restartButton =
  document.getElementById("restart");

const message =
  document.getElementById("message");

const messageText =
  document.getElementById("messageText");

const nextButton =
  document.getElementById("nextButton");

/* =========================================================
   BUILD 7 — PROGRESS PERSISTENCE
   ========================================================= */


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const levelSelect =
  document.getElementById("levelSelect");

const levelGrid =
  document.getElementById("levelGrid");

const continueButton =
  document.getElementById("continueButton");


/* =========================================================
   SAVE DATA
   ========================================================= */

const SAVE_KEY =
  "boxPushProgress";


let highestUnlocked =
  Number(
    localStorage.getItem(SAVE_KEY)
  );


/*
  First launch:

  Level 1 is always unlocked.
*/

if (
  !Number.isInteger(highestUnlocked) ||
  highestUnlocked < 0 ||
  highestUnlocked >= LEVELS.length
) {

  highestUnlocked = 0;

  saveProgress();

}


/* =========================================================
   SAVE PROGRESS
   ========================================================= */

function saveProgress() {

  localStorage.setItem(
    SAVE_KEY,
    String(highestUnlocked)
  );

}


/* =========================================================
   UNLOCK NEXT LEVEL
   ========================================================= */

function unlockNextLevel() {

  if (
    currentLevel >=
    highestUnlocked
  ) {

    highestUnlocked =
      Math.min(
        currentLevel + 1,
        LEVELS.length - 1
      );

    saveProgress();

  }

}


/* =========================================================
   BUILD LEVEL SELECT
   ========================================================= */

function renderLevelSelect() {

  levelGrid.innerHTML = "";


  for (
    let i = 0;
    i < LEVELS.length;
    i++
  ) {

    const button =
      document.createElement("button");


    button.className =
      "level-button";


    const unlocked =
      i <= highestUnlocked;


    const completed =
      i < highestUnlocked;


    if (unlocked) {

      button.classList.add(
        "unlocked"
      );

    }
    else {

      button.classList.add(
        "locked"
      );

    }


    if (completed) {

      button.classList.add(
        "completed"
      );

    }


    if (
      i === currentLevel
    ) {

      button.classList.add(
        "current"
      );

    }


    button.innerHTML =
      unlocked
        ? `${i + 1}${completed ? '<span class="level-check">✓</span>' : ""}`
        : "🔒";


    button.setAttribute(
      "aria-label",
      unlocked
        ? `Level ${i + 1}`
        : `Level ${i + 1} locked`
    );


    if (unlocked) {

      button.addEventListener(
        "click",
        () => {

          levelSelect.classList.remove(
            "show"
          );

          loadLevel(i);

        }
      );

    }


    levelGrid.appendChild(
      button
    );

  }


  /*
    Continue always goes to the highest
    currently unlocked level.
  */

  continueButton.textContent =
    `Continue — Level ${highestUnlocked + 1}`;

}


/* =========================================================
   OPEN LEVEL SELECT
   ========================================================= */

function openLevelSelect() {

  renderLevelSelect();

  levelSelect.classList.add(
    "show"
  );

}


/* =========================================================
   CLOSE LEVEL SELECT
   ========================================================= */

function closeLevelSelect() {

  levelSelect.classList.remove(
    "show"
  );

}


/* =========================================================
   CONTINUE BUTTON
   ========================================================= */

continueButton.addEventListener(
  "click",
  () => {

    closeLevelSelect();

    loadLevel(
      highestUnlocked
    );

  }
);


/* =========================================================
   COMPLETE LEVEL
   ========================================================= */

function completeLevel() {

  gameWon = true;


  const isFinalLevel =
    currentLevel ===
    LEVELS.length - 1;


  /*
    Unlock the next level immediately.
  */

  unlockNextLevel();


  if (isFinalLevel) {

    messageText.textContent =
      `All ${LEVELS.length} levels completed in ${moves} moves`;

  }
  else {

    messageText.textContent =
      `Level ${currentLevel + 1} completed in ${moves} moves`;

  }


  message.classList.toggle(
    "final",
    isFinalLevel
  );


  nextButton.textContent =
    isFinalLevel
      ? "Play Again"
      : "Next Level";


  message.classList.add(
    "show"
  );

}


/* =========================================================
   NEXT LEVEL
   ========================================================= */

nextButton.addEventListener(
  "click",
  () => {

    message.classList.remove(
      "show"
    );


    setTimeout(
      () => {

        const isFinalLevel =
          currentLevel ===
          LEVELS.length - 1;


        if (isFinalLevel) {

          /*
            Finished all levels.

            Restart at level 1, but DO NOT erase
            the saved unlock progress.
          */

          loadLevel(0);

        }
        else {

          loadLevel(
            currentLevel + 1
          );

        }

      },
      180
    );

  }
);


/* =========================================================
   OPTIONAL LEVEL SELECT ACCESS
   =========================================================

   Add this function call wherever you want to open
   the selector later.

   Example:

       openLevelSelect();

   We keep it as a function for now so Build 8 can
   decide where the Level Select button belongs.
   ========================================================= */

/* =========================================================
   LOAD LEVEL
   ========================================================= */

function loadLevel(index) {

  currentLevel = index;

  map = [];

  boxes = [];

  targets = [];

  moves = 0;

  gameWon = false;

  message.classList.remove("show");


  const level =
    LEVELS[currentLevel];


  level.forEach(
    (row, rowIndex) => {

      map[rowIndex] = [];


      [...row].forEach(
        (cell, colIndex) => {

          /* -------------------------------
             Wall / floor
             ------------------------------- */

          if (cell === "#") {

            map[rowIndex][colIndex] =
              "wall";

          }
          else {

            map[rowIndex][colIndex] =
              "floor";

          }


          /* -------------------------------
             Player
             ------------------------------- */

          if (cell === "@") {

            player = {
              row: rowIndex,
              col: colIndex
            };

          }


          /* -------------------------------
             Box
             ------------------------------- */

          if (cell === "$") {

            boxes.push({
              row: rowIndex,
              col: colIndex
            });

          }


          /* -------------------------------
             Target
             ------------------------------- */

          if (cell === "o") {

            targets.push({
              row: rowIndex,
              col: colIndex
            });

          }

        }
      );

    }
  );


  updateStats();

  updateProgress();

  render();

}



/* =========================================================
   RENDER BOARD
   ========================================================= */

function render() {

  board.innerHTML = "";

  board.style.gridTemplateColumns =
    `repeat(${map[0].length}, 1fr)`;

  board.style.gridTemplateRows =
    `repeat(${map.length}, 1fr)`;


  /* -----------------------------------------------
     Disable animation during initial render.
     ----------------------------------------------- */

  board.classList.add("no-animation");


  for (
    let row = 0;
    row < map.length;
    row++
  ) {

    for (
      let col = 0;
      col < map[row].length;
      col++
    ) {

      const cell =
        document.createElement("div");

      cell.className = "cell";


      /* ---------------------------------------------
         Wall / floor
         --------------------------------------------- */

      if (
        map[row][col] === "wall"
      ) {

        cell.classList.add("wall");

      }
      else {

        cell.classList.add("floor");

      }


      /* ---------------------------------------------
         Target
         --------------------------------------------- */

      if (
        isTarget(row, col)
      ) {

        cell.classList.add("target");

      }


      /* ---------------------------------------------
         Box
         --------------------------------------------- */

      const boxIndex =
        getBoxAt(row, col);


      if (boxIndex !== -1) {

        const box =
          document.createElement("div");

        box.className =
          "box-piece";


        if (
          isTarget(row, col)
        ) {

          box.classList.add(
            "on-target"
          );

        }


        cell.appendChild(box);

      }


      /* ---------------------------------------------
         Player
         --------------------------------------------- */

      if (
        player.row === row &&
        player.col === col
      ) {

        const playerPiece =
          document.createElement("div");

        playerPiece.className =
          "player-piece";

        cell.appendChild(
          playerPiece
        );

      }


      board.appendChild(cell);

    }

  }


  /* -----------------------------------------------
     Allow future movements to animate.
     ----------------------------------------------- */

  requestAnimationFrame(
    () => {

      board.classList.remove(
        "no-animation"
      );

    }
  );

}


/* =========================================================
   MOVE PLAYER / BOX
   ========================================================= */

function move(direction) {

  if (gameWon) {
    return;
  }


  const directions = {

    up: {
      row: -1,
      col: 0
    },

    down: {
      row: 1,
      col: 0
    },

    left: {
      row: 0,
      col: -1
    },

    right: {
      row: 0,
      col: 1
    }

  };


  const delta =
    directions[direction];


  if (!delta) {
    return;
  }


  const nextRow =
    player.row +
    delta.row;

  const nextCol =
    player.col +
    delta.col;


  /* =======================================================
     WALL
     ======================================================= */

  if (
    isWall(
      nextRow,
      nextCol
    )
  ) {

    return;

  }


  /* =======================================================
     CHECK FOR BOX
     ======================================================= */

  const boxIndex =
    getBoxAt(
      nextRow,
      nextCol
    );


  let pushedBox = false;


  if (boxIndex !== -1) {

    const boxNextRow =
      nextRow +
      delta.row;

    const boxNextCol =
      nextCol +
      delta.col;


    /* -----------------------------------------------
       Can't push into wall
       ----------------------------------------------- */

    if (
      isWall(
        boxNextRow,
        boxNextCol
      )
    ) {

      return;

    }


    /* -----------------------------------------------
       Can't push another box
       ----------------------------------------------- */

    if (
      getBoxAt(
        boxNextRow,
        boxNextCol
      ) !== -1
    ) {

      return;

    }


    /* -----------------------------------------------
       Move box in game state
       ----------------------------------------------- */

    boxes[boxIndex].row =
      boxNextRow;

    boxes[boxIndex].col =
      boxNextCol;

    pushedBox = true;

  }


  /* =======================================================
     MOVE PLAYER IN GAME STATE
     ======================================================= */

  player.row =
    nextRow;

  player.col =
    nextCol;

  moves++;


  updateStats();


  /* =======================================================
     RENDER NEW POSITION

     CSS transitions make the pieces visually move.
     ======================================================= */

  render();


  /* =======================================================
     SMALL PUSH FEEDBACK
     ======================================================= */

  if (pushedBox) {

    const boxCell =
      board.children[
        boxes[boxIndex].row *
        map[0].length +
        boxes[boxIndex].col
      ];

    if (boxCell) {

      const boxPiece =
        boxCell.querySelector(
          ".box-piece"
        );

      if (boxPiece) {

        boxPiece.classList.add(
          "pushed"
        );

        setTimeout(
          () => {

            boxPiece.classList.remove(
              "pushed"
            );

          },
          130
        );

      }

    }

  }


  /* =======================================================
     CHECK COMPLETION
     ======================================================= */

  if (
    isLevelComplete()
  ) {

    /*
      Give the final movement a moment to visually
      complete before displaying the success modal.
    */

    setTimeout(
      () => {

        completeLevel();

      },
      140
    );

  }

}


 



/* =========================================================
   TARGET CHECK
   ========================================================= */

function isTarget(row, col) {

  return targets.some(
    target =>
      target.row === row &&
      target.col === col
  );

}


/* =========================================================
   BOX CHECK
   ========================================================= */

function getBoxAt(row, col) {

  return boxes.findIndex(
    box =>
      box.row === row &&
      box.col === col
  );

}


/* =========================================================
   WALL CHECK
   ========================================================= */

function isWall(row, col) {

  return (
    !map[row] ||
    map[row][col] === "wall"
  );

}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */



/* =========================================================
   LEVEL COMPLETION CHECK
   ========================================================= */

function isLevelComplete() {

  return boxes.every(
    box =>
      isTarget(
        box.row,
        box.col
      )
  );

}




/* =========================================================
   COMPLETE LEVEL
   ========================================================= */

function completeLevel() {

  gameWon = true;


  const isFinalLevel =
    currentLevel ===
    LEVELS.length - 1;


  /* -----------------------------------------------
     Update result text
     ----------------------------------------------- */

  if (isFinalLevel) {

    messageText.textContent =
      `All ${LEVELS.length} levels completed in ${moves} moves`;

  }
  else {

    messageText.textContent =
      `Level ${currentLevel + 1} completed in ${moves} moves`;

  }


  /* -----------------------------------------------
     Final-level styling
     ----------------------------------------------- */

  message.classList.toggle(
    "final",
    isFinalLevel
  );


  /* -----------------------------------------------
     Button text
     ----------------------------------------------- */

  if (isFinalLevel) {

    nextButton.textContent =
      "Play Again";

  }
  else {

    nextButton.textContent =
      "Next Level";

  }


  /* -----------------------------------------------
     Show completion overlay
     ----------------------------------------------- */

  message.classList.add(
    "show"
  );

}


/* =========================================================
   NEXT / REPLAY BUTTON
   ========================================================= */

/* =========================================================
   NEXT LEVEL / PROGRESSION
   ========================================================= */

/*
  One shared function handles progression.

  Both:
  - button/touch
  - Enter/Space

  call this function directly.

  This prevents double activation.
*/

function advanceFromCompletion() {

  /* -----------------------------------------------
     Safety: only work while the win overlay
     is actually visible.
     ----------------------------------------------- */

  if (
    !message.classList.contains("show")
  ) {

    return;

  }


  /* -----------------------------------------------
     Close completion overlay immediately.
     ----------------------------------------------- */

  message.classList.remove(
    "show"
  );


  /* -----------------------------------------------
     Wait for the overlay transition before
     loading the next board.
     ----------------------------------------------- */

  setTimeout(
    () => {

      const isFinalLevel =
        currentLevel ===
        LEVELS.length - 1;


      if (isFinalLevel) {

        /*
          All levels completed.

          Start again at level 1,
          but keep saved progress.
        */

        loadLevel(0);

      }
      else {

        /*
          Continue to the next level.
        */

        loadLevel(
          currentLevel + 1
        );

      }

    },
    180
  );

}


/* =========================================================
   NEXT LEVEL BUTTON
   ========================================================= */

nextButton.addEventListener(
  "click",
  () => {

    advanceFromCompletion();

  }
);


/* =========================================================
   WIN SCREEN KEYBOARD CONTROL
   =========================================================

   Enter / Space = Next Level

   We call advanceFromCompletion() directly instead
   of nextButton.click().

   This prevents the browser's own button activation
   from causing a second action.
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      !message.classList.contains("show")
    ) {

      return;

    }


    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {

      return;

    }


    /*
      Prevent the browser from performing its
      normal button activation.
    */

    event.preventDefault();


    /*
      Ignore held-down keys.
      This prevents rapid repeated progression.
    */

    if (event.repeat) {

      return;

    }


    advanceFromCompletion();

  }
);


/* =========================================================
   RESTART LEVEL
   ========================================================= */

restartButton.addEventListener(
  "click",
  () => {

    message.classList.remove(
      "show"
    );


    loadLevel(
      currentLevel
    );

  }
);



/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats() {

  movesElement.textContent =
    moves;


  levelElement.textContent =
    `${currentLevel + 1} / ${LEVELS.length}`;

}


/* =========================================================
   UPDATE LEVEL PROGRESS
   ========================================================= */

function updateProgress() {

  const total =
    LEVELS.length;

  const current =
    currentLevel + 1;


  progressText.textContent =
    `${current} / ${total}`;


  progressBar.style.width =
    `${(current / total) * 100}%`;

}


/* =========================================================
   DIRECTION BUTTONS
   ========================================================= */

document
  .querySelectorAll(".control")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          move(
            button.dataset.direction
          );

        }
      );

    }
  );


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    const keys = {

      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",

      w: "up",
      s: "down",
      a: "left",
      d: "right"

    };


    const direction =
      keys[event.key];


    if (direction) {

      event.preventDefault();

      move(direction);

    }

  }
);


/* =========================================================
   SWIPE CONTROLS
   ========================================================= */

let touchStartX = 0;

let touchStartY = 0;


board.addEventListener(
  "touchstart",
  event => {

    const touch =
      event.changedTouches[0];

    touchStartX =
      touch.clientX;

    touchStartY =
      touch.clientY;

  },
  {
    passive: true
  }
);


board.addEventListener(
  "touchend",
  event => {

    const touch =
      event.changedTouches[0];


    const dx =
      touch.clientX -
      touchStartX;

    const dy =
      touch.clientY -
      touchStartY;


    const threshold = 25;


    if (
      Math.abs(dx) < threshold &&
      Math.abs(dy) < threshold
    ) {

      return;

    }


    if (
      Math.abs(dx) >
      Math.abs(dy)
    ) {

      move(
        dx > 0
          ? "right"
          : "left"
      );

    }
    else {

      move(
        dy > 0
          ? "down"
          : "up"
      );

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   START GAME
   ========================================================= */

loadLevel(0);
