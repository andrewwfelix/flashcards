const fs = require('fs');
const path = require('path');

// Function to load flashcards from individual part-of-speech files
function loadFlashcardsFromPOSFiles() {
    try {
        const dataDir = 'data';
        
        // First, check if data directory exists
        if (!fs.existsSync(dataDir)) {
            console.log('❌ Data directory not found, falling back to main JSON file');
            return null;
        }
        
        // Load the index file to get the list of available files
        const indexPath = path.join(dataDir, 'index.json');
        if (!fs.existsSync(indexPath)) {
            console.log('❌ Index file not found, falling back to main JSON file');
            return null;
        }
        
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        console.log(`📂 Loading flashcards from ${Object.keys(indexData.files).length} part-of-speech files...`);
        
        let allFlashcards = [];
        let totalLoaded = 0;
        
        // Load each part-of-speech file
        Object.entries(indexData.files).forEach(([pos, fileInfo]) => {
            try {
                const filePath = path.join(dataDir, fileInfo.filename);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const posData = JSON.parse(fileContent);
                
                // Transform each flashcard to match the expected format
                const transformedCards = posData.flashcards.map(card => ({
                    id: card.id,
                    question: card.word,
                    answer: card.translations.join('/'), // Keep original answer format for compatibility
                    category: card.category,
                    difficulty: card.difficulty,
                    part_of_speech: card.part_of_speech,
                    // New rich data
                    translations: card.translations,
                    examples: card.examples || [],
                    cognates: card.cognates || [],
                    conjugations: card.conjugations || null,
                    etymology: card.etymology || null,
                    related_english_words: card.related_english_words || []
                }));
                
                allFlashcards = allFlashcards.concat(transformedCards);
                totalLoaded += transformedCards.length;
                
                console.log(`  ✅ Loaded ${transformedCards.length} ${pos} words from ${fileInfo.filename}`);
                
            } catch (error) {
                console.error(`  ❌ Error loading ${fileInfo.filename}:`, error.message);
            }
        });
        
        // Sort by ID to maintain consistent order
        allFlashcards.sort((a, b) => a.id - b.id);
        
        console.log(`📊 Successfully loaded ${totalLoaded} flashcards from part-of-speech files!`);
        return allFlashcards;
        
    } catch (error) {
        console.error('❌ Error loading from part-of-speech files:', error.message);
        return null;
    }
}

// Function to load a specific part of speech
function loadSpecificPartOfSpeech(partOfSpeech) {
    try {
        const filename = partOfSpeech.toLowerCase().replace(/\s+/g, '_') + '.json';
        const filePath = path.join('data', filename);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filename}`);
            return [];
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const posData = JSON.parse(fileContent);
        
        const transformedCards = posData.flashcards.map(card => ({
            id: card.id,
            question: card.word,
            answer: card.translations.join('/'),
            category: card.category,
            difficulty: card.difficulty,
            part_of_speech: card.part_of_speech,
            translations: card.translations,
            examples: card.examples || [],
            cognates: card.cognates || [],
            conjugations: card.conjugations || null,
            etymology: card.etymology || null,
            related_english_words: card.related_english_words || []
        }));
        
        console.log(`✅ Loaded ${transformedCards.length} ${partOfSpeech} words`);
        return transformedCards;
        
    } catch (error) {
        console.error(`❌ Error loading ${partOfSpeech}:`, error.message);
        return [];
    }
}

// Export functions for use in server
module.exports = {
    loadFlashcardsFromPOSFiles,
    loadSpecificPartOfSpeech
}; 