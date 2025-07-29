const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Italian Noun Quality Review System
// Uses OpenAI GPT-4o-mini to analyze the quality of noun flashcard data
// Generates detailed feedback reports for improving translations, examples, and etymology
// 
// You'll need to install: npm install openai dotenv
// And set your API key in .env file or as environment variable: OPENAI_API_KEY
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to create the review prompt for a noun
function createNounReviewPrompt(noun) {
    return `You are a linguistic data quality analyst. Your task is to review a single Italian noun entry from a flashcard dataset. Evaluate the quality of its translations (as represented by examples), example sentences, and etymology.

**Here are the criteria for a good entry:**

1.  **Translations (via Examples):** All provided English translations for the Italian word should be clearly demonstrated and nuanced by the example sentences.
2.  **Example Sentences:**
    * Must be natural, common, and practical Italian phrases.
    * Avoid generic phrases like "Ho usato la parola 'X' in una frase."
    * The \`context\` field should be specific and highly descriptive, explaining the scenario or usage of the example, avoiding "generic fallback."
3.  **Etymology:**
    * The \`meaning\` field should be precise and detailed, clearly explaining the meaning of the word's original root or source.
    * The \`notes\` field should explicitly describe the evolutionary path of the word from its origin to modern Italian, providing more detail than just "Evolved from X usage."

**CURRENT ENTRY TO REVIEW:**
Word: ${noun.word} (${noun.gender})
Translations: ${noun.translations.join(', ')}
Example: "${noun.examples[0]?.italian}" → "${noun.examples[0]?.english}" (Context: ${noun.examples[0]?.context})
Etymology Origin: ${noun.etymology?.origin || 'Not specified'}
Etymology Source: ${noun.etymology?.source || 'Not specified'}
Etymology Meaning: ${noun.etymology?.meaning || 'Not specified'}
Etymology Notes: ${noun.etymology?.notes || 'Not specified'}

**Your Output Format:**

Provide your review as a JSON object with the following structure. For each section, state if it's "Good," "Needs Improvement," or "Missing," and then provide specific suggestions if improvements are needed.

\`\`\`json
{
  "word_reviewed": "${noun.word}",
  "review_summary": {
    "overall_assessment": "Brief summary (e.g., 'Generally good with minor tweaks needed' or 'Significant improvements required')",
    "translation_via_examples": {
      "status": "Good | Needs Improvement",
      "suggestions": [
        "Suggestion 1",
        "Suggestion 2"
      ]
    },
    "example_sentences": {
      "status": "Good | Needs Improvement",
      "suggestions": [
        "Suggestion 1 (e.g., 'Rewrite generic examples.', 'Provide more varied contexts.')",
        "Suggestion 2 (e.g., 'Refine context field for clarity.')"
      ]
    },
    "etymology": {
      "status": "Good | Needs Improvement",
      "suggestions": [
        "Suggestion 1 (e.g., 'Expand on root meaning.', 'Detail evolutionary steps in notes.')",
        "Suggestion 2"
      ]
    }
  }
}
\`\`\``;
}

