const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyp9e64X7KTVJ5u6reSLVIAJq1LSmB8AXu-hHGsz2POy3tnbRpdNuPT-oAUqVoshhc6/exec';

let guestTokenID = null;

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    guestTokenID = urlParams.get('id') ? urlParams.get('id').trim() : null;
    
    const findInviteBtn = document.getElementById('btn-find-invite');
    
    if (guestTokenID) {
        if (findInviteBtn) {
            findInviteBtn.disabled = false;
        }
    } else {
        if (findInviteBtn) {
            findInviteBtn.style.cursor = 'not-allowed';
        }
    }
});

// ==========================================================================
// 🏛️ SECURE MASTER APPLICATION LOOP (iPHONE SLIDER INTEGRATED ENGINE)
// ==========================================================================
let currentReservationData = null;
let selections = {};
let allGuestNames = [];

const screens = {
    search: document.getElementById('step-search'),
    config: document.getElementById('step-configure'),
    review: document.getElementById('step-review'),
    success: document.getElementById('step-success')
};

// --------------------------------------------------------------------------
// 💌 CHECKPOINT 1: THE WAX SEAL MECHANICS (ANIMATION & MUSIC GATES)
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const waxSeal = document.getElementById("wedding-wax-seal");
    const envelope = document.getElementById("wedding-envelope");
    const curtain = document.getElementById("music-permission-overlay");
    const weddingMusic = document.getElementById("bg-wedding-music");

    const sliderTrack = document.getElementById("iphone-slider-track");
    const sliderHandle = document.getElementById("iphone-slider-handle");
    const hiddenBtn = document.getElementById("btn-find-invite");

    document.body.classList.add("curtain-active");

    if (waxSeal) {
        waxSeal.addEventListener("click", (e) => {
            // 🛡️ SECURITY STEP: If no token ID is present, block EVERYTHING instantly!
            if (!guestTokenID) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                showCustomAlert("NO_TOKEN_PROVIDED");
                return false;
            }

            // 🔓 VALID TOKEN CONFIRMED: Safe to wake up music and execute structural transitions!
            if (weddingMusic) {
                weddingMusic.volume = 0.5;
                weddingMusic.play().catch(audioErr => console.warn(audioErr));
            }

            if (envelope) {
                envelope.classList.add("seal-broken");
            }

            if (curtain) {
                setTimeout(() => {
                    curtain.classList.add("hide-curtain");
                    document.body.classList.remove("curtain-active"); 
                }, 500);
            }
            
            // 🔓 ACTIVATE SLIDER: Unlock the track layer to allow physical pointer drags
            if (sliderTrack) {
                sliderTrack.classList.remove("disabled-slider");
                initSliderDragEngine();
            }
        });
    }

     // --------------------------------------------------------------------------
    // 🎛️ DRAG LOGIC CALCULATOR: RE-TUNED FOR MOBILE TOUCH & COUPLING CAPE
    // --------------------------------------------------------------------------
    function initSliderDragEngine() {
        if (!sliderHandle || !sliderTrack || !hiddenBtn) return;

        const sliderCape = document.getElementById("iphone-slider-cape");
        let isDragging = false;
        let startX = 0;

        function startDrag(e) {
            isDragging = true;
            // ✔️ FIXED: Correctly extracts the touch coordinates from array index 0
            const clientX = e.touches && e.touches.length ? e.touches[0].pageX : e.pageX;
            startX = clientX - sliderHandle.offsetLeft;
            
            sliderHandle.style.transition = 'none';
            if (sliderCape) sliderCape.style.transition = 'none';
        }

        function doDrag(e) {
            if (!isDragging) return;
            
            // Prevent mobile phones from bouncing or scrolling the page while dragging the knob
            if (e.cancelable) e.preventDefault();
            
            // ✔️ FIXED: Correctly extracts moving touch paths from array index 0
            const currentX = e.touches && e.touches.length ? e.touches[0].pageX : e.pageX;
            let leftPosition = currentX - startX;
            const maxDelta = sliderTrack.clientWidth - sliderHandle.clientWidth - 4;

            // Constrain handle movement inside the track boundaries
            if (leftPosition < 2) leftPosition = 2;
            if (leftPosition > maxDelta) leftPosition = maxDelta;

            const currentTranslateX = leftPosition - 2;
            sliderHandle.style.transform = "translateX(" + currentTranslateX + "px)";

            // 🧥 THE CAPE COUPLING: Smoothly expands the curtain background behind the path
            if (sliderCape) {
                // Expanding the cape box past the center radius ensures complete font coverage
                sliderCape.style.width = (leftPosition + 25) + "px"; 
            }

            // 🎯 ACTION THRESHOLD REACHED (Pulled past 95% of the total width)
            if (leftPosition >= maxDelta - 2) {
                isDragging = false;
                sliderHandle.style.transform = "translateX(" + (maxDelta - 2) + "px)";
                if (sliderCape) sliderCape.style.width = "100%";
                
                hiddenBtn.disabled = false;
                hiddenBtn.click();
            }
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            
            // Snap back smoothly if let go midway
            sliderHandle.style.transition = 'transform 0.2s ease-out';
            sliderHandle.style.transform = 'translateX(0px)';
            
            if (sliderCape) {
                sliderCape.style.transition = 'width 0.2s ease-out';
                sliderCape.style.width = '0px';
            }
        }

        // Mouse listeners for desktop computers
        sliderHandle.addEventListener("mousedown", startDrag);
        window.addEventListener("mousemove", doDrag);
        window.addEventListener("mouseup", endDrag);

        // Touch listeners for mobile smartphones
        sliderHandle.addEventListener("touchstart", startDrag, { passive: true });
        window.addEventListener("touchmove", doDrag, { passive: false });
        window.addEventListener("touchend", endDrag);
    }

});

