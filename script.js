const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const size = 20; // Tamanho de cada bloco
let score = 0;
let gameOver = false;

// 1 = Parede, 0 = Pastilha, 2 = Vazio
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Pac-Man: Inicializado exatamente no centro de um bloco válido
const pacman = {
    x: 9 * size + size / 2,
    y: 16 * size + size / 2,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    radius: 8,
    speed: 2
};

const ghost = {
    x: 9 * size + size / 2,
    y: 8 * size + size / 2,
    dirX: 1,
    dirY: 0,
    radius: 8,
    speed: 1.5,
    color: '#ff0000'
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')    { pacman.nextDirX = 0;  pacman.nextDirY = -1; }
    if (e.key === 'ArrowDown')  { pacman.nextDirX = 0;  pacman.nextDirY = 1;  }
    if (e.key === 'ArrowLeft')  { pacman.nextDirX = -1; pacman.nextDirY = 0;  }
    if (e.key === 'ArrowRight') { pacman.nextDirX = 1;  pacman.nextDirY = 0;  }
});

// Nova função de colisão baseada na célula do grid para evitar travamentos por aproximação
function isTileWall(mapX, mapY) {
    if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[0].length) {
        return true;
    }
    return map[mapY][mapX] === 1;
}

function update() {
    if (gameOver) return;

    // --- MOVIMENTAÇÃO DO PAC-MAN ---
    // Verifica se ele está próximo o suficiente do centro de um bloco para mudar de direção
    const currentTileX = Math.floor(pacman.x / size);
    const currentTileY = Math.floor(pacman.y / size);
    const centerX = currentTileX * size + size / 2;
    const centerY = currentTileY * size + size / 2;

    // Se estiver perto do centro do bloco atual, checa se pode virar para a direção desejada
    if (Math.abs(pacman.x - centerX) < pacman.speed && Math.abs(pacman.y - centerY) < pacman.speed) {
        if (!isTileWall(currentTileX + pacman.nextDirX, currentTileY + pacman.nextDirY)) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
            // Alinha perfeitamente no centro para não agarrar nas quinas
            pacman.x = centerX;
            pacman.y = centerY;
        }
    }

    // Calcula a próxima posição baseada na direção atual
    const nextX = pacman.x + pacman.dirX * pacman.speed;
    const nextY = pacman.y + pacman.dirY * pacman.speed;

    // Descobre qual bloco ele vai ocupar com base no raio/borda do personagem
    const checkTileX = Math.floor((nextX + pacman.dirX * pacman.radius) / size);
    const checkTileY = Math.floor((nextY + pacman.dirY * pacman.radius) / size);

    // Só move se o bloco da frente NÃO for uma parede
    if (!isTileWall(checkTileX, checkTileY)) {
        pacman.x = nextX;
        pacman.y = nextY;
    } else {
        // Se bater, para imediatamente e se alinha ao centro do bloco para poder virar depois
        pacman.x = centerX;
        pacman.y = centerY;
    }

    // Comer pastilhas
    const activeTileX = Math.floor(pacman.x / size);
    const activeTileY = Math.floor(pacman.y / size);
    if (map[activeTileY] && map[activeTileY][activeTileX] === 0) {
        map[activeTileY][activeTileX] = 2;
        score += 10;
        scoreEl.innerText = score;
    }

    // --- MOVIMENTAÇÃO DO FANTASMA ---
    const gCenterX = Math.floor(ghost.x / size) * size + size / 2;
    const gCenterY = Math.floor(ghost.y / size) * size + size / 2;

    if (Math.abs(ghost.x - gCenterX) < ghost.speed && Math.abs(ghost.y - gCenterY) < ghost.speed) {
        ghost.x = gCenterX;
        ghost.y = gCenterY;

        const currentGhostTileX = Math.floor(ghost.x / size);
        const currentGhostTileY = Math.floor(ghost.y / size);
        
        const dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
        const possibleDirs = dirs.filter(d => !isTileWall(currentGhostTileX + d.x, currentGhostTileY + d.y));

        let bestDir = null;
        let minDist = Infinity;

        possibleDirs.forEach(d => {
            const targetX = (currentGhostTileX + d.x) * size + size / 2;
            const targetY = (currentGhostTileY + d.y) * size + size / 2;
            const dist = Math.hypot(pacman.x - targetX, pacman.y - targetY);
            if (dist < minDist) {
                minDist = dist;
                bestDir = d;
            }
        });

        if (bestDir) {
            ghost.dirX = bestDir.x;
            ghost.dirY = bestDir.y;
        }
    }

    ghost.x += ghost.dirX * ghost.speed;
    ghost.y += ghost.dirY * ghost.speed;

    // Colisão com o Fantasma (Game Over)
    if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < pacman.radius + ghost.radius) {
        gameOver = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o Labirinto
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 1) {
                ctx.fillStyle = '#1919a6';
                ctx.fillRect(c * size, r * size, size, size);
            } else if (map[r][c] === 0) {
                ctx.fillStyle = '#ffb8ae';
                ctx.beginPath();
                ctx.arc(c * size + size / 2, r * size + size / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Desenha o Pac-Man mudando o ângulo da boca baseado na direção
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    let angleStart = 0.2;
    let angleEnd = 1.8;
    
    if (pacman.dirX === -1) { angleStart = 1.2; angleEnd = 0.8; }
    if (pacman.dirY === -1) { angleStart = 1.7; angleEnd = 1.3; }
    if (pacman.dirY === 1)  { angleStart = 0.7; angleEnd = 0.3; }

    ctx.arc(pacman.x, pacman.y, pacman.radius, angleStart * Math.PI, angleEnd * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();

    // Desenha o Fantasma
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, ghost.radius, Math.PI, 0, false);
    ctx.lineTo(ghost.x + ghost.radius, ghost.y + ghost.radius);
    ctx.lineTo(ghost.x - ghost.radius, ghost.y + ghost.radius);
    ctx.closePath();
    ctx.fill();

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = '24px "Courier New"';
        ctx.fillText('GAME OVER', canvas.width / 2 - 65, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
