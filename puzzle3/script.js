/* =========================================================
   COLOR CONNECT
   UPDATED SCORE SYSTEM

   SCORE:
       SCORE = TOTAL BOARD CELLS
             - COLORED PATH CELLS

   Example:
       5×5 = 25 cells

       If paths use 10 cells:

       Score = 25 - 10
             = 15

   HIGHER SCORE = BETTER

   WIN:
       Every color pair must be connected.

       Empty cells are allowed.

   EASY:
       5×5 / 5 pairs

   NORMAL:
       6×6 / 6 pairs

   HARD:
       8×8 / 8 pairs
========================================================= */


/* =========================================================
   01. DIFFICULTY CONFIG
========================================================= */

const DIFFICULTIES = {

    easy: {
        name: "Easy",
        size: 5,
        pairs: 5
    },

    normal: {
        name: "Normal",
        size: 6,
        pairs: 6
    },

    hard: {
        name: "Hard",
        size: 8,
        pairs: 8
    }

};


let difficulty = "easy";

let SIZE =
    DIFFICULTIES[difficulty].size;

let COLOR_COUNT =
    DIFFICULTIES[difficulty].pairs;


/* =========================================================
   02. COLORS
========================================================= */

const COLORS = {

    red: "#ff4f64",

    blue: "#4d8dff",

    yellow: "#ffd34d",

    green: "#45d483",

    purple: "#b66cff",

    orange: "#ff914d",

    cyan: "#35d5d5",

    pink: "#ff66b3"

};


/* =========================================================
   03. GAME STATE
========================================================= */

let levelData = {};

let board = [];

let paths = {};

let currentColor = null;

let currentPath = [];

let drawing = false;

let moves = 0;

let solved = false;

let currentPuzzle = null;


/* =========================================================
   SCORE STATE
========================================================= */

let score = 0;

let bestScore = 0;

let isNewBest = false;


/* =========================================================
   CURRENT THEME
========================================================= */

let currentTheme =
    localStorage.getItem(
        "colorConnectTheme"
    )
    ||
    "default";


/* =========================================================
   THEME UNLOCK CHECK
========================================================= */

function isThemeUnlocked(theme) {

    if (
        theme.unlocked
    ) {

        return true;

    }


    return !!achievementData[
        theme.achievement
    ];

}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme() {

    document.body.classList.remove(

        "theme-ocean",

        "theme-sunset",

        "theme-neon",

        "theme-forest",

        "theme-gold"

    );


    if (
        currentTheme !==
        "default"
    ) {

        document.body.classList.add(

            `theme-${currentTheme}`

        );

    }


    localStorage.setItem(

        "colorConnectTheme",

        currentTheme

    );

}


/* =========================================================
   RENDER THEMES
========================================================= */

function renderThemes() {

    themeList.innerHTML = "";


    for (
        const id in THEMES
    ) {

        const theme =
            THEMES[id];


        const unlocked =
            isThemeUnlocked(theme);


        const selected =
            currentTheme === id;


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "theme-item";


        if (!unlocked) {

            item.classList.add(
                "locked"
            );

        }


        if (selected) {

            item.classList.add(
                "selected"
            );

        }


        item.innerHTML = `

            <div
                class="theme-preview ${theme.preview}"
            ></div>


            <div class="theme-info">

                <div class="theme-name">

                    ${
                        unlocked
                            ? theme.name
                            : "🔒 " + theme.name
                    }

                </div>


                <div class="theme-description">

                    ${theme.description}

                </div>


                <div class="theme-status">

                    ${
                        unlocked
                            ? (
                                selected
                                    ? "✓ Selected"
                                    : "Available"
                              )
                            : (
                                "🔒 Complete achievement"
                              )
                    }

                </div>

            </div>

        `;


        if (unlocked) {

            item.addEventListener(
                "click",
                () => {

                    currentTheme = id;

                    applyTheme();

                    renderThemes();

                }
            );

        }


        themeList.appendChild(
            item
        );

    }

}


/* =========================================================
   THEME DOM
========================================================= */

const themesButton =
    document.getElementById(
        "themesButton"
    );


const themePanel =
    document.getElementById(
        "themePanel"
    );


const closeThemes =
    document.getElementById(
        "closeThemes"
    );


const themeList =
    document.getElementById(
        "themeList"
    );


/* =========================================================
   THEME PANEL
========================================================= */

themesButton.addEventListener(
    "click",
    () => {

        renderThemes();

        themePanel.classList.add(
            "show"
        );

    }
);


closeThemes.addEventListener(
    "click",
    () => {

        themePanel.classList.remove(
            "show"
        );

    }
);


