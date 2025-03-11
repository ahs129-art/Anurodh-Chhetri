const welcomeScreen = document.getElementById('welcome-screen');
const cookiePopup = document.getElementById('cookie-popup');
const mainUi = document.getElementById('main-ui');
const startScreen = document.getElementById('start-screen');
const testUi = document.getElementById('test-ui');
const textDisplay = document.getElementById('text-display');
const inputArea = document.getElementById('input-area');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const errorsDisplay = document.getElementById('errors');
const pastTestsList = document.getElementById('past-tests-list');
const musicToggle = document.getElementById('music-toggle');
const playNextButton = document.getElementById('play-next');
const musicPlayer = document.getElementById('music-player');
const repeatButton = document.getElementById('repeat-test');
const nextButton = document.getElementById('next-test');

// Expanded list of easy, continuous paragraphs
const paragraphs = [
    "the dog runs fast in the park today a big cat sits on the soft mat kids play games with a red ball",
    "the sun shines over the green hill my friend walks to the blue lake a small bird flies high in the sky",
    "we read books under the tall tree the wind blows over the wide field a young child laughs in the garden",
    "the river flows through the quiet valley old trees stand along the peaceful shore fish swim in clear water",
    "a bright moon lights up the dark night stars twinkle above the silent mountains a fox roams in the forest",
    "the happy deer jumps in the meadow green frogs hop near the small pond a butterfly lands on a flower",
    "a warm breeze moves the long grass bees buzz around the bright flowers a squirrel climbs up the oak tree",
    "the old barn stands in the sunny field cows graze on the fresh grass a farmer works in the morning light",
    "a playful puppy chases its tail birds sing in the early dawn a horse gallops across the open plain",
    "the calm sea reflects the blue sky waves crash on the sandy beach a crab walks along the wet shore"
];
let currentParagraphIndex = -1;
let timeLeft, timer, totalErrors = 0, testActive = false, testDuration, testText, timerStarted = false, userId, musicPlaying = true, startTime;

// Music tracks
const tracks = [
    "Mac_Miller_-_Surf(48k).mp3",
    "kendrick_lamar_humble.mp3",
    "j_cole_middle_child.mp3",
    "drake_hotline_bling.mp3",
    "travis_scott_sicko_mode.mp3"
];
let currentTrackIndex = 0;

// Generate or retrieve unique user ID
if (!localStorage.getItem('userId')) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
} else {
    userId = localStorage.getItem('userId');
}

// Welcome Screen with Cookie Popup and Music Auto-Play
document.getElementById('enter-btn').addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    mainUi.classList.remove('hidden');
    musicPlayer.play()
        .catch(err => {
            console.error('Auto-play failed:', err);
            alert('Auto-play failed. Ensure you\'re using a local server and the file "Mac_Miller_-_Surf(48k).mp3" is present. Check console for details.');
        });
    console.log('Entered main UI, music should auto-play');
});

// Cookie Popup (only on first load)
if (!localStorage.getItem('cookiesAccepted')) {
    // Already handled in CSS with delay - no JS needed here
} else {
    cookiePopup.classList.add('hidden');
}

document.getElementById('accept-cookies').addEventListener('click', () => {
    cookiePopup.classList.add('hidden');
    localStorage.setItem('cookiesAccepted', 'true');
});

// Dark/Light Mode
document.getElementById('mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mode', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});
if (localStorage.getItem('mode') === 'light') document.body.classList.add('light-mode');

// Music Toggle
musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
        musicPlayer.pause();
        musicToggle.textContent = 'Music: Off';
        musicPlaying = false;
        console.log('Music paused');
    } else {
        musicPlayer.play()
            .then(() => {
                musicToggle.textContent = 'Music: On';
                musicPlaying = true;
                console.log('Music resumed');
            })
            .catch(err => console.error('Music play error:', err));
    }
});

