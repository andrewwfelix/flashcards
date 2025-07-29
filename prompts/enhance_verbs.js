const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Italian Verb Enhancement System
// Uses OpenAI GPT-4o-mini to enhance and improve verb flashcard data
// Actually updates the data/verb.json file with enhanced content
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to create the enhancement prompt for a verb
function createVerbEnhancementPrompt(verb) {
    return `You are an expert Italian language instructor and linguist specializing in verb conjugation and etymology. Your task is to enhance a single Italian verb entry from a flashcard dataset. 

**CURRENT ENTRY:**
Word: ${verb.word}
Translations: ${verb.translations.join(', ')}
Current Examples: ${JSON.stringify(verb.examples, null, 2)}
Current Conjugations: ${JSON.stringify(verb.conjugations, null, 2)}
Current Cognates: ${JSON.stringify(verb.cognates || [], null, 2)}

**YOUR TASK:**
Enhance this entry by improving ALL sections and adding conjugation pattern classification. Provide natural, educational, and accurate content.

**CONJUGATION PATTERN CLASSIFICATION:**
- **regular_are**: Regular -are verbs (1st conjugation) 
- **regular_ere**: Regular -ere verbs (2nd conjugation)
- **regular_ire**: Regular -ire verbs (3rd conjugation, simple)
- **regular_ire_isc**: Regular -ire verbs with -isc- infix (3rd conjugation)
- **semi_irregular**: Follows pattern but with stem/spelling changes
- **irregular**: Highly irregular, doesn't follow standard patterns

**REQUIREMENTS:**
1. **Examples**: Create 3-4 practical sentences showing different tenses (present, past, future) and contexts
2. **Etymology**: Provide detailed, accurate etymology with precise meaning and evolutionary notes
3. **Related English Words**: List 2-3 English words derived from the same root with meanings and usage examples
4. **Cognates**: Provide cognate words (derivatives and related terms)
5. **Conjugation Classification**: Classify the verb's conjugation pattern
6. **Usage Notes**: Include register, common phrases, grammatical tips

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "word": "${verb.word}",
  "translations": ${JSON.stringify(verb.translations)},
  "part_of_speech": "Verb",
  "difficulty": "${verb.difficulty}",
  "category": "${verb.category}",
  "examples": [
    {
      "italian": "Natural Italian sentence using ${verb.word}",
      "english": "Natural English translation",
      "context": "Specific context or scenario",
      "tense": "present/past/future/conditional"
    }
  ],
  "conjugations": ${JSON.stringify(verb.conjugations)},
  "conjugation_pattern": {
    "type": "regular_are|regular_ere|regular_ire|regular_ire_isc|semi_irregular|irregular",
    "description": "Clear explanation of the conjugation pattern",
    "notes": "Any special conjugation rules or irregularities"
  },
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
  ],
  "usage_notes": {
    "register": "formal/informal/neutral - when to use this verb",
    "common_phrases": ["phrase 1", "phrase 2"],
    "grammatical_tips": "Important grammar notes, auxiliary verb usage, etc."
  }

**CRITICAL: Ensure all JSON is perfectly valid. In common_phrases array, use ONLY the Italian phrases without explanations. Do not add parenthetical explanations inside array elements.**
}`;
}

