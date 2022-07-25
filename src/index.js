const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// default projectile radius
const projectile_radius = 3;

const menu = document.querySelector('#menu');

const scoreEL = document.querySelector('#score');
const scoreMenu = document.querySelector('#score-menu');
const StartGameBtn = document.querySelector('#StartGameBtn');

const friction = 0.99;

// middle of the screen coordinates
const center_x = canvas.width / 2;
const center_y = canvas.height / 2;

let player = new Player(center_x, center_y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
  player = new Player(center_x, center_y, 10, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
}

function spawnEnemies() {
  setInterval(() => {
    let x;
    let y;

    const radius = 30 * Math.random() + 5;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360},50%,50%)`;
    const angle = Math.atan2(player.getY() - y, player.getX() - x);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const velocity = { x: cos, y: sin };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 2500);
}
let animationID;
let score = 0;
function animate() {
  scoreEL.innerHTML = score;

  animationID = requestAnimationFrame(animate);
  c.fillStyle = 'rgb(0,0,0,0.3)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  projectiles.forEach((projectile, projectile_index) => {
    projectile.update();
    // remove from edge of screen
    if (
      projectile.x + projectile.radius < 0
      || projectile.x - projectile.radius > canvas.width
      || projectile.y + projectile.radius < 0
      || projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectile_index, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, enemy_index) => {
    enemy.update();
    // enemy touch player end game
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 0) {
      cancelAnimationFrame(animationID);
      scoreMenu.innerHTML = score;
      menu.style.display = 'flex';
    }
    particles.forEach((particle, particle_index) => {
      if (particle.alpha <= 0) {
        setTimeout(() => {
          particles.splice(particle_index, 1);
        }, 0);
      } else {
        particle.update();
      }
    });
    projectiles.forEach((projectile, projectile_index) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // Create explosions
        for (let i = 0; i < Math.floor(Math.random() * 2 + 3); i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2 + 0.5,
              enemy.color,
              { x: Math.random() - 0.5, y: Math.random() - 0.5 },
            ),
          );
        }
        // Shrink enemies on hit
        if (enemy.radius - 10 > 5) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectile_index, 1);
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(enemy_index, 1);
            projectiles.splice(projectile_index, 1);
            // Increase Score
            score += 100;
          }, 0);
        }
      }
    });
  });
}

addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - center_y, event.clientX - center_x);
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const velocity = { x: cos * 4, y: sin * 4 };

  projectiles.push(
    new Projectile(
      center_x + projectile_radius * cos + player.radius * cos,
      center_y + player.radius * sin + projectile_radius * sin,
      undefined,
      'white',
      velocity,
    ),
  );
  projectiles.forEach((projectile) => {

  });
});

StartGameBtn.addEventListener('click', () => {
  init();
  animate();
  spawnEnemies();
  menu.style.display = 'none';
});
