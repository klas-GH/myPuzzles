// ========================================
// COLOR SORT
// BUILD 7
// SAVED PROGRESS + LEVEL SELECT
// ========================================


// ========================================
// LEVEL DATA
// ========================================

// ========================================
// BUILD 9
// 30-LEVEL CAMPAIGN
// DETERMINISTIC + SOLVABILITY CHECKED
// ========================================

const COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange"
];

const LEVEL_PACK_KEY =
  "colorSortLevelPackV2";

const LEVEL_CAPACITY = 3;


// ========================================
// LEVEL DIFFICULTY
// ========================================

const LEVEL_PLAN = [

  // 1-5
  ...Array(5).fill({
    colors: 3,
    minMoves: 5,
    minMix: 4
  }),

  // 6-10
  ...Array(5).fill({
    colors: 4,
    minMoves: 8,
    minMix: 6
  }),

  // 11-20
  ...Array(10).fill({
    colors: 5,
    minMoves: 12,
    minMix: 8
  }),

  // 21-30
  ...Array(10).fill({
    colors: 6,
    minMoves: 16,
    minMix: 10
  })

];


// ========================================
// SEEDED RANDOM
// ========================================

function seededRandom(seed) {

  let value = seed >>> 0;

  return function () {

    value += 0x6D2B79F5;

    let t = value;

    t =
      Math.imul(
        t ^ (t >>> 15),
        t | 1
      );

    t ^=
      t +
      Math.imul(
        t ^ (t >>> 7),
        t | 61
      );

    return (
      (
        (t ^ (t >>> 14))
        >>> 0
      ) /
      4294967296
    );

  };

}


// ========================================
// SHUFFLE
// ========================================

function shuffle(array, random) {

  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        random() * (i + 1)
      );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];

  }

  return result;
}


// ========================================
// CREATE RANDOM CANDIDATE
// ========================================

function createCandidate(
  colorCount,
  capacity,
  seed
) {

  const random =
    seededRandom(seed);


  const colors =
    COLORS.slice(
      0,
      colorCount
    );


  const balls = [];


  colors.forEach(
    color => {

      for (
        let i = 0;
        i < capacity;
        i++
      ) {

        balls.push(color);

      }

    }
  );


  const shuffled =
    shuffle(
      balls,
      random
    );


  const tubes = [];


  for (
    let i = 0;
    i < colorCount;
    i++
  ) {

    tubes.push(
      shuffled.slice(
        i * capacity,
        (i + 1) * capacity
      )
    );

  }


  // Two empty work tubes
  tubes.push([]);
  tubes.push([]);


  return tubes;
}


// ========================================
// SOLVED CHECK
// ========================================

function generatedSolved(
  tubes,
  capacity
) {

  return tubes.every(
    tube => {

      if (
        tube.length === 0
      ) {

        return true;

      }


      if (
        tube.length !== capacity
      ) {

        return false;

      }


      return tube.every(
        color =>
          color === tube[0]
      );

    }
  );

}


// ========================================
// CANONICAL STATE
// ========================================

function generatedKey(tubes) {

  return tubes
    .map(
      tube =>
        tube.join(",")
    )
    .sort()
    .join("|");

}


// ========================================
// MIX SCORE
// ========================================

function getMixScore(tubes) {

  let score = 0;


  tubes.forEach(
    tube => {

      for (
        let i = 1;
        i < tube.length;
        i++
      ) {

        if (
          tube[i] !==
          tube[i - 1]
        ) {

          score++;

        }

      }

    }
  );


  return score;
}


// ========================================
// LEGAL MOVE FOR GENERATOR
// ========================================

function generatedMoveIsValid(
  source,
  destination,
  capacity
) {

  if (
    source.length === 0
  ) {

    return false;

  }


  if (
    destination.length >= capacity
  ) {

    return false;

  }


  // Never disturb a completed tube.
  if (
    source.length === capacity &&
    source.every(
      color =>
        color === source[0]
    )
  ) {

    return false;

  }


  const movingColor =
    source[
      source.length - 1
    ];


  // Empty destination.
  if (
    destination.length === 0
  ) {

    // Don't waste a move taking
    // a uniform partial tube apart.
    if (
      source.every(
        color =>
          color === source[0]
      )
    ) {

      return false;

    }

    return true;

  }


  return (
    destination[
      destination.length - 1
    ] === movingColor
  );

}


// ========================================
// SOLVER
// ========================================

