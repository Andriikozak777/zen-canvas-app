const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');
const controlsPanel = document.getElementById('controlsPanel');
const menuToggleButton = document.getElementById('menuToggleButton'); 
const themeToggleButton = document.getElementById('themeToggleButton');
const menuBackdrop = document.getElementById('menuBackdrop'); 

// Элементы управления
const languageSelect = document.getElementById('languageSelect'); 
const volumeSlider = document.getElementById('volumeSlider');
const particleMinSizeSlider = document.getElementById('particleMinSizeSlider');
const particleMaxSizeSlider = document.getElementById('particleMaxSizeSlider');
const particleLifeSlider = document.getElementById('particleLifeSlider');
const particleSpeedSlider = document.getElementById('particleSpeedSlider');
const particleCountSlider = document.getElementById('particleCountSlider');
const particleSpawnRateSlider = document.getElementById('particleSpawnRateSlider');
const melodyTempoSlider = document.getElementById('melodyTempoSlider'); 
const colorPaletteSelect = document.getElementById('colorPaletteSelect');
const particleShapeSelect = document.getElementById('particleShapeSelect');
const particleMovementSelect = document.getElementById('particleMovementSelect');
const instrumentSelect = document.getElementById('instrumentSelect');
const clearCanvasButton = document.getElementById('clearCanvasButton');
const screenshotButton = document.getElementById('screenshotButton');
const resetSettingsButton = document.getElementById('resetSettingsButton');

// Новые элементы для режима игры
const gameModeSelect = document.getElementById('gameModeSelect');
const gameInstructions = document.getElementById('gameInstructions');

// --- Настройки по умолчанию (для кнопки сброса) ---
const defaultSettings = {
    volume: -10,
    particleMinSize: 2, 
    particleMaxSize: 8, 
    particleLife: 150,
    particleSpeed: 3,
    particleCount: 400,
    particleSpawnRate: 2,
    melodyTempo: 120,
    colorPalette: 'dynamic',
    particleShape: 'circle',
    particleMovement: 'random',
    instrument: 'simple-poly',
    theme: 'dark',
    gameMode: 'free-play', 
    language: 'ru' 
};

// Цветовые палитры (HSL значения)
const colorPalettes = {
    dynamic: [], 
    warm: [
        { h: 0, s: 70, l: 50 }, { h: 30, s: 70, l: 50 }, { h: 60, s: 70, l: 50 }
    ],
    cool: [
        { h: 180, s: 70, l: 50 }, { h: 210, s: 70, l: 50 }, { h: 240, s: 70, l: 50 }
    ],
    pastel: [
        { h: 300, s: 40, l: 70 }, { h: 120, s: 40, l: 70 }, { h: 240, s: 40, l: 70 }
    ],
    vibrant: [
        { h: 0, s: 90, l: 60 }, { h: 120, s: 90, l: 60 }, { h: 240, s: 90, l: 60 }, { h: 60, s: 90, l: 60 }
    ]
};

// --- Переменные состояния ---
let particles = [];
let maxParticles = parseInt(particleCountSlider.value);
let particleBaseSpeed = parseFloat(particleSpeedSlider.value);
let particleMinSize = parseFloat(particleMinSizeSlider.value);
let particleMaxSize = parseFloat(particleMaxSizeSlider.value);
let particleLife = parseInt(particleLifeSlider.value);
let particleSpawnRate = defaultSettings.particleSpawnRate;
let currentParticleShape = defaultSettings.particleShape;
let currentColorPalette = defaultSettings.colorPalette;
let currentParticleMovement = defaultSettings.particleMovement;
let currentInstrument = defaultSettings.instrument;
let hue = 0;
let particlePulseFactor = 0;
let audioAnalyzer;

// Глобальные переменные для эффектов
let reverb;
let delay;

// Текущая тема и режим игры
let currentTheme = defaultSettings.theme;
let gameMode = defaultSettings.gameMode; 

// Новые переменные для Melody Maze
let currentMazePath = []; 
const mazeLineTolerance = 50; 
const mazeNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]; 
let mazeSynth; 
let mazeSequence; 
let isMazePlayingAudio = false; 
let synth; 
let loop; 
let interactionSynth; 
let isPlaying = false; 