themePanel.addEventListener(
    "click",
    e => {

        if (
            e.target ===
            themePanel
        ) {

            themePanel.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   04. SCORE DOM
========================================================= */

const scoreCount =
    document.getElementById(
        "scoreCount"
    );


const bestScoreCount =
    document.getElementById(
        "bestScoreCount"
    );


const winScore =
    document.getElementById(
        "winScore"
    );


const winBest =
    document.getElementById(
        "winBest"
    );


const newBest =
    document.getElementById(
        "newBest"
    );


/* =========================================================
   GAME DOM
========================================================= */

const boardElement =
    document.getElementById(
        "board"
    );


const svg =
    document.getElementById(
        "paths"
    );


const message =
    document.getElementById(
        "message"
    );


const moveCount =
    document.getElementById(
        "moveCount"
    );


const resetButton =
    document.getElementById(
        "reset"
    );


const newPuzzleButton =
    document.getElementById(
        "newPuzzle"
    );


const levelElement =
    document.getElementById(
        "level"
    );


const difficultyButtons =
    document.querySelectorAll(
        ".difficulty-btn"
    );


/* =========================================================
   05. FEEDBACK STATE
========================================================= */

let soundEnabled =
    localStorage.getItem(
        "colorConnectSound"
    ) !== "off";


let hapticsEnabled =
    localStorage.getItem(
        "colorConnectHaptics"
    ) !== "off";


let audioContext = null;


/* =========================================================
   06. ACHIEVEMENTS
========================================================= */

const ACHIEVEMENTS = {

    firstWin: {

        icon: "🥉",

        name: "First Win",

        description:
            "Solve your first puzzle.",

        reward:
            "🎨 Unlocks Ocean theme"

    },


    tenWins: {

        icon: "🔥",

        name: "10 Wins",

        description:
            "Solve 10 puzzles.",

        reward:
            "🎨 Unlocks Sunset theme"

    },


    highScore: {

        icon: "⭐",

        name: "High Score",

        description:
            "Score 20 or more points.",

        reward:
            "🎨 Unlocks Neon theme"

    },


    hardMode: {

        icon: "🧩",

        name: "Hard Mode",

        description:
            "Solve an 8×8 puzzle.",

        reward:
            "🎨 Unlocks Forest theme"

    },


    master: {

        icon: "🏆",

        name: "Master",

        description:
            "Solve 25 puzzles.",

        reward:
            "🎨 Unlocks Gold theme"

    }

};


/* =========================================================
   ACHIEVEMENT STATE
========================================================= */

let achievementData =
    JSON.parse(

        localStorage.getItem(
            "colorConnectAchievements"
        )

        ||

        "{}"

    );


let totalWins =
    Number(

        localStorage.getItem(
            "colorConnectTotalWins"
        )

        ||

        0

    );


/* =========================================================
   ACHIEVEMENT DOM
========================================================= */

const achievementsButton =
    document.getElementById(
        "achievementsButton"
    );


const achievementPanel =
    document.getElementById(
        "achievementPanel"
    );


const closeAchievements =
    document.getElementById(
        "closeAchievements"
    );


const achievementList =
    document.getElementById(
        "achievementList"
    );


const achievementPopup =
    document.getElementById(
        "achievementPopup"
    );


const achievementPopupName =
    document.getElementById(
        "achievementPopupName"
    );


/* =========================================================
   SAVE ACHIEVEMENTS
========================================================= */

function saveAchievements() {

    localStorage.setItem(

        "colorConnectAchievements",

        JSON.stringify(
            achievementData
        )

    );


    localStorage.setItem(

        "colorConnectTotalWins",

        String(totalWins)

    );

}


/* =========================================================
   UNLOCK ACHIEVEMENT
========================================================= */

function unlockAchievement(id) {

    if (
        achievementData[id]
    ) {

        return;

    }


    achievementData[id] = true;


    saveAchievements();


    const achievement =
        ACHIEVEMENTS[id];


    showAchievementPopup(
        achievement.name
    );


    renderAchievements();

}


/* =========================================================
   ACHIEVEMENT POPUP
========================================================= */

let achievementPopupTimer = null;


function showAchievementPopup(
    name
) {

    achievementPopupName.textContent =
        name;


    achievementPopup.classList.add(
        "show"
    );


    clearTimeout(
        achievementPopupTimer
    );


    achievementPopupTimer =
        setTimeout(
            () => {

                achievementPopup.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   CHECK ACHIEVEMENTS
========================================================= */

function checkAchievements() {

    /*
        Every completed puzzle = one win.
    */

    totalWins++;


    saveAchievements();


    /* FIRST WIN */

    if (
        totalWins >= 1
    ) {

        unlockAchievement(
            "firstWin"
        );

    }


    /* 10 WINS */

    if (
        totalWins >= 10
    ) {

        unlockAchievement(
            "tenWins"
        );

    }


    /* HIGH SCORE */

    if (
        score >= 20
    ) {

        unlockAchievement(
            "highScore"
        );

    }


    /* HARD MODE */

    if (
        difficulty === "hard"
    ) {

        unlockAchievement(
            "hardMode"
        );

    }


    /* MASTER */

    if (
        totalWins >= 25
    ) {

        unlockAchievement(
            "master"
        );

    }

}


/* =========================================================
   RENDER ACHIEVEMENTS
========================================================= */

function renderAchievements() {

    achievementList.innerHTML = "";


    for (
        const id in ACHIEVEMENTS
    ) {

        const achievement =
            ACHIEVEMENTS[id];


        const unlocked =
            !!achievementData[id];


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "achievement-item " +
            (
                unlocked
                    ? "unlocked"
                    : "locked"
            );


        item.innerHTML = `

            <div class="achievement-icon">

                ${
                    unlocked
                        ? achievement.icon
                        : "🔒"
                }

            </div>


            <div class="achievement-info">

                <div class="achievement-name">

                    ${achievement.name}

                </div>


                <div class="achievement-description">

                    ${achievement.description}

                </div>


                <div class="achievement-reward">

                    ${achievement.reward}

                </div>

            </div>

        `;


        achievementList.appendChild(
            item
        );

    }

}


/* =========================================================
   ACHIEVEMENT PANEL
========================================================= */

achievementsButton.addEventListener(
    "click",
    () => {

        renderAchievements();

        achievementPanel.classList.add(
            "show"
        );

    }
);


closeAchievements.addEventListener(
    "click",
    () => {

        achievementPanel.classList.remove(
            "show"
        );

    }
);


achievementPanel.addEventListener(
    "click",
    e => {

        if (
            e.target ===
            achievementPanel
        ) {

            achievementPanel.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   07. THEMES
========================================================= */

const THEMES = {

    default: {

        name: "Classic",

        description:
            "The original Color Connect look.",

        preview:
            "default",

        unlocked: true

    },


    ocean: {

        name: "Ocean",

        description:
            "A cool blue underwater style.",

        preview:
            "ocean",

        achievement:
            "firstWin"

    },


    sunset: {

        name: "Sunset",

        description:
            "Warm evening colors.",

        preview:
            "sunset",

        achievement:
            "tenWins"

    },


    neon: {

        name: "Neon",

        description:
            "Bright futuristic colors.",

        preview:
            "neon",

        achievement:
            "highScore"

    },


    forest: {

        name: "Forest",

        description:
            "A calm green nature style.",

        preview:
            "forest",

        achievement:
            "hardMode"

    },


    gold: {

        name: "Gold",

        description:
            "The ultimate unlocked style.",

        preview:
            "gold",

        achievement:
            "master"

    }

};


/* =========================================================
   08. FEEDBACK DOM
========================================================= */

const soundToggle =
    document.getElementById(
        "soundToggle"
    );


const hapticToggle =
    document.getElementById(
        "hapticToggle"
    );


/* =========================================================
   WIN SCREEN
========================================================= */

const winScreen =
    document.getElementById(
        "winScreen"
    );


const winMoves =
    document.getElementById(
        "winMoves"
    );


const winNext =
    document.getElementById(
        "winNext"
    );


/* =========================================================
   09. HAPTICS
========================================================= */

function vibrate(pattern) {

    if (
        !hapticsEnabled
    ) {

        return;

    }


    if (
        "vibrate" in navigator
    ) {

        navigator.vibrate(
            pattern
        );

    }

}


/* =========================================================
   10. SOUND ENGINE
========================================================= */

function getAudioContext() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            return null;

        }


        audioContext =
            new AudioContext();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return audioContext;

}


/* =========================================================
   PLAY TONE
========================================================= */

function playTone(
    frequency,
    duration,
    volume = 0.04,
    type = "sine"
) {

    if (
        !soundEnabled
    ) {

        return;

    }


    const ctx =
        getAudioContext();


    if (!ctx) {

        return;

    }


    const oscillator =
        ctx.createOscillator();


    const gain =
        ctx.createGain();


    oscillator.type =
        type;


    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        0,
        ctx.currentTime
    );


    gain.gain.linearRampToValueAtTime(
        volume,
        ctx.currentTime + 0.01
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
    );


    oscillator.connect(gain);

    gain.connect(
        ctx.destination
    );


    oscillator.start();


    oscillator.stop(
        ctx.currentTime +
        duration
    );

}


/* =========================================================
   GAME SOUNDS
========================================================= */

function playConnectSound() {

    playTone(
        620,
        0.09,
        0.045,
        "sine"
    );

}


function playInvalidSound() {

    playTone(
        180,
        0.08,
        0.025,
        "square"
    );

}


function playWinSound() {

    if (
        !soundEnabled
    ) {

        return;

    }


    playTone(
        523,
        0.12,
        0.045,
        "sine"
    );


    setTimeout(
        () => {

            playTone(
                659,
                0.12,
                0.045,
                "sine"
            );

        },
        90
    );


    setTimeout(
        () => {

            playTone(
                784,
                0.22,
                0.055,
                "sine"
            );

        },
        180
    );

}


/* =========================================================
   11. BEST SCORE STORAGE
========================================================= */

function getBestScore() {

    const saved =
        localStorage.getItem(
            `colorConnectBest_${difficulty}`
        );


    return saved
        ? Number(saved)
        : 0;

}


/* =========================================================
   LOAD BEST SCORE
========================================================= */

function loadBestScore() {

    bestScore =
        getBestScore();


    bestScoreCount.textContent =
        bestScore;

}


/* =========================================================
   12. CALCULATE SCORE
========================================================= */

function calculateScore() {

    /*
        SCORE IS BASED DIRECTLY ON
        THE NUMBER OF EMPTY CELLS.

        Example:

        5×5 board = 25 cells

        If paths occupy 10 cells:

            25 - 10 = 15 score

        Therefore:

            MORE EMPTY CELLS
            =
            FEWER COLORED PATH CELLS
            =
            HIGHER SCORE
            =
            BETTER RESULT
    */


    const totalCells =
        SIZE * SIZE;


    const occupied =
        new Set();


    /*
        Count every cell used by
        every completed path.

        Set prevents accidental
        double-counting.
    */

    for (
        const color in paths
    ) {

        const path =
            paths[color];


        if (!path) {
            continue;
        }


        for (
            const point of path
        ) {

            occupied.add(
                `${point.row},${point.col}`
            );

        }

    }


    const coloredCells =
        occupied.size;


    const emptyCells =
        totalCells -
        coloredCells;


    /*
        Empty cells are the score.

        Never return a negative
        value as a safety measure.
    */

    return Math.max(
        0,
        emptyCells
    );

}


/* =========================================================
   13. FINISH SCORE
========================================================= */

function finishScore() {

    score =
        calculateScore();


    isNewBest =
        score > bestScore;


    if (isNewBest) {

        bestScore =
            score;


        localStorage.setItem(

            `colorConnectBest_${difficulty}`,

            String(bestScore)

        );

    }


    updateScoreDisplay();

}


/* =========================================================
   SCORE DISPLAY
========================================================= */

function updateScoreDisplay() {

    scoreCount.textContent =
        score;


    bestScoreCount.textContent =
        bestScore;

}


/* =========================================================
   14. APPLY DIFFICULTY
========================================================= */

function applyDifficulty() {

    const config =
        DIFFICULTIES[difficulty];


    SIZE =
        config.size;


    COLOR_COUNT =
        config.pairs;


    document.body.classList.remove(
        "board-normal",
        "board-hard"
    );


    if (
        difficulty === "normal"
    ) {

        document.body.classList.add(
            "board-normal"
        );

    }


    if (
        difficulty === "hard"
    ) {

        document.body.classList.add(
            "board-hard"
        );

    }


    levelElement.textContent =
        `${config.name} · ` +
        `${SIZE}×${SIZE} · ` +
        `${COLOR_COUNT} Pairs`;


    difficultyButtons.forEach(
        button => {

            button.classList.toggle(

                "active",

                button.dataset.difficulty ===
                difficulty

            );

        }
    );

}


/* =========================================================
   15. BOARD SIZE
========================================================= */

function setupBoardSize() {

    boardElement.style.gridTemplateColumns =
        `repeat(${SIZE}, var(--cell))`;


    boardElement.style.gridTemplateRows =
        `repeat(${SIZE}, var(--cell))`;

}


/* =========================================================
   16. RANDOM HELPERS
========================================================= */

function randomInt(max) {

    return Math.floor(
        Math.random() * max
    );

}


function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            randomInt(i + 1);


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


/* =========================================================
   17. GRID NEIGHBOURS
========================================================= */

function getNeighbours(
    row,
    col
) {

    const result = [];


    const directions = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];


    for (
        const [dr, dc]
        of directions
    ) {

        const nr =
            row + dr;


        const nc =
            col + dc;


        if (

            nr >= 0 &&
            nr < SIZE &&
            nc >= 0 &&
            nc < SIZE

        ) {

            result.push({

                row: nr,

                col: nc

            });

        }

    }


    return shuffle(result);

}


/* =========================================================
   18. ADJACENCY
========================================================= */

function isAdjacent(a, b) {

    return (

        Math.abs(
            a.row - b.row
        )

        +

        Math.abs(
            a.col - b.col
        )

    ) === 1;

}


/* =========================================================
   19. HAMILTONIAN PATH
========================================================= */

function generateHamiltonianPath() {

    const total =
        SIZE * SIZE;


    for (
        let attempt = 0;
        attempt < 100;
        attempt++
    ) {

        const start = {

            row:
                randomInt(SIZE),

            col:
                randomInt(SIZE)

        };


        const visited =
            Array.from(

                {
                    length: SIZE
                },

                () =>
                    Array(
                        SIZE
                    ).fill(false)

            );


        const path = [
            start
        ];


        visited[
            start.row
        ][
            start.col
        ] = true;


        if (
            searchHamiltonian(
                start,
                visited,
                path,
                total
            )
        ) {

            return path;

        }

    }


    return createSnakePath();

}


/* =========================================================
   20. HAMILTONIAN SEARCH
========================================================= */

function searchHamiltonian(
    current,
    visited,
    path,
    total
) {

    if (
        path.length === total
    ) {

        return true;

    }


    let neighbours =
        getNeighbours(
            current.row,
            current.col
        );


    neighbours.sort(

        (a, b) => {

            const aCount =
                getNeighbours(
                    a.row,
                    a.col
                ).filter(

                    p =>
                        !visited[
                            p.row
                        ][
                            p.col
                        ]

                ).length;


            const bCount =
                getNeighbours(
                    b.row,
                    b.col
                ).filter(

                    p =>
                        !visited[
                            p.row
                        ][
                            p.col
                        ]

                ).length;


            return aCount - bCount;

        }

    );


    for (
        const next
        of neighbours
    ) {

        if (
            visited[
                next.row
            ][
                next.col
            ]
        ) {

            continue;

        }


        visited[
            next.row
        ][
            next.col
        ] = true;


        path.push(next);


        if (
            searchHamiltonian(
                next,
                visited,
                path,
                total
            )
        ) {

            return true;

        }


        path.pop();


        visited[
            next.row
        ][
            next.col
        ] = false;

    }


    return false;

}


/* =========================================================
   21. SNAKE FALLBACK
========================================================= */

function createSnakePath() {

    const result = [];


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        if (
            row % 2 === 0
        ) {

            for (
                let col = 0;
                col < SIZE;
                col++
            ) {

                result.push({

                    row,

                    col

                });

            }

        } else {

            for (
                let col = SIZE - 1;
                col >= 0;
                col--
            ) {

                result.push({

                    row,

                    col

                });

            }

        }

    }


    return result;

}


/* =========================================================
   22. SEGMENT LENGTHS
========================================================= */

function createSegmentLengths(
    total,
    count
) {

    const lengths =
        Array(count).fill(2);


    let remaining =
        total -
        count * 2;


    while (
        remaining > 0
    ) {

        const index =
            randomInt(count);


        lengths[index]++;

        remaining--;

    }


    return shuffle(lengths);

}


/* =========================================================
   23. GENERATE CANDIDATE
========================================================= */

function generateCandidatePuzzle() {

    const fullPath =
        generateHamiltonianPath();


    const colorNames =
        Object.keys(COLORS)
            .slice(
                0,
                COLOR_COUNT
            );


    const lengths =
        createSegmentLengths(

            fullPath.length,

            COLOR_COUNT

        );


    const puzzle = {};


    let position = 0;


    for (
        let i = 0;
        i < COLOR_COUNT;
        i++
    ) {

        const length =
            lengths[i];


        const segment =
            fullPath.slice(

                position,

                position + length

            );


        position += length;


        puzzle[
            colorNames[i]
        ] = [

            [

                segment[0].row,

                segment[0].col

            ],

            [

                segment[
                    segment.length - 1
                ].row,

                segment[
                    segment.length - 1
                ].col

            ]

        ];

    }

/*
console.log(
    "FULL PATH:",
    fullPath.map(
        (p, i) =>
            `${i}:(${p.row},${p.col})`
    )
);

console.log(
    "GENERATED PUZZLE:",
    JSON.stringify(
        puzzle,
        null,
        2
    )
);

*/

    return puzzle;

}


/* =========================================================
   24. GENERATE PUZZLE
========================================================= */

function generatePuzzle() {

    return generateCandidatePuzzle();

}


/* =========================================================
   25. LOAD PUZZLE
========================================================= */

function loadPuzzle(puzzle) {

    hideWinScreen();


    currentPuzzle =
        structuredClone(puzzle);


    levelData =
        structuredClone(puzzle);

/*
console.log(
    "LOADED LEVEL DATA:",
    JSON.stringify(levelData, null, 2)
);

*/

    paths = {};


    currentColor = null;


    currentPath = [];


    drawing = false;


    moves = 0;


    score = 0;


    isNewBest = false;


    loadBestScore();


    updateScoreDisplay();


    newBest.classList.remove(
        "show"
    );


    solved = false;


    message.textContent =
        "Connect all colors";


    message.classList.remove(
        "win"
    );


    updateMoves();


    setupBoardSize();


    createBoard();


    renderPaths();

}


/* =========================================================
   26. CREATE BOARD
========================================================= */

function createBoard() {

    setupBoardSize();


    boardElement
        .querySelectorAll(
            ".cell"
        )
        .forEach(
            cell =>
                cell.remove()
        );


    board = [];


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        board[row] = [];


        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "cell";


            cell.dataset.row =
                row;


            cell.dataset.col =
                col;


            boardElement.insertBefore(
                cell,
                svg
            );


            board[row][col] = {

                element:
                    cell,

                color:
                    null,

                endpoint:
                    null

            };

        }

    }


    /* CREATE ENDPOINTS */

    for (
        const color
        in levelData
    ) {

        for (
            const [row, col]
            of levelData[color]
        ) {

            board[row][col]
                .endpoint =
                color;


            const dot =
                document.createElement(
                    "div"
                );


            dot.className =
                "dot";


            dot.style.background =
                COLORS[color];


            board[row][col]
                .element
                .appendChild(
                    dot
                );

        }

    }

}


/* =========================================================
   27. POINTER → CELL
========================================================= */

function getCellFromPointer(e) {

    const element =
        document.elementFromPoint(

            e.clientX,

            e.clientY

        );


    if (!element) {

        return null;

    }


    const cell =
        element.closest(
            ".cell"
        );


    if (!cell) {

        return null;

    }


    return {

        row:
            Number(
                cell.dataset.row
            ),

        col:
            Number(
                cell.dataset.col
            )

    };

}


/* =========================================================
   28. START DRAWING
========================================================= */

function startDrawing(e) {

    if (solved) {

        return;

    }


    const pos =
        getCellFromPointer(e);


    if (!pos) {

        return;

    }


    const cell =
        board[
            pos.row
        ][
            pos.col
        ];


    if (!cell.endpoint) {

        return;

    }


    currentColor =
        cell.endpoint;


    /*
        Remove previous path of
        this color.
    */

    delete paths[
        currentColor
    ];


    clearBoardColor(
        currentColor
    );


    currentPath = [

        {

            row:
                pos.row,

            col:
                pos.col

        }

    ];


    drawing = true;


    renderPaths();


    try {

        boardElement.setPointerCapture(
            e.pointerId
        );

    } catch {}

}


/* =========================================================
   29. MOVE DRAWING
========================================================= */

function moveDrawing(e) {

    if (
        !drawing ||
        solved
    ) {

        return;

    }


    const pos =
        getCellFromPointer(e);


    if (!pos) {

        return;

    }


    const last =
        currentPath[
            currentPath.length - 1
        ];


    if (

        pos.row === last.row &&

        pos.col === last.col

    ) {

        return;

    }


    if (
        !isAdjacent(
            last,
            pos
        )
    ) {

        return;

    }


    /* BACKTRACK */

    if (
        currentPath.length >= 2
    ) {

        const previous =
            currentPath[
                currentPath.length - 2
            ];


        if (

            previous.row === pos.row &&

            previous.col === pos.col

        ) {

            currentPath.pop();


            renderPaths();


            return;

        }

    }


    const target =
        board[
            pos.row
        ][
            pos.col
        ];


    /*
        Cannot enter another
        completed color.
    */

    if (

        target.color &&

        target.color !== currentColor

    ) {

        return;

    }


    /*
        Cannot revisit own path.
    */

    if (

        currentPath.some(

            p =>

                p.row === pos.row &&

                p.col === pos.col

        )

    ) {

        return;

    }


    /*
        Cannot enter another endpoint.
    */

    if (

        target.endpoint &&

        target.endpoint !== currentColor

    ) {

        return;

    }


    currentPath.push({

        row:
            pos.row,

        col:
            pos.col

    });


    renderPaths();


    /*
        MATCHING ENDPOINT
    */

    if (
        target.endpoint ===
        currentColor
    ) {

        finishCurrentPath();

    }

}


/* =========================================================
   30. FINISH CURRENT PATH
========================================================= */

function finishCurrentPath() {

    const finishedPath =
        currentPath.map(

            p => ({

                row:
                    p.row,

                col:
                    p.col

            })

        );


    paths[
        currentColor
    ] =
        finishedPath;


    /*
        Mark board cells.
    */

    for (
        const p
        of finishedPath
    ) {

        board[
            p.row
        ][
            p.col
        ].color =
            currentColor;

    }


    moves++;


    playConnectSound();


    vibrate(12);


    updateMoves();


    drawing = false;


    currentPath = [];


    renderPaths();


    /*
        Check after every completed
        color.
    */

    checkWin();

}


/* =========================================================
   31. STOP DRAWING
========================================================= */

function stopDrawing() {

    if (!drawing) {

        return;

    }


    if (
        currentPath.length
    ) {

        const last =
            currentPath[
                currentPath.length - 1
            ];


        const reached =
            board[
                last.row
            ][
                last.col
            ].endpoint ===
            currentColor;


        if (!reached) {

            currentPath = [];


            renderPaths();

        }

    }


    drawing = false;

}


/* =========================================================
   32. CLEAR COLOR
========================================================= */

function clearBoardColor(
    color
) {

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (

                board[row][col].color ===
                color

            ) {

                board[row][col].color =
                    null;

            }

        }

    }

}


