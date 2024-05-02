/*
 * Define HTML Elements
 */

const board = document.getElementById('Game-Board');
const score = document.getElementById('score');
const highScore = document.getElementById('high-score');
const leaderboardSection = document.getElementById('leaderboard-section')
const easy = document.getElementById('easy');
const medium = document.getElementById('medium');
const hard = document.getElementById('hard');
let curHighScore = parseInt(highScore.innerHTML);
let curScore = 0;
let difficulty = 'medium';

/*
 * Define Game Variables
 */
const gridSize = 20;
let snake = [{x: 10, y: 10}]
let food = generateFood();
let direction = 'right';
let gameInterval;
let gameSpeed = 125;
let gameStarted = false;
let isKeyDown = false;

//draws map, snake, and food
function drawGameMap() {
    board.innerHTML = '';
    drawSnake();
    drawFood();
}

function drawSnake() {
    snake.forEach((segment) => {
        const snakeElement = createGameElement('div', 'snake');
        setPosition(snakeElement, segment);
        board.appendChild(snakeElement);
    })
}

function drawFood() {
    const foodElement = createGameElement('div', 'food');
    setPosition(foodElement, food);
    board.appendChild(foodElement);
}

function createGameElement(element, cn) {
    const el = document.createElement(element);
    el.className = cn;
    return el;
}

//set position of created elements
function setPosition(element, position) {
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
}

function generateFood() {
    let x = Math.ceil((Math.random() * gridSize));
    let y = Math.ceil((Math.random() * gridSize));
    while (true) { // keep food from being generated onto the snake
        let isIn = false;
        snake.forEach(segment => {
            if (segment.x === x && segment.y === y) {
                isIn = true;
            }
        })
        if (!isIn) {
            break;
        } else {
            x = Math.ceil((Math.random() * gridSize));
            y = Math.ceil((Math.random() * gridSize));
            console.log("Food Reroll");
        }
    }
    return {x, y};
}

function moveSnake() {
    const snakeHead = {...snake[0]}
    switch (direction) {
        case 'right':
            snakeHead.x++;
            break;
        case 'up':
            snakeHead.y--;
            break;
        case 'down':
            snakeHead.y++;
            break;
        case 'left':
            snakeHead.x--;
            break;
    }

    snake.unshift(snakeHead);

    if (snakeHead.x === food.x && snakeHead.y === food.y) {
        curScore++;
        score.innerHTML = curScore;
        food = generateFood();
        //moveSnake();
        drawGameMap();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    //check if the player hit the game border
    if ((head.x < 1) || (head.x > gridSize) || (head.y < 1) || (head.y > gridSize)) {
        resetGame();
    }
    //check if the player hit themself
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            resetGame();
        }
    }
}

drawGameMap();

//stop the double input bug by automatically moving the snake when they player moves
function makeMoveWhenMove() {
    clearInterval(gameInterval);
    moveSnake();
    drawGameMap();
    gameInterval = setInterval(() => {
        moveSnake();
        checkCollision();
        drawGameMap();
    }, gameSpeed)
}

function startGame(dir) {
    leaderboardSection.style.display = "none";
    gameStarted = true;
    score.innerHTML = "0"
    switch (dir.key) {
        case 'ArrowUp':
            direction = 'up';
            break;
        case 'ArrowDown':
            direction = 'down';
            break;
        case 'ArrowLeft':
            direction = 'left';
            break;
        case 'ArrowRight':
            direction = 'right';
            break;
        }
    gameInterval = setInterval(() => {
        moveSnake();
        checkCollision();
        drawGameMap();
    }, gameSpeed)
}

async function sendScore() {
    console.log(score.innerHTML);
    const data = {
        'user': username,
        'score': snake.length-1,
        'difficulty': difficulty,
    }

    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };

    console.log(options);

    try {
        const response = await fetch("/sendScore", options);
        const result = await response.text();
        console.log("Success:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}

function resetGame() {
    sendScore();
    food = generateFood();
    direction = 'right';
    if (curScore > curHighScore) {
        curHighScore = snake.length-1;
        highScore.innerHTML = curHighScore.toString();
    }
    snake = [{x: 10, y: 10}];
    clearInterval(gameInterval);
    curScore = 0;
    gameStarted = false;
    leaderboardSection.style.display = "block";
}

//keypress event listener
function handleKeyPress(event) {
    if ((!gameStarted && event.code === 'ArrowUp')    || 
        (!gameStarted && event.code === 'ArrowDown')  || 
        (!gameStarted && event.code === 'ArrowLeft')  || 
        (!gameStarted && event.code === 'ArrowRight') ||
        (!gameStarted && event.key === 'ArrowUp')     || 
        (!gameStarted && event.key === 'ArrowDown')   || 
        (!gameStarted && event.key === 'ArrowLeft')   || 
        (!gameStarted && event.key === 'ArrowRight')) 
    {
        startGame(event);
    } else {
        if (!isKeyDown) {
            switch (event.key) {
                case 'ArrowUp':
                    if (direction != 'down' && direction != 'up') {
                        direction = 'up';
                        makeMoveWhenMove();
                    }
                    break;
                case 'ArrowDown':
                    if (direction != 'up' && direction != 'down') {
                        direction = 'down';
                        makeMoveWhenMove();
                    }
                    break;
                case 'ArrowLeft':
                    if (direction != 'right' && direction != 'left') {
                        direction = 'left';
                        makeMoveWhenMove();
                    }
                    break;
                case 'ArrowRight':
                    if (direction != 'left' && direction != 'right') {
                        direction = 'right';
                        makeMoveWhenMove();
                    }
                    break;
                case 'Q':
                    resetGame();
                    break;
            }
        }
    }
}

document.addEventListener('keydown', handleKeyPress);

//change the game speed
function toggleDifficulty(mode) {
    if (!gameStarted) {
        if (mode === 'easy') {
            gameSpeed = 200;
            difficulty = 'easy';
        } else if (mode === 'medium') {
            gameSpeed = 125;
            difficulty = 'medium';
        } else {
            gameSpeed = 75;
            difficulty = 'hard';
        }
        toggleButtonStyle(mode)
    }
}

function toggleButtonStyle(mode) {
    easy.className = 'difficulties';
    medium.className = 'difficulties';
    hard.className = 'difficulties';
    if (mode === 'easy') {
        easy.className = 'difficulties active';
    } else if (mode === 'medium') {
        medium.className = 'difficulties active';
    } else {
        hard.className = 'difficulties active';
    }
}

async function getScores() {
    const response = await fetch('/getScores');
    let data = await response.json();
    for (i in data.easy) {
        document.getElementById('e'+i).innerHTML = data.easy[i].score + "<br>" + data.easy[i].name;
        document.getElementById('m'+i).innerHTML = data.medium[i].score + "<br>" + data.medium[i].name;
        document.getElementById('h'+i).innerHTML = data.hard[i].score + "<br>" + data.hard[i].name;
    }
}

getScores();
refreshScores = setInterval(getScores, 10000);