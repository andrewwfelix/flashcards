// Global variables
let flashcards = [];
let currentStudyCards = [];
let currentStudyIndex = 0;
let isCardFlipped = false;
let knownCardIds = new Set(); // Track cards marked as known in this session

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const flashcardsGrid = document.getElementById('flashcards-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const createForm = document.getElementById('create-flashcard-form');
const importForm = document.getElementById('import-form');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-flashcard-form');

// Study mode elements
const startStudyBtn = document.getElementById('start-study');
const flipCardBtn = document.getElementById('flip-card');
const prevCardBtn = document.getElementById('prev-card');
const nextCardBtn = document.getElementById('next-card');
const navigationButtons = document.querySelector('.navigation-buttons');
const markKnownBtn = document.getElementById('mark-known');
const keepStudyingBtn = document.getElementById('keep-studying');
const actionButtons = document.querySelector('.action-buttons');
const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');
const studyProgress = document.getElementById('study-progress');
const studyCategory = document.getElementById('study-category');
const studyPartOfSpeechFilter = document.getElementById('study-part-of-speech-filter');
const studyQuestion = document.getElementById('study-question');
const studyAnswerBack = document.getElementById('study-answer-back');
const studyCard = document.getElementById('study-card');

// Enhanced learning elements
const examplesSection = document.getElementById('examples-section');
const cognatesSection = document.getElementById('cognates-section');
const conjugationsSection = document.getElementById('conjugations-section');
const etymologySection = document.getElementById('etymology-section');
const relatedWordsSection = document.getElementById('related-words-section');
const examplesList = document.getElementById('examples-list');
const cognatesList = document.getElementById('cognates-list');
const conjugationsList = document.getElementById('conjugations-list');
const etymologyContent = document.getElementById('etymology-content');
const relatedWordsList = document.getElementById('related-words-list');

// API base URL
const API_BASE = '/api/flashcards';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadFlashcards();
    setupEventListeners();
});

// Event listeners setup
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Search and filter
    searchInput.addEventListener('input', filterFlashcards);
    categoryFilter.addEventListener('change', filterFlashcards);

    // Create form
    createForm.addEventListener('submit', handleCreateFlashcard);
    document.getElementById('clear-form').addEventListener('click', clearCreateForm);

    // Import form
    if (importForm) {
        console.log('Import form found, adding event listener');
        importForm.addEventListener('submit', handleImportFlashcards);
    } else {
        console.error('Import form not found!');
    }

    // Study mode
    startStudyBtn.addEventListener('click', startStudyMode);
    flipCardBtn.addEventListener('click', flipCard);
    prevCardBtn.addEventListener('click', goToPreviousCard);
    nextCardBtn.addEventListener('click', goToNextCard);
    markKnownBtn.addEventListener('click', markCardAsKnown);
    keepStudyingBtn.addEventListener('click', keepCardForStudying);
    studyCard.addEventListener('click', flipCard);
    studyPartOfSpeechFilter.addEventListener('change', handleStudyFilterChange);
    
    // Keyboard shortcuts for study mode
    document.addEventListener('keydown', handleKeyboardShortcuts);
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => handleDifficultyRating(btn.dataset.difficulty));
    });
    


    // Modal
    document.querySelector('.close').addEventListener('click', closeEditModal);
    document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', handleEditFlashcard);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// View switching
function switchView(viewName) {
    // Update navigation buttons
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });

    // Hide/show header for full-screen study mode
    const header = document.querySelector('.header');
    const container = document.querySelector('.container');
    const mainContent = document.querySelector('.main-content');
    
    if (viewName === 'study') {
        header.style.display = 'none';
        document.body.style.overflow = 'hidden';
        // Override container constraints for full-screen
        container.style.maxWidth = 'none';
        container.style.margin = '0';
        container.style.padding = '0';
        mainContent.style.margin = '0';
        mainContent.style.padding = '0';
    } else {
        header.style.display = 'block';
        document.body.style.overflow = 'auto';
        // Restore container styles
        container.style.maxWidth = '';
        container.style.margin = '';
        container.style.padding = '';
        mainContent.style.margin = '';
        mainContent.style.padding = '';
        resetStudyMode();
    }
}

