const board =
  document.getElementById("board");

const moveCount =
  document.getElementById("moveCount");

const winMessage =
  document.getElementById("winMessage");

const winMoves =
  document.getElementById("winMoves");

const newPuzzleButton =
  document.getElementById("newPuzzle");

const difficultyButtons =
  document.querySelectorAll(
    ".difficulty-button"
  );

const bestCount =
  document.getElementById("bestCount");

const themes =
  document.getElementById("themes");

const themeButtons =
  document.querySelectorAll(
    ".theme-button"
  );

let size = 3;

let lights = [];

let moves = 0;

let gameWon = false;

const themeUnlocks = {
  forest: 3,
  sunset: 10,
  ocean: 25
};


let solvedCount =
  Number(
    localStorage.getItem(
      "lightsout-solved"
    )
  ) || 0;


let unlockedThemes =
  JSON.parse(
    localStorage.getItem(
      "lightsout-themes"
    ) ||
    '["classic"]'
  );


function getBest() {

  return Number(
    localStorage.getItem(
      `lightsout-best-${size}`
    )
  ) || 0;
}


function saveBest() {

  localStorage.setItem(
    `lightsout-best-${size}`,
    moves
  );
}

function applyTheme(theme) {

  if (!unlockedThemes.includes(theme)) {
    return;
  }

  document.body.dataset.theme =
    theme;

  localStorage.setItem(
    "lightsout-theme",
    theme
  );


  themeButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.theme === theme
    );

  });
}


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


    button.disabled =
      !unlocked;


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


  themes.classList.toggle(
    "visible",
    hasExtraTheme
  );
}


function checkThemeUnlocks() {

  Object.entries(themeUnlocks)
    .forEach(
      ([theme, required]) => {

        if (
          solvedCount >= required &&
          !unlockedThemes.includes(theme)
        ) {

          unlockedThemes.push(theme);

        }

      }
    );


  localStorage.setItem(
    "lightsout-themes",
    JSON.stringify(
      unlockedThemes
    )
  );


  updateThemes();
}

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



const savedTheme =
  localStorage.getItem(
    "lightsout-theme"
  );


if (
  savedTheme &&
  unlockedThemes.includes(
    savedTheme
  )
) {

  applyTheme(savedTheme);

} else {

  applyTheme("classic");

}


updateThemes();


/* --------------------------------
   Create random board
-------------------------------- */

function createBoard() {

  lights =
    Array(size * size).fill(false);

  moves = 0;

  gameWon = false;

  board.classList.remove("solved");

  moveCount.textContent = moves;

  bestCount.textContent = getBest();

  winMessage.style.display = "none";


  /*
    Create the puzzle by making
    random legal moves from the
    solved state.

    Because every move can be
    reversed, the puzzle is
    guaranteed to be solvable.
  */

  const shuffleMoves =
    size === 3 ? 15 :
    size === 4 ? 30 :
    50;


  let previousMove = -1;


  for (
    let i = 0;
    i < shuffleMoves;
    i++
  ) {

    const total =
      size * size;


    const possible = [];


    for (
      let index = 0;
      index < total;
      index++
    ) {

      if (index !== previousMove) {
        possible.push(index);
      }

    }


    const index =
      possible[
        Math.floor(
          Math.random() *
          possible.length
        )
      ];


    toggleLightsOnly(index);

    previousMove = index;
  }


  drawBoard();
}


/* --------------------------------
   Draw board
-------------------------------- */

function drawBoard() {

  board.innerHTML = "";

 board.style.gridTemplateColumns =
  `repeat(${size}, 1fr)`;


  lights.forEach(
    (isOn, index) => {

      const light =
        document.createElement("div");


      light.className = "light";


      if (isOn) {
        light.classList.add("on");
      }


      light.addEventListener(
        "click",
        () => toggle(index)
      );


      board.appendChild(light);

    }
  );
}

/* --------------------------------
   Toggle lights without
   counting a player move
-------------------------------- */

function toggleLightsOnly(index) {

  const row =
    Math.floor(index / size);

  const col =
    index % size;


  const positions = [

    [row, col],

    [row - 1, col],

    [row + 1, col],

    [row, col - 1],

    [row, col + 1]

  ];


  positions.forEach(
    ([r, c]) => {

      if (
        r >= 0 &&
        r < size &&
        c >= 0 &&
        c < size
      ) {

        const target =
          r * size + c;


        lights[target] =
          !lights[target];
      }

    }
  );
}


/* --------------------------------
   Toggle light + neighbors
-------------------------------- */

function toggle(index) {

  if (gameWon) {
    return;
  }


  const row =
    Math.floor(index / size);

  const col =
    index % size;


  const positions = [

    [row, col],

    [row - 1, col],

    [row + 1, col],

    [row, col - 1],

    [row, col + 1]

  ];


  positions.forEach(
    ([r, c]) => {

      if (
        r >= 0 &&
        r < size &&
        c >= 0 &&
        c < size
      ) {

        const target =
          r * size + c;


        lights[target] =
          !lights[target];

      }

    }
  );


  moves++;

  moveCount.textContent =
    moves;


  drawBoard();

  checkWin();
}


/* --------------------------------
   Check win
-------------------------------- */

function checkWin() {

  const solved =
    lights.every(
      light => !light
    );


  if (!solved) {
    return;
  }


  gameWon = true;

solvedCount++;

localStorage.setItem(
  "lightsout-solved",
  solvedCount
);

checkThemeUnlocks();



board.classList.remove("solved");

void board.offsetWidth;

board.classList.add("solved");


  const currentBest = getBest();

if (
  currentBest === 0 ||
  moves < currentBest
) {

  saveBest();

  bestCount.textContent =
    moves;
}


  winMoves.textContent =
    moves;


  winMessage.style.display =
    "block";
}


/* --------------------------------
   New puzzle
-------------------------------- */

newPuzzleButton.addEventListener(
  "click",
  createBoard
);

/* --------------------------------
   Difficulty selection
-------------------------------- */

difficultyButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const newSize =
        Number(
          button.dataset.size
        );


      if (newSize === size) {
        return;
      }


      size = newSize;


      difficultyButtons.forEach(
        item => {

          item.classList.remove(
            "active"
          );

        }
      );


      button.classList.add(
        "active"
      );


      createBoard();

    }
  );

});


/* --------------------------------
   Start
-------------------------------- */

createBoard();
