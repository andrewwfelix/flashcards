// Global variables
let flashcards = [];
let currentStudyCards = [];
let currentStudyIndex = 0;
let isCardFlipped = false;
let knownCardIds = new Set(); // Track cards marked as known in this session
let autoFlipTimer = null; // Timer for auto-flip functionality

// Audio Manager for pronunciation
class AudioManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.settings = {
            autoPlay: false,
            volume: 0.7,
            rate: 0.8,
            pitch: 1.0,
            language: 'it-IT'
        };
        this.isSpeaking = false;
        
        // Check if speech synthesis is supported
        if (!this.synthesis) {
            console.error('Speech synthesis not supported in this browser');
            return;
        }
        
        console.log('AudioManager initialized. Speech synthesis available:', !!this.synthesis);
        console.log('Available voices:', this.synthesis.getVoices().length);
    }

    speak(text, language = 'it-IT') {
        if (!this.synthesis) {
            console.error('Speech synthesis not available');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = this.settings.rate;
        utterance.volume = this.settings.volume;
        utterance.pitch = this.settings.pitch;

        utterance.onstart = () => {
            this.isSpeaking = true;
        };

        utterance.onend = () => {
            this.isSpeaking = false;
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
        };

        try {
            this.synthesis.speak(utterance);
        } catch (error) {
            console.error('Error starting speech synthesis:', error);
        }
    }

    stop() {
        this.synthesis.cancel();
        this.isSpeaking = false;
    }

    getVoices() {
        return this.synthesis.getVoices();
    }
}

// Initialize audio manager
const audioManager = new AudioManager();

// Test function for debugging - call this from console: testSpeech()
window.testSpeech = function() {
    console.log('Testing speech synthesis...');
    if (audioManager) {
        audioManager.speak('ciao', 'it-IT');
    } else {
        console.error('AudioManager not initialized');
    }
};

// Settings
let userSettings = {
    cardSize: 'medium',
    showContext: 'none',
    showCognates: 'none',
    showExamplesOnFront: 'disabled',
    examplesPerCard: 3,
    autoFlipDelay: 5,
    studyMode: 'random'
};

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

// Settings elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsForm = document.getElementById('settings-form');
const resetSettingsBtn = document.getElementById('reset-settings');
const cancelSettingsBtn = document.getElementById('cancel-settings');

// Audio test button
const testAudioBtn = document.getElementById('test-audio-btn');

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
const studyFrequencyFilter = document.getElementById('study-frequency-filter');
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

// Question-side conjugations elements (for verbs)
const questionConjugationsSection = document.getElementById('question-conjugations-section');
const questionConjugationsList = document.getElementById('question-conjugations-list');

// Question-side examples elements
const questionExamplesSection = document.getElementById('question-examples-section');
const questionExamplesList = document.getElementById('question-examples-list');

const etymologyContent = document.getElementById('etymology-content');
const relatedWordsList = document.getElementById('related-words-list');