// API functions
async function loadFlashcards() {
    try {
        const response = await fetch(API_BASE);
        flashcards = await response.json();
        renderFlashcards(flashcards);
    } catch (error) {
        console.error('Error loading flashcards:', error);
        showNotification('Error loading flashcards', 'error');
    }
}

async function createFlashcard(flashcardData) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flashcardData),
        });

        if (response.ok) {
            const newFlashcard = await response.json();
            flashcards.push(newFlashcard);
            renderFlashcards(flashcards);
            showNotification('Flashcard created successfully!', 'success');
            clearCreateForm();
        } else {
            throw new Error('Failed to create flashcard');
        }
    } catch (error) {
        console.error('Error creating flashcard:', error);
        showNotification('Error creating flashcard', 'error');
    }
}

async function updateFlashcard(id, flashcardData) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flashcardData),
        });

        if (response.ok) {
            const updatedFlashcard = await response.json();
            const index = flashcards.findIndex(fc => fc.id === id);
            if (index !== -1) {
                flashcards[index] = updatedFlashcard;
                renderFlashcards(flashcards);
            }
            showNotification('Flashcard updated successfully!', 'success');
            closeEditModal();
        } else {
            throw new Error('Failed to update flashcard');
        }
    } catch (error) {
        console.error('Error updating flashcard:', error);
        showNotification('Error updating flashcard', 'error');
    }
}

async function deleteFlashcard(id) {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            flashcards = flashcards.filter(fc => fc.id !== id);
            renderFlashcards(flashcards);
            showNotification('Flashcard deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete flashcard');
        }
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        showNotification('Error deleting flashcard', 'error');
    }
}

// Render functions
function renderFlashcards(cardsToRender) {
    flashcardsGrid.innerHTML = '';

    if (cardsToRender.length === 0) {
        flashcardsGrid.innerHTML = '<div class="loading">No flashcards found</div>';
        return;
    }

    cardsToRender.forEach(flashcard => {
        const flashcardElement = createFlashcardElement(flashcard);
        flashcardsGrid.appendChild(flashcardElement);
    });
}