// --------------------------------------------------------------------------
// 🔍 CHECKPOINT 2: NETWORK HOOK (EXECUTED BEHIND THE SCENES BY THE SLIDER)
// --------------------------------------------------------------------------
document.getElementById('btn-find-invite').addEventListener('click', function() {
    const btn = this;
    if (!guestTokenID) {
        showCustomAlert("NO_TOKEN_PROVIDED");
        return;
    }
    
    const ringImage = document.querySelector('.event-meta img');
    if (ringImage) {
        ringImage.classList.add('spin-active');
    }
    
    btn.disabled = true;
    btn.textContent = 'Searching...';

    const finalUrl = SCRIPT_URL + "?id=" + encodeURIComponent(guestTokenID);
    
    fetch(finalUrl)
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;
            btn.textContent = 'View My Invitation';
            
            if (data.error) {
                if (ringImage) ringImage.classList.remove('spin-active');
                showCustomAlert("RSVP_ALREADY_COMPLETED");
            } else {
                currentReservationData = data;
                setupConfigurationScreen(data);
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.textContent = 'View My Invitation';
            if (ringImage) ringImage.classList.remove('spin-active');
            showCustomAlert("We couldn't connect to the guest database. Please try again.");
        });
});



// PRODUCTION ROUTER VIEWPORT TRANSITION ENGINE
function switchScreen(targetScreen) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    
    targetScreen.classList.add('active');

    window.scrollTo(0, 0);
}

// SECURE MASTER MODAL MANAGER (WITH STICKY SECURITY WALL)
function showCustomAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const msgElement = document.getElementById('modal-alert-message');
    const modalTitle = modal ? modal.querySelector('.modal-title') : null;
    const modalEmoji = modal ? modal.querySelector('.modal-emoji') : null;
    const closeBtn = document.getElementById('btn-close-modal');

    if (!modal || !msgElement) return;

    const checkStr = String(message).toLowerCase().trim();
    if (checkStr.includes("no_token_provided") || checkStr.includes("personal link required")) {
        if (modalEmoji) modalEmoji.textContent = "🔒";
        if (modalTitle) modalTitle.textContent = "LINK REQUIRED";
        msgElement.innerHTML = "Welcome! 💗 Please access this wedding suite using the unique personal link sent to you by the couple to view your interactive invitation details.";
        if (closeBtn) closeBtn.style.display = 'none';
        modal.onclick = null;
    } 
    else if (checkStr.includes("completed") || checkStr.includes("already")) {
        if (modalEmoji) modalEmoji.textContent = "🔒";
        if (modalTitle) modalTitle.textContent = "DETAILS SECURED";
        msgElement.innerHTML = "Oh snap! It looks like an RSVP has already been safely locked in for this household group. If you need to make changes, just drop Joshua or Jonahmir a message! 💜";
        if (closeBtn) closeBtn.style.display = 'inline-block';
        
        closeBtn.onclick = function() { modal.classList.remove('show'); };
        modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('show'); };
    } 
    else if (checkStr.includes("selection") || checkStr.includes("every guest")) {
        if (modalEmoji) modalEmoji.textContent = "🥺";
        if (modalTitle) modalTitle.textContent = "SELECTION REQUIRED";
        msgElement.innerHTML = "Hold on! Please make a selection for every guest before moving forward. Let's make sure everyone is accounted for! ✨";
        if (closeBtn) closeBtn.style.display = 'inline-block';
        
        closeBtn.onclick = function() { modal.classList.remove('show'); };
        modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('show'); };
    }

    modal.classList.add('show');
}