// Function to enhance a single verb with OpenAI
async function enhanceVerbWithAI(verb) {
    try {
        console.log(`🔧 Enhancing: ${verb.word}`);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert Italian language instructor specializing in verb conjugation patterns and etymology. Enhance flashcard entries with accurate, educational content including conjugation classification. CRITICAL: Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax."
                },
                {
                    role: "user", 
                    content: createVerbEnhancementPrompt(verb)
                }
            ],
            temperature: 0.1, // Very low for consistency
            max_tokens: 3000
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse the JSON response
        try {
            // Clean up the response
            const cleanResponse = response.replace(/```json\n?|```\n?/g, '').trim();
            const enhancedVerb = JSON.parse(cleanResponse);
            
            // Ensure the enhanced verb has all required fields
            const finalVerb = {
                id: verb.id, // Keep original ID
                word: enhancedVerb.word || verb.word,
                translations: enhancedVerb.translations || verb.translations,
                part_of_speech: "Verb",
                difficulty: enhancedVerb.difficulty || verb.difficulty,
                category: enhancedVerb.category || verb.category,
                examples: enhancedVerb.examples || verb.examples,
                conjugations: verb.conjugations, // Keep original conjugations (they're good!)
                conjugation_pattern: enhancedVerb.conjugation_pattern || null,
                etymology: enhancedVerb.etymology || null,
                related_english_words: enhancedVerb.related_english_words || [],
                cognates: enhancedVerb.cognates || verb.cognates || [],
                usage_notes: enhancedVerb.usage_notes || null
            };
            
            return {
                success: true,
                enhanced: finalVerb
            };
        } catch (parseError) {
            console.error(`❌ JSON parse error for ${verb.word}:`, parseError.message);
            console.error('Raw response:', response);
            return {
                success: false,
                error: 'Invalid JSON response',
                original: verb
            };
        }

    } catch (error) {
        console.error(`❌ API error for ${verb.word}:`, error.message);
        return {
            success: false,
            error: error.message,
            original: verb
        };
    }
}

// Function to enhance a range of verbs and update the file
async function enhanceVerbRange(startId, endId) {
    try {
        // Load verb data
        const verbsPath = path.join(__dirname, '..', 'data', 'verb.json');
        const verbsData = JSON.parse(fs.readFileSync(verbsPath, 'utf8'));
        
        console.log(`🚀 Starting enhancement of verbs ${startId}-${endId}...`);
        
        // Filter to the requested range
        const targetVerbs = verbsData.flashcards.filter(verb => 
            verb.id >= startId && verb.id <= endId
        );
        
        if (targetVerbs.length === 0) {
            console.log(`❌ No verbs found in range ${startId}-${endId}`);
            return;
        }
        
        console.log(`📝 Found ${targetVerbs.length} verbs to enhance`);
        
        let enhanced = 0;
        let failed = 0;
        
        // Create a copy of the original data to modify
        const updatedData = { ...verbsData };
        
        // Process each verb
        for (const verb of targetVerbs) {
            const result = await enhanceVerbWithAI(verb);
            
            if (result.success) {
                // Find the verb in the original data and replace it
                const index = updatedData.flashcards.findIndex(v => v.id === verb.id);
                if (index !== -1) {
                    updatedData.flashcards[index] = result.enhanced;
                    enhanced++;
                    console.log(`✅ ${verb.word}: Enhanced successfully`);
                }
            } else {
                failed++;
                console.log(`❌ ${verb.word}: Enhancement failed - ${result.error}`);
            }
            
            // Add a small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Save the updated data back to the file
        if (enhanced > 0) {
            // Create a backup first
            const backupPath = verbsPath + `.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, JSON.stringify(verbsData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
            
            // Write the enhanced data
            fs.writeFileSync(verbsPath, JSON.stringify(updatedData, null, 2));
            console.log(`💾 Updated ${enhanced} verbs in data/verb.json`);
        }
        
        console.log(`\n📊 Enhancement Summary:`);
        console.log(`✅ Enhanced: ${enhanced}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 Total in range: ${targetVerbs.length}`);
        
    } catch (error) {
        console.error('❌ Error during enhancement:', error.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('📋 Usage: node enhance_verbs.js <start_id> <end_id>');
        console.log('📋 Example: node enhance_verbs.js 1 5  (enhance verbs with IDs 1 through 5)');
        process.exit(1);
    }
    
    const startId = parseInt(args[0]);
    const endId = parseInt(args[1]);
    
    if (isNaN(startId) || isNaN(endId) || startId < 1 || endId < startId) {
        console.log('❌ Invalid range. Start and end must be positive numbers, and start must be <= end');
        process.exit(1);
    }
    
    console.log('🔧 Starting verb enhancement system...');
    await enhanceVerbRange(startId, endId);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    enhanceVerbWithAI,
    enhanceVerbRange
}; 