// Conjunction-specific elements
const conjunctionClassificationSection = document.getElementById('conjunction-classification-section');
const conjunctionClassificationContent = document.getElementById('conjunction-classification-content');
const clauseConnectionSection = document.getElementById('clause-connection-section');
const clauseConnectionContent = document.getElementById('clause-connection-content');
const moodRequirementsSection = document.getElementById('mood-requirements-section');
const moodRequirementsContent = document.getElementById('mood-requirements-content');
const positionRulesSection = document.getElementById('position-rules-section');
const positionRulesContent = document.getElementById('position-rules-content');
const usageContextsSection = document.getElementById('usage-contexts-section');
const usageContextsContent = document.getElementById('usage-contexts-content');
const collocationsSection = document.getElementById('collocations-section');
const collocationsContent = document.getElementById('collocations-content');
const formalInformalSection = document.getElementById('formal-informal-section');
const formalInformalContent = document.getElementById('formal-informal-content');
const usageNotesSection = document.getElementById('usage-notes-section');
const usageNotesContent = document.getElementById('usage-notes-content');
const commonErrorsSection = document.getElementById('common-errors-section');
const commonErrorsContent = document.getElementById('common-errors-content');

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
    }

    // Settings
    settingsBtn.addEventListener('click', openSettingsModal);
    settingsForm.addEventListener('submit', handleSaveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
    cancelSettingsBtn.addEventListener('click', closeSettingsModal);
    
    // Study mode

    // Study mode
    startStudyBtn.addEventListener('click', startStudyMode);
    flipCardBtn.addEventListener('click', flipCard);
    prevCardBtn.addEventListener('click', goToPreviousCard);
    nextCardBtn.addEventListener('click', goToNextCard);
    markKnownBtn.addEventListener('click', markCardAsKnown);
    keepStudyingBtn.addEventListener('click', keepCardForStudying);
    studyCard.addEventListener('click', flipCard);
    studyPartOfSpeechFilter.addEventListener('change', handleStudyFilterChange);
    studyFrequencyFilter.addEventListener('change', handleStudyFilterChange);
    
    // Keyboard shortcuts for study mode
    document.addEventListener('keydown', handleKeyboardShortcuts);
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => handleDifficultyRating(btn.dataset.difficulty));
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (currentStudyCards.length > 0) {
            adjustCardHeight();
        }
    });
    


    // Modal
    document.querySelector('.close').addEventListener('click', closeEditModal);
    document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', handleEditFlashcard);
    
    // Audio test button
    if (testAudioBtn) {
        testAudioBtn.addEventListener('click', () => {
            console.log('Test audio button clicked');
            audioManager.speak('ciao', 'it-IT');
        });
    }
    
    // Event delegation for pronunciation click
    document.addEventListener('click', (event) => {
        // Find the word element by checking the target and its parents
        let element = event.target;
        let wordElement = null;
        
        // Check if target is an element
        if (element && element.nodeType === Node.ELEMENT_NODE) {
            // First check if the target itself is a word element
            if (element.classList.contains('flashcard-word')) {
                wordElement = element;
            } else if (element.classList.contains('flashcard-item')) {
                // Click is on the flashcard item, find the word element inside it
                const wordElementInside = element.querySelector('.flashcard-word');
                if (wordElementInside) {
                    wordElement = wordElementInside;
                }
            } else {
                // Check parent elements
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList.contains('flashcard-word')) {
                        wordElement = parent;
                        break;
                    } else if (parent.classList.contains('flashcard-item')) {
                        // Found flashcard item, look for word element inside
                        const wordElementInside = parent.querySelector('.flashcard-word');
                        if (wordElementInside) {
                            wordElement = wordElementInside;
                        }
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        } else {
            // If it's a text node, try to find the parent element
            if (event.target.parentElement) {
                element = event.target.parentElement;
                if (element.classList.contains('flashcard-word')) {
                    wordElement = element;
                }
            }
        }
        
        if (wordElement) {
            const italianWord = wordElement.getAttribute('data-pronounce');
            if (italianWord && !audioManager.isSpeaking) {
                audioManager.speak(italianWord, 'it-IT');
            }
        }
    }, true);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
        if (e.target === settingsModal) {
            closeSettingsModal();
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
        
        // Debug: Check if we have word_with_article data
        const nounsWithArticles = flashcards.filter(fc => 
            fc.part_of_speech === 'Noun' && fc.word_with_article
        );
        console.log(`Loaded ${flashcards.length} flashcards total`);
        console.log(`Found ${nounsWithArticles.length} nouns with articles`);
        if (nounsWithArticles.length > 0) {
            console.log('Sample noun with article:', nounsWithArticles[0]);
        }
        
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
    

    
    // For nouns, use the word with article if available
    const displayWord = (flashcard.part_of_speech === 'Noun' && flashcard.word_with_article) 
        ? flashcard.word_with_article 
        : flashcard.word || flashcard.question;
    
    // Get the Italian word for pronunciation
    // For nouns, use the word with article if available
    const italianWord = (flashcard.part_of_speech === 'Noun' && flashcard.word_with_article) 
        ? flashcard.word_with_article 
        : flashcard.word || flashcard.question;
    
    // Consistent bullet format for all cards: "il • the"
    div.innerHTML = `
        <div class="flashcard-content format-bullet">
            <span class="flashcard-word" data-pronounce="${italianWord}">${displayWord}</span>
            <span class="bullet"> • </span>
            <span class="flashcard-translation">${flashcard.answer}</span>
        </div>
    `;
    


    // Add data attributes for event delegation
    const wordElement = div.querySelector('.flashcard-word');
    if (wordElement) {
        wordElement.setAttribute('data-pronounce', italianWord);
        wordElement.setAttribute('data-part-of-speech', flashcard.part_of_speech);
    }

    return div;
}

// Filter functions
function filterFlashcards() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPartOfSpeech = categoryFilter.value;

    let filteredCards = flashcards.filter(flashcard => {
        // For nouns, also search in word_with_article
        const searchableWord = (flashcard.part_of_speech === 'Noun' && flashcard.word_with_article) 
            ? flashcard.word_with_article 
            : flashcard.question;
            
        const matchesSearch = searchableWord.toLowerCase().includes(searchTerm) ||
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
    
    // Temporarily disable transition to prevent flash
    studyCard.style.transition = 'none';
    
    // Ensure card is on question side first
    studyCard.classList.remove('flipped');
    isCardFlipped = false;
    
    // Update content
    // For nouns, use the word with article if available
    let displayWord;
    if (currentCard.part_of_speech === 'Noun' && currentCard.word_with_article) {
        displayWord = currentCard.word_with_article;
    } else {
        displayWord = currentCard.word || currentCard.question;
    }
    
    // Get the Italian word for pronunciation
    // For nouns, use the word with article if available
    const italianWord = (currentCard.part_of_speech === 'Noun' && currentCard.word_with_article) 
        ? currentCard.word_with_article 
        : currentCard.word || currentCard.question;
    
    // Set the display text and add pronunciation data
    studyQuestion.textContent = displayWord;
    studyQuestion.setAttribute('data-pronounce', italianWord);
    
    // Add hover event listeners for pronunciation in study mode
    studyQuestion.style.cursor = 'pointer';
    studyQuestion.title = 'Hover to hear pronunciation';
    studyQuestion.setAttribute('data-pronounce', italianWord);
    studyQuestion.setAttribute('data-part-of-speech', currentCard.part_of_speech);
    studyAnswerBack.textContent = currentCard.answer;
    
    // For verbs, show conjugations on the question side
    if (currentCard.part_of_speech === 'Verb' && currentCard.conjugations) {
        populateConjugationsInContainer(currentCard.conjugations, questionConjugationsList);
        questionConjugationsSection.style.display = 'block';
        // Hide conjugations on answer side since they're on question side
        conjugationsSection.style.display = 'none';
    } else {
        // Hide question-side conjugations for non-verbs
        questionConjugationsSection.style.display = 'none';
        // Show conjugations on answer side if they exist
        populateConjugations(currentCard.conjugations);
    }
    
    // Handle examples on question side if setting is enabled
    if (userSettings.showExamplesOnFront === 'enabled' && currentCard.examples && currentCard.examples.length > 0) {
        populateQuestionExamples(currentCard.examples);
    } else {
        questionExamplesSection.style.display = 'none';
    }
    
    // Populate other enhanced data with smart content management
    // Skip examples here for conjunctions since we handle them separately
    if (currentCard.part_of_speech !== 'Conjunction') {
        populateExamples(currentCard.examples || []);
    }
    
    // Hide cognates for nouns, verbs, and conjunctions to save space, show for other parts of speech
    if (currentCard.part_of_speech === 'Noun' || 
        currentCard.part_of_speech === 'Verb' || 
        currentCard.part_of_speech === 'Conjunction') {
        cognatesSection.style.display = 'none';
    } else {
        populateCognates(currentCard.cognates || []);
    }
    
    // Hide etymology and related words for conjunctions, show for others
    if (currentCard.part_of_speech === 'Conjunction') {
        etymologySection.style.display = 'none';
        relatedWordsSection.style.display = 'none';
    } else {
        // Always show etymology since it's valuable for learning
        populateEtymology(currentCard.etymology);
        
        // Only hide related words if there's substantial other content
        const hasManyOtherSections = (currentCard.examples && currentCard.examples.length > 1) && 
                                   currentCard.etymology;
        
        if (!hasManyOtherSections) {
            populateRelatedEnglishWords(currentCard.related_english_words || []);
        } else {
            // Only hide related words when there's really too much content
            relatedWordsSection.style.display = 'none';
        }
    }
    
    // Handle conjunction-specific display
    if (currentCard.part_of_speech === 'Conjunction') {
        // For conjunctions, hide all complex sections and show only examples
        hideConjunctionSections();
        // Override examples to show 3 for conjunctions
        populateConjunctionExamples(currentCard.examples || []);
    } else {
        // Hide conjunction sections for non-conjunction cards
        hideConjunctionSections();
    }
    
    // Re-enable transition after a brief moment
    setTimeout(() => {
        studyCard.style.transition = '';
        adjustCardHeight();
    }, 10);
    
    updateStudyProgress();
}

// Function to adjust card height based on content
function adjustCardHeight() {
    const questionSide = document.querySelector('.question-side');
    const answerSide = document.querySelector('.answer-side');
    const cardContent = document.querySelector('.card-content');
    const cardBack = document.querySelector('.card-back');
    
    // Get content heights with small buffer
    const questionHeight = questionSide.scrollHeight + 16;
    const answerHeight = answerSide.scrollHeight + 16;
    
    // Use the larger of the two heights, with minimum of 500px
    const targetHeight = Math.max(500, questionHeight, answerHeight);
    
    // Allow larger cards - cap at 90vh or 850px, whichever is smaller
    const maxHeight = Math.min(window.innerHeight * 0.9, 850);
    const finalHeight = Math.min(targetHeight, maxHeight);
    
    // Apply the height to card elements
    studyCard.style.height = `${finalHeight}px`;
    cardContent.style.height = `${finalHeight}px`;
    cardBack.style.height = `${finalHeight}px`;
    
    // Update the content areas with proper overflow handling
    const contentHeight = finalHeight - 32; // Account for reduced padding
    questionSide.style.height = `${contentHeight}px`;
    questionSide.style.maxHeight = `${contentHeight}px`;
    questionSide.style.overflowY = contentHeight < (questionSide.scrollHeight + 8) ? 'auto' : 'hidden';
    
    answerSide.style.height = `${contentHeight}px`;
    answerSide.style.maxHeight = `${contentHeight}px`;
    answerSide.style.overflowY = contentHeight < (answerSide.scrollHeight + 8) ? 'auto' : 'hidden';
}

function flipCard() {
    if (isCardFlipped) {
        studyCard.classList.remove('flipped');
        isCardFlipped = false;
    } else {
        studyCard.classList.add('flipped');
        isCardFlipped = true;
    }
    
    // Adjust height after flip animation completes
    setTimeout(() => {
        adjustCardHeight();
    }, 300);
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
        nextCardBtn.textContent = '🔄 Next (Shuffle)';
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
    const selectedFrequencyRange = studyFrequencyFilter.value;
    
    // Filter by part of speech first
    let filteredCards;
    if (!selectedPartOfSpeech) {
        filteredCards = [...flashcards];
    } else {
        filteredCards = flashcards.filter(card => 
            card.part_of_speech === selectedPartOfSpeech
        );
    }
    
    // Then filter by frequency range
    if (selectedFrequencyRange) {
        const [minFreq, maxFreq] = selectedFrequencyRange.split('-').map(Number);
        filteredCards = filteredCards.filter(card => {
            // Now each part of speech has IDs from 1 to N (frequency order)
            return card.id >= minFreq && card.id <= maxFreq;
        });
    }
    
    // Finally filter out known cards
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
    const selectedFrequencyRange = studyFrequencyFilter.value;
    
    let categoryText = '';
    
    // Add part of speech info
    if (selectedPartOfSpeech) {
        categoryText = selectedPartOfSpeech;
    } else {
        categoryText = 'All Parts of Speech';
    }
    
    // Add frequency range info
    if (selectedFrequencyRange) {
        const friendlyRangeNames = {
            '1-10': '🥇 Most Common (1-10)',
            '11-20': '🥈 Very Common (11-20)',
            '21-30': '🥉 Common (21-30)',
            '31-50': '📈 Frequent (31-50)',
            '51-100': '📊 Regular (51-100)',
            '101-200': '📚 Extended (101-200)',
            '201-500': '📖 Advanced (201-500)',
            '501-1000': '🎓 Expert (501-1000)'
        };
        categoryText += ` • ${friendlyRangeNames[selectedFrequencyRange]}`;
    }
    
    studyCategory.textContent = categoryText;
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
    
    // Get current card to determine how many examples to show
    const currentCard = currentStudyCards[currentStudyIndex];
    
    // Use settings for examples count
    const maxExamples = userSettings.examplesPerCard;
    const limitedExamples = examples.slice(0, maxExamples);
    
    limitedExamples.forEach(example => {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example-item';
        
        // Check settings for context display
        const shouldShowContext = shouldShowContextForPOS(currentCard?.part_of_speech);
        
        if (shouldShowContext) {
            exampleDiv.innerHTML = `
                <div class="example-italian">"${example.italian}"</div>
                <div class="example-english">"${example.english}"</div>
                <div class="example-context">Context: ${example.context}</div>
            `;
        } else {
            exampleDiv.innerHTML = `
                <div class="example-italian">"${example.italian}"</div>
                <div class="example-english">"${example.english}"</div>
            `;
        }
        
        examplesList.appendChild(exampleDiv);
    });
    
    examplesSection.style.display = 'block';
}

// Helper function to determine if context should be shown based on settings
function shouldShowContextForPOS(partOfSpeech) {
    switch (userSettings.showContext) {
        case 'all':
            return true;
        case 'none':
            return false;
        case 'nouns-only':
            return partOfSpeech === 'Noun';
        case 'verbs-only':
            return partOfSpeech === 'Verb';
        default:
            return false;
    }
}

// Populate examples specifically for conjunctions (show 3 examples)
function populateConjunctionExamples(examples) {
    if (!examples || examples.length === 0) {
        examplesSection.style.display = 'none';
        return;
    }
    
    examplesList.innerHTML = '';
    
    // Show up to 3 examples for conjunctions
    const limitedExamples = examples.slice(0, 3);
    
    limitedExamples.forEach(example => {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example-item';
        
        // For conjunctions, only show Italian and English, no context
        exampleDiv.innerHTML = `
            <div class="example-italian">"${example.italian}"</div>
            <div class="example-english">"${example.english}"</div>
        `;
        
        examplesList.appendChild(exampleDiv);
    });
    
    examplesSection.style.display = 'block';
}

// Populate examples on the question side (without English translation)
function populateQuestionExamples(examples) {
    if (!examples || examples.length === 0) {
        questionExamplesSection.style.display = 'none';
        return;
    }
    
    questionExamplesList.innerHTML = '';
    
    // Use the same number of examples as configured in settings
    const maxExamples = userSettings.examplesPerCard;
    const limitedExamples = examples.slice(0, maxExamples);
    
    limitedExamples.forEach(example => {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example-item';
        
        // Only show Italian text, no English translation or context
        exampleDiv.innerHTML = `
            <div class="example-italian">"${example.italian}"</div>
        `;
        
        questionExamplesList.appendChild(exampleDiv);
    });
    
    questionExamplesSection.style.display = 'block';
}

// Populate cognates section
function populateCognates(cognates) {
    if (!cognates || cognates.length === 0) {
        cognatesSection.style.display = 'none';
        return;
    }
    
    // Check if cognates should be shown for current part of speech
    const currentCard = currentStudyCards[currentStudyIndex];
    if (!shouldShowCognatesForPOS(currentCard?.part_of_speech)) {
        cognatesSection.style.display = 'none';
        return;
    }
    
    cognatesList.innerHTML = '';
    
    const cognatesContainer = document.createElement('div');
    cognatesContainer.className = 'cognates-container';
    
    // Limit to first 3 cognates to prevent scrolling
    const limitedCognates = cognates.slice(0, 3);
    
    limitedCognates.forEach(cognate => {
        const cognateTag = document.createElement('span');
        cognateTag.className = 'cognate-tag';
        cognateTag.textContent = cognate;
        cognatesContainer.appendChild(cognateTag);
    });
    
    cognatesList.appendChild(cognatesContainer);
    cognatesSection.style.display = 'block';
}

// Helper function to determine if cognates should be shown based on settings
function shouldShowCognatesForPOS(partOfSpeech) {
    switch (userSettings.showCognates) {
        case 'all':
            return true;
        case 'none':
            return false;
        case 'nouns-only':
            return partOfSpeech === 'Noun';
        case 'verbs-only':
            return partOfSpeech === 'Verb';
        default:
            return false;
    }
}

// Helper function to populate conjugations in any container
function populateConjugationsInContainer(conjugations, containerElement) {
    containerElement.innerHTML = '';
    
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
        
        containerElement.appendChild(conjugationGrid);
    }
}

// Populate conjugations section (for answer side)
function populateConjugations(conjugations) {
    populateConjugationsInContainer(conjugations, conjugationsList);
    
    if (conjugations && Object.keys(conjugations).length > 0) {
        conjugationsSection.style.display = 'block';
    } else {
        conjugationsSection.style.display = 'none';
    }
}

// Populate conjunction classification section
function populateConjunctionClassification(classification) {
    
    if (!classification) {
        conjunctionClassificationSection.style.display = 'none';
        return;
    }
    
    conjunctionClassificationContent.innerHTML = '';
    const classificationDiv = document.createElement('div');
    classificationDiv.className = 'conjunction-classification-item';
    
    classificationDiv.innerHTML = `
        <div class="classification-detail">
            <strong>Type:</strong> ${classification.type || 'Not specified'}
        </div>
        <div class="classification-detail">
            <strong>Function:</strong> ${classification.function || 'Not specified'}
        </div>
        <div class="classification-detail">
            <strong>Connects:</strong> ${classification.connects || 'Not specified'}
        </div>
    `;
    
    conjunctionClassificationContent.appendChild(classificationDiv);
    conjunctionClassificationSection.style.display = 'block';
}

// Populate clause connection section
function populateClauseConnection(connection) {
    if (!connection) {
        clauseConnectionSection.style.display = 'none';
        return;
    }
    
    clauseConnectionContent.innerHTML = '';
    
    if (connection.coordination && connection.coordination.examples && connection.coordination.examples.length > 0) {
        const coordDiv = document.createElement('div');
        coordDiv.className = 'clause-pattern';
        coordDiv.innerHTML = `
            <div class="pattern-type"><strong>Coordination:</strong></div>
            <div class="pattern-description">${connection.coordination.description}</div>
            <div class="pattern-examples">
                ${connection.coordination.examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
            </div>
        `;
        clauseConnectionContent.appendChild(coordDiv);
    }
    
    if (connection.subordination && connection.subordination.examples && connection.subordination.examples.length > 0) {
        const subDiv = document.createElement('div');
        subDiv.className = 'clause-pattern';
        subDiv.innerHTML = `
            <div class="pattern-type"><strong>Subordination:</strong></div>
            <div class="pattern-description">${connection.subordination.description}</div>
            <div class="pattern-examples">
                ${connection.subordination.examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
            </div>
        `;
        clauseConnectionContent.appendChild(subDiv);
    }
    
    clauseConnectionSection.style.display = clauseConnectionContent.children.length > 0 ? 'block' : 'none';
}

// Populate mood/tense requirements section
function populateMoodRequirements(requirements) {
    if (!requirements || Object.keys(requirements).length === 0) {
        moodRequirementsSection.style.display = 'none';
        return;
    }
    
    moodRequirementsContent.innerHTML = '';
    
    ['indicative', 'subjunctive', 'conditional'].forEach(mood => {
        if (requirements[mood] && requirements[mood].examples && requirements[mood].examples.length > 0) {
            const moodDiv = document.createElement('div');
            moodDiv.className = 'mood-requirement';
            moodDiv.innerHTML = `
                <div class="mood-type"><strong>${mood.charAt(0).toUpperCase() + mood.slice(1)}:</strong></div>
                <div class="mood-description">${requirements[mood].description}</div>
                <div class="mood-examples">
                    ${requirements[mood].examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
                </div>
            `;
            moodRequirementsContent.appendChild(moodDiv);
        }
    });
    
    moodRequirementsSection.style.display = moodRequirementsContent.children.length > 0 ? 'block' : 'none';
}

// Populate position rules section
function populatePositionRules(rules) {
    if (!rules) {
        positionRulesSection.style.display = 'none';
        return;
    }
    
    positionRulesContent.innerHTML = '';
    
    ['sentence_initial', 'between_clauses', 'with_punctuation'].forEach(position => {
        if (rules[position] && rules[position].examples && rules[position].examples.length > 0) {
            const posDiv = document.createElement('div');
            posDiv.className = 'position-rule';
            posDiv.innerHTML = `
                <div class="position-type"><strong>${position.replace('_', ' ').charAt(0).toUpperCase() + position.replace('_', ' ').slice(1)}:</strong></div>
                <div class="position-description">${rules[position].description}</div>
                <div class="position-examples">
                    ${rules[position].examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
                </div>
            `;
            positionRulesContent.appendChild(posDiv);
        }
    });
    
    positionRulesSection.style.display = positionRulesContent.children.length > 0 ? 'block' : 'none';
}

// Populate usage contexts section
function populateUsageContexts(contexts) {
    if (!contexts || Object.keys(contexts).length === 0) {
        usageContextsSection.style.display = 'none';
        return;
    }
    
    usageContextsContent.innerHTML = '';
    
    Object.entries(contexts).forEach(([contextName, contextData]) => {
        if (contextData.examples && contextData.examples.length > 0) {
            const contextDiv = document.createElement('div');
            contextDiv.className = 'usage-context';
            contextDiv.innerHTML = `
                <div class="context-name"><strong>${contextName.replace('_', ' ').charAt(0).toUpperCase() + contextName.replace('_', ' ').slice(1)}:</strong></div>
                <div class="context-meaning">${contextData.meaning}</div>
                <div class="context-examples">
                    ${contextData.examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
                </div>
            `;
            usageContextsContent.appendChild(contextDiv);
        }
    });
    
    usageContextsSection.style.display = usageContextsContent.children.length > 0 ? 'block' : 'none';
}

// Populate collocations section
function populateCollocations(collocations) {
    if (!collocations || collocations.length === 0) {
        collocationsSection.style.display = 'none';
        return;
    }
    
    collocationsContent.innerHTML = '';
    
    collocations.forEach(collocation => {
        const colDiv = document.createElement('div');
        colDiv.className = 'collocation-item';
        colDiv.innerHTML = `
            <div class="collocation-phrase"><strong>"${collocation.phrase}"</strong></div>
            <div class="collocation-meaning">${collocation.meaning}</div>
            <div class="collocation-example"><em>"${collocation.example}"</em></div>
        `;
        collocationsContent.appendChild(colDiv);
    });
    
    collocationsSection.style.display = 'block';
}

// Populate formal/informal section
function populateFormalInformal(formalVsInformal) {
    if (!formalVsInformal) {
        formalInformalSection.style.display = 'none';
        return;
    }
    
    formalInformalContent.innerHTML = '';
    
    if (formalVsInformal.formal && formalVsInformal.formal.examples && formalVsInformal.formal.examples.length > 0) {
        const formalDiv = document.createElement('div');
        formalDiv.className = 'register-type';
        formalDiv.innerHTML = `
            <div class="register-label"><strong>Formal:</strong></div>
            <div class="register-usage">${formalVsInformal.formal.usage}</div>
            <div class="register-examples">
                ${formalVsInformal.formal.examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
            </div>
        `;
        formalInformalContent.appendChild(formalDiv);
    }
    
    if (formalVsInformal.informal && formalVsInformal.informal.examples && formalVsInformal.informal.examples.length > 0) {
        const informalDiv = document.createElement('div');
        informalDiv.className = 'register-type';
        informalDiv.innerHTML = `
            <div class="register-label"><strong>Informal:</strong></div>
            <div class="register-usage">${formalVsInformal.informal.usage}</div>
            <div class="register-examples">
                ${formalVsInformal.informal.examples.slice(0, 1).map(ex => `<div class="example-item">"${ex}"</div>`).join('')}
            </div>
        `;
        formalInformalContent.appendChild(informalDiv);
    }
    
    formalInformalSection.style.display = formalInformalContent.children.length > 0 ? 'block' : 'none';
}

// Populate usage notes section
function populateUsageNotes(notes) {
    if (!notes || notes.length === 0) {
        usageNotesSection.style.display = 'none';
        return;
    }
    
    usageNotesContent.innerHTML = '';
    
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'usage-note-item';
        noteDiv.innerHTML = `<div class="note-text">${note}</div>`;
        usageNotesContent.appendChild(noteDiv);
    });
    
    usageNotesSection.style.display = 'block';
}

