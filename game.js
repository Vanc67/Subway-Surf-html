const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerImg = new Image();
playerImg.src = "img/player.png";
const coinImg = new Image();
coinImg.src = "img/coin.png";
const barrierImg = new Image();
barrierImg.src = "img/barrier.png";

const coinSound = new Audio("audio/coin.wav");
const hitSound = new Audio("audio/hit.wav");
const music = new Audio("audio/music.wav");
music.loop = true;

let gameStarted = false;
let playerLane = 1;
let playerY = 120;
let isJumping = false;
let jumpTime = 0;

const lanePositions = [16, 56, 96];
let score = 0;
let coins = [];
let barriers = [];
let gameOver = false;
let achievementShown = false;
let achievementTimer = 0;

function resetGame() {
  playerLane = 1;
  playerY = 120;
  score = 0;
  coins = [];
  barriers = [];
  gameOver = false;
  isJumping = false;
  jumpTime = 0;
  gameStarted = true;
  music.currentTime = 0;
  music.play();
  gameLoop();
}

document.addEventListener("keydown", (e) => {
  if (!gameStarted) {
    resetGame();
    return;
  }
  if (gameOver && e.key === "Enter") {
    location.reload();
  }
  if (e.key === "ArrowLeft" && playerLane > 0) playerLane--;
  else if (e.key === "ArrowRight" && playerLane < 2) playerLane++;
  else if (e.key === "ArrowUp" && !isJumping) {
    isJumping = true;
    jumpTime = 0;
  }
});

function spawnCoin() {
  const lane = Math.floor(Math.random() * 3);
  coins.push({ lane: lane, y: -16 });
}

function spawnBarrier() {
  const lane = Math.floor(Math.random() * 3);
  barriers.push({ lane: lane, y: -16 });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#66ccff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("SUBWAY RUNNER", 8, 70);
    if (Math.floor(Date.now() / 500) % 2 === 0)
      ctx.fillText("PRESS ANY KEY", 16, 90);
    return;
  }

  if (gameOver) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 60, 128, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("GAME OVER", 32, 80);
    ctx.fillText("Score: " + score, 32, 92);
    ctx.fillText("Press Enter", 24, 105);
    return;
  }

  // draw coins
  for (let coin of coins) {
    ctx.drawImage(coinImg, lanePositions[coin.lane], coin.y, 16, 16);
  }

  // draw barriers
  for (let bar of barriers) {
    ctx.drawImage(barrierImg, lanePositions[bar.lane], bar.y, 16, 16);
  }

  // draw player
  let yOffset = isJumping ? -10 * Math.sin((Math.PI * jumpTime) / 30) : 0;
  ctx.drawImage(playerImg, lanePositions[playerLane], playerY + yOffset, 16, 16);

  // draw score
  ctx.fillStyle = "#000";
  ctx.font = "bold 10px Arial";
  ctx.fillText("Score: " + score, 4, 12);

  if (achievementShown) {
    ctx.fillStyle = "#fff";
    ctx.fillText("Achievement:", 10, 30);
    ctx.fillText("10 Coins!", 20, 40);
  }
}

function update() {
  if (!gameStarted || gameOver) return;

  for (let coin of coins) coin.y += 2;
  for (let bar of barriers) bar.y += 2;

  coins = coins.filter(c => c.y < 160);
  barriers = barriers.filter(b => b.y < 160);

  for (let i = 0; i < coins.length; i++) {
    if (coins[i].lane === playerLane && coins[i].y >= playerY - 8 && coins[i].y <= playerY + 16) {
      score += 10;
      coinSound.play();
      coins.splice(i, 1);
      if (score >= 100 && !achievementShown) {
        achievementShown = true;
        achievementTimer = 120;
      }
      break;
    }
  }

  for (let i = 0; i < barriers.length; i++) {
    if (
      barriers[i].lane === playerLane &&
      barriers[i].y >= playerY - 8 &&
      barriers[i].y <= playerY + 16 &&
      !isJumping
    ) {
      gameOver = true;
      hitSound.play();
    }
  }

  if (isJumping) {
    jumpTime++;
    if (jumpTime >= 30) {
      isJumping = false;
    }
  }

  if (achievementShown) {
    achievementTimer--;
    if (achievementTimer <= 0) {
      achievementShown = false;
    }
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

setInterval(spawnCoin, 1000);
setInterval(spawnBarrier, 2000);
