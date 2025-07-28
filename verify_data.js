const fs = require('fs');

// Load the flashcards data
function loadAndVerifyData() {
    try {
        const jsonContent = fs.readFileSync('italian_flashcards.json', 'utf8');
        const data = JSON.parse(jsonContent);
        
        console.log('🔍 FLASHCARD DATA VERIFICATION REPORT');
        console.log('=====================================\n');
        
        const flashcards = data.flashcards;
        const totalCards = flashcards.length;
        
        console.log(`📊 Total flashcards: ${totalCards}\n`);
        
        // Initialize counters
        const stats = {
            withExamples: 0,
            withCognates: 0,
            withEtymology: 0,
            withRelatedWords: 0,
            missingExamples: [],
            missingCognates: [],
            missingEtymology: [],
            missingRelatedWords: []
        };
        
        // Analyze each flashcard
        flashcards.forEach(card => {
            // Check examples
            if (card.examples && card.examples.length > 0) {
                stats.withExamples++;
            } else {
                stats.missingExamples.push(card.word);
            }
            
            // Check cognates
            if (card.cognates && card.cognates.length > 0) {
                stats.withCognates++;
            } else {
                stats.missingCognates.push(card.word);
            }
            
            // Check etymology
            if (card.etymology && card.etymology.origin) {
                stats.withEtymology++;
            } else {
                stats.missingEtymology.push(card.word);
            }
            
            // Check related English words
            if (card.related_english_words && card.related_english_words.length > 0) {
                stats.withRelatedWords++;
            } else {
                stats.missingRelatedWords.push(card.word);
            }
        });
        
        // Print summary statistics
        console.log('📈 COVERAGE STATISTICS:');
        console.log(`Examples: ${stats.withExamples}/${totalCards} (${(stats.withExamples/totalCards*100).toFixed(1)}%)`);
        console.log(`Cognates: ${stats.withCognates}/${totalCards} (${(stats.withCognates/totalCards*100).toFixed(1)}%)`);
        console.log(`Etymology: ${stats.withEtymology}/${totalCards} (${(stats.withEtymology/totalCards*100).toFixed(1)}%)`);
        console.log(`Related Words: ${stats.withRelatedWords}/${totalCards} (${(stats.withRelatedWords/totalCards*100).toFixed(1)}%)\n`);
        
        // Show missing data details (first 10 items each)
        if (stats.missingExamples.length > 0) {
            console.log('❌ Missing Examples (first 10):');
            console.log(stats.missingExamples.slice(0, 10).join(', '));
            if (stats.missingExamples.length > 10) {
                console.log(`... and ${stats.missingExamples.length - 10} more`);
            }
            console.log('');
        }
        
        if (stats.missingCognates.length > 0) {
            console.log('❌ Missing Cognates (first 10):');
            console.log(stats.missingCognates.slice(0, 10).join(', '));
            if (stats.missingCognates.length > 10) {
                console.log(`... and ${stats.missingCognates.length - 10} more`);
            }
            console.log('');
        }
        
        if (stats.missingEtymology.length > 0) {
            console.log('❌ Missing Etymology (first 10):');
            console.log(stats.missingEtymology.slice(0, 10).join(', '));
            if (stats.missingEtymology.length > 10) {
                console.log(`... and ${stats.missingEtymology.length - 10} more`);
            }
            console.log('');
        }
        
        if (stats.missingRelatedWords.length > 0) {
            console.log('❌ Missing Related English Words (first 10):');
            console.log(stats.missingRelatedWords.slice(0, 10).join(', '));
            if (stats.missingRelatedWords.length > 10) {
                console.log(`... and ${stats.missingRelatedWords.length - 10} more`);
            }
            console.log('');
        }
        
        // Find words with complete data
        const completeWords = flashcards.filter(card => 
            card.examples && card.examples.length > 0 &&
            card.cognates && card.cognates.length > 0 &&
            card.etymology && card.etymology.origin &&
            card.related_english_words && card.related_english_words.length > 0
        );
        
        console.log(`✅ Words with COMPLETE data: ${completeWords.length}/${totalCards} (${(completeWords.length/totalCards*100).toFixed(1)}%)`);
        
        if (completeWords.length > 0) {
            console.log('🌟 Examples of complete words:');
            console.log(completeWords.slice(0, 10).map(card => card.word).join(', '));
        }
        
        // Detailed analysis for specific categories
        console.log('\n🔬 DETAILED ANALYSIS:');
        
        // Check for empty examples
        const emptyExamples = flashcards.filter(card => 
            !card.examples || card.examples.length === 0 || 
            card.examples.some(ex => !ex.italian || !ex.english)
        ).map(card => card.word);
        
        if (emptyExamples.length > 0) {
            console.log(`⚠️  Words with missing/incomplete examples: ${emptyExamples.length}`);
        }
        
        // Check for words that should have cognates but don't
        const shouldHaveCognates = flashcards.filter(card => 
            (!card.cognates || card.cognates.length === 0) &&
            card.word.length > 4 && // Longer words more likely to have cognates
            !['il', 'la', 'di', 'che', 'è', 'con', 'per', 'una', 'del', 'dei'].includes(card.word) // Skip articles/prepositions
        ).map(card => card.word);
        
        console.log(`🔍 Words that might have cognates: ${shouldHaveCognates.slice(0, 10).join(', ')}`);
        
        console.log('\n🎯 RECOMMENDATIONS:');
        if (stats.missingRelatedWords.length > stats.missingEtymology.length) {
            console.log('• Focus on adding related English words (lowest coverage)');
        }
        if (stats.missingEtymology.length > 50) {
            console.log('• Add etymology data for more common words');
        }
        if (stats.missingCognates.length > 100) {
            console.log('• Improve cognate detection algorithm');
        }
        
    } catch (error) {
        console.error('❌ Error loading data:', error.message);
    }
}

// Run the verification
loadAndVerifyData(); 