/* =========================================================
   33. RENDER PATHS
========================================================= */

function renderPaths() {

    svg.innerHTML = "";


    /* COMPLETED PATHS */

    for (
        const color
        in paths
    ) {

        createSVGPath(

            paths[color],

            COLORS[color],

            false

        );

    }


    /* CURRENT PATH */

    if (

        drawing &&

        currentPath.length

    ) {

        createSVGPath(

            currentPath,

            COLORS[currentColor],

            true

        );

    }

}


/* =========================================================
   34. CREATE SVG PATH
========================================================= */

function createSVGPath(

    points,

    color,

    preview

) {

    if (
        !points.length
    ) {

        return;

    }


    const cells =
        boardElement
            .querySelectorAll(
                ".cell"
            );


    if (!cells.length) {

        return;

    }


    const firstRect =
        cells[0]
            .getBoundingClientRect();


    const cellSize =
        firstRect.width;


    const gap =
        getGridGap();


    const strokeWidth =
        Math.max(

            14,

            cellSize *
            (
                SIZE >= 8
                    ? 0.34
                    : 0.38
            )

        );


    function center(point) {

        return {

            x:

                point.col *
                (
                    cellSize +
                    gap
                )

                +

                cellSize / 2,


            y:

                point.row *
                (
                    cellSize +
                    gap
                )

                +

                cellSize / 2

        };

    }


    const first =
        center(
            points[0]
        );


    let d =
        `M ${first.x} ${first.y}`;


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        const p =
            center(
                points[i]
            );


        d +=
            ` L ${p.x} ${p.y}`;

    }


    const path =
        document.createElementNS(

            "http://www.w3.org/2000/svg",

            "path"

        );


    path.setAttribute(
        "d",
        d
    );


    path.setAttribute(
        "stroke",
        color
    );


    path.setAttribute(
        "stroke-width",
        strokeWidth
    );


    path.classList.add(
        "path"
    );


    if (preview) {

        path.classList.add(
            "preview"
        );

    }


    svg.appendChild(
        path
    );

}