// Play Next Track
playNextButton.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    musicPlayer.src = tracks[currentTrackIndex];
    musicPlayer.load();
    if (musicPlaying) {
        musicPlayer.play()
            .then(() => console.log(`Playing next track: ${tracks[currentTrackIndex]}`))
            .catch(err => console.error('Next track play error:', err));
    }
});

function startTest(seconds) {
    if (testActive) return;
    testActive = true;
    testDuration = seconds;
    timeLeft = seconds;
    totalErrors = 0;
    inputArea.value = '';
    inputArea.disabled = false;
    inputArea.focus();
    
    // Select a new random paragraph if not repeating
    if (currentParagraphIndex === -1 || !testText) {
        do {
            currentParagraphIndex = Math.floor(Math.random() * paragraphs.length);
        } while (currentParagraphIndex === localStorage.getItem('lastParagraphIndex'));
        localStorage.setItem('lastParagraphIndex', currentParagraphIndex);
    }
    testText = paragraphs[currentParagraphIndex].trim().replace(/\s+/g, ' ');
    renderText(testText);
    updateTimerDisplay();
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '0%';
    errorsDisplay.textContent = '0';
    startTime = new Date();
    document.getElementById('results').classList.add('hidden');

    startScreen.classList.add('hidden');
    testUi.classList.remove('hidden');

    inputArea.addEventListener('input', handleInput, { once: false });
}

function renderText(text) {
    textDisplay.innerHTML = text.split('').map((char, index) => 
        `<span data-index="${index}">${char}</span>`
    ).join('');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function handleInput() {
    if (!timerStarted) {
        timerStarted = true;
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) endTest();
        }, 1000);
    }

    const typedText = inputArea.value.trim();
    const spans = textDisplay.querySelectorAll('span');
    totalErrors = 0;

    spans.forEach((span, index) => {
        const typedChar = typedText[index] || '';
        const originalChar = span.textContent;
        span.className = '';
        if (index < typedText.length) {
            if (typedChar === originalChar) {
                span.classList.add('correct');
            } else {
                span.classList.add('error');
                totalErrors++;
            }
        } else if (index === typedText.length) {
            span.classList.add('current');
        }
    });

    errorsDisplay.textContent = totalErrors;
}

function endTest() {
    clearInterval(timer);
    testActive = false;
    timerStarted = false;
    inputArea.disabled = true;

    const typedText = inputArea.value.trim();
    const endTime = new Date();
    const timeElapsed = (endTime - startTime) / 60000;
    const wordsTyped = typedText.split(/\s+/).filter(word => word.length > 0).length;
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;
    const correctChars = Array.from(textDisplay.querySelectorAll('.correct')).length;
    const accuracy = Math.round((correctChars / testText.length) * 100) || 0;

    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = `${accuracy}%`;
    document.getElementById('results').classList.remove('hidden');
    saveTestResult(wpm, accuracy, totalErrors);

    if (musicPlaying) musicPlayer.pause();
}

// "Repeat" and "Next" Button Listeners
repeatButton.addEventListener('click', () => {
    // Keep the same paragraph
    testUi.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startTest(testDuration); // Reuse same duration
});

nextButton.addEventListener('click', () => {
    // Load a new paragraph
    currentParagraphIndex = -1; // Reset to force new paragraph
    testUi.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startTest(testDuration);
});

function saveTestResult(wpm, accuracy, errors) {
    const result = { wpm, accuracy, errors, date: new Date().toLocaleString() };
    const storageKey = `pastResults_${userId}`;
    let pastResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
    pastResults.push(result);
    localStorage.setItem(storageKey, JSON.stringify(pastResults));
    displayPastResults();
}

function displayPastResults() {
    const storageKey = `pastResults_${userId}`;
    let pastResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
    pastTestsList.innerHTML = '';
    pastResults.forEach(result => {
        const li = document.createElement('li');
        li.textContent = `WPM: ${result.wpm}, Accuracy: ${result.accuracy}%, Errors: ${result.errors} - ${result.date}`;
        pastTestsList.appendChild(li);
    });
}

window.onload = displayPastResults;