// --- Объект для переводов ---
const translations = {
    ru: {
        overlayTitle: 'Дзен-Холст',
        overlayText: 'Нажмите "Старт", чтобы начать медитативную мелодию и творить визуальное искусство.',
        startButton: 'Старт',
        languageLabel: 'Язык:',
        gameModeLabel: 'Режим игры:',
        freePlayOption: 'Свободная игра',
        echoSphereOption: 'Эхо-сфера',
        melodyMazeOption: 'Мелодичный лабиринт',
        volumeLabel: 'Громкость:',
        particleMinSizeLabel: 'Мин. размер частиц:',
        particleMaxSizeLabel: 'Макс. размер частиц:',
        particleLifeLabel: 'Время жизни частиц:',
        particleSpeedLabel: 'Скорость частиц:',
        particleCountLabel: 'Кол-во частиц:',
        particleSpawnRateLabel: 'Частота частиц:',
        melodyTempoLabel: 'Темп мелодии:',
        colorPaletteLabel: 'Палитра:',
        dynamicPaletteOption: 'Динамическая (Радуга)',
        warmPaletteOption: 'Теплая (Красные/Оранжевые)',
        coolPaletteOption: 'Холодная (Синие/Зеленые)',
        pastelPaletteOption: 'Пастельная',
        vibrantPaletteOption: 'Яркая',
        particleShapeLabel: 'Форма частиц:',
        circleShapeOption: 'Круг',
        squareShapeOption: 'Квадрат',
        triangleShapeOption: 'Треугольник',
        particleMovementLabel: 'Движение частиц:',
        randomMovementOption: 'Случайное',
        spiralMovementOption: 'Спираль',
        waveMovementOption: 'Волна',
        instrumentLabel: 'Инструмент:',
        simplePolyInstrumentOption: 'Пианино (по умолчанию)',
        fmsynthInstrumentOption: 'FM-синтезатор',
        amsynthInstrumentOption: 'AM-синтезатор',
        pluckInstrumentOption: 'Плюк-синтезатор',
        clearCanvasButton: 'Очистить холст',
        screenshotButton: 'Сделать скриншот',
        resetSettingsButton: 'Сбросить настройки',
        menuButtonOpen: '☰ Меню',
        menuButtonClose: '✖ Закрыть',
        themeButtonLight: 'Светлая тема',
        themeButtonDark: 'Темная тема',
        freePlayInstructions: '<strong>Свободная игра:</strong> Двигайте мышью/пальцем, чтобы создавать частицы. Фоновая мелодия будет играть.',
        echoSphereInstructions: '<strong>Эхо-сфера:</strong> Нажмите и удерживайте мышь/палец, чтобы создать звуковую сферу. Отпустите, чтобы остановить.',
        melodyMazeInstructions: '<strong>Мелодичный лабиринт:</strong> Проведите мышью/пальцем вдоль синей линии, чтобы услышать мелодию. Новый лабиринт при каждом запуске!',
        selectGameModeInstructions: 'Выберите режим игры.',
        audioStartError: 'Не удалось запустить. Пожалуйста, попробуйте снова или проверьте настройки браузера.'
    },
    uk: {
        overlayTitle: 'Дзен-Полотно',
        overlayText: 'Натисніть "Старт", щоб розпочати медитативну мелодію та творити візуальне мистецтво.',
        startButton: 'Старт',
        languageLabel: 'Мова:',
        gameModeLabel: 'Режим гри:',
        freePlayOption: 'Вільна гра',
        echoSphereOption: 'Ехо-сфера',
        melodyMazeOption: 'Мелодійний лабіринт',
        volumeLabel: 'Гучність:',
        particleMinSizeLabel: 'Мін. розмір частинок:',
        particleMaxSizeLabel: 'Макс. розмір частинок:',
        particleLifeLabel: 'Час життя частинок:',
        particleSpeedLabel: 'Швидкість частинок:',
        particleCountLabel: 'Кількість частинок:',
        particleSpawnRateLabel: 'Частота частинок:',
        melodyTempoLabel: 'Темп мелодії:',
        colorPaletteLabel: 'Палітра:',
        dynamicPaletteOption: 'Динамічна (Веселка)',
        warmPaletteOption: 'Тепла (Червоні/Помаранчеві)',
        coolPaletteOption: 'Холодна (Сині/Зелені)',
        pastelPaletteOption: 'Пастельна',
        vibrantPaletteOption: 'Яскрава',
        particleShapeLabel: 'Форма частинок:',
        circleShapeOption: 'Коло',
        squareShapeOption: 'Квадрат',
        triangleShapeOption: 'Трикутник',
        particleMovementLabel: 'Рух частинок:',
        randomMovementOption: 'Випадковий',
        spiralMovementOption: 'Спіраль',
        waveMovementOption: 'Хвиля',
        instrumentLabel: 'Інструмент:',
        simplePolyInstrumentOption: 'Піаніно (за замовчуванням)',
        fmsynthInstrumentOption: 'FM-синтезатор',
        amsynthInstrumentOption: 'AM-синтезатор',
        pluckInstrumentOption: 'Плюк-синтезатор',
        clearCanvasButton: 'Очистити полотно',
        screenshotButton: 'Зробити знімок екрана',
        resetSettingsButton: 'Скинути налаштування',
        menuButtonOpen: '☰ Меню',
        menuButtonClose: '✖ Закрити',
        themeButtonLight: 'Світла тема',
        themeButtonDark: 'Темна тема',
        freePlayInstructions: '<strong>Вільна гра:</strong> Рухайте мишею/пальцем, щоб створювати частинки. Фонова мелодія гратиме.',
        echoSphereInstructions: '<strong>Ехо-сфера:</strong> Натисніть і утримуйте мишу/палець, щоб створити звукову сферу. Відпустіть, щоб зупинити.',
        melodyMazeInstructions: '<strong>Мелодійний лабіринт:</strong> Проведіть мишею/пальцем уздовж синьої лінії, щоб почути мелодію. Новий лабіринт при кожному запуску!',
        selectGameModeInstructions: 'Виберіть режим гри.',
        audioStartError: 'Не вдалося запустити. Будь ласка, спробуйте знову або перевірте налаштування браузера.'
    },
    en: {
        overlayTitle: 'Zen Canvas',
        overlayText: 'Click "Start" to begin a meditative melody and create visual art.',
        startButton: 'Start',
        languageLabel: 'Language:',
        gameModeLabel: 'Game Mode:',
        freePlayOption: 'Free Play',
        echoSphereOption: 'Echo Sphere',
        melodyMazeOption: 'Melody Maze',
        volumeLabel: 'Volume:',
        particleMinSizeLabel: 'Min Particle Size:',
        particleMaxSizeLabel: 'Max Particle Size:',
        particleLifeLabel: 'Particle Life:',
        particleSpeedLabel: 'Particle Speed:',
        particleCountLabel: 'Particle Count:',
        particleSpawnRateLabel: 'Particle Spawn Rate:',
        melodyTempoLabel: 'Melody Tempo:',
        colorPaletteLabel: 'Palette:',
        dynamicPaletteOption: 'Dynamic (Rainbow)',
        warmPaletteOption: 'Warm (Reds/Oranges)',
        coolPaletteOption: 'Cool (Blues/Greens)',
        pastelPaletteOption: 'Pastel',
        vibrantPaletteOption: 'Vibrant',
        particleShapeLabel: 'Particle Shape:',
        circleShapeOption: 'Circle',
        squareShapeOption: 'Square',
        triangleShapeOption: 'Triangle',
        particleMovementLabel: 'Particle Movement:',
        randomMovementOption: 'Random',
        spiralMovementOption: 'Spiral',
        waveMovementOption: 'Wave',
        instrumentLabel: 'Instrument:',
        simplePolyInstrumentOption: 'Piano (default)',
        fmsynthInstrumentOption: 'FM Synth',
        amsynthInstrumentOption: 'AM Synth',
        pluckInstrumentOption: 'Pluck Synth',
        clearCanvasButton: 'Clear Canvas',
        screenshotButton: 'Take Screenshot',
        resetSettingsButton: 'Reset Settings',
        menuButtonOpen: '☰ Menu',
        menuButtonClose: '✖ Close',
        themeButtonLight: 'Light Theme',
        themeButtonDark: 'Dark Theme',
        freePlayInstructions: '<strong>Free Play:</strong> Move your mouse/finger to create particles. A background melody will play.',
        echoSphereInstructions: '<strong>Echo Sphere:</strong> Press and hold your mouse/finger to create a sound sphere. Release to stop.',
        melodyMazeInstructions: '<strong>Melody Maze:</strong> Drag your mouse/finger along the blue line to hear a melody. A new maze each time!',
        selectGameModeInstructions: 'Select a game mode.',
        audioStartError: 'Failed to start. Please try again or check your browser settings.'
    }
};