/* =========================================================
   35. GRID GAP
========================================================= */

function getGridGap() {

    const cells =
        boardElement
            .querySelectorAll(
                ".cell"
            );


    if (
        cells.length < 2
    ) {

        return 5;

    }


    const first =
        cells[0]
            .getBoundingClientRect();


    const second =
        cells[1]
            .getBoundingClientRect();


    return Math.max(

        0,

        second.left -
        first.right

    );

}


/* =========================================================
   36. CHECK ONE COLOR
========================================================= */

function isColorConnected(
    color
) {

    const path =
        paths[color];


    if (
        !path ||
        path.length < 2
    ) {

        return false;

    }


    const endpoints =
        levelData[color];


    if (
        !endpoints ||
        endpoints.length !== 2
    ) {

        return false;

    }


    const start =
        endpoints[0];


    const end =
        endpoints[1];


    const first =
        path[0];


    const last =
        path[
            path.length - 1
        ];


    const forward =

        first.row === start[0] &&

        first.col === start[1] &&

        last.row === end[0] &&

        last.col === end[1];


    const reverse =

        first.row === end[0] &&

        first.col === end[1] &&

        last.row === start[0] &&

        last.col === start[1];


    if (
        !forward &&
        !reverse
    ) {

        return false;

    }


    /*
        Every path step must be
        adjacent.
    */

    for (
        let i = 1;
        i < path.length;
        i++
    ) {

        if (
            !isAdjacent(
                path[i - 1],
                path[i]
            )
        ) {

            return false;

        }

    }


    return true;

}


