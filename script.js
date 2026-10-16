const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxjXZ9obK2aQ7ZzsNsyJZaYgzvWO0LUJ2GVWreN9JGt2g4jUOxVpVwCZAcnSDk-iVl/exec';

let currentReservationData = null;
let selections = {};
let allGuestNames = [];

const screens = {
    search: document.getElementById('step-search'),
    config: document.getElementById('step-configure'),
    review: document.getElementById('step-review'),
    success: document.getElementById('step-success')
};

document.addEventListener("DOMContentLoaded", () => {
    const waxSeal = document.getElementById("wedding-wax-seal");
    const envelope = document.getElementById("wedding-envelope");
    const curtain = document.getElementById("music-permission-overlay");
    const weddingMusic = document.getElementById("bg-wedding-music");

    document.body.classList.add("curtain-active");

    if (waxSeal && envelope && curtain && weddingMusic) {
        waxSeal.addEventListener("click", () => {
            weddingMusic.volume = 0.5;
            weddingMusic.play().catch(audioErr => console.warn(audioErr));

            envelope.classList.add("seal-broken");

            setTimeout(() => {
                curtain.classList.add("hide-curtain");
                document.body.classList.remove("curtain-active"); 
            }, 500); 
        });
    }
});

// ==========================================================================
// PRODUCTION ROUTER VIEWPORT TRANSITION ENGINE
// ==========================================================================
function switchScreen(targetScreen) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    
    targetScreen.classList.add('active');

    window.scrollTo(0, 0);
}

function showCustomAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const msgElement = document.getElementById('modal-alert-message');
    if (modal && msgElement) {
        msgElement.textContent = message;
        modal.classList.add('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('btn-close-modal');
    const modal = document.getElementById('custom-alert-modal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    }
});

// ==========================================================================
// PRODUCTION PRE-LOAD GUEST NAMES ENGINE
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const targetUrl = `${SCRIPT_URL}?action=getAll`;
    
    fetch(targetUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.names) {
                allGuestNames = data.names;
            }
        })
        .catch(err => {
        });
});


const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

searchInput.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    autocompleteList.innerHTML = '';
    
    if (!val) {
        autocompleteList.classList.remove('visible');
        return;
    }

    const filtered = allGuestNames.filter(name => name.toLowerCase().includes(val));
    
    if (filtered.length > 0) {
        autocompleteList.classList.add('visible'); 
        
        filtered.forEach(name => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = name;
            item.addEventListener('click', () => {
                searchInput.value = name;
                autocompleteList.innerHTML = '';
                autocompleteList.classList.remove('visible'); 
            });
            autocompleteList.appendChild(item);
        });
    } else {
        autocompleteList.classList.remove('visible');
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
        autocompleteList.innerHTML = '';
        autocompleteList.classList.remove('visible');
    }
});


document.addEventListener('click', (e) => {
    if (e.target !== searchInput) autocompleteList.innerHTML = '';
});

// ==========================================================================
// PRODUCTION STEP 1 GUEST LOOKUP ENGINE
// ==========================================================================
document.getElementById('btn-find-invite').addEventListener('click', function() {
    const nameInput = searchInput.value.trim();
    const errorElement = document.getElementById('search-error');
    const btn = this;
    
    if(!nameInput) return;
    
    const ringImage = document.querySelector('.event-meta img');
    if (ringImage) {
        ringImage.classList.add('spin-active');
    }
    
    btn.disabled = true;
    btn.textContent = 'Searching...';
    errorElement.style.display = 'none';

    const finalUrl = `${SCRIPT_URL}?name=${encodeURIComponent(nameInput)}`;
    
    fetch(finalUrl)
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            
            if (data.error) {
                errorElement.style.display = 'block';
                if (ringImage) ringImage.classList.remove('spin-active');
            } else {
                currentReservationData = data;
                setupConfigurationScreen(data);
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            if (ringImage) ringImage.classList.remove('spin-active');
            
            showCustomAlert("We couldn't connect to the guest database. Please check your internet connection and try again.");
        });
});

