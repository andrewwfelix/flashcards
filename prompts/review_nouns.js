const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// You'll need to install: npm install openai dotenv
// And set your API key in .env file or as environment variable: OPENAI_API_KEY
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to create the review prompt for a noun
function createNounReviewPrompt(noun) {
    return `Please review and improve this Italian noun entry for a language learning flashcard app. 

CURRENT ENTRY:
Word: ${noun.word} (${noun.gender})
Current Translations: ${noun.translations.join(', ')}
Current Example: ${noun.examples[0]?.italian} → ${noun.examples[0]?.english}
Current Etymology: ${noun.etymology?.notes || 'None'}
Current Related English Words: ${noun.related_english_words?.map(w => w.word).join(', ') || 'None'}

REQUIREMENTS:
1. Keep the word and gender exactly as-is
2. Verify translations are accurate and complete
3. Provide 1-2 realistic, natural Italian example sentences with English translations
4. Provide accurate etymology information (origin, source word, meaning evolution)
5. List 2-4 genuine English cognates/related words with brief definitions
6. Use varied, interesting contexts (not generic "This is important")

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "translations": ["translation1", "translation2"],
  "examples": [
    {
      "italian": "Natural Italian sentence here",
      "english": "English translation here", 
      "context": "brief context description"
    }
  ],
  "etymology": {
    "origin": "Latin/Greek/Germanic/etc",
    "source": "source_word",
    "meaning": "original meaning and evolution",
    "notes": "How it evolved into modern Italian"
  },
  "related_english_words": [
    {
      "word": "related_word",
      "meaning": "definition",
      "usage": "example sentence"
    }
  ],
  "cognates": ["word1", "word2", "word3"]
}`;
}

// Function to call OpenAI API
async function reviewNounWithAI(noun) {
    try {
        console.log(`🔍 Reviewing: ${noun.word}`);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // More cost-effective than gpt-4
            messages: [
                {
                    role: "system",
                    content: "You are an expert Italian language teacher and linguist. Provide accurate, educational content for Italian language learners."
                },
                {
                    role: "user", 
                    content: createNounReviewPrompt(noun)
                }
            ],
            temperature: 0.3, // Lower for more consistent, factual responses
            max_tokens: 1000
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse the JSON response
        try {
            const improvedData = JSON.parse(response);
            return {
                success: true,
                data: improvedData
            };
        } catch (parseError) {
            console.error(`❌ JSON parse error for ${noun.word}:`, parseError.message);
            return {
                success: false,
                error: 'Invalid JSON response',
                rawResponse: response
            };
        }

    } catch (error) {
        console.error(`❌ API error for ${noun.word}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to process all nouns
async function reviewAllNouns() {
    try {
        // Load noun data
        const nounsPath = path.join(__dirname, '..', 'data', 'nouns.json');
        const nounsData = JSON.parse(fs.readFileSync(nounsPath, 'utf8'));
        
        console.log(`🚀 Starting review of ${nounsData.flashcards.length} nouns...`);
        console.log('💡 This will take a while and cost some OpenAI credits');
        
        // Create backup
        const backupPath = path.join(__dirname, '..', 'data', 'nouns_backup.json');
        fs.writeFileSync(backupPath, JSON.stringify(nounsData, null, 2));
        console.log(`💾 Backup created: ${backupPath}`);
        
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };
        
        // Process each noun (with delay to respect rate limits)
        for (let i = 0; i < nounsData.flashcards.length; i++) {
            const noun = nounsData.flashcards[i];
            
            console.log(`\n📝 Processing ${i + 1}/${nounsData.flashcards.length}: ${noun.word}`);
            
            const result = await reviewNounWithAI(noun);
            
            if (result.success) {
                // Update the noun with improved data
                Object.assign(noun, {
                    translations: result.data.translations,
                    examples: result.data.examples,
                    etymology: result.data.etymology,
                    related_english_words: result.data.related_english_words,
                    cognates: result.data.cognates
                });
                
                results.successful++;
                console.log(`✅ Successfully updated ${noun.word}`);
                
            } else {
                results.failed++;
                results.errors.push({
                    word: noun.word,
                    error: result.error,
                    rawResponse: result.rawResponse
                });
                console.log(`❌ Failed to update ${noun.word}: ${result.error}`);
            }
            
            // Rate limiting: wait 1 second between requests
            if (i < nounsData.flashcards.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Save updated data
        const outputPath = path.join(__dirname, '..', 'data', 'nouns_reviewed.json');
        fs.writeFileSync(outputPath, JSON.stringify(nounsData, null, 2));
        
        // Save error report
        const errorPath = path.join(__dirname, 'review_errors.json');
        fs.writeFileSync(errorPath, JSON.stringify(results.errors, null, 2));
        
        console.log('\n🎉 Review complete!');
        console.log(`✅ Successfully reviewed: ${results.successful} nouns`);
        console.log(`❌ Failed: ${results.failed} nouns`);
        console.log(`📄 Updated data saved to: ${outputPath}`);
        if (results.errors.length > 0) {
            console.log(`📋 Error details saved to: ${errorPath}`);
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
    }
}

// Allow running specific ranges for testing
async function reviewNounRange(start, end) {
    const nounsPath = path.join(__dirname, '..', 'data', 'nouns.json');
    const nounsData = JSON.parse(fs.readFileSync(nounsPath, 'utf8'));
    
    const slice = nounsData.flashcards.slice(start - 1, end);
    console.log(`🧪 Testing with nouns ${start}-${end} (${slice.length} nouns)`);
    
    for (const noun of slice) {
        const result = await reviewNounWithAI(noun);
        console.log(`${noun.word}: ${result.success ? '✅' : '❌'}`);
        if (result.success) {
            console.log('Sample result:', JSON.stringify(result.data.examples[0], null, 2));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Export functions
module.exports = {
    reviewAllNouns,
    reviewNounRange,
    reviewNounWithAI
};

// Allow running from command line
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 2) {
        // Test with range: node review_nouns.js 1 5
        const start = parseInt(args[0]);
        const end = parseInt(args[1]);
        reviewNounRange(start, end);
    } else {
        // Review all
        reviewAllNouns();
    }
} 