let currentLanguage = defaultSettings.language; 

// Функция для установки языка
function setLanguage(langCode) {
    currentLanguage = langCode;
    document.documentElement.lang = langCode; 

    const currentTranslation = translations[langCode];

    // Обновляем текст в оверлее
    document.getElementById('overlayTitle').textContent = currentTranslation.overlayTitle;
    document.getElementById('overlayText').textContent = currentTranslation.overlayText;
    document.getElementById('startButton').textContent = currentTranslation.startButton;

    // Обновляем текст в панели управления
    document.getElementById('languageLabel').textContent = currentTranslation.languageLabel;
    document.getElementById('gameModeLabel').textContent = currentTranslation.gameModeLabel;
    document.getElementById('freePlayOption').textContent = currentTranslation.freePlayOption;
    document.getElementById('echoSphereOption').textContent = currentTranslation.echoSphereOption;
    document.getElementById('melodyMazeOption').textContent = currentTranslation.melodyMazeOption;
    document.getElementById('volumeLabel').textContent = currentTranslation.volumeLabel;
    document.getElementById('particleMinSizeLabel').textContent = currentTranslation.particleMinSizeLabel;
    document.getElementById('particleMaxSizeLabel').textContent = currentTranslation.particleMaxSizeLabel;
    document.getElementById('particleLifeLabel').textContent = currentTranslation.particleLifeLabel;
    document.getElementById('particleSpeedLabel').textContent = currentTranslation.particleSpeedLabel;
    document.getElementById('particleCountLabel').textContent = currentTranslation.particleCountLabel;
    document.getElementById('particleSpawnRateLabel').textContent = currentTranslation.particleSpawnRateLabel;
    document.getElementById('melodyTempoLabel').textContent = currentTranslation.melodyTempoLabel;
    document.getElementById('colorPaletteLabel').textContent = currentTranslation.colorPaletteLabel;
    document.getElementById('dynamicPaletteOption').textContent = currentTranslation.dynamicPaletteOption;
    document.getElementById('warmPaletteOption').textContent = currentTranslation.warmPaletteOption;
    document.getElementById('coolPaletteOption').textContent = currentTranslation.coolPaletteOption;
    document.getElementById('pastelPaletteOption').textContent = currentTranslation.pastelPaletteOption;
    document.getElementById('vibrantPaletteOption').textContent = currentTranslation.vibrantPaletteOption;
    document.getElementById('particleShapeLabel').textContent = currentTranslation.particleShapeLabel;
    document.getElementById('circleShapeOption').textContent = currentTranslation.circleShapeOption;
    document.getElementById('squareShapeOption').textContent = currentTranslation.squareShapeOption;
    document.getElementById('triangleShapeOption').textContent = currentTranslation.triangleShapeOption;
    document.getElementById('particleMovementLabel').textContent = currentTranslation.particleMovementLabel;
    document.getElementById('randomMovementOption').textContent = currentTranslation.randomMovementOption;
    document.getElementById('spiralMovementOption').textContent = currentTranslation.spiralMovementOption;
    document.getElementById('waveMovementOption').textContent = currentTranslation.waveMovementOption;
    document.getElementById('instrumentLabel').textContent = currentTranslation.instrumentLabel;
    document.getElementById('simplePolyInstrumentOption').textContent = currentTranslation.simplePolyInstrumentOption;
    document.getElementById('fmsynthInstrumentOption').textContent = currentTranslation.fmsynthInstrumentOption;
    document.getElementById('amsynthInstrumentOption').textContent = currentTranslation.amsynthInstrumentOption;
    document.getElementById('pluckInstrumentOption').textContent = currentTranslation.pluckInstrumentOption;
    document.getElementById('clearCanvasButton').textContent = currentTranslation.clearCanvasButton;
    document.getElementById('screenshotButton').textContent = currentTranslation.screenshotButton;
    document.getElementById('resetSettingsButton').textContent = currentTranslation.resetSettingsButton;
    
    // Обновляем текст кнопки меню
    menuToggleButton.textContent = controlsPanel.classList.contains('visible') ? currentTranslation.menuButtonClose : currentTranslation.menuButtonOpen;
    
    // Обновляем текст кнопки темы
    themeToggleButton.textContent = currentTheme === 'dark' ? currentTranslation.themeButtonLight : currentTranslation.themeButtonDark;

    // Обновляем инструкции для игры
    updateGameInstructions();

    // Сохраняем выбранный язык
    localStorage.setItem('zenLanguage', langCode);
}

// --- Настройки холста ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Перегенерируем лабиринт при изменении размера холста
    if (gameMode === 'melody-maze') {
        generateRandomMazePath();
    }
}
window.addEventListener('resize', resizeCanvas);


// Function to update game instructions based on current game mode
function updateGameInstructions() {
    const currentTranslation = translations[currentLanguage];
    switch (gameMode) {
        case 'free-play':
            gameInstructions.innerHTML = currentTranslation.freePlayInstructions;
            break;
        case 'echo-sphere':
            gameInstructions.innerHTML = currentTranslation.echoSphereInstructions;
            break;
        case 'melody-maze':
            gameInstructions.innerHTML = currentTranslation.melodyMazeInstructions;
            break;
        default:
            gameInstructions.innerHTML = currentTranslation.selectGameModeInstructions;
    }
}