// Populate common errors section
function populateCommonErrors(errors) {
    if (!errors || errors.length === 0) {
        commonErrorsSection.style.display = 'none';
        return;
    }
    
    commonErrorsContent.innerHTML = '';
    
    errors.forEach(error => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'common-error-item';
        errorDiv.innerHTML = `
            <div class="error-mistake"><strong>Mistake:</strong> ${error.mistake}</div>
            <div class="error-correct"><strong>Correct:</strong> "${error.correct}"</div>
            <div class="error-incorrect"><strong>Incorrect:</strong> "${error.incorrect}"</div>
        `;
        commonErrorsContent.appendChild(errorDiv);
    });
    
    commonErrorsSection.style.display = 'block';
}

// Hide conjunction sections
function hideConjunctionSections() {
    conjunctionClassificationSection.style.display = 'none';
    clauseConnectionSection.style.display = 'none';
    moodRequirementsSection.style.display = 'none';
    positionRulesSection.style.display = 'none';
    usageContextsSection.style.display = 'none';
    collocationsSection.style.display = 'none';
    formalInformalSection.style.display = 'none';
    usageNotesSection.style.display = 'none';
    commonErrorsSection.style.display = 'none';
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
    
    // Handle both old format (source, notes) and new conjunction format (meaning, evolution)
    if (etymology.meaning && etymology.evolution) {
        // New conjunction format
        etymologyDiv.innerHTML = `
            <div class="etymology-source">From ${etymology.origin || 'Unknown'}: ${etymology.meaning}</div>
            <div class="etymology-notes">${etymology.evolution}</div>
        `;
    } else {
        // Old format for backwards compatibility
        etymologyDiv.innerHTML = `
            <div class="etymology-source">From ${etymology.origin || 'Unknown'}: ${etymology.source || 'Unknown'} ${etymology.meaning ? `(${etymology.meaning})` : ''}</div>
            <div class="etymology-notes">${etymology.notes || ''}</div>
        `;
    }
    
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
    
    // Limit to first 2 related words to prevent scrolling
    const limitedWords = relatedWords.slice(0, 2);
    
    // Create formatted entries with each word on its own line
    limitedWords.forEach(wordInfo => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'related-word-item';
        
        wordDiv.innerHTML = `
            <div class="related-word-name"><strong>${wordInfo.word}</strong></div>
            <div class="related-word-meaning">${wordInfo.meaning}</div>
            <div class="related-word-usage">"${wordInfo.usage}"</div>
        `;
        
        relatedWordsList.appendChild(wordDiv);
    });
    
    relatedWordsSection.style.display = 'block';
}

