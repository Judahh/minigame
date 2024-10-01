const dinoElement = document.getElementById('dino');
const gameContainerElement = document.querySelector('.game-container');
const gameOverElement = document.getElementById('game-over');
const startElement = document.getElementById('start');
//const hiddenElement = document.getElementById('hidden-div');
const winElement = document.getElementById('win');
const scoreElement = document.getElementById('score');
const paralaxBgElement = document.getElementById('parallax-bg');
const paralaxFgElement = document.getElementById('parallax-fg');
let end = parseInt(window.getComputedStyle(gameContainerElement).getPropertyValue('width'));
let maxTop = parseInt(window.getComputedStyle(gameContainerElement).getPropertyValue('height'));

let winScore;
let speed;
let cactusSpawnRate;
let bigCactusSpawnRate;
let coinSpawnRate;
let isJumping;
let currentJumpSpeed;
let score;
let highScore;
let isGameOver=true;
let dinoVerticalPosition;
let gameInterval;

function checkParalax() {
    const fgSpeed = speed/1.2;
    const bgSpeed = fgSpeed/1.2;

    const fgProperties = getElementProperties(paralaxFgElement);
    const bgProperties = getElementProperties(paralaxBgElement);

    paralaxFgElement.style.right = (fgProperties.right + fgSpeed) + 'px';
    paralaxBgElement.style.right = (bgProperties.right + bgSpeed) + 'px';

    // check if paralax reached end
    if (parseInt(paralaxFgElement.style.right) >= end + fgProperties.width) {
        paralaxFgElement.style.right = '-100%';
    }
    if (parseInt(paralaxBgElement.style.right) >= end + bgProperties.width) {
        paralaxBgElement.style.right = '-100%';
    }
}

document.addEventListener('touchstart', touchEvent);
document.addEventListener('click', clickEvent);
document.addEventListener('keydown', keyEvent);

function keyEvent(event) {
    if (event.code === 'Space') {
        spaceEvent();
    }
}

function touchEvent(event) {
    jumpEvent();
}

function clickEvent(event) {
    jumpEvent();
}

function spaceEvent() {
    jumpEvent();
}

function jumpEvent() {
    if (isGameOver) {
        init();
        return;
    }
    if (!isJumping) {
        currentJumpSpeed = jumpSpeed;
        dinoVerticalPosition += jumpSpeed;
    } else {
        if (flightMode) {
            currentJumpSpeed += jumpSpeed;
        } else {
            currentJumpSpeed -= forceFallSpeed;
        }
    }
}

function gameStep() {
    checkDino();
    checkObject('cactus', onCactusReachedEnd, checkCactus);
    if (enableBigCactus) {
        checkObject('big-cactus', onBigCactusReachedEnd, checkBigCactus);
    }
    if (enableCoins) {
        checkObject('coin', onCoinReachedEnd, checkCoin);
    }
    addTimePoints();
    checkParalax();
}

function init() {
    winScore = useHighScoreToWin ? highScore > defaultWinScore ? highScore : defaultWinScore : defaultWinScore;
    speed = 5;
    cactusSpawnRate = initialCactusSpawnRate;
    bigCactusSpawnRate = initialBigCactusSpawnRate;
    coinSpawnRate = initialCoinSpawnRate;
    isJumping = false;
    currentJumpSpeed = 0;
    highScore = highScore || 0;
    score = 0;
    isGameOver = false;
    dinoVerticalPosition = 0;
    startElement.classList.add('hidden');
    gameOverElement.classList.add('hidden');
    winElement.classList.add('hidden');
    scoreElement.innerHTML = score;
    destroyAllObjects('cactus');
    destroyAllObjects('coin');
    destroyAllObjects('big-cactus');
    gameInterval = setInterval(gameStep, stepMs);
}

function getDefaultObjectHorizontalPosition(className) {
    switch (className) {
        case 'cactus':
            return defaultCactusHorizontalPosition;
        case 'coin':
            return defaultCoinHorizontalPosition;
        default:
            return 0;
    }
}

function isRandomObjectSpawnPosition(className) {
    switch (className) {
        case 'big-cactus':
            return isRandomCactusSpawnPosition;
        case 'cactus':
            return isRandomCactusSpawnPosition;
        case 'coin':
            return isRandomCoinSpawnPosition;
        default:
            return false;
    }
}