// Helper function to calculate distance from a point to a line segment
function distToSegmentSquared(p, v, w) {
    const l2 = (w.x - v.x) * (w.x - v.x) + (w.y - v.y) * (w.y - v.y);
    if (l2 === 0) return (p.x - v.x) * (p.x - v.x) + (p.y - v.y) * (p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    };
    return (p.x - projection.x) * (p.x - projection.x) + (p.y - projection.y) * (p.y - projection.y);
}

function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

// Функция для генерации случайного пути лабиринта
function generateRandomMazePath() {
    currentMazePath = [];
    const minX = 0.1; 
    const maxX = 0.9; 
    const minY = 0.1; 
    const maxY = 0.9; 
    const minSegmentLength = 0.05; 
    const maxSegmentLength = 0.15; 
    const maxAngleChange = Math.PI / 4; 

    let currentX = minX;
    let currentY = Math.random() * (maxY - minY) + minY; 
    let currentAngle = Math.random() * Math.PI / 2 - Math.PI / 4; 

    currentMazePath.push({ x: currentX * canvas.width, y: currentY * canvas.height });

    while (currentX < maxX) {
        // Случайное изменение угла
        currentAngle += (Math.random() - 0.5) * maxAngleChange * 2;
        // Ограничиваем угол, чтобы путь не уходил слишком сильно вверх/вниз
        currentAngle = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, currentAngle));

        const segmentLength = (Math.random() * (maxSegmentLength - minSegmentLength) + minSegmentLength);
        
        let nextX = currentX + Math.cos(currentAngle) * segmentLength;
        let nextY = currentY + Math.sin(currentAngle) * segmentLength;

        // Корректировка, чтобы путь оставался в пределах холста
        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextY = Math.max(minY, Math.min(maxY, nextY));

        currentMazePath.push({ x: nextX * canvas.width, y: nextY * canvas.height });

        currentX = nextX;
        currentY = nextY;
    }
    // Убедимся, что последняя точка достигает правой границы
    currentMazePath[currentMazePath.length - 1].x = maxX * canvas.width;
}


// Функция для отрисовки частицы в зависимости от выбранной формы
function drawParticle(p) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;

    switch (currentParticleShape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); 
            ctx.fill();
            break;
        case 'square':
            const size = p.radius * 2; 
            ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
            break;
        case 'triangle':
            const triHeight = p.radius * 2 * (Math.sqrt(3) / 2); 
            const triBase = p.radius * 2; 
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - triHeight / 2);
            ctx.lineTo(p.x - triBase / 2, p.y + triHeight / 2);
            ctx.lineTo(p.x + triBase / 2, p.y + triHeight / 2);
            ctx.closePath();
            ctx.fill();
            break;
    }
}