/* =========================================================
   37. WIN CHECK
========================================================= */

function checkWin() {

    if (solved) {

        return true;

    }


    const colors =
        Object.keys(
            levelData
        );


    /*
        IMPORTANT:

        We DO NOT require every board
        cell to be filled.

        Only every pair needs to
        connect successfully.
    */

    for (
        const color
        of colors
    ) {

        if (
            !isColorConnected(color)
        ) {

            return false;

        }

    }


    /* =====================================================
       PUZZLE SOLVED
    ====================================================== */


    /*
        Calculate score BEFORE showing
        the win screen.

        Score = empty cells.
    */

    finishScore();


    playWinSound();


    vibrate([
        30,
        40,
        60
    ]);


    checkAchievements();


    solved = true;


    drawing = false;


    currentPath = [];


    currentColor = null;


    renderPaths();


    message.textContent =
        "🎉 Puzzle solved!";


    message.classList.add(
        "win"
    );


    showWinScreen();


    return true;

}


/* =========================================================
   38. UPDATE FEEDBACK BUTTONS
========================================================= */

function updateFeedbackButtons() {

    soundToggle.textContent =

        soundEnabled
            ? "🔊 Sound ON"
            : "🔇 Sound OFF";


    hapticToggle.textContent =

        hapticsEnabled
            ? "📳 Haptics ON"
            : "📴 Haptics OFF";


    soundToggle.classList.toggle(
        "active",
        soundEnabled
    );


    hapticToggle.classList.toggle(
        "active",
        hapticsEnabled
    );

}


