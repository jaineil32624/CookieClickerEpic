const upgrades = [
  { name: 'Cursor', cost: 15, cookiesPerClick: 1, auto: 0, tooltip: 'A tiny helper that boosts clicks.' },
  { name: 'Grandma', cost: 100, cookiesPerClick: 2, auto: 0.1, tooltip: 'Grandma bakes while you click.' },
  { name: 'Farm', cost: 500, cookiesPerClick: 5, auto: 0.5, tooltip: 'A farm that produces cookies steadily.' },
  { name: 'Mine', cost: 1200, cookiesPerClick: 10, auto: 1, tooltip: 'A cookie mine with rich yields.' },
  { name: 'Factory', cost: 3000, cookiesPerClick: 20, auto: 2, tooltip: 'A factory that crushes cookie production.' },
  { name: 'Bank', cost: 7000, cookiesPerClick: 50, auto: 4, tooltip: 'Bank profits turn into cookies.' },
  { name: 'Temple', cost: 15000, cookiesPerClick: 100, auto: 8, tooltip: 'Mystical production from the temple.' },
  { name: 'Wizard', cost: 30000, cookiesPerClick: 200, auto: 15, tooltip: 'A wizard conjuring sweet cookies.' },
  { name: 'Ship', cost: 60000, cookiesPerClick: 500, auto: 30, tooltip: 'A ship delivering cookies worldwide.' },
  { name: 'Portal', cost: 100000, cookiesPerClick: 1000, auto: 60, tooltip: 'A portal to infinite cookies.' },
  { name: 'Gold Oven', cost: 220000, cookiesPerClick: 2200, auto: 120, tooltip: 'A flashy oven with golden power.' },
  { name: 'Silver Mixer', cost: 460000, cookiesPerClick: 4600, auto: 260, tooltip: 'A mixer made of silver and dreams.' },
  { name: 'Diamond Oven', cost: 950000, cookiesPerClick: 9500, auto: 560, tooltip: 'Shimmering diamond cookie production.' },
  { name: 'Rainbow Press', cost: 2000000, cookiesPerClick: 20000, auto: 1200, tooltip: 'Rainbow press makes cookies magical.' },
  { name: 'Party Cake', cost: 5000000, cookiesPerClick: 50000, auto: 3000, tooltip: 'A cake that powers the whole party.' },
  { name: 'Star Bakery', cost: 12000000, cookiesPerClick: 120000, auto: 7200, tooltip: 'A star-powered bakery for the masses.' },
  { name: 'Orbital Oven', cost: 28000000, cookiesPerClick: 280000, auto: 18000, tooltip: 'Bake cookies in orbit around the moon.' },
  { name: 'Quantum Mixer', cost: 64000000, cookiesPerClick: 640000, auto: 42000, tooltip: 'Quantum mechanics multiplies cookies.' },
  { name: 'Birthday Blast', cost: 150000000, cookiesPerClick: 1500000, auto: 100000, tooltip: 'An explosive party upgrade of delight.' },
  { name: 'Legendary Feast', cost: 400000000, cookiesPerClick: 4000000, auto: 260000, tooltip: 'The ultimate legendary cookie feast.' }
];

let cookies = 0;
let perClick = 1;
let autoPerSecond = 0;
let musicStarted = false;

const cookieBtn = document.getElementById('cookieBtn');
const musicBtn = document.getElementById('musicBtn');
const cookiesEl = document.getElementById('cookies');
const perClickEl = document.getElementById('per-click');
const autoEl = document.getElementById('auto');
const upgradesEl = document.getElementById('upgrades');
const bgMusic = document.getElementById('bgMusic');
const clickSound = document.getElementById('clickSound');
const cookieRain = document.getElementById('cookieRain');
const gameContainer = document.querySelector('.game');

function formatNumber(value) {
  return Math.floor(value).toLocaleString();
}

function playClickSound() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
}

function startMusic() {
  if (!musicStarted && bgMusic) {
    musicStarted = true;
    bgMusic.currentTime = 0;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => {});
    if (musicBtn) {
      musicBtn.textContent = '♫ Music On';
    }
  }
}

function createRainParticle(scale = 1, delay = 0) {
  const particle = document.createElement('div');
  particle.className = 'cookie-particle';
  const gameRect = gameContainer?.getBoundingClientRect() ?? document.body.getBoundingClientRect();
  const startX = Math.random() * gameRect.width;
  const duration = 3500 + Math.random() * 1400;
  const amplitude = 30 + Math.random() * 50;
  particle.style.left = `${startX}px`;
  particle.style.width = `${26 * scale}px`;
  particle.style.height = `${26 * scale}px`;
  particle.style.opacity = `${0.6 + Math.random() * 0.4}`;
  particle.style.transform = `translateY(-30px) rotate(${Math.random() * 360}deg)`;
  cookieRain.appendChild(particle);

  const startTime = performance.now() + delay;

  function animate(now) {
    const elapsed = now - startTime;
    if (elapsed < 0) {
      requestAnimationFrame(animate);
      return;
    }
    const progress = elapsed / duration;
    if (progress >= 1) {
      particle.remove();
      return;
    }
    const x = startX + Math.sin(progress * Math.PI * 2) * amplitude;
    const y = progress * (gameRect.height + 80);
    const rotation = progress * 720;
    const scaleFactor = 1 - progress * 0.25;
    particle.style.transform = `translate(${x - startX}px, ${y}px) rotate(${rotation}deg) scale(${scaleFactor})`;
    particle.style.opacity = `${0.7 * (1 - progress)}`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function triggerRain(count = 12) {
  for (let i = 0; i < count; i++) {
    const scale = 0.6 + Math.random() * 0.7;
    createRainParticle(scale, i * 60);
  }
}

function createUpgradeButton(upgrade) {
  const button = document.createElement('button');
  button.className = 'upgrade';
  button.innerHTML = `
    <div>
      <strong>${upgrade.name}</strong>
      <span>${upgrade.tooltip}</span>
    </div>
    <div class="cost">${formatNumber(upgrade.cost)}</div>
  `;
  button.disabled = cookies < upgrade.cost;

  button.addEventListener('click', () => {
    startMusic();
    playClickSound();
    if (cookies >= upgrade.cost) {
      cookies -= upgrade.cost;
      perClick += upgrade.cookiesPerClick;
      autoPerSecond += upgrade.auto;
      render();
      triggerRain(5);
    }
  });

  button.addEventListener('mouseover', () => {
    button.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(192,192,192,0.18))';
  });
  button.addEventListener('mouseout', () => {
    button.style.background = '';
  });

  return button;
}

function render() {
  cookiesEl.textContent = formatNumber(cookies);
  perClickEl.textContent = formatNumber(perClick);
  autoEl.textContent = autoPerSecond.toFixed(1);

  upgradesEl.innerHTML = '';
  upgrades.forEach((upgrade) => {
    upgradesEl.appendChild(createUpgradeButton(upgrade));
  });
}

cookieBtn.addEventListener('click', (event) => {
  startMusic();
  playClickSound();
  cookies += perClick;
  cookieBtn.classList.remove('pulse');
  void cookieBtn.offsetWidth;
  cookieBtn.classList.add('pulse');
  triggerRain(4);
  render();
});

if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    startMusic();
  });
}

setInterval(() => {
  cookies += autoPerSecond;
  render();
}, 1000);

setInterval(() => {
  triggerRain(2);
}, 7000);

render();
