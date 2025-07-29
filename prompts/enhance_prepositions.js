const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function enhancePrepositions(startIndex = 0, batchSize = 10) {
    try {
        // Read current preposition data
        const prepositionPath = path.join(__dirname, '..', 'data', 'preposition.json');
        const currentData = JSON.parse(fs.readFileSync(prepositionPath, 'utf8'));
        
        const totalPrepositions = currentData.flashcards.length;
        const endIndex = Math.min(startIndex + batchSize, totalPrepositions);
        const batch = currentData.flashcards.slice(startIndex, endIndex);
        
        console.log(`📚 Enhancing prepositions ${startIndex + 1}-${endIndex} of ${totalPrepositions}...`);
        
        if (startIndex === 0) {
            // Create backup only on first batch
            const timestamp = Date.now();
            const backupPath = `${prepositionPath}.backup.${timestamp}`;
            fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
            console.log(`💾 Backup created: ${backupPath}`);
        }

        const systemPrompt = `You are an expert Italian language instructor specializing in preposition usage patterns and etymology. Enhance flashcard entries with accurate, educational content including usage contexts and articulated forms. Respond ONLY with perfectly valid JSON. Do not add any explanations, comments, or parenthetical notes within JSON arrays or objects that would break JSON syntax. Fix all grammatical errors in examples.`;

        const batchData = {
            part_of_speech: "Preposition",
            count: batch.length,
            flashcards: batch
        };

        const userPrompt = `Enhance these Italian preposition flashcard entries with comprehensive linguistic information. For each preposition, provide:

REQUIRED STRUCTURE:
{
  "id": [keep existing],
  "word": "[keep existing]",
  "translations": [comprehensive list of English meanings],
  "part_of_speech": "Preposition",
  "difficulty": "[keep existing]", 
  "category": "Italian",
  
  "usage_contexts": {
    "[context_name]": {
      "meaning": "clear explanation of this usage",
      "examples": ["Italian example 1", "Italian example 2"]
    }
    // Include contexts like: possession, origin, material, partitive, temporal, spatial, purpose, etc.
  },

  "articulated_forms": {
    // Only include if the preposition combines with articles
    "masculine_singular": {"definite": "combined_form", "example": "combined example", "meaning": "English meaning"},
    "feminine_singular": {"definite": "combined_form", "example": "combined example", "meaning": "English meaning"},
    "masculine_plural": {"definite": "combined_form", "example": "combined example", "meaning": "English meaning"},
    "feminine_plural": {"definite": "combined_form", "example": "combined example", "meaning": "English meaning"}
  },

  "common_collocations": [
    {"phrase": "fixed expression", "meaning": "English meaning", "example": "Example sentence"}
  ],

  "idiomatic_expressions": [
    {"expression": "idiom", "literal": "literal meaning", "meaning": "actual meaning", "example": "Example usage"}
  ],

  "etymology": {
    "origin": "Latin or other origin",
    "meaning": "original meaning", 
    "evolution": "how it developed in Italian"
  },

  "related_english_words": [
    {"word": "English cognate", "meaning": "definition", "usage": "connection to preposition"}
  ],

  "usage_notes": [
    "Important usage rule or note",
    "Another crucial point"
  ],

  "common_errors": [
    {"mistake": "what learners do wrong", "correct": "correct usage", "incorrect": "wrong usage"}
  ]
}

CRITICAL REQUIREMENTS:
- Use proper Italian examples with correct grammar, articles, and spelling
- Include all major usage contexts for each preposition
- For major prepositions (di, a, da, in, con, su, per, tra/fra), include articulated forms
- Provide 2-3 examples for each usage context
- Include authentic collocations and idiomatic expressions
- Etymology should trace from Latin origins where applicable
- Usage notes should address learner difficulties
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
        fs.writeFileSync(prepositionPath, JSON.stringify(currentData, null, 2));
        
        console.log(`✅ Successfully enhanced prepositions ${startIndex + 1}-${endIndex}!`);
        
        // Continue with next batch if there are more prepositions
        if (endIndex < totalPrepositions) {
            console.log(`⏭️ Processing next batch...`);
            await enhancePrepositions(endIndex, batchSize);
        } else {
            console.log(`🎉 All ${totalPrepositions} prepositions enhanced!`);
            console.log(`📈 Data written to: ${prepositionPath}`);
            
            // Show file size comparison
            const backupFiles = fs.readdirSync(path.dirname(prepositionPath))
                .filter(f => f.startsWith('preposition.json.backup'))
                .sort()
                .slice(-1);
            
            if (backupFiles.length > 0) {
                const backupPath = path.join(path.dirname(prepositionPath), backupFiles[0]);
                const originalSize = fs.statSync(backupPath).size;
                const newSize = fs.statSync(prepositionPath).size;
                console.log(`📊 File size: ${originalSize} bytes → ${newSize} bytes (+${((newSize/originalSize - 1) * 100).toFixed(1)}%)`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error enhancing prepositions batch ${startIndex + 1}-${Math.min(startIndex + batchSize, 56)}:`, error);
        
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
    }
}

// Run the enhancement starting from the beginning
enhancePrepositions(); 