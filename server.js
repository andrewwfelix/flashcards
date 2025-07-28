const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { loadFlashcardsFromPOSFiles, loadSpecificPartOfSpeech } = require('./load_from_pos_files');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Function to load flashcards from JSON file
function loadFlashcardsFromJSON() {
  try {
    const jsonContent = fs.readFileSync('italian_flashcards.json', 'utf8');
    const data = JSON.parse(jsonContent);
    
    // Transform JSON structure to match existing API format
    const flashcards = data.flashcards.map(card => ({
      id: card.id,
      question: card.word,
      answer: card.translations.join('/'),
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
    
    console.log(`✅ Loaded ${flashcards.length} flashcards from JSON with examples and cognates!`);
    return flashcards;
  } catch (error) {
    console.error('❌ Error loading JSON file, trying CSV fallback:', error.message);
    return loadFlashcardsFromCSVFallback();
  }
}

// Fallback CSV loader if JSON fails
function loadFlashcardsFromCSVFallback() {
  try {
    const csvContent = fs.readFileSync('top_1000_italian_words.csv', 'utf8');
    const lines = csvContent.split('\n');
    const flashcards = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',');
        if (values.length >= 5) {
          flashcards.push({
            id: i,
            question: values[0],
            answer: values[1],
            category: values[2],
            difficulty: values[3],
            part_of_speech: values[4],
                                translations: values[1].split('/'),
                    examples: [],
                                      cognates: [],
                  conjugations: null,
                  etymology: null,
                  related_english_words: []
          });
        }
      }
    }
    
    console.log(`📁 Loaded ${flashcards.length} flashcards from CSV fallback`);
    return flashcards;
  } catch (error) {
    console.error('❌ Error loading CSV file, using hardcoded fallback:', error.message);
    return getFallbackFlashcards();
  }
}

