const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");

// Game settings
const GRAVITY = 0.5;
const JUMP = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2.5;
const PIPE_INTERVAL = 90; // frames between pipes

// Game state
let bird, pipes, score, bestScore, frame, state;
bestScore = Number(localStorage.getItem("flappyBest")) || 0;

function reset() {
  bird = { x: 80, y: canvas.height / 2, size: 24, velocity: 0 };
  pipes = [];
  score = 0;
  frame = 0;
  state = "ready"; // ready | playing | over
  message.style.display = "block";
  message.innerHTML = "Press <b>Space</b> / Click / Tap to start";
}

function flap() {
  if (state === "ready") {
    state = "playing";
    message.style.display = "none";
  }
  if (state === "playing") {
    bird.velocity = JUMP;
  } else if (state === "over") {
    reset();
  }
}

function addPipe() {
  const minTop = 60;
  const maxTop = canvas.height - PIPE_GAP - 100;
  const top = Math.random() * (maxTop - minTop) + minTop;
  pipes.push({ x: canvas.width, top: top, passed: false });
}

function gameOver() {
  state = "over";
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("flappyBest", bestScore);
  }
  message.style.display = "block";
  message.innerHTML = "Game Over! Press <b>Space</b> / Click to restart";
}

function update() {
  if (state !== "playing") return;

  frame++;

  // Bird physics
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Hit ground or ceiling
  if (bird.y + bird.size > canvas.height - 40 || bird.y < 0) {
    gameOver();
  }

  // Spawn pipes
  if (frame % PIPE_INTERVAL === 0) addPipe();

  // Move pipes and check collisions
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= PIPE_SPEED;

    const hitX = bird.x + bird.size > p.x && bird.x < p.x + PIPE_WIDTH;
    const hitY = bird.y < p.top || bird.y + bird.size > p.top + PIPE_GAP;
    if (hitX && hitY) gameOver();

    if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
      p.passed = true;
      score++;
    }

    if (p.x + PIPE_WIDTH < 0) pipes.splice(i, 1);
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
  ctx.rotate(Math.min(Math.max(bird.velocity * 0.05, -0.5), 1.0));

  // Body
  ctx.fillStyle = "#f7d51d";
  ctx.fillRect(-bird.size / 2, -bird.size / 2, bird.size, bird.size);
  // Eye
  ctx.fillStyle = "#fff";
  ctx.fillRect(2, -8, 8, 8);
  ctx.fillStyle = "#000";
  ctx.fillRect(6, -6, 4, 4);
  // Beak
  ctx.fillStyle = "#e67e22";
  ctx.fillRect(10, 2, 10, 6);

  ctx.restore();
}

function drawPipes() {
  ctx.fillStyle = "#2ecc71";
  ctx.strokeStyle = "#1e8449";
  ctx.lineWidth = 3;
  pipes.forEach((p) => {
    // Top pipe
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);
    // Bottom pipe
    const bottomY = p.top + PIPE_GAP;
    ctx.fillRect(p.x, bottomY, PIPE_WIDTH, canvas.height - bottomY - 40);
    ctx.strokeRect(p.x, bottomY, PIPE_WIDTH, canvas.height - bottomY - 40);
  });
}

function drawGround() {
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = "#8bc34a";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 8);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.strokeText(score, canvas.width / 2, 60);
  ctx.fillText(score, canvas.width / 2, 60);

  ctx.font = "16px Arial";
  ctx.lineWidth = 3;
  ctx.textAlign = "left";
  ctx.strokeText("Best: " + bestScore, 10, 25);
  ctx.fillText("Best: " + bestScore, 10, 25);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPipes();
  drawGround();
  drawBird();
  drawScore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flap();
  }
});
canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  flap();
}, { passive: false });

reset();
loop();