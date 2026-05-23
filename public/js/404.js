const errorTitle = document.getElementById('error-title');
const gameContainer = document.getElementById('game-container');
const dino = document.getElementById('dino');
const plant = document.getElementById('plant');
const scoreElement = document.getElementById('score');

let isJumping = false;
let gameStarted = false;
let score = -10;

// Execute the jump animation and increment the user's score
function jump() {
    if (isJumping) return;

    isJumping = true;
    // Taller container allows a higher jump (120px instead of 80px)
    dino.style.bottom = "120px";
    
    score += 10;
    scoreElement.innerText = score;

    setTimeout(() => {
        dino.style.bottom = "0px";
        isJumping = false;
    }, 400);
}

// Check if the dino element overlaps with the plant element
function checkCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const plantRect = plant.getBoundingClientRect();

    // Collision logic: check if they overlap horizontally AND vertically
    if (
        dinoRect.left < plantRect.right - 10 &&
        dinoRect.right > plantRect.left + 10 &&
        dinoRect.bottom > plantRect.top + 20
    ) {
        gameOver();
    }
}

// Stop the game, reset elements, and alert the user
function gameOver() {
    gameStarted = false;
    plant.classList.remove('move');
    alert("Game Over! Final Score: " + score);
    score = 0;
    scoreElement.innerText = score;
    gameContainer.style.display = 'none';
}

// Initialize and start the hidden easter egg game when the error title is clicked
errorTitle.addEventListener('click', () => {
    if (gameStarted) return; 
    gameContainer.style.display = 'block';
    plant.classList.add('move');
    gameStarted = true; 
    jump();
});

// Trigger jump action when the up arrow or space bar is pressed during gameplay
document.addEventListener('keydown', (event) => {
    if ((event.key === "ArrowUp" || event.key === " ") && gameStarted) {
        jump();
    }
});

// Continuously check for collisions while the game is running
setInterval(() => {
    if (gameStarted) {
        checkCollision();
    }
}, 50);