// ==========================================================================
// STEP 2: BUILD CONFIG UI WITH INTEGRATED STEP ACCORDION ENGINE
// ==========================================================================
function setupConfigurationScreen(data) {
    document.getElementById('config-guest-title').textContent = data.mainGuest.toUpperCase();
    
    const seatCount = parseInt(data.seats) || 0;
    
    document.getElementById('text-seats-count').textContent = seatCount;
    document.getElementById('allowed-seats-count').textContent = seatCount;

    const textSeatsWord = document.getElementById('text-seats-word');
    const allowedSeatsLabel = document.getElementById('allowed-seats-label');
    
    if (seatCount === 1) {
        textSeatsWord.textContent = "seat";
        allowedSeatsLabel.textContent = "RESERVED SEAT";
    } else {
        textSeatsWord.textContent = "seats";
        allowedSeatsLabel.textContent = "RESERVED SEATS";
    }
    
    const phoneInput = document.getElementById('mobile-input');
    phoneInput.value = data.mobile ? data.mobile : "+63 ";
    
    const banner = document.getElementById('already-submitted-banner');
    if(data.savedResponses) {
        banner.style.display = 'block';
        selections = data.savedResponses; 
    } else {
        banner.style.display = 'none';
        selections = {};
    }
    
    let finalMembersList = [...data.members].map(m => m.trim()).filter(m => m !== "");
    const mainGuestName = data.mainGuest.trim();

    const isMainGuestInList = finalMembersList.some(m => m.toLowerCase() === mainGuestName.toLowerCase());

    if (!isMainGuestInList) {
        finalMembersList.unshift(mainGuestName);
    }
    
    const container = document.getElementById('dynamic-guest-list');
    container.innerHTML = '';

    finalMembersList.forEach((member, index) => {
        if(!data.savedResponses) selections[member] = null;
        const currentChoice = selections[member];

        let initialEmoji = '';
        if (currentChoice === 'yes') initialEmoji = '🤩';
        if (currentChoice === 'no') initialEmoji = '🥺';

        const guestBox = document.createElement('div');
        guestBox.className = `guest-decision-card ${index > 0 ? 'is-collapsed' : ''}`;
        guestBox.setAttribute('data-index', index);
        
        guestBox.innerHTML = `
            <div class="guest-name">
                <span>${member}</span>
                <span id="emoji-${member.replace(/\s+/g, '-')}" class="status-emoji-indicator ${currentChoice === 'yes' ? 'emoji-pop-zoom' : currentChoice === 'no' ? 'emoji-slam-roll' : ''}">${initialEmoji}</span>
            </div>
            <div class="decision-buttons">
                <button type="button" class="btn-toggle opt-yes ${currentChoice === 'yes' ? 'selected' : ''}" onclick="makeAccordionSelection('${member}', 'yes', this, ${index})">Attending</button>
                <button type="button" class="btn-toggle opt-no ${currentChoice === 'no' ? 'selected' : ''}" onclick="makeAccordionSelection('${member}', 'no', this, ${index})">Not Attending</button>
            </div>
        `;

        const headerRow = guestBox.querySelector('.guest-name');
        headerRow.addEventListener('click', () => {
            const allCards = container.querySelectorAll('.guest-decision-card');
            allCards.forEach(c => {
                if (c !== guestBox) c.classList.add('is-collapsed');
            });
            guestBox.classList.toggle('is-collapsed');
        });

        container.appendChild(guestBox);
    });

    tallySelections();
    switchScreen(screens.config);
}

// ==========================================================================
// ACCORDION ADVANCEMENT STATE TRACKER PIPELINE
// ==========================================================================
function makeAccordionSelection(member, choice, buttonElement, currentIndex) {
    if (typeof makeSelection === 'function') {
        makeSelection(member, choice, buttonElement);
    }
    setTimeout(() => {
        const currentCard = buttonElement.closest('.guest-decision-card');
        if (currentCard) {
            currentCard.classList.add('is-collapsed');
        }

        const nextCard = document.querySelector(`[data-index="${currentIndex + 1}"]`);
        if (nextCard) {
            console.log(`[ACCORDION CHAIN] Automatically opening next guest row: index ${currentIndex + 1}`);
            nextCard.classList.remove('is-collapsed');
        }
    }, 450); 
}
function makeSelection(member, decision, clickedBtn) {
    selections[member] = decision;
    
    const emojiTarget = document.getElementById(`emoji-${member.replace(/\s+/g, '-')}`);
    
    if (emojiTarget) {
        emojiTarget.classList.remove('emoji-pop-zoom', 'emoji-slam-roll');
        
        void emojiTarget.offsetWidth; 
        
        if (decision === 'yes') {
            emojiTarget.textContent = '🤩';
            emojiTarget.classList.add('emoji-pop-zoom'); 
        } else if (decision === 'no') {
            emojiTarget.textContent = '🥺';
            emojiTarget.classList.add('emoji-slam-roll'); 
        }
    }
    
    const parent = clickedBtn.parentElement;
    Array.from(parent.children).forEach(btn => btn.classList.remove('selected'));
    clickedBtn.classList.add('selected');
    tallySelections();
}


