// The answer is always "WOOF"
const WORD = 'WOOF';
const WORD_LENGTH = 4;
const MAX_GUESSES = 6;

let currentRow = 0;
let currentTile = 0;
let currentGuess = '';
let gameOver = false;

// Initialize the game board
function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${i}`;
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        
        board.appendChild(row);
    }
}

// Add letter to current guess
function addLetter(letter) {
    if (currentTile < WORD_LENGTH && !gameOver) {
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentGuess += letter;
        currentTile++;
    }
}

// Remove last letter from current guess
function removeLetter() {
    if (currentTile > 0 && !gameOver) {
        currentTile--;
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = '';
        tile.classList.remove('filled');
        currentGuess = currentGuess.slice(0, -1);
    }
}

// Show message to player
function showMessage(text, type = '') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = 'message ' + type;
    
    if (type !== 'success') {
        setTimeout(() => {
            message.textContent = '';
            message.className = 'message';
        }, 2000);
    }
}

// Shake the current row for invalid input
function shakeRow() {
    const row = document.getElementById(`row-${currentRow}`);
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 500);
}

// Check the current guess
function checkGuess() {
    if (currentTile !== WORD_LENGTH) {
        showMessage('Not enough letters', 'error');
        shakeRow();
        return;
    }
    
    const guess = currentGuess.toUpperCase();
    const wordArray = WORD.split('');
    const guessArray = guess.split('');
    const result = new Array(WORD_LENGTH).fill('absent');
    const letterCount = {};
    
    // Count letters in the word
    for (const letter of wordArray) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    
    // First pass: mark correct letters (green)
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArray[i] === wordArray[i]) {
            result[i] = 'correct';
            letterCount[guessArray[i]]--;
        }
    }
    
    // Second pass: mark present letters (yellow)
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] !== 'correct') {
            if (letterCount[guessArray[i]] > 0) {
                result[i] = 'present';
                letterCount[guessArray[i]]--;
            }
        }
    }
    
    // Reveal tiles with animation
    revealTiles(guessArray, result);
}

// Reveal tiles with flip animation
function revealTiles(guessArray, result) {
    const row = document.getElementById(`row-${currentRow}`);
    const tiles = row.querySelectorAll('.tile');
    
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('reveal', result[index]);
            updateKeyboard(guessArray[index], result[index]);
            
            // After last tile is revealed
            if (index === WORD_LENGTH - 1) {
                setTimeout(() => {
                    checkWinLose(guessArray, result);
                }, 250);
            }
        }, index * 300);
    });
}

// Update keyboard colors
function updateKeyboard(letter, status) {
    const key = document.querySelector(`button[data-key="${letter}"]`);
    if (!key) return;
    
    // Only upgrade status: absent -> present -> correct
    const currentStatus = key.classList.contains('correct') ? 'correct' :
                         key.classList.contains('present') ? 'present' :
                         key.classList.contains('absent') ? 'absent' : '';
    
    if (status === 'correct') {
        key.classList.remove('present', 'absent');
        key.classList.add('correct');
    } else if (status === 'present' && currentStatus !== 'correct') {
        key.classList.remove('absent');
        key.classList.add('present');
    } else if (status === 'absent' && !currentStatus) {
        key.classList.add('absent');
    }
}

// Check for win or loss
function checkWinLose(guessArray, result) {
    const isWin = result.every(r => r === 'correct');
    
    if (isWin) {
        gameOver = true;
        showMessage('Genius!', 'success');
        
        // Bounce animation for winning row
        const row = document.getElementById(`row-${currentRow}`);
        const tiles = row.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('win');
            }, index * 100);
        });
        
        document.getElementById('play-again').classList.remove('hidden');
    } else if (currentRow === MAX_GUESSES - 1) {
        gameOver = true;
        showMessage(WORD, 'error');
        document.getElementById('play-again').classList.remove('hidden');
    } else {
        // Move to next row
        currentRow++;
        currentTile = 0;
        currentGuess = '';
    }
}

// Handle keyboard input
function handleKeyPress(key) {
    if (gameOver) return;
    
    if (key === 'ENTER') {
        checkGuess();
    } else if (key === 'BACKSPACE') {
        removeLetter();
    } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
    }
}

// Reset the game
function resetGame() {
    currentRow = 0;
    currentTile = 0;
    currentGuess = '';
    gameOver = false;
    
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    document.getElementById('play-again').classList.add('hidden');
    
    // Reset keyboard
    document.querySelectorAll('.keyboard button').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
    
    initBoard();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initBoard();
    
    // Physical keyboard
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
            handleKeyPress(key);
        }
    });
    
    // On-screen keyboard
    document.getElementById('keyboard').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const key = e.target.dataset.key;
            handleKeyPress(key);
        }
    });
    
    // Play again button
    document.getElementById('play-again').addEventListener('click', resetGame);
});
