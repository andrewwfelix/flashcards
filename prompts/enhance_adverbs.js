const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Italian Adverb Enhancement System
// Uses OpenAI GPT-4o-mini to enhance and improve adverb flashcard data
// Actually updates the data/adverb.json file with enhanced content
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to create the enhancement prompt for an adverb
function createAdverbEnhancementPrompt(adverb) {
    return `You are an expert Italian language instructor and linguist specializing in adverb formation and usage. Your task is to enhance a single Italian adverb entry from a flashcard dataset. 

**CURRENT ENTRY:**
Word: ${adverb.word}
Translations: ${adverb.translations.join(', ')}
Current Examples: ${JSON.stringify(adverb.examples, null, 2)}

**YOUR TASK:**
Enhance this entry by improving ALL sections and adding adverb-specific educational content. Provide natural, educational, and grammatically correct content.

**ADVERB FORMATION CLASSIFICATION:**
- **regular_mente**: Adjective + -mente (veloce → velocemente, facile → facilmente)
- **irregular_formation**: Modified adjective + -mente (buono → bene, NOT buonamente)
- **original_adverb**: Native adverbs (già, ancora, sempre, mai)
- **adjective_as_adverb**: Invariable adjectives used as adverbs (forte, piano)

**FUNCTIONAL CATEGORIES:**
- **manner**: Come? (bene, male, velocemente) - How?
- **time**: Quando? (oggi, ieri, sempre, mai) - When?
- **place**: Dove? (qui, là, sopra, sotto) - Where?
- **quantity**: Quanto? (molto, poco, abbastanza) - How much?
- **frequency**: Quanto spesso? (sempre, spesso, mai) - How often?

**POSITION RULES:**
- **post_verb**: Usually after verb (parlo bene)
- **pre_verb**: Before verb for emphasis (bene parlo)
- **sentence_start**: Can start sentence (oggi vado...)
- **flexible**: Various positions possible

**REQUIREMENTS:**
1. **Examples**: Create 3-4 grammatically correct Italian sentences showing proper usage and position
2. **Formation Analysis**: Explain how the adverb is formed (if applicable)
3. **Functional Category**: What question does this adverb answer?
4. **Position Rules**: Where does this adverb typically go in sentences?
5. **Comparison Forms**: Comparative and superlative (if applicable)
6. **Etymology**: Detailed, accurate etymology with precise meaning and evolutionary notes
7. **Related English Words**: 2-3 English words derived from the same root with meanings and usage examples
8. **Usage Notes**: Include register, common phrases, grammatical tips

**CRITICAL GRAMMAR FIXES NEEDED:**
- "Parlo non" should be "Non parlo" (negation goes before verb)
- "Come interessante" should be "Che interessante!" or "Com'è interessante!"
- All examples must be grammatically correct and natural

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "word": "${adverb.word}",
  "translations": ${JSON.stringify(adverb.translations)},
  "part_of_speech": "Adverb",
  "difficulty": "${adverb.difficulty}",
  "category": "${adverb.category}",
  "examples": [
    {
      "italian": "Grammatically correct Italian sentence using ${adverb.word}",
      "english": "Natural English translation",
      "context": "Specific context or scenario"
    }
  ],
  "formation": {
    "type": "regular_mente|irregular_formation|original_adverb|adjective_as_adverb",
    "base_adjective": "adjective if applicable, or null",
    "description": "Clear explanation of how the adverb is formed",
    "formation_rule": "Detailed formation rule if applicable"
  },
  "function": {
    "type": "manner|time|place|quantity|frequency",
    "description": "What this adverb describes or modifies",
    "question_answered": "What question this adverb answers (Come?, Quando?, Dove?, etc.)"
  },
  "position": {
    "type": "post_verb|pre_verb|sentence_start|flexible",
    "description": "Where this adverb typically goes in sentences",
    "notes": "Any special position rules or emphasis changes"
  },
  "comparison": {
    "comparative": "comparative form (più + adverb or irregular)",
    "superlative": "superlative form (il più + adverb or irregular)",
    "notes": "Any irregular comparison notes or if not applicable"
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
    "register": "formal/informal/neutral - when to use this adverb",
    "common_phrases": ["phrase 1", "phrase 2"],
    "grammatical_tips": "Important grammar notes about position, formation, etc."
  }
}

**CRITICAL: Ensure all JSON is perfectly valid. In common_phrases array, use ONLY the Italian phrases without explanations. Do not add parenthetical explanations inside array elements.**`;
}

