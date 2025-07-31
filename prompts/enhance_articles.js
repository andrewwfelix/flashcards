const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function enhanceArticles(startIndex = 0, batchSize = 10) {
    try {
        // Read current article data
        const articlePath = path.join(__dirname, '..', 'data', 'article.json');
        const currentData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
        
        const totalArticles = currentData.flashcards.length;
        const endIndex = Math.min(startIndex + batchSize, totalArticles);
        const batch = currentData.flashcards.slice(startIndex, endIndex);
        
        console.log(`📚 Enhancing articles ${startIndex + 1}-${endIndex} of ${totalArticles}...`);
        
        if (startIndex === 0) {
            // Create backup only on first batch
            const timestamp = Date.now();
            const backupPath = `${articlePath}.backup.${timestamp}`;
            fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
        }

        const systemPrompt = `You are an expert Italian language instructor specializing in article usage, gender agreement, and phonetic rules. Enhance flashcard entries with accurate, educational content including agreement patterns, contraction rules, and phonetic variations. Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax. Fix all grammatical errors in examples.`;

        const batchData = {
            part_of_speech: "Article",
            count: batch.length,
            flashcards: batch
        };

        const userPrompt = `Enhance these Italian article flashcard entries with comprehensive linguistic information. For each article, provide:

REQUIRED STRUCTURE:
{
  "id": [keep existing],
  "word": "[keep existing]",
  "translations": [comprehensive list of English meanings],
  "part_of_speech": "Article",
  "difficulty": "[keep existing]", 
  "category": "Italian",
  
  "article_classification": {
    "type": "definite|indefinite|contracted",
    "gender": "masculine|feminine|neutral",
    "number": "singular|plural|both",
    "definiteness": "definite|indefinite|partitive"
  },

  "agreement_rules": {
    "gender_agreement": {
      "masculine": {
        "description": "when used with masculine nouns",
        "examples": ["il ragazzo", "un amico", "dello studente"]
      },
      "feminine": {
        "description": "when used with feminine nouns", 
        "examples": ["la ragazza", "una amica", "della studentessa"]
      }
    },
    "number_agreement": {
      "singular": {
        "description": "singular noun usage",
        "examples": ["il libro", "la casa", "un cane"]
      },
      "plural": {
        "description": "plural noun usage",
        "examples": ["i libri", "le case", "degli amici"]
      }
    }
  },

  "phonetic_rules": {
    "consonant_clusters": {
      "description": "usage before specific consonant combinations",
      "examples": ["lo studente", "gli studenti", "uno sbaglio"]
    },
    "vowel_sounds": {
      "description": "usage before vowels or specific sounds",
      "examples": ["l'amico", "un'amica", "dell'acqua"]
    },
    "z_sounds": {
      "description": "usage before z sounds",
      "examples": ["lo zio", "gli zii", "uno zaino"]
    }
  },

  "contraction_patterns": {
    "preposition_source": "di|a|da|in|su|con|null",
    "formation_rule": "how this contracted form is created",
    "base_components": {
      "preposition": "source preposition or null",
      "article": "base article form"
    },
    "contraction_examples": [
      {"phrase": "casa del padre", "meaning": "father's house", "breakdown": "di + il = del"}
    ]
  },

  "usage_contexts": {
    "[context_name]": {
      "meaning": "clear explanation of this usage",
      "examples": ["Correct Italian example 1", "Correct Italian example 2"],
      "when_to_use": "specific rules for this context"
    }
    // Include contexts like: definite_reference, indefinite_reference, partitive, generic, possessive, etc.
  },

  "common_noun_patterns": {
    "typical_nouns": [
      {"noun": "common noun that uses this article", "gender": "m|f", "example": "article + noun"}
    ],
    "irregular_cases": [
      {"noun": "exceptional noun", "rule": "why this article is used", "example": "full phrase"}
    ]
  },

  "regional_variations": {
    "standard": {
      "usage": "standard Italian usage",
      "examples": ["Standard form examples"]
    },
    "regional": {
      "usage": "regional or dialectal variations",
      "examples": ["Regional variations if any"],
      "regions": "where these variations occur"
    }
  },

  "etymology": {
    "origin": "Latin or other origin",
    "evolution": "how it developed in Italian",
    "related_forms": "related articles or forms"
  },

  "usage_frequency": {
    "frequency_level": "very_high|high|medium|low",
    "usage_notes": "how commonly this form is used",
    "alternatives": "alternative forms or constructions"
  },

  "usage_notes": [
    "Important rule about gender/number agreement",
    "Key point about phonetic usage",
    "Critical note about when to use this form"
  ],

  "common_errors": [
    {"mistake": "what learners do wrong", "correct": "correct usage", "incorrect": "wrong usage", "explanation": "why this error occurs"}
  ]
}

CRITICAL REQUIREMENTS:
- Use proper Italian examples with correct gender/number agreement
- Fix all existing grammatical errors in examples
- Include both basic and contracted article patterns where relevant
- Show proper phonetic rules (lo/gli before s+consonant, z, vowels)
- Provide natural, contextual examples, not artificial constructions
- For contracted articles, clearly show the component breakdown
- Etymology should trace from Latin origins where applicable
- Usage notes should address learner difficulties with agreement and phonetics
- Common errors should show typical English speaker mistakes with Italian articles
- Include frequency information for practical usage priority

Current data to enhance:
${JSON.stringify(batchData, null, 2)}`;

        console.log('🤖 Calling OpenAI API...');
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
        });

        let enhancedDataString = response.choices[0].message.content.trim();
        
        // Remove markdown formatting if present
        if (enhancedDataString.startsWith('```json')) {
            enhancedDataString = enhancedDataString.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (enhancedDataString.startsWith('```')) {
            enhancedDataString = enhancedDataString.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        // Parse and validate JSON
        let enhancedBatch;
        try {
            enhancedBatch = JSON.parse(enhancedDataString);
        } catch (parseError) {
            console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
            console.log('Raw response:', enhancedDataString.substring(0, 500) + '...');
            return;
        }

        // Update the original data with enhanced batch
        for (let i = 0; i < enhancedBatch.flashcards.length; i++) {
            const globalIndex = startIndex + i;
            if (globalIndex < currentData.flashcards.length) {
                currentData.flashcards[globalIndex] = enhancedBatch.flashcards[i];
            }
        }

        // Write updated data back to file
        fs.writeFileSync(articlePath, JSON.stringify(currentData, null, 2));
        
        console.log(`✅ Successfully enhanced articles ${startIndex + 1}-${endIndex}!`);
        
        // Continue with next batch if there are more articles
        if (endIndex < totalArticles) {
            console.log(`⏭️ Processing next batch...`);
            await enhanceArticles(endIndex, batchSize);
        } else {
            console.log(`🎉 All ${totalArticles} articles enhanced!`);
            console.log(`📈 Data written to: ${articlePath}`);
            
            // Show file size comparison
            const backupFiles = fs.readdirSync(path.dirname(articlePath))
                .filter(f => f.startsWith('article.json.backup'))
                .sort()
                .slice(-1);
            
            if (backupFiles.length > 0) {
                const backupPath = path.join(path.dirname(articlePath), backupFiles[0]);
                const originalSize = fs.statSync(backupPath).size;
                const newSize = fs.statSync(articlePath).size;
                console.log(`📊 File size: ${originalSize} bytes → ${newSize} bytes (+${((newSize/originalSize - 1) * 100).toFixed(1)}%)`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error enhancing articles batch ${startIndex + 1}-${Math.min(startIndex + batchSize, 39)}:`, error);
        
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
    }
}

// Run the enhancement starting from the beginning
enhanceArticles(); 