/* =========================================================
   39. SOUND TOGGLE
========================================================= */

soundToggle.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;


        localStorage.setItem(

            "colorConnectSound",

            soundEnabled
                ? "on"
                : "off"

        );


        updateFeedbackButtons();


        if (soundEnabled) {

            playTone(
                660,
                0.08,
                0.04
            );

        }

    }
);


/* =========================================================
   40. HAPTICS TOGGLE
========================================================= */

hapticToggle.addEventListener(
    "click",
    () => {

        hapticsEnabled =
            !hapticsEnabled;


        localStorage.setItem(

            "colorConnectHaptics",

            hapticsEnabled
                ? "on"
                : "off"

        );


        updateFeedbackButtons();


        if (hapticsEnabled) {

            vibrate(20);

        }

    }
);


/* =========================================================
   41. SHOW WIN SCREEN
========================================================= */

function showWinScreen() {

    if (!winScreen) {

        return;

    }


    winScore.textContent =
        score;


    winBest.textContent =
        bestScore;


    winMoves.textContent =
        moves;


    newBest.classList.toggle(

        "show",

        isNewBest

    );


    winScreen.classList.add(
        "show"
    );

}


/* =========================================================
   42. HIDE WIN SCREEN
========================================================= */

function hideWinScreen() {

    if (!winScreen) {

        return;

    }


    winScreen.classList.remove(
        "show"
    );

}