// Settings functions
function openSettingsModal() {
    loadSettings();
    settingsModal.style.display = 'block';
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
}

function loadSettings() {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('flashcardSettings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
    }
    
    // Populate form with current settings
    document.getElementById('card-size').value = userSettings.cardSize;
    document.getElementById('show-context').value = userSettings.showContext;
    document.getElementById('show-cognates').value = userSettings.showCognates;
    document.getElementById('show-examples-on-front').value = userSettings.showExamplesOnFront;
    document.getElementById('examples-per-card').value = userSettings.examplesPerCard;
    document.getElementById('auto-flip-delay').value = userSettings.autoFlipDelay;
    document.getElementById('study-mode').value = userSettings.studyMode;
}

function handleSaveSettings(e) {
    e.preventDefault();
    
    // Get form values
    userSettings = {
        cardSize: document.getElementById('card-size').value,
        showContext: document.getElementById('show-context').value,
        showCognates: document.getElementById('show-cognates').value,
        showExamplesOnFront: document.getElementById('show-examples-on-front').value,
        examplesPerCard: parseInt(document.getElementById('examples-per-card').value),
        autoFlipDelay: parseInt(document.getElementById('auto-flip-delay').value),
        studyMode: document.getElementById('study-mode').value
    };
    
    // Save to localStorage
    localStorage.setItem('flashcardSettings', JSON.stringify(userSettings));
    
    // Apply settings
    applySettings();
    
    // Close modal
    closeSettingsModal();
    
    // Show notification
    showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
    userSettings = {
        cardSize: 'medium',
        showContext: 'none',
        showCognates: 'none',
        showExamplesOnFront: 'disabled',
        examplesPerCard: 3,
        autoFlipDelay: 5,
        studyMode: 'random'
    };
    
    // Update form
    loadSettings();
    
    // Apply settings
    applySettings();
    
    // Show notification
    showNotification('Settings reset to defaults!', 'info');
}

function applySettings() {
    // Apply card size
    const card = document.querySelector('.flashcard-card');
    if (card) {
        // Remove existing size classes
        card.classList.remove('compact-size', 'medium-size', 'large-size');
        // Add new size class
        card.classList.add(`${userSettings.cardSize}-size`);
    }
    
    // If we're in study mode, refresh the current card to apply new settings
    // But preserve the flip state if the card is currently flipped
    if (currentStudyCards.length > 0) {
        const wasFlipped = isCardFlipped;
        showCurrentCard();
        // Restore flip state if it was flipped before
        if (wasFlipped) {
            studyCard.classList.add('flipped');
            isCardFlipped = true;
        }
    }
}

// Load settings on app start
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    applySettings();
});