// Function to call OpenAI API for noun review
async function reviewNounWithAI(noun) {
    try {
        console.log(`🔍 Reviewing: ${noun.word}`);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // More cost-effective than gpt-4
            messages: [
                {
                    role: "system",
                    content: "You are a linguistic data quality analyst specializing in Italian language learning materials. Provide detailed, constructive feedback on flashcard data quality."
                },
                {
                    role: "user", 
                    content: createNounReviewPrompt(noun)
                }
            ],
            temperature: 0.2, // Lower for more consistent, analytical responses
            max_tokens: 800
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse the JSON response
        try {
            // Remove markdown code blocks if present
            const cleanResponse = response.replace(/```json\n?|```\n?/g, '').trim();
            const reviewData = JSON.parse(cleanResponse);
            return {
                success: true,
                review: reviewData
            };
        } catch (parseError) {
            console.error(`❌ JSON parse error for ${noun.word}:`, parseError.message);
            console.error('Raw response:', response);
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

// Function to review all nouns and generate quality report
async function reviewAllNouns() {
    try {
        // Load noun data
        const nounsPath = path.join(__dirname, '..', 'data', 'nouns.json');
        const nounsData = JSON.parse(fs.readFileSync(nounsPath, 'utf8'));
        
        console.log(`🚀 Starting quality review of ${nounsData.flashcards.length} nouns...`);
        console.log('💡 This will generate a detailed quality report');
        
        const results = {
            successful: 0,
            failed: 0,
            reviews: [],
            errors: [],
            summary: {
                needs_improvement: 0,
                good_quality: 0,
                translation_issues: 0,
                example_issues: 0,
                etymology_issues: 0
            }
        };
        
        // Process each noun (with delay to respect rate limits)
        for (let i = 0; i < nounsData.flashcards.length; i++) {
            const noun = nounsData.flashcards[i];
            
            console.log(`\n📝 Processing ${i + 1}/${nounsData.flashcards.length}: ${noun.word}`);
            
            const result = await reviewNounWithAI(noun);
            
            if (result.success) {
                const review = result.review;
                results.reviews.push(review);
                results.successful++;
                
                // Update summary statistics
                const overallStatus = review.review_summary.overall_assessment.toLowerCase();
                if (overallStatus.includes('improvement') || overallStatus.includes('significant')) {
                    results.summary.needs_improvement++;
                } else {
                    results.summary.good_quality++;
                }
                
                // Track specific issues
                if (review.review_summary.translation_via_examples.status === 'Needs Improvement') {
                    results.summary.translation_issues++;
                }
                if (review.review_summary.example_sentences.status === 'Needs Improvement') {
                    results.summary.example_issues++;
                }
                if (review.review_summary.etymology.status === 'Needs Improvement') {
                    results.summary.etymology_issues++;
                }
                
                console.log(`✅ Review completed for ${noun.word}: ${review.review_summary.overall_assessment}`);
                
            } else {
                results.failed++;
                results.errors.push({
                    word: noun.word,
                    error: result.error,
                    rawResponse: result.rawResponse
                });
                console.log(`❌ Failed to review ${noun.word}: ${result.error}`);
            }
            
            // Rate limiting: wait 1 second between requests
            if (i < nounsData.flashcards.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Save complete review report
        const reviewReport = {
            generated_date: new Date().toISOString(),
            total_nouns_reviewed: results.successful,
            summary: results.summary,
            detailed_reviews: results.reviews,
            processing_errors: results.errors
        };
        
        const outputPath = path.join(__dirname, 'noun_quality_report.json');
        fs.writeFileSync(outputPath, JSON.stringify(reviewReport, null, 2));
        
        console.log('\n🎉 Quality review complete!');
        console.log(`✅ Successfully reviewed: ${results.successful} nouns`);
        console.log(`❌ Failed: ${results.failed} nouns`);
        console.log(`\n📊 Quality Summary:`);
        console.log(`   👍 Good quality: ${results.summary.good_quality} nouns`);
        console.log(`   ⚠️  Need improvement: ${results.summary.needs_improvement} nouns`);
        console.log(`   🔤 Translation issues: ${results.summary.translation_issues} nouns`);
        console.log(`   📝 Example issues: ${results.summary.example_issues} nouns`);
        console.log(`   📜 Etymology issues: ${results.summary.etymology_issues} nouns`);
        console.log(`\n📄 Full report saved to: ${outputPath}`);
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
    }
}

// Allow running specific ranges for testing
async function reviewNounRange(start, end) {
    const nounsPath = path.join(__dirname, '..', 'data', 'nouns.json');
    const nounsData = JSON.parse(fs.readFileSync(nounsPath, 'utf8'));
    
    const slice = nounsData.flashcards.slice(start - 1, end);
    console.log(`🧪 Testing quality review with nouns ${start}-${end} (${slice.length} nouns)`);
    
    for (const noun of slice) {
        console.log(`\n📝 Reviewing: ${noun.word}`);
        const result = await reviewNounWithAI(noun);
        
        if (result.success) {
            const review = result.review;
            console.log(`✅ ${noun.word}: ${review.review_summary.overall_assessment}`);
            
            // Show specific issues if any
            const issues = [];
            if (review.review_summary.translation_via_examples.status === 'Needs Improvement') {
                issues.push('translations');
            }
            if (review.review_summary.example_sentences.status === 'Needs Improvement') {
                issues.push('examples');
            }
            if (review.review_summary.etymology.status === 'Needs Improvement') {
                issues.push('etymology');
            }
            
            if (issues.length > 0) {
                console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
                // Show first suggestion for the first issue
                if (review.review_summary.example_sentences.status === 'Needs Improvement') {
                    console.log(`   💡 Example suggestion: ${review.review_summary.example_sentences.suggestions[0]}`);
                }
            } else {
                console.log(`   👍 No issues found`);
            }
        } else {
            console.log(`❌ ${noun.word}: Failed - ${result.error}`);
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
        // Test quality review with range: node review_nouns.js 1 5
        const start = parseInt(args[0]);
        const end = parseInt(args[1]);
        console.log('🔍 Starting quality review test...\n');
        reviewNounRange(start, end);
    } else {
        // Generate full quality report for all nouns
        console.log('📊 Starting comprehensive quality analysis...\n');
        reviewAllNouns();
    }
} 