function solveGeneratedLevel(
  startingTubes,
  capacity,
  maxVisited = 90000
) {

  const visited =
    new Set();


  function search(tubes) {

    if (
      generatedSolved(
        tubes,
        capacity
      )
    ) {

      return true;

    }


    if (
      visited.size >=
      maxVisited
    ) {

      return false;

    }


    const key =
      generatedKey(tubes);


    if (
      visited.has(key)
    ) {

      return false;

    }


    visited.add(key);


    const moves = [];


    // Build legal moves.
    for (
      let from = 0;
      from < tubes.length;
      from++
    ) {

      const source =
        tubes[from];


      if (
        source.length === 0
      ) {

        continue;

      }


      for (
        let to = 0;
        to < tubes.length;
        to++
      ) {

        if (
          from === to
        ) {

          continue;

        }


        const destination =
          tubes[to];


        if (
          !generatedMoveIsValid(
            source,
            destination,
            capacity
          )
        ) {

          continue;

        }


        const color =
          source[
            source.length - 1
          ];


        let score = 0;


        // Prefer completing stacks.
        if (
          destination.length > 0
        ) {

          score += 5;

        }


        // Prefer revealing a different
        // color underneath.
        if (
          source.length > 1 &&
          source[
            source.length - 2
          ] !== color
        ) {

          score += 4;

        }


        // Prefer moves that create
        // more sorted structure.
        if (
          destination.length > 0
        ) {

          score += destination.length;

        }


        moves.push({
          from,
          to,
          score
        });

      }

    }


    // Good moves first.
    moves.sort(
      (a, b) =>
        b.score - a.score
    );


    for (
      const move of moves
    ) {

      const next =
        tubes.map(
          tube =>
            [...tube]
        );


      const ball =
        next[
          move.from
        ].pop();


      next[
        move.to
      ].push(ball);


      if (
        search(next)
      ) {

        return true;

      }

    }


    return false;

  }


  return search(
    startingTubes.map(
      tube =>
        [...tube]
    )
  );

}


// ========================================
// GENERATE ONE LEVEL
// ========================================

function generateOneLevel(
  config,
  levelNumber
) {

  const baseSeed =
    73421 +
    levelNumber * 9187;


  for (
    let attempt = 0;
    attempt < 300;
    attempt++
  ) {

    const candidate =
      createCandidate(
        config.colors,
        LEVEL_CAPACITY,
        baseSeed + attempt * 7919
      );


    // Avoid very easy-looking boards.
    if (
      getMixScore(candidate) <
      config.minMix
    ) {

      continue;

    }


    const solved =
      solveGeneratedLevel(
        candidate,
        LEVEL_CAPACITY,
        config.colors >= 6
          ? 140000
          : 90000
      );


    if (solved) {

      return {
        capacity:
          LEVEL_CAPACITY,

        tubes:
          candidate
      };

    }

  }


  // Extremely conservative fallback.
  // Keep trying deterministic candidates
  // with a lower difficulty requirement.

  for (
    let attempt = 300;
    attempt < 1000;
    attempt++
  ) {

    const candidate =
      createCandidate(
        config.colors,
        LEVEL_CAPACITY,
        baseSeed + attempt * 7919
      );


    if (
      solveGeneratedLevel(
        candidate,
        LEVEL_CAPACITY,
        160000
      )
    ) {

      return {
        capacity:
          LEVEL_CAPACITY,

        tubes:
          candidate
      };

    }

  }


  throw new Error(
    `Could not generate level ${levelNumber}`
  );

}


// ========================================
// BUILD THE 30 LEVEL PACK
// ========================================

function buildLevelPack() {

  const generated = [];


  for (
    let i = 0;
    i < LEVEL_PLAN.length;
    i++
  ) {

    generated.push(
      generateOneLevel(
        LEVEL_PLAN[i],
        i + 1
      )
    );

  }


  return generated;
}


// ========================================
// LOAD / CACHE LEVEL PACK
// ========================================

function loadLevelPack() {

  const saved =
    localStorage.getItem(
      LEVEL_PACK_KEY
    );


  if (saved) {

    try {

      const parsed =
        JSON.parse(saved);


      if (
        Array.isArray(parsed) &&
        parsed.length === 30
      ) {

        return parsed;

      }

    } catch {

      // Generate a fresh pack.
    }

  }


  const generated =
    buildLevelPack();


  localStorage.setItem(
    LEVEL_PACK_KEY,
    JSON.stringify(generated)
  );


  return generated;
}


