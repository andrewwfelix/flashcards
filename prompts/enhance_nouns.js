const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Italian Noun Enhancement System
// Uses OpenAI GPT-4o-mini to enhance and improve noun flashcard data
// Actually updates the data/nouns.json file with enhanced content
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to create the enhancement prompt for a noun
function createNounEnhancementPrompt(noun) {
    return `You are an expert Italian language instructor and linguist. Your task is to enhance a single Italian noun entry from a flashcard dataset. 

**CURRENT ENTRY:**
Word: ${noun.word} (${noun.gender})
Translations: ${noun.translations.join(', ')}
Current Examples: ${JSON.stringify(noun.examples, null, 2)}
Current Etymology: ${JSON.stringify(noun.etymology, null, 2)}
Current Related English Words: ${JSON.stringify(noun.related_english_words, null, 2)}
Current Cognates: ${JSON.stringify(noun.cognates, null, 2)}

**YOUR TASK:**
Enhance this entry by improving ALL sections. Provide natural, educational, and accurate content.

**REQUIREMENTS:**
1. **Examples**: Create 2-3 practical, natural Italian sentences that clearly demonstrate different meanings/contexts of the word
2. **Etymology**: Provide detailed, accurate etymology with precise meaning and evolutionary notes
3. **Related English Words**: List 2-3 English words derived from the same root with meanings and usage examples
4. **Cognates**: Provide simple cognate words (usually just the word itself and obvious derivatives)

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "word": "${noun.word}",
  "gender": "${noun.gender}",
  "translations": ${JSON.stringify(noun.translations)},
  "part_of_speech": "Noun",
  "difficulty": "${noun.difficulty}",
  "category": "${noun.category}",
  "examples": [
    {
      "italian": "Natural Italian sentence using ${noun.word}",
      "english": "Natural English translation",
      "context": "Specific context or scenario where this is used"
    }
  ],
  "etymology": {
    "origin": "Language origin (e.g., Latin, Greek)",
    "source": "Original word",
    "meaning": "Detailed meaning of the original word",
    "notes": "Detailed explanation of how the word evolved to modern Italian"
  },
  "related_english_words": [
    {
      "word": "english_word",
      "meaning": "Clear definition",
      "usage": "Example sentence using the word"
    }
  ],
  "cognates": [
    "word1",
    "word2"
  ]
}`;
}

// Function to enhance a single noun with OpenAI
async function enhanceNounWithAI(noun) {
    try {
        console.log(`🔧 Enhancing: ${noun.word}`);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert Italian language instructor. Enhance flashcard entries with accurate, educational content. Respond only with valid JSON."
                },
                {
                    role: "user", 
                    content: createNounEnhancementPrompt(noun)
                }
            ],
            temperature: 0.1, // Very low for consistency
            max_tokens: 1500
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse the JSON response
        try {
            // Clean up the response
            const cleanResponse = response.replace(/```json\n?|```\n?/g, '').trim();
            const enhancedNoun = JSON.parse(cleanResponse);
            
            // Ensure the enhanced noun has all required fields
            const finalNoun = {
                id: noun.id, // Keep original ID
                word: enhancedNoun.word || noun.word,
                gender: enhancedNoun.gender || noun.gender,
                translations: enhancedNoun.translations || noun.translations,
                part_of_speech: "Noun",
                difficulty: enhancedNoun.difficulty || noun.difficulty,
                category: enhancedNoun.category || noun.category,
                examples: enhancedNoun.examples || noun.examples,
                etymology: enhancedNoun.etymology || noun.etymology,
                related_english_words: enhancedNoun.related_english_words || noun.related_english_words,
                cognates: enhancedNoun.cognates || noun.cognates
            };
            
            return {
                success: true,
                enhanced: finalNoun
            };
        } catch (parseError) {
            console.error(`❌ JSON parse error for ${noun.word}:`, parseError.message);
            console.error('Raw response:', response);
            return {
                success: false,
                error: 'Invalid JSON response',
                original: noun
            };
        }

    } catch (error) {
        console.error(`❌ API error for ${noun.word}:`, error.message);
        return {
            success: false,
            error: error.message,
            original: noun
        };
    }
}

// Function to enhance a range of nouns and update the file
async function enhanceNounRange(startId, endId) {
    try {
        // Load noun data
        const nounsPath = path.join(__dirname, '..', 'data', 'nouns.json');
        const nounsData = JSON.parse(fs.readFileSync(nounsPath, 'utf8'));
        
        console.log(`🚀 Starting enhancement of nouns ${startId}-${endId}...`);
        
        // Filter to the requested range
        const targetNouns = nounsData.flashcards.filter(noun => 
            noun.id >= startId && noun.id <= endId
        );
        
        if (targetNouns.length === 0) {
            console.log(`❌ No nouns found in range ${startId}-${endId}`);
            return;
        }
        
        console.log(`📝 Found ${targetNouns.length} nouns to enhance`);
        
        let enhanced = 0;
        let failed = 0;
        
        // Create a copy of the original data to modify
        const updatedData = { ...nounsData };
        
        // Process each noun
        for (const noun of targetNouns) {
            const result = await enhanceNounWithAI(noun);
            
            if (result.success) {
                // Find the noun in the original data and replace it
                const index = updatedData.flashcards.findIndex(n => n.id === noun.id);
                if (index !== -1) {
                    updatedData.flashcards[index] = result.enhanced;
                    enhanced++;
                    console.log(`✅ ${noun.word}: Enhanced successfully`);
                }
            } else {
                failed++;
                console.log(`❌ ${noun.word}: Enhancement failed - ${result.error}`);
            }
            
            // Add a small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Save the updated data back to the file
        if (enhanced > 0) {
            // Create a backup first
            const backupPath = nounsPath + `.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, JSON.stringify(nounsData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
            
            // Write the enhanced data
            fs.writeFileSync(nounsPath, JSON.stringify(updatedData, null, 2));
            console.log(`💾 Updated ${enhanced} nouns in data/nouns.json`);
        }
        
        console.log(`\n📊 Enhancement Summary:`);
        console.log(`✅ Enhanced: ${enhanced}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 Total in range: ${targetNouns.length}`);
        
    } catch (error) {
        console.error('❌ Error during enhancement:', error.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('📋 Usage: node enhance_nouns.js <start_id> <end_id>');
        console.log('📋 Example: node enhance_nouns.js 1 5  (enhance nouns with IDs 1 through 5)');
        process.exit(1);
    }
    
    const startId = parseInt(args[0]);
    const endId = parseInt(args[1]);
    
    if (isNaN(startId) || isNaN(endId) || startId < 1 || endId < startId) {
        console.log('❌ Invalid range. Start and end must be positive numbers, and start must be <= end');
        process.exit(1);
    }
    
    console.log('🔧 Starting noun enhancement system...');
    await enhanceNounRange(startId, endId);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    enhanceNounWithAI,
    enhanceNounRange
}; 