// Fallback flashcards if CSV loading fails
function getFallbackFlashcards() {
  return [
  // Italian Nouns
  { id: 1, question: "casa", answer: "house", category: "Italian", difficulty: "Easy", part_of_speech: "Noun", translations: ["house", "home"], examples: [], cognates: [], conjugations: null, etymology: null, related_english_words: [] },
      { id: 2, question: "acqua", answer: "water", category: "Italian", difficulty: "Easy", part_of_speech: "Noun", translations: ["water"], examples: [], cognates: [], conjugations: null, etymology: null, related_english_words: [] },
    { id: 3, question: "pane", answer: "bread", category: "Italian", difficulty: "Easy", part_of_speech: "Noun", translations: ["bread"], examples: [], cognates: [], conjugations: null, etymology: null, related_english_words: [] },
  { id: 4, question: "tempo", answer: "time", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 5, question: "uomo", answer: "man", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 6, question: "donna", answer: "woman", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 7, question: "bambino", answer: "child", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 8, question: "mondo", answer: "world", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 9, question: "vita", answer: "life", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 10, question: "mano", answer: "hand", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 11, question: "occhio", answer: "eye", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 12, question: "giorno", answer: "day", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 13, question: "notte", answer: "night", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 14, question: "anno", answer: "year", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 15, question: "paese", answer: "country", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 16, question: "città", answer: "city", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 17, question: "strada", answer: "street", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 18, question: "macchina", answer: "car", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 19, question: "lavoro", answer: "work", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 20, question: "scuola", answer: "school", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 21, question: "famiglia", answer: "family", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 22, question: "amico", answer: "friend", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 23, question: "denaro", answer: "money", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 24, question: "numero", answer: "number", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 25, question: "parte", answer: "part", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 26, question: "gruppo", answer: "group", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 27, question: "problema", answer: "problem", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 28, question: "posto", answer: "place", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 29, question: "caso", answer: "case", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },
  { id: 30, question: "fatto", answer: "fact", category: "Italian", difficulty: "Easy", part_of_speech: "Noun" },

  // Italian Verbs
  { id: 31, question: "essere", answer: "to be", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 32, question: "avere", answer: "to have", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 33, question: "fare", answer: "to do/make", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 34, question: "dire", answer: "to say", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 35, question: "andare", answer: "to go", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 36, question: "potere", answer: "to be able", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 37, question: "dovere", answer: "to have to", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 38, question: "volere", answer: "to want", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 39, question: "sapere", answer: "to know", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 40, question: "dare", answer: "to give", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 41, question: "stare", answer: "to stay", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 42, question: "vedere", answer: "to see", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 43, question: "venire", answer: "to come", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 44, question: "uscire", answer: "to go out", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 45, question: "parlare", answer: "to speak", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 46, question: "trovare", answer: "to find", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 47, question: "portare", answer: "to bring", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 48, question: "lasciare", answer: "to leave", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 49, question: "mettere", answer: "to put", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },
  { id: 50, question: "sentire", answer: "to hear/feel", category: "Italian", difficulty: "Medium", part_of_speech: "Verb" },

  // Italian Adjectives
  { id: 51, question: "grande", answer: "big/large", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 52, question: "piccolo", answer: "small", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 53, question: "nuovo", answer: "new", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 54, question: "vecchio", answer: "old", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 55, question: "buono", answer: "good", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 56, question: "cattivo", answer: "bad", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 57, question: "bello", answer: "beautiful", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 58, question: "brutto", answer: "ugly", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 59, question: "giovane", answer: "young", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 60, question: "lungo", answer: "long", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 61, question: "corto", answer: "short", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 62, question: "alto", answer: "tall/high", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 63, question: "basso", answer: "short/low", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 64, question: "facile", answer: "easy", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },
  { id: 65, question: "difficile", answer: "difficult", category: "Italian", difficulty: "Easy", part_of_speech: "Adjective" },

  // Italian Greetings
  { id: 66, question: "ciao", answer: "hello/goodbye", category: "Italian", difficulty: "Easy", part_of_speech: "Greeting" },
  { id: 67, question: "buongiorno", answer: "good morning", category: "Italian", difficulty: "Easy", part_of_speech: "Greeting" },
  { id: 68, question: "buonasera", answer: "good evening", category: "Italian", difficulty: "Easy", part_of_speech: "Greeting" },
  { id: 69, question: "buonanotte", answer: "good night", category: "Italian", difficulty: "Easy", part_of_speech: "Greeting" },
  { id: 70, question: "salve", answer: "hello", category: "Italian", difficulty: "Easy", part_of_speech: "Greeting" },
  { id: 71, question: "arrivederci", answer: "goodbye", category: "Italian", difficulty: "Easy", part_of_speech: "Greeting" },

  // Italian Expressions
  { id: 72, question: "grazie", answer: "thank you", category: "Italian", difficulty: "Easy", part_of_speech: "Expression" },
  { id: 73, question: "prego", answer: "you're welcome", category: "Italian", difficulty: "Easy", part_of_speech: "Expression" },
  { id: 74, question: "scusi", answer: "excuse me (formal)", category: "Italian", difficulty: "Easy", part_of_speech: "Expression" },
  { id: 75, question: "scusa", answer: "excuse me (informal)", category: "Italian", difficulty: "Easy", part_of_speech: "Expression" },
  { id: 76, question: "mi dispiace", answer: "I'm sorry", category: "Italian", difficulty: "Easy", part_of_speech: "Expression" },
  { id: 77, question: "per favore", answer: "please", category: "Italian", difficulty: "Easy", part_of_speech: "Expression" },

  // Italian Adverbs
  { id: 78, question: "molto", answer: "very/much", category: "Italian", difficulty: "Easy", part_of_speech: "Adverb" },
  { id: 79, question: "più", answer: "more", category: "Italian", difficulty: "Easy", part_of_speech: "Adverb" },
  { id: 80, question: "meno", answer: "less", category: "Italian", difficulty: "Easy", part_of_speech: "Adverb" },
  { id: 81, question: "sempre", answer: "always", category: "Italian", difficulty: "Easy", part_of_speech: "Adverb" },
  { id: 82, question: "mai", answer: "never", category: "Italian", difficulty: "Easy", part_of_speech: "Adverb" },
  { id: 83, question: "oggi", answer: "today", category: "Italian", difficulty: "Medium", part_of_speech: "Adverb" },
  { id: 84, question: "ieri", answer: "yesterday", category: "Italian", difficulty: "Medium", part_of_speech: "Adverb" },
  { id: 85, question: "domani", answer: "tomorrow", category: "Italian", difficulty: "Medium", part_of_speech: "Adverb" },

  // Italian Questions
  { id: 86, question: "come stai?", answer: "how are you? (informal)", category: "Italian", difficulty: "Easy", part_of_speech: "Question" },
  { id: 87, question: "come sta?", answer: "how are you? (formal)", category: "Italian", difficulty: "Easy", part_of_speech: "Question" },
  { id: 88, question: "che cosa fai?", answer: "what are you doing?", category: "Italian", difficulty: "Easy", part_of_speech: "Question" },
  { id: 89, question: "dove vai?", answer: "where are you going?", category: "Italian", difficulty: "Easy", part_of_speech: "Question" },
  { id: 90, question: "quanto costa?", answer: "how much does it cost?", category: "Italian", difficulty: "Medium", part_of_speech: "Question" }
  ];
}