// ========================================
// THE 30 LEVELS
// ========================================

const LEVELS =
  loadLevelPack();


// ========================================
// SAVED PROGRESS
// ========================================

const SAVE_KEY =
  "colorSortProgress";


function loadProgress() {

  const saved =
    localStorage.getItem(
      SAVE_KEY
    );


  if (!saved) {

    return {
      unlocked: 1,
      completed: []
    };

  }


  try {

    const data =
      JSON.parse(saved);


    return {

      unlocked:
        Math.max(
          1,
          Math.min(
            LEVELS.length,
            data.unlocked || 1
          )
        ),

      completed:
        Array.isArray(data.completed)
          ? data.completed
          : []

    };

  } catch {

    return {
      unlocked: 1,
      completed: []
    };

  }
}


let progress =
  loadProgress();


function saveProgress() {

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(progress)
  );

}


// ========================================
// GAME STATE
// ========================================

let currentLevel = 0;

let tubes = [];

let capacity = 2;

let selectedTube = null;

let gameWon = false;

let movedTube = null;

let advancingLevel = false;


// ========================================
// DOM
// ========================================

const board =
  document.getElementById(
    "board"
  );

const message =
  document.getElementById(
    "message"
  );

const levelNumber =
  document.getElementById(
    "levelNumber"
  );

const levelPanel =
  document.getElementById(
    "levelPanel"
  );

const levelGrid =
  document.getElementById(
    "levelGrid"
  );


// ========================================
// START LEVEL
// ========================================

function startLevel(levelIndex) {

  if (
    levelIndex < 0 ||
    levelIndex >= LEVELS.length
  ) {

    return;

  }


  // Don't allow locked levels
  if (
    levelIndex + 1 >
    progress.unlocked
  ) {

    return;

  }


  const level =
    LEVELS[levelIndex];


  currentLevel =
    levelIndex;


  capacity =
    level.capacity;


  tubes =
    level.tubes.map(
      tube => [...tube]
    );


  selectedTube = null;

  movedTube = null;

  gameWon = false;

  advancingLevel = false;


  levelNumber.textContent =
    levelIndex + 1;


  message.textContent = "";

  message.className =
    "message";


  board.classList.remove(
    "level-complete"
  );


  closeLevelPanel();

  render();

}


// ========================================
// RENDER
// ========================================

function render() {

  board.innerHTML = "";


  tubes.forEach(
    (tube, index) => {

      const tubeElement =
        document.createElement(
          "div"
        );


      tubeElement.className =
        "tube";


      if (
        selectedTube === index
      ) {

        tubeElement.classList.add(
          "selected"
        );

      }


      if (gameWon) {

        tubeElement.classList.add(
          "complete"
        );

      }


      if (
        movedTube ===
        `invalid-${index}`
      ) {

        tubeElement.classList.add(
          "invalid"
        );

      }


      tubeElement.addEventListener(
        "click",
        () =>
          handleTubeClick(index)
      );


      tube.forEach(
        (color, ballIndex) => {

          const ball =
            document.createElement(
              "div"
            );


          ball.className =
            `ball ${color}`;


          if (
            movedTube &&
            movedTube.tube === index &&
            movedTube.ball === ballIndex
          ) {

            ball.classList.add(
              "just-moved"
            );

          }


          tubeElement.appendChild(
            ball
          );

        }
      );


      board.appendChild(
        tubeElement
      );

    }
  );

}


// ========================================
// PLAYER INPUT
// ========================================

function handleTubeClick(index) {

  if (
    gameWon ||
    advancingLevel
  ) {

    return;

  }


  movedTube = null;


  // SELECT
  if (
    selectedTube === null
  ) {

    if (
      tubes[index].length === 0
    ) {

      return;

    }


    selectedTube = index;

    render();

    return;

  }


  // DESELECT
  if (
    selectedTube === index
  ) {

    selectedTube = null;

    render();

    return;

  }


  // MOVE
  const from =
    selectedTube;


  const moved =
    moveBall(
      from,
      index
    );


  if (moved) {

    movedTube = {

      tube: index,

      ball:
        tubes[index].length - 1

    };


    selectedTube = null;

    render();

    checkWin();

    return;

  }


  // INVALID
  selectedTube = null;

  movedTube =
    `invalid-${index}`;


  render();


  setTimeout(
    () => {

      movedTube = null;

      render();

    },
    280
  );

}


