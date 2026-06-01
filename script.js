const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const size = 20; // Tamanho de cada bloco do mapa
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

// Configurações do Pac-Man
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

// Configurações do Fantasma (Blinky - Vermelho)
const ghost = {
    x: 9 * size + size / 2,
    y: 8 * size + size / 2,
    dirX: 1,
    dirY: 0,
    radius: 8,
    speed: 1.5,
    color: '#ff0000'
};

// Captura comandos do teclado
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')    { pacman.nextDirX = 0;  pacman.nextDirY = -1; }
    if (e.key === 'ArrowDown')  { pacman.nextDirX = 0;  pacman.nextDirY = 1;  }
    if (e.key === 'ArrowLeft')  { pacman.nextDirX = -1; pacman.nextDirY = 0;  }
    if (e.key === 'ArrowRight') { pacman.nextDirX = 1;  pacman.nextDirY = 0;  }
});

// Verifica se a próxima posição colide com uma parede
function isColliding(x, y, radius) {
    const buffer = 2; // Evita travamentos nas quinas das paredes
    const checkPoints = [
        { x: x - radius + buffer, y: y - radius + buffer },
        { x: x + radius - buffer, y: y - radius + buffer },
        { x: x - radius + buffer, y: y + radius - buffer },
        { x: x + radius - buffer, y: y + radius - buffer }
    ];

    for (let p of checkPoints) {
        const mapX = Math.floor(p.x / size);
        const mapY = Math.floor(p.y / size);
        if (map[mapY] && map[mapY][mapX] === 1) {
            return true;
        }
    }
    return false;
}

// Inteligência artificial básica do fantasma (Persegue o Pac-man)
function moveGhost() {
    // Só muda de direção quando estiver alinhado à grade do mapa
    if (Math.floor(ghost.x) % size === size / 2 && Math.floor(ghost.y) % size === size / 2) {
        const possibleDirs = [];
        const dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];

        // Vê quais direções não têm parede
        dirs.forEach(d => {
            if (!isColliding(ghost.x + d.x * size, ghost.y + d.y * size, ghost.radius)) {
                possibleDirs.push(d);
            }
        });

        // Escolhe a direção que deixa o fantasma mais perto do Pac-Man
        let bestDir = possibleDirs[0];
        let minDist = Infinity;

        possibleDirs.forEach(d => {
            const nextX = ghost.x + d.x * size;
            const nextY = ghost.y + d.y * size;
            const dist = Math.hypot(pacman.x - nextX, pacman.y - nextY);
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
}

function update() {
    if (gameOver) return;

    // Tenta aplicar a direção desejada pelo jogador
    if (Math.floor(pacman.x) % size === size / 2 && Math.floor(pacman.y) % size === size / 2) {
        if (!isColliding(pacman.x + pacman.nextDirX * size, pacman.y + pacman.nextDirY * size, pacman.radius)) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }
    }

    // Move o Pacman se não houver colisão à frente
    if (!isColliding(pacman.x + pacman.dirX * pacman.speed, pacman.y + pacman.dirY * pacman.speed, pacman.radius)) {
        pacman.x += pacman.dirX * pacman.speed;
        pacman.y += pacman.dirY * pacman.speed;
    }

    // Comer a pastilha
    const currentMapX = Math.floor(pacman.x / size);
    const currentMapY = Math.floor(pacman.y / size);
    if (map[currentMapY] && map[currentMapY][currentMapX] === 0) {
        map[currentMapY][currentMapX] = 2; // Transforma em vazio
        score += 10;
        scoreEl.innerText = score;
    }

    moveGhost();

    // Detecção de Game Over (Colisão Pac-Man vs Fantasma)
    const distToGhost = Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y);
    if (distToGhost < pacman.radius + ghost.radius) {
        gameOver = true;
    }
}

function draw() {
    // Limpa a tela
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

    // Desenha o Pac-Man
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, 0.2 * Math.PI, 1.8 * Math.PI); // Boca aberta de lado
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();

    // Desenha o Fantasma
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, ghost.radius, Math.PI, 0, false); // Cabeça redonda
    ctx.lineTo(ghost.x + ghost.radius, ghost.y + ghost.radius); // Corpo
    ctx.lineTo(ghost.x - ghost.radius, ghost.y + ghost.radius);
    ctx.closePath();
    ctx.fill();

    // Tela de Fim de Jogo
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = '24px "Courier New"';
        ctx.fillText('GAME OVER', canvas.width / 2 - 65, canvas.height / 2);
    }
}

// Loop principal do jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
