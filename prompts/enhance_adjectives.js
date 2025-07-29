const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Italian Adjective Enhancement System
// Uses OpenAI GPT-4o-mini to enhance and improve adjective flashcard data
// Actually updates the data/adjective.json file with enhanced content
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to create the enhancement prompt for an adjective
function createAdjectiveEnhancementPrompt(adjective) {
    return `You are an expert Italian language instructor and linguist specializing in adjective agreement and etymology. Your task is to enhance a single Italian adjective entry from a flashcard dataset. 

**CURRENT ENTRY:**
Word: ${adjective.word}
Translations: ${adjective.translations.join(', ')}
Current Examples: ${JSON.stringify(adjective.examples, null, 2)}
Current Etymology: ${JSON.stringify(adjective.etymology || {}, null, 2)}

**YOUR TASK:**
Enhance this entry by improving ALL sections and adding adjective-specific educational content. Provide natural, educational, and accurate content.

**ADJECTIVE AGREEMENT PATTERN CLASSIFICATION:**
- **regular_o_a**: Regular -o/-a adjectives (rosso/rossa/rossi/rosse)
- **regular_e**: Invariable -e adjectives (grande/grandi for both genders)
- **irregular**: Irregular patterns (buono/buona/buoni/buone, bello/bella/bei/belle)

**ADJECTIVE POSITION CLASSIFICATION:**
- **pre_noun**: Usually goes before noun (bello, grande, piccolo, buono...)
- **post_noun**: Usually goes after noun (most adjectives)
- **both**: Can go before or after with meaning change

**REQUIREMENTS:**
1. **Examples**: Create 3-4 natural Italian sentences showing different agreements and contexts
2. **Agreement Forms**: Provide all 4 forms (masc sing, fem sing, masc plural, fem plural)
3. **Comparison Forms**: Comparative and superlative (if applicable)
4. **Etymology**: Detailed, accurate etymology with precise meaning and evolutionary notes
5. **Related English Words**: 2-3 English words derived from the same root with meanings and usage examples
6. **Cognates**: Provide cognate words (derivatives and related terms)
7. **Position Rules**: Explain when adjective goes before/after noun
8. **Usage Notes**: Include register, common phrases, grammatical tips

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "word": "${adjective.word}",
  "translations": ${JSON.stringify(adjective.translations)},
  "part_of_speech": "Adjective",
  "difficulty": "${adjective.difficulty}",
  "category": "${adjective.category}",
  "examples": [
    {
      "italian": "Natural Italian sentence using ${adjective.word}",
      "english": "Natural English translation",
      "context": "Specific context or scenario"
    }
  ],
  "agreement_pattern": {
    "type": "regular_o_a|regular_e|irregular",
    "description": "Clear explanation of the agreement pattern",
    "forms": {
      "masculine_singular": "form",
      "feminine_singular": "form",
      "masculine_plural": "form",
      "feminine_plural": "form"
    }
  },
  "comparison": {
    "comparative": "comparative form (più + adjective or irregular)",
    "superlative": "superlative form (il più + adjective or irregular)",
    "notes": "Any irregular comparison notes"
  },
  "position": {
    "type": "pre_noun|post_noun|both",
    "description": "When this adjective goes before/after noun",
    "notes": "Any meaning changes based on position"
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
    "register": "formal/informal/neutral - when to use this adjective",
    "common_phrases": ["phrase 1", "phrase 2"],
    "grammatical_tips": "Important grammar notes about agreement, position, etc."
  }
}

**CRITICAL: Ensure all JSON is perfectly valid. In common_phrases array, use ONLY the Italian phrases without explanations. Do not add parenthetical explanations inside array elements.**`;
}

