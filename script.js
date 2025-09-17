const ball = document.getElementById('ball');
const goal = document.getElementById('goal');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');

let score = 0;

// 공 물리 속성
let ballPos = { x: 50, y: 230 };
const initialBallPos = { x: 50, y: 230 };
let velocity = { x: 0, y: 0 };
let rotation = 0;
const acceleration = 1.5;
const friction = 0.9;
const maxSpeed = 15;
const bounceFactor = 1.2;

// 키 입력 상태
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
document.addEventListener('keydown', e => { if(keys.hasOwnProperty(e.key)) keys[e.key] = true; });
document.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.key)) keys[e.key] = false; });

// 적 여러 명 생성
let enemies = [];
let baseEnemyCount = 5; // 기본 적 5명
function createEnemies(count){
    for(let i=enemies.length; i<count; i++){
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        gameArea.appendChild(enemy);
        enemies.push({
            el: enemy,
            pos: { x: Math.random() * (gameArea.offsetWidth - 40), y: Math.random() * (gameArea.offsetHeight - 40) },
            dir: { x: (Math.random() * 2 + 1) * (Math.random()<0.5?-1:1), y: (Math.random() * 2 + 1) * (Math.random()<0.5?-1:1) }
        });
    }
}
createEnemies(baseEnemyCount);

// 경기장 초기 크기
let arenaWidth = 800;
let arenaHeight = 500;
const arenaGrowth = 50; // 점수 3점마다 증가할 크기

// 게임 루프
function gameLoop() {
    moveBall();
    moveEnemies();
    checkGoal();
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

// 공 움직임
function moveBall() {
    if(keys.ArrowUp) velocity.y -= acceleration;
    if(keys.ArrowDown) velocity.y += acceleration;
    if(keys.ArrowLeft) velocity.x -= acceleration;
    if(keys.ArrowRight) velocity.x += acceleration;

    velocity.x = Math.max(Math.min(velocity.x, maxSpeed), -maxSpeed);
    velocity.y = Math.max(Math.min(velocity.y, maxSpeed), -maxSpeed);

    ballPos.x += velocity.x;
    ballPos.y += velocity.y;

    rotation += Math.sqrt(velocity.x**2 + velocity.y**2) * 0.5;
    ball.style.transform = `rotate(${rotation}deg)`;

    velocity.x *= friction;
    velocity.y *= friction;

    // 벽 충돌
    if(ballPos.x < 0) { ballPos.x = 0; velocity.x *= -bounceFactor; }
    if(ballPos.y < 0) { ballPos.y = 0; velocity.y *= -bounceFactor; }
    if(ballPos.x + ball.offsetWidth > gameArea.offsetWidth) { 
        ballPos.x = gameArea.offsetWidth - ball.offsetWidth; 
        velocity.x *= -bounceFactor; 
    }
    if(ballPos.y + ball.offsetHeight > gameArea.offsetHeight) { 
        ballPos.y = gameArea.offsetHeight - ball.offsetHeight; 
        velocity.y *= -bounceFactor; 
    }

    ball.style.left = ballPos.x + 'px';
    ball.style.top = ballPos.y + 'px';
}

// 적 움직임
function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.dir.x *= 1.001;
        enemy.dir.y *= 1.001;

        enemy.pos.x += enemy.dir.x;
        enemy.pos.y += enemy.dir.y;

        if(enemy.pos.x < 0 || enemy.pos.x + 40 > gameArea.offsetWidth) enemy.dir.x *= -1;
        if(enemy.pos.y < 0 || enemy.pos.y + 40 > gameArea.offsetHeight) enemy.dir.y *= -1;

        enemy.el.style.left = enemy.pos.x + 'px';
        enemy.el.style.top = enemy.pos.y + 'px';
    });
}

// 골 체크
function checkGoal() {
    const ballRect = ball.getBoundingClientRect();
    const goalRect = goal.getBoundingClientRect();
    if (
        ballRect.left < goalRect.right &&
        ballRect.right > goalRect.left &&
        ballRect.top < goalRect.bottom &&
        ballRect.bottom > goalRect.top
    ) {
        score++;
        scoreDisplay.textContent = score;
        resetBall();

        // 3점마다 난이도 증가
        if(score % 3 === 0){
            // 적 3명 추가
            createEnemies(enemies.length + 3);
            // 경기장 크기 증가
            arenaWidth += arenaGrowth;
            arenaHeight += arenaGrowth;
            gameArea.style.width = arenaWidth + 'px';
            gameArea.style.height = arenaHeight + 'px';
        }
    }
}

// 공과 적 충돌 체크
function checkCollisions() {
    const ballRect = ball.getBoundingClientRect();
    enemies.forEach(enemy => {
        const enemyRect = enemy.el.getBoundingClientRect();
        if (
            ballRect.left < enemyRect.right &&
            ballRect.right > enemyRect.left &&
            ballRect.top < enemyRect.bottom &&
            ballRect.bottom > enemyRect.top
        ) {
            // 공이 초기 위치로
            ballPos = { ...initialBallPos };
            velocity = { x: 0, y: 0 };
            rotation = 0;
        }
    });
}

// 공 초기화
function resetBall() {
    ballPos = { ...initialBallPos };
    velocity = { x: 0, y: 0 };
    rotation = 0;
}

gameLoop();
