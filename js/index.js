// --- Constantes globales ---
const board = document.getElementById("board");
const enemigoseliminados = document.getElementById("enemies-eliminated");
const municionTxt = document.getElementById("municion");
// --- Clase base para Player positionY Enemy ---
class Entity {
  constructor(positionX, positionY, w, h, className) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.width = w;
    this.height = h;

    this.createDomElement(className);
    this.updatePosition();
  }

  createDomElement(className) {
    this.elm = document.createElement("div");
    this.elm.className = className;
    document.getElementById("board").appendChild(this.elm);
  }

  updatePosition() {
    this.elm.style.left = this.positionX + "vw";
    this.elm.style.bottom = this.positionY + "vh";
    this.elm.style.width = this.width + "vw";
    this.elm.style.height = this.height + "vh";
  }

  move(dx, dy) {
    this.positionX += dx;
    this.positionY += dy;
    this.updatePosition();
  }

  // FUNCION GENERAL COLISIONES
  collidesWith(other) {
    return !(
      this.positionX + this.width < other.positionX ||
      this.positionX > other.positionX + other.width ||
      this.positionY + this.height < other.positionY ||
      this.positionY > other.positionY + other.height
    );
  }
}

// --- Player ---
class Player extends Entity {
  constructor() {
    super(0, 0, 3, 5, "Player");
    this.speed = 1.5;
  }

  update(keys) {
    let dx = 0,
      dy = 0;

    if (keys["ArrowLeft"] && this.positionX > 0) {
      dx -= this.speed;
    }
    if (keys["ArrowRight"] && this.positionX + this.width < 100) {
      dx += this.speed;
    }
    if (keys["ArrowUp"] && this.positionY + this.height < 100) {
      dy += this.speed;
    }
    if (keys["ArrowDown"] && this.positionY > 0) {
      dy -= this.speed;
    }
    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    this.move(dx, dy);
  }
}

// --- Enemy ---
class Enemy extends Entity {
  constructor() {
    let w = 2;
    let h = 2;

    const side = Math.floor(Math.random() * 4);
    let positionX, positionY, dx, dy;

    if (side === 0) {
      positionX = Math.random() * (100 - w);
      positionY = 100 - h;
      dx = 0;
      dy = -0.5;
    } else if (side === 1) {
      positionX = Math.random() * (100 - w);
      positionY = 0;
      dx = 0;
      dy = 0.5;
    } else if (side === 2) {
      positionX = 0;
      positionY = Math.random() * (100 - h);
      dx = 0.5;
      dy = 0;
    } else {
      positionX = 100 - w;
      positionY = Math.random() * (100 - h);
      dx = -0.5;
      dy = 0;
    }

    super(positionX, positionY, w, h, "Enemy");
    this.dx = dx;
    this.dy = dy;
  }

  update() {
    this.move(this.dx, this.dy);
  }
}

// --- Balas ---

class Bullet extends Entity {
  constructor(positionX, positionY, width, height, mouseX, mouseY) {
    super(positionX, positionY, width, height, "Bullet");

    // Calcular velocidad hacia el objetivo
    const speed = 1.5; // Velocidad de la bala (vh/intervalo)
    const angle = Math.atan2(mouseY - positionY, mouseX - positionX);

    this.dx = Math.cos(angle) * speed;
    this.dy = Math.sin(angle) * speed;
  }

  update() {
    this.move(this.dx, this.dy);
  }
}

// --- INICIO DEL JUEGO ---
const enemiesArr = [];
const bulletsArr = [];
const player = new Player();
const keys = {};
let mouse = { x: 0, y: 0 };
let municion = 10;
let puntos = 0;
// Spawn enemigos
let enemySpawnLoop = setInterval(() => {
  enemiesArr.push(new Enemy());
}, 500);

// Loop principal
let gameLoop = setInterval(() => {
  enemiesArr.forEach((enemy, index) => {
    enemy.update();

    //COLISION;
      if (enemy.collidesWith(player)) {
        clearInterval(gameLoop);
        clearInterval(enemySpawnLoop);
        clearInterval(bulletLoop);
        console.log("JUEGO TERMINADO");
          const gameOverMsg = document.createElement("div");
          gameOverMsg.innerText = "¡Colisión! Juego terminado";
          gameOverMsg.className = "game-over";
          board.appendChild(gameOverMsg);

        // setTimeout(() => {
        //   location.reload();
        // }, 5000); // espera 5 segundos antes de reiniciar
      }
    

    // Eliminar enemigos fuera del tablero
    if (
      enemy.positionX < 0 ||
      enemy.positionX + enemy.width > 100 ||
      enemy.positionY < 0 ||
      enemy.positionY + enemy.height > 100
    ) {
      enemy.elm.remove();
      enemiesArr.splice(index, 1);
    }
  });
  player.update(keys);
}, 50);

// Actualizar balas
let bulletLoop = setInterval(() => {
  bulletsArr.forEach((bullet, index) => {
    bullet.update();

    // Colisión con enemigos
    enemiesArr.forEach((enemy, eIndex) => {
      if (bullet.collidesWith(enemy)) {
        enemy.elm.remove(); //Elimina el elemento
        enemiesArr.splice(eIndex, 1); //Borra el elemento del array
        bullet.elm.remove(); //Elimina el elemento de la bala
        bulletsArr.splice(index, 1); //Elimina la bala del array de balas
        puntos++;
        enemigoseliminados.textContent = "Kills: " + puntos;
      }
    });

    // Eliminar balas fuera del tablero
    if (
      bullet.positionX < 0 ||
      bullet.positionX > 100 ||
      bullet.positionY < 0 ||
      bullet.positionY > 100
    ) {
      bullet.elm.remove();
      bulletsArr.splice(index, 1);
    }
  });
}, 50);
// --- Controles ---

//Contiene la informacion de mi raton sobre el board
board.addEventListener("mousemove", (e) => {
  const rect = board.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 100;
  mouse.y = 100 - ((e.clientY - rect.top) / rect.height) * 100; // invertido por bottom
});
//Posicion especifica de mi raton al hacer click en el board
//Y dispara la bala
board.addEventListener("click", () => {

  if (municion > 0) {
    const bullet = new Bullet(
      player.positionX + player.width / 2,
      player.positionY + player.height / 2,
      1,
      1,
      mouse.x,
      mouse.y,
      "Bullet"
    );

    municion--;
    municionTxt.textContent = "Munición: " + municion;

    bulletsArr.push(bullet);
  } else {
    console.log("NO QUEDA MUNICION");
  }
});
//Contiene la informacion para recargar
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    municion = 10;
    municionTxt.textContent = "Munición: " + municion;
  }
});

document.addEventListener("keydown", (event) => {
  keys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});
