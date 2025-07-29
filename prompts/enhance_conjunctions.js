const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function enhanceConjunctions(startIndex = 0, batchSize = 10) {
    try {
        // Read current conjunction data
        const conjunctionPath = path.join(__dirname, '..', 'data', 'conjunction.json');
        const currentData = JSON.parse(fs.readFileSync(conjunctionPath, 'utf8'));
        
        const totalConjunctions = currentData.flashcards.length;
        const endIndex = Math.min(startIndex + batchSize, totalConjunctions);
        const batch = currentData.flashcards.slice(startIndex, endIndex);
        
        console.log(`📚 Enhancing conjunctions ${startIndex + 1}-${endIndex} of ${totalConjunctions}...`);
        
        if (startIndex === 0) {
            // Create backup only on first batch
            const timestamp = Date.now();
            const backupPath = `${conjunctionPath}.backup.${timestamp}`;
            fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
        }

        const systemPrompt = `You are an expert Italian language instructor specializing in conjunction usage and syntax. Enhance flashcard entries with accurate, educational content including conjunction classification and clause connection patterns. Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax. Fix all grammatical errors in examples.`;

        const batchData = {
            part_of_speech: "Conjunction",
            count: batch.length,
            flashcards: batch
        };

        const userPrompt = `Enhance these Italian conjunction flashcard entries with comprehensive linguistic information. For each conjunction, provide:

REQUIRED STRUCTURE:
{
  "id": [keep existing],
  "word": "[keep existing]",
  "translations": [comprehensive list of English meanings],
  "part_of_speech": "Conjunction",
  "difficulty": "[keep existing]", 
  "category": "Italian",
  
  "conjunction_classification": {
    "type": "coordinating|subordinating|correlative|conjunctive_adverb",
    "function": "additive|adversative|causal|temporal|conditional|concessive|comparative|final|consecutive",
    "connects": "words|phrases|clauses|sentences"
  },

  "clause_connection": {
    "coordination": {
      "description": "connects elements of equal grammatical status",
      "examples": ["Marco e Giulia studiano", "È intelligente ma pigro"]
    },
    "subordination": {
      "description": "connects dependent clause to main clause",
      "examples": ["Vengo se hai tempo", "Benché sia difficile, ci proverò"]
    }
  },

  "mood_tense_requirements": {
    "indicative": {
      "description": "when conjunction requires indicative mood",
      "examples": ["Penso che è vero", "Dopo che sono arrivato"]
    },
    "subjunctive": {
      "description": "when conjunction requires subjunctive mood",
      "examples": ["Benché sia difficile", "Sebbene faccia freddo"]
    },
    "conditional": {
      "description": "when conjunction is used with conditional",
      "examples": ["Se avessi tempo, verrei", "Come se fosse facile"]
    }
  },

  "position_rules": {
    "sentence_initial": {
      "description": "conjunction can start a sentence",
      "examples": ["Però non posso venire", "Quindi, andiamo"]
    },
    "between_clauses": {
      "description": "conjunction between two clauses",
      "examples": ["Studio italiano e parlo inglese", "È tardi ma resto"]
    },
    "with_punctuation": {
      "description": "punctuation rules with conjunction",
      "examples": ["È bravo, però non studia", "Viene Marco, e anche Giulia"]
    }
  },

  "usage_contexts": {
    "[context_name]": {
      "meaning": "clear explanation of this usage",
      "examples": ["Correct Italian example 1", "Correct Italian example 2"]
    }
    // Include contexts like: addition, contrast, condition, cause_effect, time_sequence, etc.
  },

  "common_collocations": [
    {"phrase": "fixed expression with conjunction", "meaning": "English meaning", "example": "Example sentence"}
  ],

  "formal_vs_informal": {
    "formal": {
      "usage": "written/formal speech",
      "examples": ["Tuttavia, la situazione è complessa", "Pertanto, concludiamo"]
    },
    "informal": {
      "usage": "spoken/casual",
      "examples": ["Però non posso", "E allora che fai?"]
    }
  },

  "etymology": {
    "origin": "Latin or other origin",
    "meaning": "original meaning", 
    "evolution": "how it developed in Italian"
  },

  "related_english_words": [
    {"word": "English cognate", "meaning": "definition", "usage": "connection to conjunction"}
  ],

  "usage_notes": [
    "Important usage rule about mood or word order",
    "Another crucial point about formality or register"
  ],

  "common_errors": [
    {"mistake": "what learners do wrong", "correct": "correct usage", "incorrect": "wrong usage"}
  ]
}

CRITICAL REQUIREMENTS:
- Use proper Italian examples with correct grammar, articles, and spelling
- Fix all existing grammatical errors in examples
- Include both coordinating and subordinating conjunction patterns
- Show proper mood usage (indicative vs subjunctive) where relevant
- Provide natural, contextual examples, not word-by-word translations
- For subordinating conjunctions, show proper clause structure
- Etymology should trace from Latin origins where applicable
- Usage notes should address learner difficulties with mood selection
- Common errors should show typical English speaker mistakes with Italian syntax

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
        fs.writeFileSync(conjunctionPath, JSON.stringify(currentData, null, 2));
        
        console.log(`✅ Successfully enhanced conjunctions ${startIndex + 1}-${endIndex}!`);
        
        // Continue with next batch if there are more conjunctions
        if (endIndex < totalConjunctions) {
            console.log(`⏭️ Processing next batch...`);
            await enhanceConjunctions(endIndex, batchSize);
        } else {
            console.log(`🎉 All ${totalConjunctions} conjunctions enhanced!`);
            console.log(`📈 Data written to: ${conjunctionPath}`);
            
            // Show file size comparison
            const backupFiles = fs.readdirSync(path.dirname(conjunctionPath))
                .filter(f => f.startsWith('conjunction.json.backup'))
                .sort()
                .slice(-1);
            
            if (backupFiles.length > 0) {
                const backupPath = path.join(path.dirname(conjunctionPath), backupFiles[0]);
                const originalSize = fs.statSync(backupPath).size;
                const newSize = fs.statSync(conjunctionPath).size;
                console.log(`📊 File size: ${originalSize} bytes → ${newSize} bytes (+${((newSize/originalSize - 1) * 100).toFixed(1)}%)`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error enhancing conjunctions batch ${startIndex + 1}-${Math.min(startIndex + batchSize, 46)}:`, error);
        
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
    }
}

// Run the enhancement starting from the beginning
enhanceConjunctions(); 