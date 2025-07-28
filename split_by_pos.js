const fs = require('fs');
const path = require('path');

// Load the main flashcards data
function splitFlashcardsByPartOfSpeech() {
    try {
        console.log('📂 Loading flashcards data...');
        const jsonContent = fs.readFileSync('italian_flashcards.json', 'utf8');
        const data = JSON.parse(jsonContent);
        
        const flashcards = data.flashcards;
        console.log(`📊 Total flashcards loaded: ${flashcards.length}`);
        
        // Group flashcards by part of speech
        const groupedByPOS = {};
        
        flashcards.forEach(card => {
            const pos = card.part_of_speech || 'Unknown';
            if (!groupedByPOS[pos]) {
                groupedByPOS[pos] = [];
            }
            groupedByPOS[pos].push(card);
        });
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }
        
        // Write each part of speech to its own file
        const posFiles = {};
        
        Object.keys(groupedByPOS).forEach(pos => {
            const count = groupedByPOS[pos].length;
            const filename = pos.toLowerCase().replace(/\s+/g, '_') + '.json';
            const filepath = path.join('data', filename);
            
            const posData = {
                part_of_speech: pos,
                count: count,
                flashcards: groupedByPOS[pos]
            };
            
            fs.writeFileSync(filepath, JSON.stringify(posData, null, 2));
            posFiles[pos] = {
                filename: filename,
                count: count
            };
            
            console.log(`✅ Created ${filename} with ${count} words`);
        });
        
        // Create an index file that lists all the parts of speech files
        const indexData = {
            description: "Italian Flashcards split by Part of Speech",
            total_flashcards: flashcards.length,
            created_date: new Date().toISOString(),
            files: posFiles
        };
        
        fs.writeFileSync(path.join('data', 'index.json'), JSON.stringify(indexData, null, 2));
        console.log('📋 Created index.json with file overview');
        
        // Create a summary report
        console.log('\n📈 SPLIT SUMMARY:');
        console.log('=================');
        
        const sortedPOS = Object.keys(posFiles).sort((a, b) => posFiles[b].count - posFiles[a].count);
        
        sortedPOS.forEach(pos => {
            const info = posFiles[pos];
            const percentage = ((info.count / flashcards.length) * 100).toFixed(1);
            console.log(`${pos.padEnd(15)} | ${info.count.toString().padStart(4)} words (${percentage}%) | ${info.filename}`);
        });
        
        console.log('\n🎯 FILES CREATED:');
        console.log('data/index.json - Overview of all files');
        sortedPOS.forEach(pos => {
            console.log(`data/${posFiles[pos].filename}`);
        });
        
        console.log('\n✨ Data successfully split by part of speech!');
        
    } catch (error) {
        console.error('❌ Error splitting data:', error.message);
    }
}

// Run the split
splitFlashcardsByPartOfSpeech(); 