/* =========================================================
   43. MOVE COUNTER
========================================================= */

function updateMoves() {

    moveCount.textContent =
        moves;

}


/* =========================================================
   44. RESET
========================================================= */

function resetPuzzle() {

    hideWinScreen();


    if (!currentPuzzle) {

        return;

    }


    loadPuzzle(
        currentPuzzle
    );

}


/* =========================================================
   45. NEW PUZZLE
========================================================= */

function newPuzzle() {

    hideWinScreen();


    message.textContent =
        "Generating...";


    message.classList.remove(
        "win"
    );


    setTimeout(
        () => {

            const puzzle =
                generatePuzzle();


            loadPuzzle(
                puzzle
            );

        },
        10
    );

}


/* =========================================================
   46. CHANGE DIFFICULTY
========================================================= */

function changeDifficulty(
    newDifficulty
) {

    if (
        !DIFFICULTIES[newDifficulty]
    ) {

        return;

    }


    if (
        newDifficulty ===
        difficulty
    ) {

        return;

    }


    difficulty =
        newDifficulty;


    applyDifficulty();


    newPuzzle();

}


/* =========================================================
   47. DIFFICULTY EVENTS
========================================================= */

difficultyButtons.forEach(
    button => {

        button.addEventListener(

            "click",

            () => {

                changeDifficulty(

                    button.dataset.difficulty

                );

            }

        );

    }
);


/* =========================================================
   48. MAIN EVENTS
========================================================= */

boardElement.addEventListener(

    "pointerdown",

    startDrawing

);


boardElement.addEventListener(

    "pointermove",

    moveDrawing

);


window.addEventListener(

    "pointerup",

    stopDrawing

);


resetButton.addEventListener(

    "click",

    resetPuzzle

);


newPuzzleButton.addEventListener(

    "click",

    newPuzzle

);


/* =========================================================
   49. START THEME
========================================================= */

if (

    !THEMES[currentTheme] ||

    !isThemeUnlocked(
        THEMES[currentTheme]
    )

) {

    currentTheme =
        "default";

}


/* =========================================================
   50. WIN BUTTON
========================================================= */

winNext.addEventListener(

    "click",

    newPuzzle

);


/* =========================================================
   51. START GAME
========================================================= */

applyDifficulty();


loadBestScore();


setupBoardSize();


renderAchievements();


updateFeedbackButtons();


applyTheme();


renderThemes();


newPuzzle();