function getObjectSpawnRate(className) {
    switch (className) {
        case 'big-cactus':
            return bigCactusSpawnRate;
        case 'cactus':
            return cactusSpawnRate;
        case 'coin':
            return coinSpawnRate;
        default:
            return 0;
    }
}

function cactusCustomSpawn(oldHeight, oldWidth) {
    let height = oldHeight;
    let width = oldWidth;
    if (enableBigCactus) {
        if (Math.random() < bigCactusSpawnRate) {
            height = 60;
            width = 60;
        }
    }
    return {
        height,
        width
    };
}

function spawnObject(className, customSpawn) {
    const object = document.createElement('div');
    object.classList.add(className);
    object.classList.add('object');
    object.id = getObjectArray(className).length + '-' + className;
    const right = getDefaultObjectHorizontalPosition(className) + 'px';
    let bottom;
    hiddenElement.appendChild(object);
    const objectProperties = getElementProperties(object);
    const { height, width } = customSpawn?.(objectProperties.height, objectProperties.width) || objectProperties;
    hiddenElement.removeChild(object);

    bottom = isRandomObjectSpawnPosition(className) ? Math.random() * (maxTop - height) : bottom;

    const finalRight = addPx(right);
    const finalBottom = addPx(bottom);
    const finalHeight = addPx(height);
    const finalWidth = addPx(width);

    spawn(className, finalRight, finalBottom, finalHeight, finalWidth);
}

function checkDino() {
    if (dinoVerticalPosition <= 0) {
        isJumping = false;
        if (dinoVerticalPosition < 0) {
            dinoVerticalPosition = 0;
        }
    } else {
        isJumping = true;
        const dinoProperties = getElementProperties(dinoElement);
        const maxHeight = maxTop - dinoProperties.height;
        if (dinoVerticalPosition > maxHeight) {
            dinoVerticalPosition = maxHeight;
            currentJumpSpeed = 0;
        }
    }
    if (isJumping) {
        dinoVerticalPosition += currentJumpSpeed;
        currentJumpSpeed -= gravity;
    }
    dinoElement.style.bottom = dinoVerticalPosition + 'px';
}

function addTimePoints() {
    addScore(timePoints);
}

function addCoinPoints(object) {
    addScore(coinPoints);
    destroyObject('coin', object.id.replace('-coin', ''));
}

function checkObject(className, onEnd, check, customSpawn) {
    if (getObjectArray(className).length === 0) {
        spawnObject(className, customSpawn);
    }
    // randomly spawn object
    if (Math.random() < getObjectSpawnRate(className)) {
        spawnObject(className, customSpawn);
    }
    for (const object of getObjectArray(className)) {
        let objectHorizontalPosition = parseInt(object.style.right);
        if (objectHorizontalPosition >= end) {
            onEnd?.(object);
        } else {
            objectHorizontalPosition += speed;
        }
        object.style.right = objectHorizontalPosition + 'px';
        check?.(object);
    }
}

function onCactusReachedEnd(object) {
    const className = 'cactus';
    const id = parseInt(object.id.replace('-'+className, ''));
    destroyObject(className, id);
    addScore(speed);
    speed += acceleration;
    if (cactusSpawnRate < cactusSpawnRateMax) {
        cactusSpawnRate += cactusSpawnRateAcceleration;
    }
}

function onBigCactusReachedEnd(object) {
    const className = 'big-cactus';
    const id = parseInt(object.id.replace('-'+className, ''));
    destroyObject(className, id);
    addScore(speed * bigCactusSpeedPoints);
    speed += acceleration;
    if (bigCactusSpawnRate < cactusSpawnRateMax) {
        bigCactusSpawnRate += cactusSpawnRateAcceleration;
    }
}

function onCoinReachedEnd(object) {
    const className = 'coin';
    const id = parseInt(object.id.replace('-'+className, ''));
    destroyObject(className, id);
    if (coinSpawnRate < coinSpawnRateMax) {
        coinSpawnRate += coinSpawnRateAcceleration;
    }
}

function checkCactus(object) {
    // Give a little offset to the collision detection, to avoid false positives
    checkCollision(dinoElement, object, undefined, 'cactus-collision', gameOver);
}

function checkBigCactus(object) {
    // Give a little offset to the collision detection, to avoid false positives
    checkCollision(dinoElement, object, undefined, 'big-cactus-collision', gameOver);
}

function checkCoin(object) {
    // Remove offset to the collision detection, to make it easier to get the coin
    checkCollision(dinoElement, object, undefined, 'coin-collision', addCoinPoints, object);
}