// Function to enhance a single adjective with OpenAI
async function enhanceAdjectiveWithAI(adjective) {
    try {
        console.log(`🔧 Enhancing: ${adjective.word}`);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert Italian language instructor specializing in adjective agreement patterns and etymology. Enhance flashcard entries with accurate, educational content including agreement classification. Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax."
                },
                {
                    role: "user", 
                    content: createAdjectiveEnhancementPrompt(adjective)
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
            const enhancedAdjective = JSON.parse(cleanResponse);
            
            // Ensure the enhanced adjective has all required fields
            const finalAdjective = {
                id: adjective.id, // Keep original ID
                word: enhancedAdjective.word || adjective.word,
                translations: enhancedAdjective.translations || adjective.translations,
                part_of_speech: "Adjective",
                difficulty: enhancedAdjective.difficulty || adjective.difficulty,
                category: enhancedAdjective.category || adjective.category,
                examples: enhancedAdjective.examples || adjective.examples,
                agreement_pattern: enhancedAdjective.agreement_pattern || null,
                comparison: enhancedAdjective.comparison || null,
                position: enhancedAdjective.position || null,
                etymology: enhancedAdjective.etymology || adjective.etymology || null,
                related_english_words: enhancedAdjective.related_english_words || [],
                cognates: enhancedAdjective.cognates || [],
                usage_notes: enhancedAdjective.usage_notes || null
            };
            
            return {
                success: true,
                enhanced: finalAdjective
            };
        } catch (parseError) {
            console.error(`❌ JSON parse error for ${adjective.word}:`, parseError.message);
            console.error('Raw response:', response);
            return {
                success: false,
                error: 'Invalid JSON response',
                original: adjective
            };
        }

    } catch (error) {
        console.error(`❌ API error for ${adjective.word}:`, error.message);
        return {
            success: false,
            error: error.message,
            original: adjective
        };
    }
}

// Function to enhance a range of adjectives and update the file
async function enhanceAdjectiveRange(startId, endId) {
    try {
        // Load adjective data
        const adjectivesPath = path.join(__dirname, '..', 'data', 'adjective.json');
        const adjectivesData = JSON.parse(fs.readFileSync(adjectivesPath, 'utf8'));
        
        console.log(`🚀 Starting enhancement of adjectives ${startId}-${endId}...`);
        
        // Filter to the requested range
        const targetAdjectives = adjectivesData.flashcards.filter(adjective => 
            adjective.id >= startId && adjective.id <= endId
        );
        
        if (targetAdjectives.length === 0) {
            console.log(`❌ No adjectives found in range ${startId}-${endId}`);
            return;
        }
        
        console.log(`📝 Found ${targetAdjectives.length} adjectives to enhance`);
        
        let enhanced = 0;
        let failed = 0;
        
        // Create a copy of the original data to modify
        const updatedData = { ...adjectivesData };
        
        // Process each adjective
        for (const adjective of targetAdjectives) {
            const result = await enhanceAdjectiveWithAI(adjective);
            
            if (result.success) {
                // Find the adjective in the original data and replace it
                const index = updatedData.flashcards.findIndex(a => a.id === adjective.id);
                if (index !== -1) {
                    updatedData.flashcards[index] = result.enhanced;
                    enhanced++;
                    console.log(`✅ ${adjective.word}: Enhanced successfully`);
                }
            } else {
                failed++;
                console.log(`❌ ${adjective.word}: Enhancement failed - ${result.error}`);
            }
            
            // Add a small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Save the updated data back to the file
        if (enhanced > 0) {
            // Create a backup first
            const backupPath = adjectivesPath + `.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, JSON.stringify(adjectivesData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
            
            // Write the enhanced data
            fs.writeFileSync(adjectivesPath, JSON.stringify(updatedData, null, 2));
            console.log(`💾 Updated ${enhanced} adjectives in data/adjective.json`);
        }
        
        console.log(`\n📊 Enhancement Summary:`);
        console.log(`✅ Enhanced: ${enhanced}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 Total in range: ${targetAdjectives.length}`);
        
    } catch (error) {
        console.error('❌ Error during enhancement:', error.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('📋 Usage: node enhance_adjectives.js <start_id> <end_id>');
        console.log('📋 Example: node enhance_adjectives.js 1 5  (enhance adjectives with IDs 1 through 5)');
        process.exit(1);
    }
    
    const startId = parseInt(args[0]);
    const endId = parseInt(args[1]);
    
    if (isNaN(startId) || isNaN(endId) || startId < 1 || endId < startId) {
        console.log('❌ Invalid range. Start and end must be positive numbers, and start must be <= end');
        process.exit(1);
    }
    
    console.log('🔧 Starting adjective enhancement system...');
    await enhanceAdjectiveRange(startId, endId);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    enhanceAdjectiveWithAI,
    enhanceAdjectiveRange
}; 