function tallySelections() {
    const totalSelectedAttending = Object.values(selections).filter(v => v === 'yes').length;
    document.getElementById('current-selection-tally').textContent = totalSelectedAttending;
    
    const maxAllowed = currentReservationData.seats;
    const warningBanner = document.getElementById('seat-warning-banner');
    
    if (totalSelectedAttending > maxAllowed) {
        warningBanner.style.display = 'block';
        document.getElementById('btn-go-to-review').disabled = true;
        document.getElementById('btn-go-to-review').style.opacity = '0.5';
    } else {
        warningBanner.style.display = 'none';
        document.getElementById('btn-go-to-review').disabled = false;
        document.getElementById('btn-go-to-review').style.opacity = '1';
    }
}

document.getElementById('mobile-input').addEventListener('input', function(e) {
    let raw = this.value.replace(/\D/g, ''); 

    if (!raw.startsWith('63')) {
        raw = '63' + raw;
    }
    
    if (raw.length > 12) raw = raw.substring(0, 12);

    let formatted = '+63 ';
    if (raw.length > 2) {
        formatted += raw.substring(2, 5); 
    }
    if (raw.length > 5) {
        formatted += ' ' + raw.substring(5, 8); 
    }
    if (raw.length > 8) {
        formatted += ' ' + raw.substring(8, 12); 
    }
    
    this.value = formatted;
});

document.getElementById('mobile-input').addEventListener('keydown', function(e) {
    if (this.selectionStart < 5 && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
    }
});

// ==========================================================================
// PRODUCTION RSVP REVIEW VERIFICATION ENGINE
// ==========================================================================
document.getElementById('btn-go-to-review').addEventListener('click', function() {
    const unanswered = Object.values(selections).some(val => val === null);
    if (unanswered) {
        showCustomAlert("Please make a selection for every guest before moving forward.");
        return;
    }

    const attendingList = document.getElementById('review-list-attending');
    const declinedList = document.getElementById('review-list-declined');
    
    attendingList.innerHTML = '';
    declinedList.innerHTML = '';

    let countAttending = 0;

    Object.keys(selections).forEach(name => {
        const decision = selections[name];
        const li = document.createElement('li');
        li.textContent = name;
        
        if (decision === 'yes') {
            countAttending++;
            attendingList.appendChild(li);
        } else {
            declinedList.appendChild(li);
        }
    });

    if (attendingList.children.length === 0) {
        const fallbackLi = document.createElement('li');
        fallbackLi.textContent = "None";
        fallbackLi.className = "empty-placeholder";
        attendingList.appendChild(fallbackLi);
    }
    if (declinedList.children.length === 0) {
        const fallbackLi = document.createElement('li');
        fallbackLi.textContent = "None";
        fallbackLi.className = "empty-placeholder";
        declinedList.appendChild(fallbackLi);
    }

    const finalSubmitBtn = document.getElementById('btn-submit-rsvp');
    if (finalSubmitBtn) {
        finalSubmitBtn.disabled = false;         
        finalSubmitBtn.textContent = 'Submit RSVP'; 
    }

    document.getElementById('review-attendance-summary').textContent = `${countAttending} attending`;
    switchScreen(screens.review);
});


document.getElementById('btn-edit-answers').addEventListener('click', function() {
    switchScreen(screens.config);
});

// ==========================================================================
// PRODUCTION RSVP SUBMISSION SHEET PUSH ENGINE
// ==========================================================================
document.getElementById('btn-submit-rsvp').addEventListener('click', function() {
    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Saving updates...';

    const countAttending = Object.values(selections).filter(v => v === 'yes').length;

    const payload = {
        mainGuest: currentReservationData.mainGuest,
        mobile: document.getElementById('mobile-input').value.trim(),
        responses: selections,
        totalConfirmed: countAttending 
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        const isAnyoneAttending = Object.values(selections).some(decision => decision === 'yes');
        const cinematicScreen = document.getElementById('marvel-cinematic-intro');

        if (isAnyoneAttending && cinematicScreen) {
            cinematicScreen.classList.remove('fade-out-curtain');
            cinematicScreen.classList.add('activated-curtain');
            switchScreen(screens.success);
            
            setTimeout(() => {
                cinematicScreen.classList.add('fade-out-curtain');
                setTimeout(() => {
                    cinematicScreen.classList.remove('activated-curtain');
                }, 800);
            }, 7400);

        } else {
            if (cinematicScreen) cinematicScreen.style.display = 'none';
            switchScreen(screens.success);
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.textContent = 'Submit RSVP';
        showCustomAlert("An error occurred while saving your RSVP. Please try clicking Submit again.");
    });
});