// Функция для получения цвета частицы из палитры
function getParticleColor() {
    const lightness = currentTheme === 'light' ? 70 : 50;
    if (currentColorPalette === 'dynamic') {
        return `hsl(${hue}, 70%, ${lightness}%)`;
    } else {
        const palette = colorPalettes[currentColorPalette];
        const colorIndex = Math.floor(Math.random() * palette.length);
        const color = palette[colorIndex];
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`; 
    }
}

// Tone.js Synth для звуков взаимодействия (теперь используется для "Эхо-сферы")
let activeEchoSynthNote = null; 

function createParticle(x, y) {
    const baseRadius = Math.random() * (particleMaxSize - particleMinSize) + particleMinSize;
    const radius = baseRadius + particlePulseFactor * 2;
    let speedX = (Math.random() - 0.5) * particleBaseSpeed;
    let speedY = (Math.random() - 0.5) * particleBaseSpeed;

    // Логика создания частиц в зависимости от режима игры
    if (gameMode === 'echo-sphere') {
        const angle = Math.random() * Math.PI * 2; 
        particles.push({
            x: x, 
            y: y, 
            initialX: x, 
            initialY: y,
            angle: angle, 
            radius: radius * 0.5, 
            color: getParticleColor(),
            alpha: 1,
            speedX: Math.cos(angle) * (particleBaseSpeed * 1.5), 
            speedY: Math.sin(angle) * (particleBaseSpeed * 1.5),
            life: particleLife * 3, 
            spawnTime: Tone.now() 
        });
        return; 
    }

    // Существующая логика для свободной игры и других движений
    if (currentParticleMovement === 'spiral') {
        const angle = Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
        const distance = Math.sqrt(Math.pow(x - canvas.height / 2, 2) + Math.pow(y - canvas.width / 2, 2));
        speedX = Math.cos(angle + Math.PI / 2) * (particleBaseSpeed * 0.5) + (x - canvas.width / 2) * 0.001;
        speedY = Math.sin(angle + Math.PI / 2) * (particleBaseSpeed * 0.5) + (y - canvas.height / 2) * 0.001;
    } else if (currentParticleMovement === 'wave') {
        speedX = Math.sin(x * 0.05 + hue * 0.01) * particleBaseSpeed * 0.8;
        speedY = Math.cos(y * 0.05 + hue * 0.01) * particleBaseSpeed * 0.8;
    }

    particles.push({
        x: x,
        y: y,
        radius: radius,
        color: getParticleColor(),
        alpha: 1,
        speedX: speedX,
        speedY: speedY,
        life: particleLife
    });
    // Воспроизводим звук взаимодействия только в режиме свободной игры
    if (isPlaying && interactionSynth && gameMode === 'free-play') {
        interactionSynth.triggerAttackRelease("C5", "16n", Tone.now() + Math.random() * 0.01);
    }
}

// --- Настройки для аудио эффектов (мелодия) ---
const notes = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4"];

function createSynth(instrumentType) {
    // Не диспозируем здесь, так как синтезатор будет пересоздаваться в startAudioAndVisuals
    let newSynth;
    switch (instrumentType) {
        case 'simple-poly':
            newSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "sine" },
                envelope: { attack: 2, decay: 1, sustain: 0.5, release: 4 }
            });
            break;
        case 'fmsynth':
            newSynth = new Tone.FMSynth({ 
                harmonicity: 3.0,
                modulationIndex: 10,
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1.2 },
                modulation: { type: "triangle" },
                modulationEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.0, release: 0.5 }
            });
            break;
        case 'amsynth':
            newSynth = new Tone.AMSynth({ 
                harmonicity: 2.5,
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1.2 },
                modulation: { type: "square" },
                modulationEnvelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.5 }
            });
            break;
        case 'pluck':
            newSynth = new Tone.PluckSynth({ 
                attackNoise: 1,
                dampening: 4000,
                resonance: 0.7
            });
            break;
        default:
            newSynth = new Tone.PolySynth(Tone.Synth, { 
                oscillator: { type: "sine" },
                envelope: { attack: 2, decay: 1, sustain: 0.5, release: 4 }
            });
    }
    return newSynth;
}


// Переменные для градиентного фона
let bgHue1 = 0;
let bgHue2 = 180;
let bgLightness = 5; 

// Функция для отрисовки динамического фона
function drawDynamicBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const currentAudioLevelDB = audioAnalyzer && isPlaying ? audioAnalyzer.getLevel() : -60; 
    const normalizedLevel = Math.max(0, (currentAudioLevelDB + 60) / 60); 
    
    const minBgLightness = currentTheme === 'light' ? 80 : 5;
    const maxBgLightness = currentTheme === 'light' ? 95 : 20; 
    const dynamicLightness = minBgLightness + (normalizedLevel * (maxBgLightness - minBgLightness));

    gradient.addColorStop(0, `hsl(${bgHue1}, 50%, ${dynamicLightness}%)`);
    gradient.addColorStop(1, `hsl(${bgHue2}, 50%, ${dynamicLightness}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bgHue1 = (bgHue1 + 0.05) % 360;
    bgHue2 = (bgHue2 + 0.05) % 360;
}

// Функция для инициализации и запуска аудио и визуалов
async function startAudioAndVisuals() {
    if (isPlaying) return; 

    try {
        await Tone.start(); 
        console.log('Аудио контекст запущен!');

        // Инициализация эффектов и анализатора, если они еще не существуют
        if (!reverb) {
            reverb = new Tone.Reverb({ decay: 8, preDelay: 0.2, wet: 0.6 }).toDestination();
        }
        if (!delay) {
            delay = new Tone.FeedbackDelay({ delayTime: "4n", feedback: 0.5, wet: 0.3 }).connect(reverb);
        }
        if (!audioAnalyzer) {
            audioAnalyzer = new Tone.Meter();
        }
        
        // Инициализация синтезаторов, если они еще не существуют
        if (!synth) {
            synth = createSynth(currentInstrument);
            synth.connect(delay); 
            synth.connect(audioAnalyzer); 
        }
        synth.volume.value = parseFloat(volumeSlider.value); 

        if (!interactionSynth) {
            interactionSynth = new Tone.PolySynth(Tone.Synth, { 
                polyphony: 4, 
                oscillator: { type: "triangle" },
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.5 }
            }).toDestination();
            interactionSynth.volume.value = -15;
        }

        if (!mazeSynth) {
            mazeSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
            }).toDestination();
            mazeSynth.volume.value = -10;
        }

        // Инициализация последовательности лабиринта, если она еще не существует
        if (!mazeSequence) {
            mazeSequence = new Tone.Sequence((time, note) => {
                // Случайная нота из mazeNotes
                const randomNote = mazeNotes[Math.floor(Math.random() * mazeNotes.length)];
                mazeSynth.triggerAttackRelease(randomNote, "8n", time);
            }, mazeNotes, "8n"); 
            mazeSequence.loop = true;
        }

        Tone.Transport.bpm.value = parseFloat(melodyTempoSlider.value);

        // Инициализация основного лупа, если он еще не существует
        if (!loop) {
            loop = new Tone.Loop(time => {
                // Мелодия играет только в режиме "Свободная игра"
                if (gameMode === 'free-play') {
                    const numNotesToPlay = Math.random() < 0.5 ? 1 : 2;
                    const notesToPlay = [];
                    for (let i = 0; i < numNotesToPlay; i++) {
                        notesToPlay.push(notes[Math.floor(Math.random() * notes.length)]);
                    }
                    if (synth) { 
                        synth.triggerAttackRelease(notesToPlay, "2n", time);
                        synth.volume.rampTo(parseFloat(volumeSlider.value) + (Math.random() * 5 - 2.5), 2); 
                    }
                }

                particlePulseFactor = 1;
                setTimeout(() => {
                    particlePulseFactor = 0;
                }, 100);

            }, "4n");
        }

        // Управление запуском/остановкой Tone.Transport и лупов в зависимости от режима
        if (gameMode === 'free-play') {
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
            }
            if (loop && loop.state !== 'started') {
                loop.start(0);
            }
        } else {
            // Если не свободная игра, останавливаем основной луп
            if (loop && loop.state === 'started') {
                loop.stop();
            }
            // Транспорт должен оставаться запущенным для интерактивных синтезаторов (эхо, лабиринт)
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
            }
        }

        isPlaying = true; 
        overlay.classList.add('hidden');
        menuToggleButton.classList.add('visible'); 
        updateGameInstructions(); 
    } catch (error) {
        console.error('Ошибка при запуске аудио:', error);
        alert(translations[currentLanguage].audioStartError);
    }
}

// Функция для смены инструмента
function changeInstrument(newInstrumentType) {
    // Диспозиция старого синтезатора, если он существует
    if (synth && synth.dispose) {
        synth.disconnect();
        synth.dispose();
    }

    currentInstrument = newInstrumentType;
    synth = createSynth(currentInstrument); 
    
    // Подключение нового синтезатора к эффектам и анализатору
    if (delay) {
        synth.connect(delay);
    }
    if (audioAnalyzer) {
        synth.connect(audioAnalyzer);
    }
    
    synth.volume.value = parseFloat(volumeSlider.value);

    // Пересоздание и перезапуск лупа, если он был активен
    if (loop) {
        const wasLoopStarted = loop.state === 'started';
        loop.stop();
        loop.dispose();
        loop = null; 
        
        loop = new Tone.Loop(time => {
            if (gameMode === 'free-play') {
                const numNotesToPlay = Math.random() < 0.5 ? 1 : 2;
                const notesToPlay = [];
                for (let i = 0; i < numNotesToPlay; i++) {
                    notesToPlay.push(notes[Math.floor(Math.random() * notes.length)]);
                }
                if (synth) { 
                    synth.triggerAttackRelease(notesToPlay, "2n", time);
                    synth.volume.rampTo(parseFloat(volumeSlider.value) + (Math.random() * 5 - 2.5), 2);
                }
            }
            particlePulseFactor = 1;
            setTimeout(() => { particlePulseFactor = 0; }, 100);
        }, "4n");

        if (wasLoopStarted && Tone.Transport.state === 'started') {
            loop.start(0);
        }
    }
}