// Initialize flashcards by loading from part-of-speech files, with fallbacks
let flashcards = loadFlashcardsFromPOSFiles() || loadFlashcardsFromJSON();

// API Routes

// Get all flashcards
app.get('/api/flashcards', (req, res) => {
  res.json(flashcards);
});

// Get flashcard by ID
app.get('/api/flashcards/:id', (req, res) => {
  const flashcard = flashcards.find(fc => fc.id === parseInt(req.params.id));
  if (!flashcard) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }
  res.json(flashcard);
});

// Create new flashcard
app.post('/api/flashcards', (req, res) => {
  const { question, answer, category, difficulty, part_of_speech } = req.body;
  
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const newFlashcard = {
    id: flashcards.length > 0 ? Math.max(...flashcards.map(fc => fc.id)) + 1 : 1,
    question,
    answer,
    category: category || 'General',
    difficulty: difficulty || 'Medium',
    part_of_speech: part_of_speech || 'General'
  };

  flashcards.push(newFlashcard);
  res.status(201).json(newFlashcard);
});

// Update flashcard
app.put('/api/flashcards/:id', (req, res) => {
  const { question, answer, category, difficulty, part_of_speech } = req.body;
  const flashcardIndex = flashcards.findIndex(fc => fc.id === parseInt(req.params.id));
  
  if (flashcardIndex === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  flashcards[flashcardIndex] = {
    ...flashcards[flashcardIndex],
    question: question || flashcards[flashcardIndex].question,
    answer: answer || flashcards[flashcardIndex].answer,
    category: category || flashcards[flashcardIndex].category,
    difficulty: difficulty || flashcards[flashcardIndex].difficulty,
    part_of_speech: part_of_speech || flashcards[flashcardIndex].part_of_speech
  };

  res.json(flashcards[flashcardIndex]);
});

// Delete flashcard
app.delete('/api/flashcards/:id', (req, res) => {
  const flashcardIndex = flashcards.findIndex(fc => fc.id === parseInt(req.params.id));
  
  if (flashcardIndex === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  const deletedFlashcard = flashcards.splice(flashcardIndex, 1)[0];
  res.json(deletedFlashcard);
});

// Get flashcards by category
app.get('/api/flashcards/category/:category', (req, res) => {
  const categoryFlashcards = flashcards.filter(fc => 
    fc.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(categoryFlashcards);
});



// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Flashcard app running on http://localhost:${PORT}`);
}); 