function createFlashcardElement(flashcard) {
    const div = document.createElement('div');
    div.className = 'flashcard-item';
    div.innerHTML = `
        <div class="flashcard-header">
            <span class="flashcard-category">${flashcard.category}</span>
            <span class="flashcard-difficulty ${flashcard.difficulty.toLowerCase()}">${flashcard.difficulty}</span>
        </div>
        <div class="flashcard-question">${flashcard.question}</div>
        <div class="flashcard-answer">${flashcard.answer}</div>
        <div class="flashcard-tags">
            ${flashcard.part_of_speech ? `<span class="flashcard-part-of-speech">${flashcard.part_of_speech}</span>` : ''}
        </div>
        <div class="flashcard-actions">
            <button class="btn btn-secondary edit-btn" data-id="${flashcard.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger delete-btn" data-id="${flashcard.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    // Add event listeners
    div.querySelector('.edit-btn').addEventListener('click', () => openEditModal(flashcard));
    div.querySelector('.delete-btn').addEventListener('click', () => deleteFlashcard(flashcard.id));

    return div;
}

// Filter functions
function filterFlashcards() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPartOfSpeech = categoryFilter.value;

    let filteredCards = flashcards.filter(flashcard => {
        const matchesSearch = flashcard.question.toLowerCase().includes(searchTerm) ||
                            flashcard.answer.toLowerCase().includes(searchTerm);
        const matchesPartOfSpeech = !selectedPartOfSpeech || flashcard.part_of_speech === selectedPartOfSpeech;
        
        return matchesSearch && matchesPartOfSpeech;
    });

    renderFlashcards(filteredCards);
}

// Form handlers
function handleCreateFlashcard(e) {
    e.preventDefault();
    
    const formData = new FormData(createForm);
    const flashcardData = {
        question: formData.get('question'),
        answer: formData.get('answer'),
        category: formData.get('category'),
        difficulty: formData.get('difficulty'),
        part_of_speech: formData.get('part_of_speech')
    };

    createFlashcard(flashcardData);
}

function clearCreateForm() {
    createForm.reset();
}

async function handleImportFlashcards(e) {
    e.preventDefault();
    console.log('Import form submitted!');
    
    const formData = new FormData(importForm);
    const file = formData.get('csvFile');
    console.log('Selected file:', file);
    
    if (!file || file.size === 0) {
        showNotification('Please select a CSV file', 'error');
        return;
    }
    
    try {
        const uploadFormData = new FormData();
        uploadFormData.append('csvFile', file);
        
        const response = await fetch('/api/flashcards/import', {
            method: 'POST',
            body: uploadFormData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message, 'success');
            loadFlashcards(); // Reload flashcards to show imported ones
            importForm.reset();
            document.getElementById('import-results').classList.add('hidden');
        } else {
            showNotification(result.error || 'Import failed', 'error');
        }
    } catch (error) {
        console.error('Error importing flashcards:', error);
        showNotification('Error importing flashcards', 'error');
    }
}

function openEditModal(flashcard) {
    document.getElementById('edit-id').value = flashcard.id;
    document.getElementById('edit-question').value = flashcard.question;
    document.getElementById('edit-answer').value = flashcard.answer;
    document.getElementById('edit-category').value = flashcard.category;
    document.getElementById('edit-difficulty').value = flashcard.difficulty;
    document.getElementById('edit-part-of-speech').value = flashcard.part_of_speech || 'General';
    
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
}

function handleEditFlashcard(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('edit-id').value);
    const flashcardData = {
        question: document.getElementById('edit-question').value,
        answer: document.getElementById('edit-answer').value,
        category: document.getElementById('edit-category').value,
        difficulty: document.getElementById('edit-difficulty').value,
        part_of_speech: document.getElementById('edit-part-of-speech').value
    };

    updateFlashcard(id, flashcardData);
}

// Study mode functions
function startStudyMode() {
    if (flashcards.length === 0) {
        showNotification('No flashcards available for study', 'error');
        return;
    }

    applyStudyFilter();
    currentStudyIndex = 0;
    isCardFlipped = false;
    
    if (currentStudyCards.length === 0) {
        showNotification('No flashcards match the selected filter', 'error');
        return;
    }
    
    // Shuffle the cards at the start for random order
    shuffleStudyCards();
    showNotification('🔀 Cards shuffled! Ready to study...', 'success');
    
    updateStudyUI();
    showCurrentCard();
    
    startStudyBtn.classList.add('hidden');
    flipCardBtn.classList.remove('hidden');
    navigationButtons.classList.remove('hidden');
    actionButtons.classList.remove('hidden');
    difficultyButtons.forEach(btn => btn.classList.remove('hidden'));
    
    updateNavigationButtons();
}

function showCurrentCard() {
    if (currentStudyIndex >= currentStudyCards.length) {
        showStudyComplete();
        return;
    }

    const currentCard = currentStudyCards[currentStudyIndex];
    console.log('Showing card:', currentCard);
    
    // Temporarily disable transition to prevent flash
    studyCard.style.transition = 'none';
    
    // Ensure card is on question side first
    studyCard.classList.remove('flipped');
    isCardFlipped = false;
    
    // Update content
    studyQuestion.textContent = currentCard.question;
    studyAnswerBack.textContent = currentCard.answer;
    console.log('Set answer text to:', currentCard.answer);
    
    // Populate enhanced data
            populateExamples(currentCard.examples || []);
        populateCognates(currentCard.cognates || []);
        populateConjugations(currentCard.conjugations);
        populateEtymology(currentCard.etymology);
        populateRelatedEnglishWords(currentCard.related_english_words || []);
    
    // Re-enable transition after a brief moment
    setTimeout(() => {
        studyCard.style.transition = '';
    }, 10);
    
    updateStudyProgress();
}

function flipCard() {
    console.log('Flip card called, current state:', isCardFlipped);
    console.log('Answer text:', studyAnswerBack.textContent);
    if (isCardFlipped) {
        studyCard.classList.remove('flipped');
        isCardFlipped = false;
        console.log('Flipped to question side');
    } else {
        studyCard.classList.add('flipped');
        isCardFlipped = true;
        console.log('Flipped to answer side');
    }
}

function goToPreviousCard() {
    if (currentStudyIndex > 0) {
        currentStudyIndex--;
        showCurrentCard();
        updateNavigationButtons();
    }
}

function goToNextCard() {
    if (currentStudyCards.length === 0) {
        showStudyComplete();
        return;
    }
    
    if (currentStudyIndex < currentStudyCards.length - 1) {
        currentStudyIndex++;
        showCurrentCard();
        updateNavigationButtons();
    } else {
        // Auto-shuffle and restart seamlessly
        showNotification('🔀 Auto-shuffling deck...', 'info');
        
        // Brief delay to show the shuffle notification
        setTimeout(() => {
            shuffleStudyCards();
            currentStudyIndex = 0;
            showCurrentCard();
            updateNavigationButtons();
            showNotification('✨ Fresh deck ready! Keep studying...', 'success');
        }, 800);
    }
}

function updateNavigationButtons() {
    // Disable/enable previous button
    prevCardBtn.disabled = currentStudyIndex === 0;
    
    // Update next button text
    if (currentStudyCards.length === 0) {
        nextCardBtn.textContent = 'Complete';
        nextCardBtn.disabled = true;
    } else if (currentStudyIndex === currentStudyCards.length - 1) {
        nextCardBtn.textContent = 'Next → (Auto-Shuffle)';
    } else {
        nextCardBtn.textContent = 'Next →';
    }
    
    // Re-enable button if it was disabled
    if (currentStudyCards.length > 0) {
        nextCardBtn.disabled = false;
    }
}

// Fisher-Yates shuffle algorithm
function shuffleStudyCards() {
    for (let i = currentStudyCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentStudyCards[i], currentStudyCards[j]] = [currentStudyCards[j], currentStudyCards[i]];
    }
}

function applyStudyFilter() {
    const selectedPartOfSpeech = studyPartOfSpeechFilter.value;
    
    // Filter by part of speech first
    let filteredCards;
    if (!selectedPartOfSpeech) {
        filteredCards = [...flashcards];
    } else {
        filteredCards = flashcards.filter(card => 
            card.part_of_speech === selectedPartOfSpeech
        );
    }
    
    // Then filter out known cards
    currentStudyCards = filteredCards.filter(card => 
        !knownCardIds.has(card.id)
    );
}

function handleStudyFilterChange() {
    if (currentStudyCards.length > 0) {
        // If study mode is active, restart with new filter
        applyStudyFilter();
        currentStudyIndex = 0;
        
        if (currentStudyCards.length === 0) {
            showNotification('No flashcards match the selected filter', 'error');
            resetStudyMode();
            return;
        }
        
        updateStudyUI();
        showCurrentCard();
        updateNavigationButtons();
    }
}

function markCardAsKnown() {
    if (currentStudyIndex < currentStudyCards.length) {
        const currentCard = currentStudyCards[currentStudyIndex];
        knownCardIds.add(currentCard.id);
        
        // Remove the card from current study session
        currentStudyCards.splice(currentStudyIndex, 1);
        
        // Show notification
        showNotification(`"${currentCard.question}" marked as known! 🎉`, 'success');
        
        // Adjust index if we're at the end
        if (currentStudyIndex >= currentStudyCards.length) {
            if (currentStudyCards.length === 0) {
                showStudyComplete();
                return;
            }
            currentStudyIndex = currentStudyCards.length - 1;
        }
        
        updateStudyUI();
        showCurrentCard();
        updateNavigationButtons();
    }
}

function keepCardForStudying() {
    // Just move to next card without marking as known
    goToNextCard();
}

function handleKeyboardShortcuts(event) {
    // Only handle shortcuts when in study mode
    if (currentStudyCards.length === 0 || startStudyBtn.classList.contains('hidden') === false) {
        return;
    }
    
    switch(event.key.toLowerCase()) {
        case ' ': // Spacebar - flip card
            event.preventDefault();
            flipCard();
            break;
        case 'k': // K - mark as known
            event.preventDefault();
            markCardAsKnown();
            break;
        case 'n': // N - next card
            event.preventDefault();
            goToNextCard();
            break;
        case 'p': // P - previous card
            event.preventDefault();
            goToPreviousCard();
            break;
        case 'arrowright': // Right arrow - next
            event.preventDefault();
            goToNextCard();
            break;
        case 'arrowleft': // Left arrow - previous
            event.preventDefault();
            goToPreviousCard();
            break;
    }
}

function handleDifficultyRating(difficulty) {
    // In a real app, you might track difficulty ratings
    // For now, just move to the next card
    currentStudyIndex++;
    showCurrentCard();
}

function updateStudyProgress() {
    studyProgress.textContent = `${currentStudyIndex + 1} / ${currentStudyCards.length}`;
}

function showStudyComplete() {
    const totalKnown = knownCardIds.size;
    const selectedPartOfSpeech = studyPartOfSpeechFilter.value;
    const categoryText = selectedPartOfSpeech ? selectedPartOfSpeech : 'All Parts of Speech';
    
    studyCard.innerHTML = `
        <div class="card-content">
            <h3>🎉 Mastery Achieved!</h3>
            <p>You know all cards in <strong>${categoryText}</strong>!</p>
            <p><strong>${totalKnown} cards marked as known</strong> this session! 🌟</p>
            <p>Change the filter to study other word types, or start a new session to review everything again.</p>
        </div>
    `;
    
    flipCardBtn.classList.add('hidden');
    navigationButtons.classList.add('hidden');
    actionButtons.classList.add('hidden');
    difficultyButtons.forEach(btn => btn.classList.add('hidden'));
    startStudyBtn.classList.remove('hidden');
    startStudyBtn.textContent = 'Start New Session';
}

function resetStudyMode() {
    currentStudyCards = [];
    currentStudyIndex = 0;
    isCardFlipped = false;
    
    studyQuestion.textContent = 'Click "Start Study" to begin';
    studyAnswerBack.textContent = '';
    
    startStudyBtn.classList.remove('hidden');
    flipCardBtn.classList.add('hidden');
    navigationButtons.classList.add('hidden');
    actionButtons.classList.add('hidden');
    difficultyButtons.forEach(btn => btn.classList.add('hidden'));
    
    // Reset card display
    studyCard.classList.remove('flipped');
    
    updateStudyProgress();
}

function updateStudyUI() {
    studyProgress.textContent = `${currentStudyIndex + 1} / ${currentStudyCards.length}`;
    
    const selectedPartOfSpeech = studyPartOfSpeechFilter.value;
    if (selectedPartOfSpeech) {
        studyCategory.textContent = selectedPartOfSpeech;
    } else {
        studyCategory.textContent = 'All Parts of Speech';
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#48bb78';
            break;
        case 'error':
            notification.style.backgroundColor = '#f56565';
            break;
        default:
            notification.style.backgroundColor = '#667eea';
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced Learning Functions



// Populate examples section
function populateExamples(examples) {
    if (!examples || examples.length === 0) {
        examplesSection.style.display = 'none';
        return;
    }
    
    examplesList.innerHTML = '';
    
    // Limit to first 2 examples to keep card readable
    const limitedExamples = examples.slice(0, 2);
    
    limitedExamples.forEach(example => {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example-item';
        
        exampleDiv.innerHTML = `
            <div class="example-italian">"${example.italian}"</div>
            <div class="example-english">"${example.english}"</div>
            <div class="example-context">Context: ${example.context}</div>
        `;
        
        examplesList.appendChild(exampleDiv);
    });
    
    examplesSection.style.display = 'block';
}

// Populate cognates section
function populateCognates(cognates) {
    if (!cognates || cognates.length === 0) {
        cognatesSection.style.display = 'none';
        return;
    }
    
    cognatesList.innerHTML = '';
    
    const cognatesContainer = document.createElement('div');
    cognatesContainer.className = 'cognates-container';
    
    // Limit to first 5 cognates to keep card readable
    const limitedCognates = cognates.slice(0, 5);
    
    limitedCognates.forEach(cognate => {
        const cognateTag = document.createElement('span');
        cognateTag.className = 'cognate-tag';
        cognateTag.textContent = cognate;
        cognatesContainer.appendChild(cognateTag);
    });
    
    cognatesList.appendChild(cognatesContainer);
    cognatesSection.style.display = 'block';
}

// Populate conjugations section
function populateConjugations(conjugations) {
    conjugationsList.innerHTML = '';
    
    if (conjugations && Object.keys(conjugations).length > 0) {
        const conjugationGrid = document.createElement('div');
        conjugationGrid.className = 'conjugation-grid';
        
        // Convert to array and split into two columns
        const conjugationEntries = Object.entries(conjugations);
        const leftColumn = conjugationEntries.slice(0, 3); // First 3
        const rightColumn = conjugationEntries.slice(3, 6); // Last 3
        
        // Create left column
        const leftColumnDiv = document.createElement('div');
        leftColumnDiv.className = 'conjugation-column';
        
        leftColumn.forEach(([pronoun, verb]) => {
            const conjugationItem = document.createElement('div');
            conjugationItem.className = 'conjugation-item';
            
            conjugationItem.innerHTML = `
                <span class="conjugation-pronoun">${pronoun}:</span>
                <span class="conjugation-verb">${verb}</span>
            `;
            
            leftColumnDiv.appendChild(conjugationItem);
        });
        
        // Create right column
        const rightColumnDiv = document.createElement('div');
        rightColumnDiv.className = 'conjugation-column';
        
        rightColumn.forEach(([pronoun, verb]) => {
            const conjugationItem = document.createElement('div');
            conjugationItem.className = 'conjugation-item';
            
            conjugationItem.innerHTML = `
                <span class="conjugation-pronoun">${pronoun}:</span>
                <span class="conjugation-verb">${verb}</span>
            `;
            
            rightColumnDiv.appendChild(conjugationItem);
        });
        
        conjugationGrid.appendChild(leftColumnDiv);
        conjugationGrid.appendChild(rightColumnDiv);
        
        conjugationsList.appendChild(conjugationGrid);
        conjugationsSection.style.display = 'block';
    } else {
        conjugationsSection.style.display = 'none';
    }
}

// Populate etymology section
function populateEtymology(etymology) {
    if (!etymology) {
        etymologySection.style.display = 'none';
        return;
    }
    
    etymologyContent.innerHTML = '';
    
    const etymologyDiv = document.createElement('div');
    etymologyDiv.className = 'etymology-item';
    
    etymologyDiv.innerHTML = `
        <div class="etymology-origin">Origin: ${etymology.origin}</div>
        <div class="etymology-source">From: ${etymology.source} (${etymology.meaning})</div>
        <div class="etymology-notes">${etymology.notes}</div>
    `;
    
    etymologyContent.appendChild(etymologyDiv);
    etymologySection.style.display = 'block';
}

// Populate related English words section
function populateRelatedEnglishWords(relatedWords) {
    if (!relatedWords || relatedWords.length === 0) {
        relatedWordsSection.style.display = 'none';
        return;
    }
    
    relatedWordsList.innerHTML = '';
    
    // Limit to first 4 related words to keep card readable
    const limitedWords = relatedWords.slice(0, 4);
    
    // Create compact single-line format for each word
    const wordStrings = limitedWords.map(wordInfo => 
        `${wordInfo.word}; ${wordInfo.meaning}; "${wordInfo.usage}"`
    );
    
    // Join all words with bullet separators on one line
    relatedWordsList.innerHTML = wordStrings.join(' • ');
    
    relatedWordsSection.style.display = 'block';
}

 