// --- Обработчики для слайдеров и селектов ---
volumeSlider.addEventListener('input', (e) => {
    if (synth) {
        synth.volume.value = parseFloat(e.target.value);
    }
});

particleMinSizeSlider.addEventListener('input', (e) => {
    particleMinSize = parseFloat(e.target.value);
    if (particleMinSize > particleMaxSize) {
        particleMaxSizeSlider.value = particleMinSize;
        particleMaxSize = particleMinSize;
    }
});

particleMaxSizeSlider.addEventListener('input', (e) => {
    particleMaxSize = parseFloat(e.target.value);
    if (particleMaxSize < particleMinSize) {
        particleMinSizeSlider.value = particleMaxSize;
        particleMinSize = particleMaxSize;
    }
});

particleLifeSlider.addEventListener('input', (e) => {
    particleLife = parseInt(e.target.value);
});

particleSpeedSlider.addEventListener('input', (e) => {
    particleBaseSpeed = parseFloat(e.target.value);
});

particleCountSlider.addEventListener('input', (e) => {
    maxParticles = parseInt(e.target.value);
});

particleSpawnRateSlider.addEventListener('input', (e) => {
    particleSpawnRate = parseInt(e.target.value);
});

melodyTempoSlider.addEventListener('input', (e) => {
    if (Tone.Transport) {
        Tone.Transport.bpm.value = parseFloat(e.target.value);
    }
});

colorPaletteSelect.addEventListener('change', (e) => {
    currentColorPalette = e.target.value;
});

particleShapeSelect.addEventListener('change', (e) => {
    currentParticleShape = e.target.value;
});

particleMovementSelect.addEventListener('change', (e) => {
    currentParticleMovement = e.target.value;
});

instrumentSelect.addEventListener('change', (e) => {
    changeInstrument(e.target.value);
});

clearCanvasButton.addEventListener('click', () => {
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDynamicBackground();
});

screenshotButton.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'zen_canvas_art.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

resetSettingsButton.addEventListener('click', () => {
    volumeSlider.value = defaultSettings.volume;
    particleMinSizeSlider.value = defaultSettings.particleMinSize;
    particleMaxSizeSlider.value = defaultSettings.particleMaxSize;
    particleLifeSlider.value = defaultSettings.particleLife;
    particleSpeedSlider.value = defaultSettings.particleSpeed;
    particleCountSlider.value = defaultSettings.particleCount;
    particleSpawnRateSlider.value = defaultSettings.particleSpawnRate;
    melodyTempoSlider.value = defaultSettings.melodyTempo;
    colorPaletteSelect.value = defaultSettings.colorPalette;
    particleShapeSelect.value = defaultSettings.particleShape;
    particleMovementSelect.value = defaultSettings.particleMovement;
    instrumentSelect.value = defaultSettings.instrument;
    gameModeSelect.value = defaultSettings.gameMode; 
    languageSelect.value = defaultSettings.language; 

    setTheme('dark');
    themeToggleButton.textContent = translations[currentLanguage].themeButtonLight; 

    gameMode = defaultSettings.gameMode; 
    setLanguage(defaultSettings.language); 
    updateGameInstructions(); 

    maxParticles = defaultSettings.particleCount;
    particleBaseSpeed = defaultSettings.particleSpeed;
    particleMinSize = defaultSettings.particleMinSize;
    particleMaxSize = defaultSettings.particleMaxSize;
    particleLife = defaultSettings.particleLife;
    particleSpawnRate = defaultSettings.particleSpawnRate;
    currentColorPalette = defaultSettings.colorPalette;
    currentParticleShape = defaultSettings.particleShape;
    currentParticleMovement = defaultSettings.particleMovement;
    
    // Диспозиция и пересоздание синтезаторов при сбросе
    if (synth) { synth.disconnect(); synth.dispose(); synth = null; }
    if (interactionSynth) { interactionSynth.disconnect(); interactionSynth.dispose(); interactionSynth = null; }
    if (mazeSynth) { mazeSynth.disconnect(); mazeSynth.dispose(); mazeSynth = null; }
    if (loop) { loop.stop(); loop.dispose(); loop = null; }
    if (mazeSequence) { mazeSequence.stop(); mazeSequence.dispose(); mazeSequence = null; }

    // Запускаем startAudioAndVisuals, чтобы переинициализировать аудиосистему
    // с настройками по умолчанию, если она была активна.
    isPlaying = false; 
    startAudioAndVisuals(); 

    isMazePlayingAudio = false;
    activeEchoSynthNote = null;

    // Генерируем новый лабиринт при сбросе настроек
    if (gameMode === 'melody-maze') {
        generateRandomMazePath();
    }

    bgHue1 = 0;
    bgHue2 = 180;

    clearCanvasButton.click();
});

// --- Запись видео с canvas ---
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

const recordButton = document.getElementById('recordButton');

recordButton.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    const canvasStream = canvas.captureStream(30); // 30 FPS
    mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });

    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'zen_canvas_recording.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    isRecording = true;
    recordButton.textContent = 'Остановить запись';
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        recordButton.textContent = 'Начать запись';
    }
}


// --- Обработчик для кнопки меню (ранее toggleControlsButton) ---
menuToggleButton.addEventListener('click', () => {
    const isPanelVisible = controlsPanel.classList.contains('visible');
    if (isPanelVisible) {
        controlsPanel.classList.remove('visible');
        menuBackdrop.classList.remove('visible');
        menuToggleButton.textContent = translations[currentLanguage].menuButtonOpen;
    } else {
        controlsPanel.classList.add('visible');
        menuBackdrop.classList.add('visible');
        menuToggleButton.textContent = translations[currentLanguage].menuButtonClose; 
    }
});