// ==========================================================================
// DYNAMIC 3D RETRO FLIP-CLOCK MECHANICS TIME TRACK ENGINE
// ==========================================================================
function runLiveWedding3DFlipClock() {
    const targetDate = new Date("March 13, 2027 15:00:00").getTime(); 

    function update3DClockCards() {
        const now = new Date().getTime();
        const gap = targetDate - now;
        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        if (gap <= 0) {
            clearInterval(clockEngineInterval);
            const container = document.querySelector(".countdown-flip-container");
            if (container) {
                container.innerHTML = '<p class="countdown-header-tag" style="color:var(--primary-color);">✨ Today is the Big Day! 🥂</p>';
            }
            return;
        }

        const d = String(Math.floor(gap / day)).padStart(2, '0');
        const h = String(Math.floor((gap % day) / hour)).padStart(2, '0');
        const m = String(Math.floor((gap % hour) / minute)).padStart(2, '0');
        const s = String(Math.floor((gap % minute) / second)).padStart(2, '0');

        flipCardNodeUpdate(document.getElementById("clock-days-card"), d);
        flipCardNodeUpdate(document.getElementById("clock-hours-card"), h);
        flipCardNodeUpdate(document.getElementById("clock-minutes-card"), m);
        flipCardNodeUpdate(document.getElementById("clock-seconds-card"), s);
    }

    function flipCardNodeUpdate(cardContainer, newStringValue) {
        if (!cardContainer) return;

        const backgroundTop = cardContainer.querySelector(".b-top");
        const backgroundBottom = cardContainer.querySelector(".b-bottom");
        const foregroundTop = cardContainer.querySelector(".f-top");
        const foregroundBottom = cardContainer.querySelector(".f-bottom");

        if (foregroundTop.textContent === newStringValue) return;

        backgroundTop.textContent = newStringValue;
        backgroundBottom.textContent = newStringValue;

        cardContainer.classList.add("animate-flip");

        setTimeout(() => {
            foregroundTop.textContent = newStringValue;
            foregroundBottom.textContent = newStringValue;
            cardContainer.classList.remove("animate-flip"); 
        }, 390); 
    }

    update3DClockCards();
    const clockEngineInterval = setInterval(update3DClockCards, 1000);
}

// ==========================================================================
// BOOT UP THE UPGRADED 3D CLOCK ENGINE SAFELY
// ==========================================================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runLiveWedding3DFlipClock);
} else {
    runLiveWedding3DFlipClock();
}

// ==========================================================================
// PRODUCTION COLOR SWATCH LOUPE ENGINE
// ==========================================================================
document.addEventListener("click", function(e) {
    const swatch = e.target.closest(".color-swatch");
    const modalOverlay = document.getElementById("swatch-inspector-modal");
    const modalCircle = document.getElementById("modal-color-circle");
    const modalLabel = document.getElementById("modal-color-label");

    if (swatch && modalOverlay && modalCircle && modalLabel) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); 

        const hexColor = swatch.style.backgroundColor;
        const colorName = swatch.getAttribute("data-name");

        modalCircle.style.backgroundColor = hexColor;
        modalLabel.textContent = colorName;
        modalOverlay.classList.add("active-view");
        return; 
    }
    
    const activeModal = document.querySelector(".swatch-modal-overlay.active-view");
    if (activeModal) {
        e.preventDefault();
        e.stopPropagation();
        activeModal.classList.remove("active-view");
    }
});

// ==========================================================================
// PRODUCTION NAVIGATION BACK-ROUTE FROM SUCCESS HUB TO SCREEN 2
// ==========================================================================
function switchBackToEditMode() {
    const submittedBanner = document.getElementById('already-submitted-banner');
    
    if (submittedBanner) {
        submittedBanner.style.display = 'block';
    }

    if (typeof switchScreen === 'function' && screens && screens.config) {
        switchScreen(screens.config);
    } else {
        switchScreen('step-configure'); 
    }
}




