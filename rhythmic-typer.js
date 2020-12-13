/* global canvas ctx getTime animation:writable gameLoop label loop generateRandomInteger generateRandomCharCode paintParticles createParticles processParticles */
const baseScoreChange = 3;
let score = 0;
let lives = 10;
let caseSensitive = true;

const center = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  lineWidth: 3,
  color: '#AAAAAA'
};

const letter = {
  font: '25px Monospace',
  colors: ['#FF1E28', '#0095DD', '#3CCE00'],
  width: 15,
  height: 20,
  probability: 0.02,
  speedX: -1,
  lastTime: 0,
  threshold: 1000
};

const title = {
  y: canvas.height / 3,
  font: '30px Arial',
  texts: ['WRONG', ['ALRIGHT', 'ACCEPTABLE', 'KEEP GOING'], ['GOT IT', 'SYNCHRONIZED', 'GREAT TIMING'], ['THAT\'S IT', 'WELL DONE', 'THE MASTER']],
  text: null
};

const letters = [];

ctx.font = label.font;
letter.width = ctx.measureText('0').width;
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
window.addEventListener('resize', resizeHandler);

loop(function (frames) {
  ctx.lineWidth = center.lineWidth;
  ctx.strokeStyle = center.color;
  ctx.beginPath();
  ctx.arc(center.x, center.y, center.radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.font = letter.font;
  for (const l of letters) {
    ctx.fillStyle = letter.colors[l.status + 1];
    ctx.fillText(String.fromCharCode(l.code), l.x, l.y);
  }
  if (title.text) {
    ctx.font = title.font;
    ctx.fillStyle = label.color;
    ctx.fillText(title.text, canvas.width / 2 - ctx.measureText(title.text).width / 2, title.y);
  }
  paintParticles();
  ctx.font = label.font;
  ctx.fillStyle = label.color;
  ctx.fillText('Score: ' + score, label.left, label.margin);
  ctx.fillText('Lives: ' + lives, label.right, label.margin);
  processParticles(frames);
  createLetters();
  removeLetters(frames);
});

function createLetters () {
  if (Math.random() < letter.probability && getTime() - letter.lastTime > letter.threshold) {
    letter.lastTime = getTime();
    letters.push({
      x: canvas.width,
      y: center.y + letter.height / 2,
      status: 0,
      code: generateRandomCharCode(caseSensitive),
      speedX: letter.speedX
    });
  }
}

function removeLetters (frames) {
  for (let i = letters.length - 1; i >= 0; i--) {
    const l = letters[i];
    l.x += l.speedX * frames;
    if (l.status === 0) {
      if (l.x + letter.width < center.x - center.radius) {
        l.status = -1;
        if (--lives === 0) {
          window.alert('GAME OVER!');
          window.location.reload(false);
        }
      }
    } else {
      if (l.x < 0) {
        letters.splice(i, 1);
      }
    }
  }
}

function type (l) {
  l.status = 1;
  const currentScore = baseScoreChange - Math.floor(Math.abs(center.x - (l.x + letter.width / 2)) / (center.radius - letter.width / 2) * baseScoreChange);
  score += currentScore;
  title.text = title.texts[currentScore][generateRandomInteger(title.texts[currentScore].length)];
  createParticles(l.x, l.y);
}

window.changeCase = function () {
  caseSensitive = !caseSensitive;
  if (caseSensitive) {
    document.getElementById('change-case-text').innerHTML = '';
  } else {
    document.getElementById('change-case-text').innerHTML = 'in';
  }
};

function keyDownHandler (e) {
  if (animation !== undefined && e.keyCode >= 65 && e.keyCode <= 90) {
    for (const l of letters) {
      if (l.status === 0) {
        if (l.x >= center.x - center.radius && l.x + letter.width <= center.x + center.radius) {
          if (caseSensitive) {
            if (e.shiftKey) {
              if (e.keyCode === l.code) {
                type(l);
                return;
              }
            } else {
              if (e.keyCode + 32 === l.code) {
                type(l);
                return;
              }
            }
          } else {
            if (e.keyCode === l.code || e.keyCode + 32 === l.code) {
              type(l);
              return;
            }
          }
        }
      }
    }
    score -= baseScoreChange;
    title.text = title.texts[0];
  }
}

function keyUpHandler (e) {
  if (e.keyCode === 27) {
    if (animation === undefined) {
      animation = window.requestAnimationFrame(gameLoop);
    } else {
      window.cancelAnimationFrame(animation);
      animation = undefined;
    }
  }
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  center.x = canvas.width / 2;
  center.y = canvas.height / 2;
  title.y = canvas.height / 3;
}