// Обработчик для бэкдропа (закрывает меню при клике вне его)
menuBackdrop.addEventListener('click', () => {
    controlsPanel.classList.remove('visible');
    menuBackdrop.classList.remove('visible');
    menuToggleButton.textContent = translations[currentLanguage].menuButtonOpen;
});

// --- Логика переключения темы ---
function setTheme(theme) {
    currentTheme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
    canvas.style.backgroundColor = theme === 'light' ? '#e0e0e0' : '#000';
    ctx.fillStyle = theme === 'light' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    localStorage.setItem('zenTheme', theme);
}

themeToggleButton.addEventListener('click', () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    themeToggleButton.textContent = newTheme === 'dark' ? translations[currentLanguage].themeButtonLight : translations[currentLanguage].themeButtonDark;
});

// --- Обработчик для выбора режима игры ---
gameModeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    updateGameInstructions(); 
    particles = []; 

    // Останавливаем все активные аудио-компоненты
    if (loop && loop.state === 'started') {
        loop.stop();
    }
    if (mazeSequence && mazeSequence.state === 'started') {
        mazeSequence.stop();
        isMazePlayingAudio = false;
    }
    if (activeEchoSynthNote) {
        interactionSynth.triggerRelease(activeEchoSynthNote, Tone.now());
        activeEchoSynthNote = null;
    }

    // Убедимся, что Tone.Transport запущен, если мы в любом аудио-режиме
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }

    // Запускаем основной луп, если перешли в режим "Свободная игра"
    if (gameMode === 'free-play') {
        if (loop) loop.start(0);
    }

    // Генерируем новый лабиринт, если перешли в режим "Мелодичный лабиринт"
    if (gameMode === 'melody-maze') {
        generateRandomMazePath();
    }
});

// --- Обработчик для смены языка ---
languageSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

// --- Горячие клавиши ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
        clearCanvasButton.click();
    }
    if (e.key === 's' || e.key === 'S') {
        screenshotButton.click();
    }
    if (e.key === 'r' || e.key === 'R') {
        resetSettingsButton.click();
    }
    // "T" - Переключить меню
    if (e.key === 't' || e.key === 'T') {
        menuToggleButton.click();
    }
    // "L" - Переключить тему (Light/Dark)
    if (e.key === 'l' || e.key === 'L') {
        themeToggleButton.click();
    }
});


// --- Обработчики взаимодействия (обновлены для режимов игры) ---
canvas.addEventListener('mousemove', (e) => {
    if (!isPlaying) return;
    if (gameMode === 'free-play') {
        for (let i = 0; i < particleSpawnRate; i++) {
            createParticle(e.clientX, e.clientY);
        }
    } else if (gameMode === 'melody-maze') {
        const mousePos = { x: e.clientX, y: e.clientY };
        let onPath = false;

        for (let i = 0; i < currentMazePath.length - 1; i++) {
            const p1 = currentMazePath[i];
            const p2 = currentMazePath[i+1];
            const distance = distToSegment(mousePos, p1, p2);
            if (distance < mazeLineTolerance) {
                onPath = true;
                break;
            }
        }

        if (onPath) {
            if (!isMazePlayingAudio) {
                // Tone.Transport уже запущен в gameModeSelect change
                mazeSequence.start(Tone.now());
                isMazePlayingAudio = true;
            }
            // Generate particles along the path
            for (let i = 0; i < particleSpawnRate / 2; i++) { 
                createParticle(e.clientX, e.clientY);
            }
        } else {
            if (isMazePlayingAudio) {
                mazeSequence.stop();
                isMazePlayingAudio = false;
            }
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    if (gameMode === 'free-play') {
        for (let i = 0; i < e.touches.length; i++) {
            for (let j = 0; j < particleSpawnRate; j++) {
                createParticle(e.touches[i].clientX, e.touches[i].clientY);
            }
        }
    } else if (gameMode === 'melody-maze') {
        const touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        let onPath = false;

        for (let i = 0; i < currentMazePath.length - 1; i++) {
            const p1 = currentMazePath[i];
            const p2 = currentMazePath[i+1];
            const distance = distToSegment(touchPos, p1, p2);
            if (distance < mazeLineTolerance) {
                onPath = true;
                break;
            }
        }

        if (onPath) {
            if (!isMazePlayingAudio) {
                // Tone.Transport уже запущен в gameModeSelect change
                mazeSequence.start(Tone.now());
                isMazePlayingAudio = true;
            }
            for (let i = 0; i < particleSpawnRate / 2; i++) {
                createParticle(e.touches[0].clientX, e.touches[0].clientY);
            }
        } else {
            if (isMazePlayingAudio) {
                mazeSequence.stop();
                isMazePlayingAudio = false;
            }
        }
    }
}, { passive: false });

// Обработчики mousedown/mouseup для режима "Эхо-сфера"
canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying) return;
    if (gameMode === 'echo-sphere') {
        if (activeEchoSynthNote) { 
            interactionSynth.triggerRelease(activeEchoSynthNote, Tone.now());
        }
        const normalizedY = e.clientY / canvas.height;
        const minFreq = Tone.Midi('C3').toFrequency();
        const maxFreq = Tone.Midi('C6').toFrequency();
        const frequency = minFreq + (maxFreq - minFreq) * (1 - normalizedY);
        activeEchoSynthNote = frequency;
        interactionSynth.triggerAttack(frequency, Tone.now());
        // Создаем начальный "всплеск" частиц для сферы
        for (let i = 0; i < 20; i++) { 
            createParticle(e.clientX, e.clientY);
        }
    } else if (gameMode === 'melody-maze') {
        const mousePos = { x: e.clientX, y: e.clientY };
        let onPath = false;
        for (let i = 0; i < currentMazePath.length - 1; i++) {
            const p1 = currentMazePath[i];
            const p2 = currentMazePath[i+1];
            const distance = distToSegment(mousePos, p1, p2);
            if (distance < mazeLineTolerance) {
                onPath = true;
                break;
            }
        }
        if (!onPath && isMazePlayingAudio) {
            mazeSequence.stop();
            isMazePlayingAudio = false;
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (gameMode === 'echo-sphere') {
        if (activeEchoSynthNote) {
            interactionSynth.triggerRelease(activeEchoSynthNote, Tone.now());
            activeEchoSynthNote = null;
        }
    } else if (gameMode === 'melody-maze') {
        // При отпускании кнопки мыши в режиме лабиринта, останавливаем звук лабиринта
        if (isMazePlayingAudio) {
            mazeSequence.stop();
            isMazePlayingAudio = false;
        }
    }
});

// Обработчики touchstart/touchend для режима "Эхо-сфера"
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    if (gameMode === 'echo-sphere') {
        if (activeEchoSynthNote) {
            interactionSynth.triggerRelease(activeEchoSynthNote, Tone.now());
        }
        const normalizedY = e.touches[0].clientY / canvas.height;
        const minFreq = Tone.Midi('C3').toFrequency();
        const maxFreq = Tone.Midi('C6').toFrequency();
        const frequency = minFreq + (maxFreq - minFreq) * (1 - normalizedY);
        activeEchoSynthNote = frequency;
        interactionSynth.triggerAttack(frequency, Tone.now());
        for (let i = 0; i < 20; i++) {
            createParticle(e.touches[0].clientX, e.touches[0].clientY);
        }
    } else if (gameMode === 'melody-maze') {
        const touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        let onPath = false;
        for (let i = 0; i < currentMazePath.length - 1; i++) {
            const p1 = currentMazePath[i];
            const p2 = currentMazePath[i+1];
            const distance = distToSegment(touchPos, p1, p2);
            if (distance < mazeLineTolerance) {
                onPath = true;
                break;
            }
        }
        if (!onPath && isMazePlayingAudio) {
            mazeSequence.stop();
            isMazePlayingAudio = false;
        }
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (gameMode === 'echo-sphere') {
        if (activeEchoSynthNote) {
            interactionSynth.triggerRelease(activeEchoSynthNote, Tone.now());
            activeEchoSynthNote = null;
        }
    } else if (gameMode === 'melody-maze') {
        // При отпускании пальца в режиме лабиринта, останавливаем звук лабиринта
        if (isMazePlayingAudio) {
            mazeSequence.stop();
            isMazePlayingAudio = false;
        }
    }
}, { passive: false });