// Function to enhance a single adverb with OpenAI
async function enhanceAdverbWithAI(adverb) {
    try {
        console.log(`🔧 Enhancing: ${adverb.word}`);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert Italian language instructor specializing in adverb formation and usage patterns. Enhance flashcard entries with accurate, educational content including formation and functional classification. Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax. Fix all grammatical errors in examples."
                },
                {
                    role: "user", 
                    content: createAdverbEnhancementPrompt(adverb)
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
            const enhancedAdverb = JSON.parse(cleanResponse);
            
            // Ensure the enhanced adverb has all required fields
            const finalAdverb = {
                id: adverb.id, // Keep original ID
                word: enhancedAdverb.word || adverb.word,
                translations: enhancedAdverb.translations || adverb.translations,
                part_of_speech: "Adverb",
                difficulty: enhancedAdverb.difficulty || adverb.difficulty,
                category: enhancedAdverb.category || adverb.category,
                examples: enhancedAdverb.examples || adverb.examples,
                formation: enhancedAdverb.formation || null,
                function: enhancedAdverb.function || null,
                position: enhancedAdverb.position || null,
                comparison: enhancedAdverb.comparison || null,
                etymology: enhancedAdverb.etymology || null,
                related_english_words: enhancedAdverb.related_english_words || [],
                cognates: enhancedAdverb.cognates || [],
                usage_notes: enhancedAdverb.usage_notes || null
            };
            
            return {
                success: true,
                enhanced: finalAdverb
            };
        } catch (parseError) {
            console.error(`❌ JSON parse error for ${adverb.word}:`, parseError.message);
            console.error('Raw response:', response);
            return {
                success: false,
                error: 'Invalid JSON response',
                original: adverb
            };
        }

    } catch (error) {
        console.error(`❌ API error for ${adverb.word}:`, error.message);
        return {
            success: false,
            error: error.message,
            original: adverb
        };
    }
}

// Function to enhance a range of adverbs and update the file
async function enhanceAdverbRange(startId, endId) {
    try {
        // Load adverb data
        const adverbsPath = path.join(__dirname, '..', 'data', 'adverb.json');
        const adverbsData = JSON.parse(fs.readFileSync(adverbsPath, 'utf8'));
        
        console.log(`🚀 Starting enhancement of adverbs ${startId}-${endId}...`);
        
        // Filter to the requested range
        const targetAdverbs = adverbsData.flashcards.filter(adverb => 
            adverb.id >= startId && adverb.id <= endId
        );
        
        if (targetAdverbs.length === 0) {
            console.log(`❌ No adverbs found in range ${startId}-${endId}`);
            return;
        }
        
        console.log(`📝 Found ${targetAdverbs.length} adverbs to enhance`);
        
        let enhanced = 0;
        let failed = 0;
        
        // Create a copy of the original data to modify
        const updatedData = { ...adverbsData };
        
        // Process each adverb
        for (const adverb of targetAdverbs) {
            const result = await enhanceAdverbWithAI(adverb);
            
            if (result.success) {
                // Find the adverb in the original data and replace it
                const index = updatedData.flashcards.findIndex(a => a.id === adverb.id);
                if (index !== -1) {
                    updatedData.flashcards[index] = result.enhanced;
                    enhanced++;
                    console.log(`✅ ${adverb.word}: Enhanced successfully`);
                }
            } else {
                failed++;
                console.log(`❌ ${adverb.word}: Enhancement failed - ${result.error}`);
            }
            
            // Add a small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Save the updated data back to the file
        if (enhanced > 0) {
            // Create a backup first
            const backupPath = adverbsPath + `.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, JSON.stringify(adverbsData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
            
            // Write the enhanced data
            fs.writeFileSync(adverbsPath, JSON.stringify(updatedData, null, 2));
            console.log(`💾 Updated ${enhanced} adverbs in data/adverb.json`);
        }
        
        console.log(`\n📊 Enhancement Summary:`);
        console.log(`✅ Enhanced: ${enhanced}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 Total in range: ${targetAdverbs.length}`);
        
    } catch (error) {
        console.error('❌ Error during enhancement:', error.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('📋 Usage: node enhance_adverbs.js <start_id> <end_id>');
        console.log('📋 Example: node enhance_adverbs.js 1 5  (enhance adverbs with IDs 1 through 5)');
        process.exit(1);
    }
    
    const startId = parseInt(args[0]);
    const endId = parseInt(args[1]);
    
    if (isNaN(startId) || isNaN(endId) || startId < 1 || endId < startId) {
        console.log('❌ Invalid range. Start and end must be positive numbers, and start must be <= end');
        process.exit(1);
    }
    
    console.log('🔧 Starting adverb enhancement system...');
    await enhanceAdverbRange(startId, endId);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    enhanceAdverbWithAI,
    enhanceAdverbRange
}; 