// ========================================
// MOVE BALL
// ========================================

function moveBall(from, to) {

  const source =
    tubes[from];


  const destination =
    tubes[to];


  if (
    source.length === 0
  ) {

    return false;

  }


  if (
    destination.length >= capacity
  ) {

    return false;

  }


  const movingColor =
    source[
      source.length - 1
    ];


  if (
    destination.length > 0 &&
    destination[
      destination.length - 1
    ] !== movingColor
  ) {

    return false;

  }


  source.pop();

  destination.push(
    movingColor
  );


  return true;

}


// ========================================
// WIN CHECK
// ========================================

function checkWin() {

  const solved =
    tubes.every(
      tube => {

        if (
          tube.length === 0
        ) {

          return true;

        }


        if (
          tube.length !== capacity
        ) {

          return false;

        }


        return tube.every(
          color =>
            color === tube[0]
        );

      }
    );


  if (!solved) {

    return;

  }


  completeLevel();

}


// ========================================
// COMPLETE LEVEL
// ========================================

function completeLevel() {

  if (gameWon) {

    return;

  }


  gameWon = true;

  advancingLevel = true;

  selectedTube = null;

  movedTube = null;


  // --------------------------------
  // SAVE COMPLETION
  // --------------------------------

  const levelNumber =
    currentLevel + 1;


  if (
    !progress.completed.includes(
      levelNumber
    )
  ) {

    progress.completed.push(
      levelNumber
    );

  }


  // Unlock next level
  if (
    levelNumber <
    LEVELS.length
  ) {

    progress.unlocked =
      Math.max(
        progress.unlocked,
        levelNumber + 1
      );

  }


  saveProgress();


  // --------------------------------
  // VISUAL
  // --------------------------------

  board.classList.add(
    "level-complete"
  );


  message.textContent =
    "🎉 Level Complete!";


  message.className =
    "message success";


  render();


  // --------------------------------
  // NEXT
  // --------------------------------

  setTimeout(
    () => {

      if (
        currentLevel <
        LEVELS.length - 1
      ) {

        startLevel(
          currentLevel + 1
        );

      } else {

        showFinalComplete();

      }

    },
    1000
  );

}


// ========================================
// FINAL COMPLETE
// ========================================

function showFinalComplete() {

  advancingLevel = true;


  message.textContent =
    "🏆 All Levels Complete!";


  message.className =
    "message success";


  render();

}


// ========================================
// LEVEL SELECT
// ========================================

function openLevelPanel() {

  renderLevelGrid();

  levelPanel.classList.remove(
    "hidden"
  );

}


function closeLevelPanel() {

  levelPanel.classList.add(
    "hidden"
  );

}


// ========================================
// LEVEL GRID
// ========================================

function renderLevelGrid() {

  levelGrid.innerHTML = "";


  LEVELS.forEach(
    (_, index) => {

      const number =
        index + 1;


      const button =
        document.createElement(
          "button"
        );


      button.className =
        "level-button";


      const unlocked =
        number <=
        progress.unlocked;


      const completed =
        progress.completed.includes(
          number
        );


      if (!unlocked) {

        button.classList.add(
          "locked"
        );

        button.innerHTML =
          `${number}<span class="lock">🔒</span>`;

        button.disabled = true;

      } else {

        button.classList.add(
          "unlocked"
        );


        if (
          number ===
          currentLevel + 1
        ) {

          button.classList.add(
            "current"
          );

        }


        if (completed) {

          button.classList.add(
            "completed"
          );

          button.innerHTML =
            `${number} ✓`;

        } else {

          button.textContent =
            number;

        }


        button.addEventListener(
          "click",
          () => {

            startLevel(index);

          }
        );

      }


      levelGrid.appendChild(
        button
      );

    }
  );

}


// ========================================
// LEVEL BUTTON
// ========================================

document
  .getElementById(
    "levelsButton"
  )
  .addEventListener(
    "click",
    openLevelPanel
  );


// ========================================
// CLOSE BUTTON
// ========================================

document
  .getElementById(
    "closeLevels"
  )
  .addEventListener(
    "click",
    closeLevelPanel
  );


// ========================================
// RESTART
// ========================================

document
  .getElementById(
    "restart"
  )
  .addEventListener(
    "click",
    () => {

      startLevel(
        currentLevel
      );

    }
  );


// ========================================
// START
// ========================================

startLevel(
  Math.min(
    currentLevel,
    progress.unlocked - 1
  )
);