// --- Основной цикл анимации для частиц и фона ---
function animateParticles() {
    drawDynamicBackground();

    ctx.fillStyle = currentTheme === 'light' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка пути лабиринта
    if (gameMode === 'melody-maze' && currentMazePath.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentMazePath[0].x, currentMazePath[0].y);
        for (let i = 1; i < currentMazePath.length; i++) {
            ctx.lineTo(currentMazePath[i].x, currentMazePath[i].y);
        }
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)'; 
        ctx.lineWidth = 15; 
        ctx.lineCap = 'round'; 
        ctx.lineJoin = 'round'; 
        ctx.stroke();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Логика движения частиц в зависимости от режима игры
        if (gameMode === 'echo-sphere') {
            const elapsed = Tone.now() - p.spawnTime;
            // Радиальное расширение от начальной точки
            const currentDistance = elapsed * particleBaseSpeed * 10; 
            p.x = p.initialX + Math.cos(p.angle) * currentDistance;
            p.y = p.initialY + Math.sin(p.angle) * currentDistance;
            p.alpha -= 1 / p.life; 
        } else {
            // Существующая логика движения для свободной игры и мелодичного лабиринта
            if (currentParticleMovement === 'spiral') {
                const angle = Math.atan2(p.y - canvas.height / 2, p.x - canvas.width / 2);
                const distance = Math.sqrt(Math.pow(p.x - canvas.width / 2, 2) + Math.pow(p.y - canvas.height / 2, 2));
                p.speedX = Math.cos(angle + Math.PI / 2) * (particleBaseSpeed * 0.5) + (p.x - canvas.width / 2) * 0.001;
                p.speedY = Math.sin(angle + Math.PI / 2) * (particleBaseSpeed * 0.5) + (p.y - canvas.height / 2) * 0.001;
            } else if (currentParticleMovement === 'wave') {
                p.speedX = Math.sin(p.x * 0.05 + hue * 0.01) * particleBaseSpeed * 0.8;
                p.speedY = Math.cos(p.y * 0.05 + hue * 0.01) * particleBaseSpeed * 0.8;
            }
            p.x += p.speedX;
            p.y += p.speedY;
            p.alpha -= 1 / p.life;
        }

        if (p.alpha <= 0 || p.life <= 0 || 
            p.x < -p.radius || p.x > canvas.width + p.radius || 
            p.y < -p.radius || p.y > canvas.height + p.radius) {
            particles.splice(i, 1);
            continue;
        }

        drawParticle(p);
    }

    while (particles.length > maxParticles) {
        particles.shift();
    }

    if (currentColorPalette === 'dynamic') {
        hue = (hue + 0.3) % 360;
    }

    requestAnimationFrame(animateParticles);
}

// Добавляем слушатель события на кнопку "Старт"
startButton.addEventListener('click', startAudioAndVisuals);

// Запускаем анимацию частиц и инициализируем аудио при загрузке
window.onload = async function() { 
    const savedTheme = localStorage.getItem('zenTheme');
    if (savedTheme) {
        setTheme(savedTheme);
        themeToggleButton.textContent = translations[currentLanguage].themeButtonLight; 
    } else {
        setTheme(defaultSettings.theme);
        themeToggleButton.textContent = translations[currentLanguage].themeButtonLight;
    }

    const savedLanguage = localStorage.getItem('zenLanguage');
    if (savedLanguage && translations[savedLanguage]) {
        languageSelect.value = savedLanguage;
        setLanguage(savedLanguage);
    } else {
        languageSelect.value = defaultSettings.language;
        setLanguage(defaultSettings.language);
    }


    bgHue1 = Math.random() * 360;
    bgHue2 = (bgHue1 + 180) % 360;

    // Инициализируем лабиринт после установки размеров холста
    resizeCanvas(); 
    generateRandomMazePath(); 

    animateParticles();
    updateGameInstructions();
};