document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('btn-close-modal');
    const modal = document.getElementById('custom-alert-modal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    }
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
// PRODUCTION RSVP SUBMISSION SHEET PUSH ENGINE (CONFETTI RE-TIMED)
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
            
            // 🎬 SCENARIO 1: Guest is attending. Wait for the 7.4-second intro to finish!
            setTimeout(() => {
                cinematicScreen.classList.add('fade-out-curtain');
                
                // 🎉 BURST CONFETTI the exact millisecond the curtain starts dropping!
                triggerWeddingConfetti(); 
                
                setTimeout(() => {
                    cinematicScreen.classList.remove('activated-curtain');
                }, 800);
            }, 7400);

        } else {
            // 😴 SCENARIO 2: No one is attending. Skip intro and burst confetti instantly!
            if (cinematicScreen) cinematicScreen.style.display = 'none';
            switchScreen(screens.success);
            triggerWeddingConfetti();
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
// PRODUCTION CELEBRATION CONFETTI ENGINE (GENERATOR BLOCK)
function triggerWeddingConfetti() {
    const wrapper = document.getElementById('confetti-wrapper');
    if (!wrapper) return;

    // Wipe out any old remnants from previous tests
    wrapper.innerHTML = '';

    // A collection of luxury celebration colors: Lavenders, Purples, Golds, and White
    const weddingColors = ['#e3d4ef', '#513d5c', '#c1a5d9', '#ffffff', '#f4effa'];
    const totalPiecesCount = 80; // Perfectly dense without causing low-end device lag

    for (let i = 0; i < totalPiecesCount; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');

        // Randomize the starting positions across the width of your success card
        piece.style.left = Math.random() * 100 + '%';

        // Mix up the size, speeds, and delays so the drop feels natural and organic
        const randomSize = Math.floor(Math.random() * 6) + 6; // 6px to 12px
        piece.style.width = randomSize + 'px';
        piece.style.height = randomSize + 'px';
        
        piece.style.animationDuration = (Math.random() * 2) + 2.5 + 's'; // 2.5s to 4.5s
        piece.style.animationDelay = (Math.random() * 1.5) + 's'; // Staggers the fall patterns
        piece.style.backgroundColor = weddingColors[Math.floor(Math.random() * weddingColors.length)];

        wrapper.appendChild(piece);
    }
}
// ==========================================================================
// 🌸 FROSTED SHEET REVEAL INTERACTION CORE
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const btnStartConfirm = document.getElementById("btn-start-confirm");
    const btnFlipBack = document.getElementById("btn-flip-back");
    
    const welcomeSheet = document.getElementById("rsvp-welcome-sheet");
    const selectionSheet = document.getElementById("rsvp-selection-sheet");

    // 👉 GLIDE FORWARD: Reveal the RSVP Selection Form Sheet
    if (btnStartConfirm && welcomeSheet && selectionSheet) {
        btnStartConfirm.addEventListener("click", () => {
            console.log("[🎬 VIEW SELECTION] Fading out welcome summary, gliding up rsvp forms...");
            
            // Swap the animation tracking classes
            welcomeSheet.classList.remove("active-sheet");
            welcomeSheet.classList.add("hidden-sheet");

            selectionSheet.classList.remove("hidden-sheet");
            selectionSheet.classList.add("active-sheet");
            
            // Instantly scrolls to the top of the card so mobile users see the header text cleanly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 👈 SLIDE BACKWARD: Return to the initial Welcome Greeting Summary Sheet
    if (btnFlipBack && welcomeSheet && selectionSheet) {
        btnFlipBack.addEventListener("click", () => {
            console.log("[🎬 RETURN SUMMARY] Sliding back to overview grid...");
            
            selectionSheet.classList.remove("active-sheet");
            selectionSheet.classList.add("hidden-sheet");

            welcomeSheet.classList.remove("hidden-sheet");
            welcomeSheet.classList.add("active-sheet");
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});




