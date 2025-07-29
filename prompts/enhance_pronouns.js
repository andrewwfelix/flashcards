const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function enhancePronouns(startIndex = 0, batchSize = 10) {
    try {
        // Read current pronoun data
        const pronounPath = path.join(__dirname, '..', 'data', 'pronoun.json');
        const currentData = JSON.parse(fs.readFileSync(pronounPath, 'utf8'));
        
        const totalPronouns = currentData.flashcards.length;
        const endIndex = Math.min(startIndex + batchSize, totalPronouns);
        const batch = currentData.flashcards.slice(startIndex, endIndex);
        
        console.log(`📚 Enhancing pronouns ${startIndex + 1}-${endIndex} of ${totalPronouns}...`);
        
        if (startIndex === 0) {
            // Create backup only on first batch
            const timestamp = Date.now();
            const backupPath = `${pronounPath}.backup.${timestamp}`;
            fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
        }

        const systemPrompt = `You are an expert Italian language instructor specializing in pronoun morphology and syntax. Enhance flashcard entries with accurate, educational content including pronoun classification and position rules. Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax. Fix all grammatical errors in examples.`;

        const batchData = {
            part_of_speech: "Pronoun",
            count: batch.length,
            flashcards: batch
        };

        const userPrompt = `Enhance these Italian pronoun flashcard entries with comprehensive linguistic information. For each pronoun, provide:

REQUIRED STRUCTURE:
{
  "id": [keep existing],
  "word": "[keep existing]",
  "translations": [comprehensive list of English meanings],
  "part_of_speech": "Pronoun",
  "difficulty": "[keep existing]", 
  "category": "Italian",
  
  "pronoun_classification": {
    "type": "subject|direct_object|indirect_object|reflexive|possessive|demonstrative|relative|interrogative|indefinite",
    "person": "first|second|third|impersonal",
    "number": "singular|plural|invariable",
    "gender": "masculine|feminine|invariable",
    "formality": "informal|formal|both"
  },

  "position_rules": {
    "proclitic": {
      "description": "when pronoun comes before verb",
      "examples": ["Lo vedo", "Mi piace"]
    },
    "enclitic": {
      "description": "when pronoun attaches to verb",
      "examples": ["Aiutami!", "Vedendolo"]
    },
    "clitic_climbing": {
      "description": "movement with modal verbs",
      "examples": ["Lo voglio vedere / Voglio vederlo"]
    }
  },

  "agreement_patterns": {
    "with_participle": {
      "description": "agreement with past participle",
      "examples": ["L'ho vista (feminine)", "Li ho visti (masculine plural)"]
    },
    "number_agreement": {
      "description": "singular vs plural forms",
      "examples": ["lo/li (masculine)", "la/le (feminine)"]
    }
  },

  "usage_contexts": {
    "[context_name]": {
      "meaning": "clear explanation of this usage",
      "examples": ["Correct Italian example 1", "Correct Italian example 2"]
    }
    // Include contexts like: subject_emphasis, direct_object, indirect_object, reflexive_action, possession, etc.
  },

  "formal_vs_informal": {
    "informal": {
      "forms": ["tu", "ti", "tuo"],
      "examples": ["Come stai tu?", "Ti vedo domani"]
    },
    "formal": {
      "forms": ["Lei", "La", "Suo"],
      "examples": ["Come sta Lei?", "La ringrazio"]
    }
  },

  "common_collocations": [
    {"phrase": "fixed expression with pronoun", "meaning": "English meaning", "example": "Example sentence"}
  ],

  "etymology": {
    "origin": "Latin or other origin",
    "meaning": "original meaning", 
    "evolution": "how it developed in Italian"
  },

  "related_english_words": [
    {"word": "English cognate", "meaning": "definition", "usage": "connection to pronoun"}
  ],

  "usage_notes": [
    "Important usage rule or note about positioning",
    "Another crucial point about agreement or formality"
  ],

  "common_errors": [
    {"mistake": "what learners do wrong", "correct": "correct usage", "incorrect": "wrong usage"}
  ]
}

CRITICAL REQUIREMENTS:
- Use proper Italian examples with correct grammar, articles, and spelling
- Fix all existing grammatical errors in examples
- Include all major pronoun types and their positioning rules
- For object pronouns, include both proclitic and enclitic positioning
- For formal pronouns, show proper capitalization and agreement
- Provide authentic usage examples, not literal translations
- Etymology should trace from Latin origins where applicable
- Usage notes should address learner difficulties with positioning and agreement
- Common errors should show typical English speaker mistakes

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

        const enhancedDataString = response.choices[0].message.content.trim();
        
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
        fs.writeFileSync(pronounPath, JSON.stringify(currentData, null, 2));
        
        console.log(`✅ Successfully enhanced pronouns ${startIndex + 1}-${endIndex}!`);
        
        // Continue with next batch if there are more pronouns
        if (endIndex < totalPronouns) {
            console.log(`⏭️ Processing next batch...`);
            await enhancePronouns(endIndex, batchSize);
        } else {
            console.log(`🎉 All ${totalPronouns} pronouns enhanced!`);
            console.log(`📈 Data written to: ${pronounPath}`);
            
            // Show file size comparison
            const backupFiles = fs.readdirSync(path.dirname(pronounPath))
                .filter(f => f.startsWith('pronoun.json.backup'))
                .sort()
                .slice(-1);
            
            if (backupFiles.length > 0) {
                const backupPath = path.join(path.dirname(pronounPath), backupFiles[0]);
                const originalSize = fs.statSync(backupPath).size;
                const newSize = fs.statSync(pronounPath).size;
                console.log(`📊 File size: ${originalSize} bytes → ${newSize} bytes (+${((newSize/originalSize - 1) * 100).toFixed(1)}%)`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error enhancing pronouns batch ${startIndex + 1}-${Math.min(startIndex + batchSize, 52)}:`, error);
        
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
    }
}

// Run the enhancement starting from the beginning
enhancePronouns(); 