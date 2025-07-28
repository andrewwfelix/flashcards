const fs = require('fs');

// Comprehensive example generator for Italian words
function generateExamples(word, translations, partOfSpeech) {
    const examples = [];
    
    // Example templates based on part of speech and common Italian patterns
    const exampleTemplates = {
        'Article': {
            'il': [
                { italian: 'Il cane è grande', english: 'The dog is big', context: 'definite article with masculine noun' },
                { italian: 'Il libro è interessante', english: 'The book is interesting', context: 'common usage' }
            ],
            'la': [
                { italian: 'La casa è bella', english: 'The house is beautiful', context: 'definite article with feminine noun' },
                { italian: 'La pizza è deliziosa', english: 'The pizza is delicious', context: 'common usage' }
            ],
            'un': [
                { italian: 'Un amico mi ha chiamato', english: 'A friend called me', context: 'indefinite article with masculine noun' },
                { italian: 'È un bel giorno', english: 'It\'s a beautiful day', context: 'common expression' }
            ],
            'una': [
                { italian: 'Una donna cammina', english: 'A woman is walking', context: 'indefinite article with feminine noun' },
                { italian: 'Ho una macchina nuova', english: 'I have a new car', context: 'possession' }
            ]
        },
        'Verb': {
            'essere': [
                { italian: 'Io sono felice', english: 'I am happy', context: 'state of being' },
                { italian: 'Lei è dottoressa', english: 'She is a doctor', context: 'profession' }
            ],
            'avere': [
                { italian: 'Ho fame', english: 'I am hungry', context: 'common expression' },
                { italian: 'Hai una macchina?', english: 'Do you have a car?', context: 'possession' }
            ],
            'fare': [
                { italian: 'Cosa fai oggi?', english: 'What are you doing today?', context: 'daily activities' },
                { italian: 'Faccio i compiti', english: 'I\'m doing homework', context: 'tasks' }
            ],
            'andare': [
                { italian: 'Vado a casa', english: 'I go home', context: 'movement' },
                { italian: 'Andiamo al cinema', english: 'We go to the cinema', context: 'activities' }
            ],
            'dire': [
                { italian: 'Cosa dici?', english: 'What are you saying?', context: 'communication' },
                { italian: 'Dico sempre la verità', english: 'I always tell the truth', context: 'honesty' }
            ],
            'venire': [
                { italian: 'Vieni con me?', english: 'Are you coming with me?', context: 'invitation' },
                { italian: 'Vengo domani', english: 'I\'m coming tomorrow', context: 'future plans' }
            ],
            'mangiare': [
                { italian: 'Mi piace mangiare la pizza', english: 'I like to eat pizza', context: 'preferences' },
                { italian: 'Cosa vuoi mangiare?', english: 'What do you want to eat?', context: 'asking questions' }
            ],
            'bere': [
                { italian: 'Bevo acqua ogni giorno', english: 'I drink water every day', context: 'daily habits' },
                { italian: 'Vuoi bere qualcosa?', english: 'Do you want to drink something?', context: 'offering' }
            ],
            'vedere': [
                { italian: 'Vedo un uccello', english: 'I see a bird', context: 'visual perception' },
                { italian: 'Ci vediamo domani', english: 'See you tomorrow', context: 'farewell' }
            ],
            'sentire': [
                { italian: 'Sento la musica', english: 'I hear the music', context: 'auditory perception' },
                { italian: 'Come ti senti?', english: 'How do you feel?', context: 'emotions' }
            ]
        },
        'Noun': {
            'casa': [
                { italian: 'La mia casa è grande', english: 'My house is big', context: 'describing home' },
                { italian: 'Torno a casa alle sei', english: 'I return home at six', context: 'daily routine' }
            ],
            'tempo': [
                { italian: 'Non ho tempo', english: 'I don\'t have time', context: 'busy schedule' },
                { italian: 'Il tempo è bello oggi', english: 'The weather is nice today', context: 'weather' }
            ],
            'acqua': [
                { italian: 'Bevo molta acqua', english: 'I drink a lot of water', context: 'health habits' },
                { italian: 'L\'acqua è fredda', english: 'The water is cold', context: 'temperature' }
            ],
            'famiglia': [
                { italian: 'La mia famiglia è grande', english: 'My family is big', context: 'family size' },
                { italian: 'Amo la mia famiglia', english: 'I love my family', context: 'affection' }
            ],
            'amico': [
                { italian: 'Il mio migliore amico', english: 'My best friend', context: 'close relationships' },
                { italian: 'Ho molti amici', english: 'I have many friends', context: 'social circle' }
            ],
            'macchina': [
                { italian: 'La mia macchina è rossa', english: 'My car is red', context: 'describing possessions' },
                { italian: 'Vado al lavoro in macchina', english: 'I go to work by car', context: 'transportation' }
            ],
            'città': [
                { italian: 'Roma è una bella città', english: 'Rome is a beautiful city', context: 'describing places' },
                { italian: 'Vivo in città', english: 'I live in the city', context: 'residence' }
            ]
        },
        'Preposition': {
            'di': [
                { italian: 'La casa di Maria', english: 'Maria\'s house', context: 'possession' },
                { italian: 'Sono di Roma', english: 'I am from Rome', context: 'origin' }
            ],
            'a': [
                { italian: 'Vado a casa', english: 'I go home', context: 'direction' },
                { italian: 'Sono a scuola', english: 'I am at school', context: 'location' }
            ],
            'in': [
                { italian: 'Sono in macchina', english: 'I am in the car', context: 'inside location' },
                { italian: 'Vivo in Italia', english: 'I live in Italy', context: 'country' }
            ],
            'con': [
                { italian: 'Vengo con te', english: 'I come with you', context: 'accompaniment' },
                { italian: 'Mangio con la forchetta', english: 'I eat with a fork', context: 'instruments' }
            ],
            'per': [
                { italian: 'Questo è per te', english: 'This is for you', context: 'beneficiary' },
                { italian: 'Studio per l\'esame', english: 'I study for the exam', context: 'purpose' }
            ],
            'da': [
                { italian: 'Vengo da casa', english: 'I come from home', context: 'origin point' },
                { italian: 'Vado dal medico', english: 'I go to the doctor', context: 'destination person' }
            ],
            'su': [
                { italian: 'Il libro è sul tavolo', english: 'The book is on the table', context: 'position' },
                { italian: 'Saliamo su', english: 'We go up', context: 'direction' }
            ]
        },
        'Adverb': {
            'molto': [
                { italian: 'Sono molto felice', english: 'I am very happy', context: 'intensity' },
                { italian: 'Mangio molto', english: 'I eat a lot', context: 'quantity' }
            ],
            'bene': [
                { italian: 'Sto bene', english: 'I am well', context: 'health status' },
                { italian: 'Parli bene italiano', english: 'You speak Italian well', context: 'skill level' }
            ],
            'anche': [
                { italian: 'Anch\'io vengo', english: 'I come too', context: 'inclusion' },
                { italian: 'Anche lei è italiana', english: 'She is Italian too', context: 'similarity' }
            ],
            'solo': [
                { italian: 'Sono solo a casa', english: 'I am alone at home', context: 'solitude' },
                { italian: 'Solo due persone', english: 'Only two people', context: 'limitation' }
            ]
        },
        'Adjective': {
            'grande': [
                { italian: 'Una casa grande', english: 'A big house', context: 'size description' },
                { italian: 'È un grande uomo', english: 'He is a great man', context: 'character praise' }
            ],
            'nuovo': [
                { italian: 'Ho una macchina nuova', english: 'I have a new car', context: 'recent acquisition' },
                { italian: 'È un nuovo giorno', english: 'It\'s a new day', context: 'fresh start' }
            ],
            'buono': [
                { italian: 'È un buon libro', english: 'It\'s a good book', context: 'quality assessment' },
                { italian: 'Buon giorno!', english: 'Good day!', context: 'greeting' }
            ],
            'piccolo': [
                { italian: 'Un piccolo cane', english: 'A small dog', context: 'size description' },
                { italian: 'Ho un piccolo problema', english: 'I have a small problem', context: 'minimizing issues' }
            ]
        }
    };

    // First try to get specific examples for this word
    if (exampleTemplates[partOfSpeech] && exampleTemplates[partOfSpeech][word]) {
        return exampleTemplates[partOfSpeech][word];
    }

    // Generate contextual examples based on part of speech and word
    switch (partOfSpeech) {
        case 'Noun':
            if (word.endsWith('o')) { // likely masculine
                examples.push(
                    { italian: `Il ${word} è importante`, english: `The ${translations[0]} is important`, context: 'general description' },
                    { italian: `Ho un ${word}`, english: `I have a ${translations[0]}`, context: 'possession' }
                );
            } else if (word.endsWith('a')) { // likely feminine
                examples.push(
                    { italian: `La ${word} è bella`, english: `The ${translations[0]} is beautiful`, context: 'general description' },
                    { italian: `Vedo una ${word}`, english: `I see a ${translations[0]}`, context: 'observation' }
                );
            } else {
                examples.push(
                    { italian: `Mi piace il/la ${word}`, english: `I like the ${translations[0]}`, context: 'preference' },
                    { italian: `Dove è il/la ${word}?`, english: `Where is the ${translations[0]}?`, context: 'location question' }
                );
            }
            break;

        case 'Verb':
            examples.push(
                { italian: `Mi piace ${word}`, english: `I like to ${translations[0]}`, context: 'preference' },
                { italian: `Devo ${word}`, english: `I must ${translations[0]}`, context: 'necessity' }
            );
            break;

        case 'Adjective':
            examples.push(
                { italian: `È molto ${word}`, english: `It is very ${translations[0]}`, context: 'description' },
                { italian: `Una persona ${word}`, english: `A ${translations[0]} person`, context: 'character description' }
            );
            break;

        case 'Adverb':
            examples.push(
                { italian: `Parlo ${word}`, english: `I speak ${translations[0]}`, context: 'manner of speaking' },
                { italian: `${word.charAt(0).toUpperCase() + word.slice(1)} interessante`, english: `${translations[0].charAt(0).toUpperCase() + translations[0].slice(1)} interesting`, context: 'evaluation' }
            );
            break;

        case 'Preposition':
            examples.push(
                { italian: `Vado ${word} casa`, english: `I go ${translations[0]} home`, context: 'movement' },
                { italian: `È ${word} tavolo`, english: `It is ${translations[0]} the table`, context: 'position' }
            );
            break;

        case 'Pronoun':
            examples.push(
                { italian: `${word.charAt(0).toUpperCase() + word.slice(1)} sono felice`, english: `${translations[0].charAt(0).toUpperCase() + translations[0].slice(1)} am happy`, context: 'personal statement' },
                { italian: `Dove sei ${word}?`, english: `Where are ${translations[0]}?`, context: 'location question' }
            );
            break;

        case 'Conjunction':
            examples.push(
                { italian: `Mangio ${word} bevo`, english: `I eat ${translations[0]} drink`, context: 'connecting actions' },
                { italian: `Casa ${word} famiglia`, english: `House ${translations[0]} family`, context: 'connecting concepts' }
            );
            break;

        case 'Article':
            examples.push(
                { italian: `${word} casa è grande`, english: `${translations[0]} house is big`, context: 'definite reference' },
                { italian: `Vedo ${word} cane`, english: `I see ${translations[0]} dog`, context: 'visual reference' }
            );
            break;

        default:
            examples.push(
                { italian: `Questa è una frase con "${word}"`, english: `This is a sentence with "${translations[0]}"`, context: 'example usage' },
                { italian: `"${word}" è importante`, english: `"${translations[0]}" is important`, context: 'general statement' }
            );
    }

    return examples;
}

// Get English cognates for Italian words
function getCognates(word, translations, partOfSpeech) {
    // Common cognate patterns and specific cognates
    const cognateDatabase = {
        // Direct cognates
        'animale': ['animal'],
        'arte': ['art'],
        'banca': ['bank'],
        'centro': ['center', 'central'],
        'chiesa': ['church'],
        'città': ['city'],
        'comune': ['common', 'commune'],
        'cultura': ['culture', 'cultural'],
        'decisione': ['decision', 'decisive'],
        'differenza': ['difference', 'different'],
        'difficile': ['difficult', 'difficulty'],
        'direzione': ['direction', 'direct'],
        'economia': ['economy', 'economic'],
        'energia': ['energy', 'energetic'],
        'esperienza': ['experience'],
        'famiglia': ['family', 'familiar'],
        'famoso': ['famous'],
        'figura': ['figure'],
        'forma': ['form', 'format'],
        'fortuna': ['fortune', 'fortunate'],
        'futuro': ['future'],
        'generale': ['general'],
        'governo': ['government', 'govern'],
        'grande': ['grand', 'grandeur'],
        'gruppo': ['group'],
        'guerra': ['war'], // from Germanic, but cognate through French 'guerre'
        'idea': ['idea', 'ideal'],
        'imparare': ['learn'], // through Latin 'imparare'
        'importante': ['important'],
        'informazione': ['information'],
        'interessante': ['interesting', 'interest'],
        'internazionale': ['international'],
        'italiano': ['Italian'],
        'lingua': ['language', 'linguistic'],
        'locale': ['local'],
        'macchina': ['machine'],
        'materia': ['matter', 'material'],
        'medicina': ['medicine', 'medical'],
        'memoria': ['memory'],
        'metro': ['meter', 'metric'],
        'minuto': ['minute'],
        'moderno': ['modern'],
        'momento': ['moment'],
        'mondo': ['world'], // through French 'monde'
        'montagna': ['mountain'],
        'musica': ['music', 'musical'],
        'natura': ['nature', 'natural'],
        'nazione': ['nation', 'national'],
        'necessario': ['necessary'],
        'numero': ['number', 'numeral'],
        'oggetto': ['object'],
        'origine': ['origin', 'original'],
        'ospedale': ['hospital'],
        'particolare': ['particular'],
        'passato': ['past'],
        'periodo': ['period'],
        'persona': ['person', 'personal'],
        'pesce': ['fish'], // through Latin 'piscis'
        'politica': ['politics', 'political'],
        'popolazione': ['population'],
        'possibile': ['possible'],
        'posto': ['post', 'position'],
        'presente': ['present'],
        'presidente': ['president'],
        'problema': ['problem'],
        'prodotto': ['product', 'produce'],
        'professore': ['professor'],
        'programma': ['program'],
        'proprio': ['proper', 'property'],
        'provincia': ['province', 'provincial'],
        'pubblico': ['public'],
        'qualità': ['quality'],
        'ragione': ['reason', 'rational'],
        'rapporto': ['report', 'rapport'],
        'reale': ['real', 'reality'],
        'regione': ['region', 'regional'],
        'religioso': ['religious'],
        'repubblica': ['republic'],
        'ricerca': ['research'],
        'risposta': ['response'],
        'scienza': ['science', 'scientific'],
        'scuola': ['school'],
        'secondo': ['second'],
        'servizio': ['service'],
        'sistema': ['system'],
        'sociale': ['social'],
        'società': ['society'],
        'speciale': ['special'],
        'storia': ['story', 'history'],
        'strada': ['street'],
        'studio': ['study', 'studio'],
        'tecnico': ['technical', 'technique'],
        'telefono': ['telephone'],
        'televisione': ['television'],
        'tempo': ['time', 'tempo', 'temporal'],
        'termine': ['term', 'terminal'],
        'territorio': ['territory'],
        'tipo': ['type'],
        'tradizione': ['tradition'],
        'università': ['university'],
        'uso': ['use'],
        'valore': ['value'],
        'veloce': ['velocity'],
        'viaggio': ['voyage'],
        'vita': ['vital', 'vitality'],
        'zona': ['zone'],
        
        // Verb cognates
        'accettare': ['accept'],
        'accompagnare': ['accompany'],
        'accorgere': ['accord'],
        'aiutare': ['aid'],
        'apparire': ['appear'],
        'aprire': ['aperture'],
        'armare': ['arm'],
        'arrivare': ['arrive'],
        'attaccare': ['attack'],
        'aumentare': ['augment'],
        'cambiare': ['change'],
        'cercare': ['search'], // through circum
        'chiamare': ['claim', 'clamor'],
        'chiudere': ['close'],
        'cominciare': ['commence'],
        'comporre': ['compose'],
        'comprare': ['compare'], // false friend but related
        'comunicare': ['communicate'],
        'considerare': ['consider'],
        'controllare': ['control'],
        'correre': ['current', 'course'],
        'costruire': ['construct'],
        'creare': ['create'],
        'crescere': ['crescent'],
        'decidere': ['decide'],
        'descrivere': ['describe'],
        'determinare': ['determine'],
        'diventare': ['advent'],
        'dividere': ['divide'],
        'domandare': ['demand'],
        'entrare': ['enter'],
        'esistere': ['exist'],
        'evitare': ['avoid'],
        'formare': ['form'],
        'guardare': ['guard'],
        'guidare': ['guide'],
        'immaginare': ['imagine'],
        'incontrare': ['encounter'],
        'indicare': ['indicate'],
        'informare': ['inform'],
        'iniziare': ['initiate'],
        'insegnare': ['teach'], // through Latin 'insignare'
        'intendere': ['intend'],
        'interessare': ['interest'],
        'invitare': ['invite'],
        'lasciare': ['lax'], // through Latin 'laxare'
        'mancare': ['lack'], // through Germanic
        'mantenere': ['maintain'],
        'muovere': ['move'],
        'nascere': ['nascent'],
        'operare': ['operate'],
        'ordinare': ['order'],
        'organizzare': ['organize'],
        'parlare': ['parlor', 'parliament'],
        'partecipare': ['participate'],
        'partire': ['part', 'depart'],
        'passare': ['pass'],
        'pensare': ['pensive'],
        'perdere': ['perdition'],
        'permettere': ['permit'],
        'portare': ['port', 'transport'],
        'presentare': ['present'],
        'produrre': ['produce'],
        'promettere': ['promise'],
        'proporre': ['propose'],
        'provare': ['prove'],
        'raggiungere': ['reach'], // through Germanic
        'rappresentare': ['represent'],
        'restare': ['rest'],
        'ricevere': ['receive'],
        'riconoscere': ['recognize'],
        'ricordare': ['record'],
        'ridere': ['ridiculous'],
        'rimanere': ['remain'],
        'ripetere': ['repeat'],
        'rispondere': ['respond'],
        'risultare': ['result'],
        'rivedere': ['review'],
        'salutare': ['salute'],
        'sbagliare': ['error'], // not direct cognate
        'scegliere': ['select'], // not direct but related concept
        'scendere': ['descend'],
        'scherzare': ['jest'], // through Germanic
        'scusare': ['excuse'],
        'seguire': ['sequence'],
        'sembrare': ['semblance'],
        'sentire': ['sense', 'sentiment'],
        'servire': ['serve'],
        'significare': ['signify'],
        'smettere': ['submit'], // not direct
        'sognare': ['somnium'], // Latin root
        'spegnere': ['extinct'], // not direct
        'spendere': ['spend'],
        'spiegare': ['explain'], // through Latin 'explicare'
        'sposare': ['spouse'],
        'studiare': ['study'],
        'succedere': ['succeed'],
        'suonare': ['sound'],
        'svegliare': ['vigil'], // through Latin 'vigilare'
        'sviluppare': ['develop'], // through French
        'tagliare': ['cut'], // through Germanic but cognate with 'tailor'
        'tenere': ['tenacious', 'tenant'],
        'tornare': ['turn'],
        'trovare': ['trove'],
        'uccidere': ['occident'], // not direct
        'udire': ['auditory'],
        'usare': ['use'],
        'uscire': ['exit'], // through Latin 'exire'
        'vendere': ['vend'],
        'venire': ['venue', 'advent'],
        'vincere': ['victory'],
        'visitare': ['visit'],
        'vivere': ['vivid', 'vital'],
        'volare': ['volatile'],
        'voltare': ['volt'],
        'vuotare': ['void']
    };

    const cognates = [];
    
    // Check direct matches first
    if (cognateDatabase[word]) {
        cognates.push(...cognateDatabase[word]);
    }

    // Pattern-based cognate detection
    // -zione/-sione → -tion/-sion
    if (word.endsWith('zione') || word.endsWith('sione')) {
        const stem = word.slice(0, -5);
        if (word.endsWith('zione')) {
            cognates.push(stem + 'tion');
        } else {
            cognates.push(stem + 'sion');
        }
    }
    
    // -tà → -ty
    if (word.endsWith('tà')) {
        const stem = word.slice(0, -2);
        cognates.push(stem + 'ty');
    }
    
    // -bile → -ble
    if (word.endsWith('bile')) {
        const stem = word.slice(0, -4);
        cognates.push(stem + 'ble');
    }
    
    // -ico → -ic
    if (word.endsWith('ico')) {
        const stem = word.slice(0, -3);
        cognates.push(stem + 'ic');
    }
    
    // -ista → -ist
    if (word.endsWith('ista')) {
        const stem = word.slice(0, -4);
        cognates.push(stem + 'ist');
    }
    
    // -ismo → -ism
    if (word.endsWith('ismo')) {
        const stem = word.slice(0, -4);
        cognates.push(stem + 'ism');
    }
    
    // -oso → -ous
    if (word.endsWith('oso')) {
        const stem = word.slice(0, -3);
        cognates.push(stem + 'ous');
    }
    
    // Remove duplicates and return
    return [...new Set(cognates)];
}

// Get related English words with same etymology
function getRelatedEnglishWords(word, etymology) {
    if (!etymology) return [];

    const relatedWordsDatabase = {
        // Latin tempus family
        'tempo': [
            { word: 'temporal', meaning: 'relating to time', usage: 'temporal lobe of the brain' },
            { word: 'temporary', meaning: 'lasting for a short time', usage: 'temporary solution' },
            { word: 'contemporary', meaning: 'belonging to the same time', usage: 'contemporary art' }
        ],
        // Latin homo family  
        'uomo': [
            { word: 'human', meaning: 'relating to people', usage: 'human nature' },
            { word: 'humane', meaning: 'showing compassion', usage: 'humane treatment' },
            { word: 'humanity', meaning: 'human beings collectively', usage: 'crimes against humanity' }
        ],
        // Latin casa family
        'casa': [
            { word: 'casino', meaning: 'gambling house', usage: 'Las Vegas casino' },
            { word: 'casement', meaning: 'window frame', usage: 'casement window' }
        ],
        // Latin aqua family
        'acqua': [
            { word: 'aquatic', meaning: 'living in water', usage: 'aquatic animals' },
            { word: 'aquarium', meaning: 'water tank for fish', usage: 'home aquarium' },
            { word: 'aqueduct', meaning: 'water channel', usage: 'Roman aqueduct' }
        ],
        // Latin universitas family
        'università': [
            { word: 'university', meaning: 'higher education institution', usage: 'state university' },
            { word: 'universal', meaning: 'applying to all', usage: 'universal truth' },
            { word: 'universe', meaning: 'all existing matter', usage: 'expanding universe' },
            { word: 'unity', meaning: 'state of being one', usage: 'national unity' }
        ],
        // Latin medicina family
        'medicina': [
            { word: 'medicine', meaning: 'healing science', usage: 'practice medicine' },
            { word: 'medical', meaning: 'relating to medicine', usage: 'medical school' },
            { word: 'medicinal', meaning: 'having healing properties', usage: 'medicinal herbs' },
            { word: 'remedy', meaning: 'cure or treatment', usage: 'home remedy' }
        ],
        // Latin labor family
        'lavoro': [
            { word: 'labor', meaning: 'work', usage: 'manual labor' },
            { word: 'laboratory', meaning: 'research facility', usage: 'science laboratory' },
            { word: 'collaborate', meaning: 'work together', usage: 'collaborate on project' },
            { word: 'elaborate', meaning: 'detailed', usage: 'elaborate plan' }
        ],
        // Latin domina family
        'donna': [
            { word: 'dominate', meaning: 'to control or rule', usage: 'dominate the market' },
            { word: 'dominant', meaning: 'most important or powerful', usage: 'dominant species' },
            { word: 'domain', meaning: 'area of control', usage: 'public domain' },
            { word: 'madonna', meaning: 'image of Virgin Mary', usage: 'Renaissance madonna' }
        ]
    };

    return relatedWordsDatabase[word] || [];
}

// Get etymology information for words
function getEtymology(word, translations, partOfSpeech) {
    const etymologyDatabase = {
        // Latin origins (very common in Italian)
        'casa': { origin: 'Latin', source: 'casa', meaning: 'cottage, hut', notes: 'From Latin casa meaning a simple dwelling' },
        'acqua': { origin: 'Latin', source: 'aqua', meaning: 'water', notes: 'Direct from Latin aqua, cognate with English aquatic' },
        'libro': { origin: 'Latin', source: 'liber', meaning: 'book, bark of tree', notes: 'From Latin liber, originally meaning tree bark used for writing' },
        'tempo': { origin: 'Latin', source: 'tempus', meaning: 'time, season', notes: 'From Latin tempus, related to English temporal' },
        'città': { origin: 'Latin', source: 'civitas', meaning: 'citizenship, state', notes: 'From Latin civitas, root of English civic, citizen' },
        'scuola': { origin: 'Latin', source: 'schola', meaning: 'leisure, school', notes: 'From Latin schola, from Greek σχολή meaning leisure' },
        'famiglia': { origin: 'Latin', source: 'familia', meaning: 'household, family', notes: 'From Latin familia, root of English family' },
        'centro': { origin: 'Latin', source: 'centrum', meaning: 'center, pivot', notes: 'From Latin centrum, from Greek κέντρον meaning goad, center' },
        'stato': { origin: 'Latin', source: 'status', meaning: 'condition, state', notes: 'From Latin status, past participle of stare (to stand)' },
        'persona': { origin: 'Latin', source: 'persona', meaning: 'mask, character', notes: 'From Latin persona, originally meaning theatrical mask' },
        'parte': { origin: 'Latin', source: 'pars', meaning: 'part, portion', notes: 'From Latin pars (stem part-), related to English part' },
        'mano': { origin: 'Latin', source: 'manus', meaning: 'hand', notes: 'From Latin manus, cognate with English manual, manipulate' },
        'occhio': { origin: 'Latin', source: 'oculus', meaning: 'eye', notes: 'From Latin oculus, root of English ocular, oculist' },
        'giorno': { origin: 'Latin', source: 'diurnus', meaning: 'daily, of the day', notes: 'From Latin diurnus, related to English diurnal' },
        'mondo': { origin: 'Latin', source: 'mundus', meaning: 'clean, world', notes: 'From Latin mundus, originally meaning clean, pure' },
        'vita': { origin: 'Latin', source: 'vita', meaning: 'life', notes: 'From Latin vita, root of English vital, vitamin' },
        'porta': { origin: 'Latin', source: 'porta', meaning: 'gate, door', notes: 'From Latin porta, related to English portal, port' },
        'nero': { origin: 'Latin', source: 'niger', meaning: 'black', notes: 'From Latin niger, related to English negative' },
        'bianco': { origin: 'Germanic', source: 'blank', meaning: 'white, shining', notes: 'From Germanic blank, cognate with English blank' },
        'rosso': { origin: 'Latin', source: 'russus', meaning: 'red', notes: 'From Latin russus, variant of ruber (red)' },
        'grande': { origin: 'Latin', source: 'grandis', meaning: 'large, great', notes: 'From Latin grandis, root of English grand, grandiose' },
        'piccolo': { origin: 'Latin', source: 'piculus', meaning: 'small', notes: 'Possibly from Latin piculus, diminutive form' },
        'nuovo': { origin: 'Latin', source: 'novus', meaning: 'new', notes: 'From Latin novus, cognate with English novel, novice' },
        'vecchio': { origin: 'Latin', source: 'vetulus', meaning: 'old', notes: 'From Latin vetulus, diminutive of vetus (old)' },
        'bello': { origin: 'Latin', source: 'bellus', meaning: 'pretty, handsome', notes: 'From Latin bellus, related to English belle, beauty' },
        'buono': { origin: 'Latin', source: 'bonus', meaning: 'good', notes: 'From Latin bonus, cognate with English bonus' },
        'amore': { origin: 'Latin', source: 'amor', meaning: 'love', notes: 'From Latin amor, root of English amorous, amateur' },
        'pace': { origin: 'Latin', source: 'pax', meaning: 'peace', notes: 'From Latin pax (stem pac-), cognate with English pacific' },
        'guerra': { origin: 'Germanic', source: 'werra', meaning: 'strife, war', notes: 'From Germanic werra, cognate with English war' },
        'cane': { origin: 'Latin', source: 'canis', meaning: 'dog', notes: 'From Latin canis, root of English canine' },
        'gatto': { origin: 'Latin', source: 'cattus', meaning: 'cat', notes: 'From Latin cattus, possibly from North African origin' },
        'mare': { origin: 'Latin', source: 'mare', meaning: 'sea', notes: 'From Latin mare, root of English marine, maritime' },
        'cielo': { origin: 'Latin', source: 'caelum', meaning: 'sky, heaven', notes: 'From Latin caelum, related to English celestial' },
        'terra': { origin: 'Latin', source: 'terra', meaning: 'earth, land', notes: 'From Latin terra, root of English terrestrial, territory' },
        'fuoco': { origin: 'Latin', source: 'focus', meaning: 'hearth, fire', notes: 'From Latin focus, originally meaning hearth' },
        'sole': { origin: 'Latin', source: 'sol', meaning: 'sun', notes: 'From Latin sol, root of English solar, solstice' },
        'luna': { origin: 'Latin', source: 'luna', meaning: 'moon', notes: 'From Latin luna, root of English lunar, lunacy' },
        'musica': { origin: 'Latin', source: 'musica', meaning: 'music', notes: 'From Latin musica, from Greek μουσική (art of the Muses)' },
        'vino': { origin: 'Latin', source: 'vinum', meaning: 'wine', notes: 'From Latin vinum, cognate with English wine, vine' },
        'pane': { origin: 'Latin', source: 'panis', meaning: 'bread', notes: 'From Latin panis, root of English pantry, company (com-panis)' },
        'strada': { origin: 'Latin', source: 'strata', meaning: 'paved road', notes: 'From Latin strata (via), meaning paved road' },
        'ponte': { origin: 'Latin', source: 'pons', meaning: 'bridge', notes: 'From Latin pons (stem pont-), root of English pontoon' },
        'chiesa': { origin: 'Greek', source: 'kyriakón', meaning: 'of the Lord', notes: 'From Greek κυριακόν (house of the Lord) via Latin ecclesia' },
        'scienza': { origin: 'Latin', source: 'scientia', meaning: 'knowledge', notes: 'From Latin scientia, from scire (to know)' },
        'medicina': { origin: 'Latin', source: 'medicina', meaning: 'healing art', notes: 'From Latin medicina (ars), the art of healing' },
        'storia': { origin: 'Greek', source: 'história', meaning: 'inquiry, history', notes: 'From Greek ἱστορία, from historein (to inquire)' },
        'uomo': { origin: 'Latin', source: 'homo', meaning: 'man, human being', notes: 'From Latin homo (stem homin-), root of English human, humane' },
        'donna': { origin: 'Latin', source: 'domina', meaning: 'lady, mistress', notes: 'From Latin domina, feminine of dominus (lord, master)' },
        'bambino': { origin: 'Italian', source: 'bambo', meaning: 'child', notes: 'From Italian bambo (simpleton), possibly of onomatopoeic origin' },
        'ragazzo': { origin: 'Arabic', source: 'raqqāṣ', meaning: 'messenger, courier', notes: 'From Arabic raqqāṣ via medieval trade routes' },
        'ragazza': { origin: 'Arabic', source: 'raqqāṣ', meaning: 'messenger, courier', notes: 'Feminine form of ragazzo, from Arabic raqqāṣ' },
        'lavoro': { origin: 'Latin', source: 'labor', meaning: 'work, toil', notes: 'From Latin labor, root of English labor, laboratory' },
        'denaro': { origin: 'Latin', source: 'denarius', meaning: 'containing ten', notes: 'From Latin denarius (coin worth ten asses), root of English monetary' },
        'oro': { origin: 'Latin', source: 'aurum', meaning: 'gold', notes: 'From Latin aurum, root of English aurous, aureate' },
        'argento': { origin: 'Latin', source: 'argentum', meaning: 'silver', notes: 'From Latin argentum, root of English Argentina (land of silver)' },
        'ferro': { origin: 'Latin', source: 'ferrum', meaning: 'iron', notes: 'From Latin ferrum, root of English ferrous, ferric' },
        'pietra': { origin: 'Latin', source: 'petra', meaning: 'rock, stone', notes: 'From Latin petra, from Greek πέτρα, root of English petrify' },
        'bosco': { origin: 'Germanic', source: 'busk', meaning: 'wood, forest', notes: 'From Germanic busk, cognate with English bush' },
        'paese': { origin: 'Latin', source: 'pagensis', meaning: 'of the countryside', notes: 'From Latin pagensis, from pagus (country district)' },
        'nazione': { origin: 'Latin', source: 'natio', meaning: 'birth, race', notes: 'From Latin natio, from nasci (to be born), root of English nation' },
        'popolo': { origin: 'Latin', source: 'populus', meaning: 'people', notes: 'From Latin populus, root of English popular, population' },
        'governo': { origin: 'Latin', source: 'gubernare', meaning: 'to steer, govern', notes: 'From Latin gubernare, from Greek κυβερνᾶν, root of English govern' },
        'legge': { origin: 'Latin', source: 'lex', meaning: 'law', notes: 'From Latin lex (stem leg-), root of English legal, legitimate' },
        'giustizia': { origin: 'Latin', source: 'iustitia', meaning: 'justice', notes: 'From Latin iustitia, from iustus (just), root of English justice' },
        'libertà': { origin: 'Latin', source: 'libertas', meaning: 'freedom', notes: 'From Latin libertas, from liber (free), root of English liberty' },
        'sicurezza': { origin: 'Latin', source: 'securitas', meaning: 'freedom from care', notes: 'From Latin securitas, from securus (secure), root of English security' },
        'salute': { origin: 'Latin', source: 'salus', meaning: 'health, safety', notes: 'From Latin salus (stem salut-), root of English salute, salvation' },
        'malattia': { origin: 'Latin', source: 'male habitus', meaning: 'badly kept', notes: 'From Latin male habitus (badly kept/maintained), meaning illness' },
        'ospedale': { origin: 'Latin', source: 'hospitale', meaning: 'place for guests', notes: 'From Latin hospitale, from hospes (host/guest), root of English hospital' },
        'dottore': { origin: 'Latin', source: 'doctor', meaning: 'teacher', notes: 'From Latin doctor, from docere (to teach), root of English doctor' },
        'università': { origin: 'Latin', source: 'universitas', meaning: 'the whole', notes: 'From Latin universitas, from universus (whole), root of English university' },
        'studente': { origin: 'Latin', source: 'studens', meaning: 'eager, zealous', notes: 'From Latin studens, from studere (to be eager), root of English student' },
        'professore': { origin: 'Latin', source: 'professor', meaning: 'one who declares', notes: 'From Latin professor, from profiteri (to declare), root of English professor' },
        'biblioteca': { origin: 'Greek', source: 'bibliothēkē', meaning: 'book repository', notes: 'From Greek βιβλιοθήκη (biblio=book + theke=repository)' }
    };

    // Check if we have specific etymology for this word
    if (etymologyDatabase[word]) {
        return etymologyDatabase[word];
    }

    // Pattern-based etymology detection for common suffixes
    if (word.endsWith('zione') || word.endsWith('sione')) {
        return {
            origin: 'Latin',
            source: word.replace(/(z|s)ione$/, 'tion'),
            meaning: 'action or result of',
            notes: `From Latin -tio/-sio suffix, indicating action or result. Cognate with English -tion/-sion words.`
        };
    }

    if (word.endsWith('tà')) {
        return {
            origin: 'Latin',
            source: word.replace('tà', 'tas'),
            meaning: 'quality or state',
            notes: `From Latin -tas suffix, indicating quality or condition. Related to English -ty suffix.`
        };
    }

    if (word.endsWith('bile')) {
        return {
            origin: 'Latin',
            source: word.replace('bile', 'bilis'),
            meaning: 'able to be',
            notes: `From Latin -bilis suffix, meaning "able to be" or "worthy of". Cognate with English -ble suffix.`
        };
    }

    if (word.endsWith('ico') || word.endsWith('ica')) {
        return {
            origin: 'Greek/Latin',
            source: word.replace('ic[ao]', 'icus'),
            meaning: 'relating to',
            notes: `From Greek/Latin -icus suffix, meaning "relating to" or "characteristic of". Cognate with English -ic.`
        };
    }

    if (word.endsWith('ista')) {
        return {
            origin: 'Greek',
            source: word.replace('ista', 'istes'),
            meaning: 'one who practices',
            notes: `From Greek -istes suffix, meaning "one who does" or "practitioner of". Cognate with English -ist.`
        };
    }

    // Return null if no etymology found
    return null;
}

// Get conjugations for verbs
function getConjugations(word, partOfSpeech) {
    if (partOfSpeech !== 'Verb') return undefined;

    const commonConjugations = {
        'essere': { io: 'sono', tu: 'sei', 'lui/lei': 'è', noi: 'siamo', voi: 'siete', loro: 'sono' },
        'avere': { io: 'ho', tu: 'hai', 'lui/lei': 'ha', noi: 'abbiamo', voi: 'avete', loro: 'hanno' },
        'fare': { io: 'faccio', tu: 'fai', 'lui/lei': 'fa', noi: 'facciamo', voi: 'fate', loro: 'fanno' },
        'andare': { io: 'vado', tu: 'vai', 'lui/lei': 'va', noi: 'andiamo', voi: 'andate', loro: 'vanno' },
        'dire': { io: 'dico', tu: 'dici', 'lui/lei': 'dice', noi: 'diciamo', voi: 'dite', loro: 'dicono' },
        'venire': { io: 'vengo', tu: 'vieni', 'lui/lei': 'viene', noi: 'veniamo', voi: 'venite', loro: 'vengono' },
        'dare': { io: 'do', tu: 'dai', 'lui/lei': 'dà', noi: 'diamo', voi: 'date', loro: 'danno' },
        'stare': { io: 'sto', tu: 'stai', 'lui/lei': 'sta', noi: 'stiamo', voi: 'state', loro: 'stanno' },
        'sapere': { io: 'so', tu: 'sai', 'lui/lei': 'sa', noi: 'sappiamo', voi: 'sapete', loro: 'sanno' },
        'vedere': { io: 'vedo', tu: 'vedi', 'lui/lei': 'vede', noi: 'vediamo', voi: 'vedete', loro: 'vedono' }
    };

    if (commonConjugations[word]) {
        return commonConjugations[word];
    }

    // Generate regular conjugations for -are, -ere, -ire verbs
    if (word.endsWith('are')) {
        const stem = word.slice(0, -3);
        return {
            io: stem + 'o',
            tu: stem + 'i',
            'lui/lei': stem + 'a',
            noi: stem + 'iamo',
            voi: stem + 'ate',
            loro: stem + 'ano'
        };
    } else if (word.endsWith('ere')) {
        const stem = word.slice(0, -3);
        return {
            io: stem + 'o',
            tu: stem + 'i',
            'lui/lei': stem + 'e',
            noi: stem + 'iamo',
            voi: stem + 'ete',
            loro: stem + 'ono'
        };
    } else if (word.endsWith('ire')) {
        const stem = word.slice(0, -3);
        return {
            io: stem + 'o',
            tu: stem + 'i',
            'lui/lei': stem + 'e',
            noi: stem + 'iamo',
            voi: stem + 'ite',
            loro: stem + 'ono'
        };
    }

    return undefined;
}

// Convert CSV to comprehensive JSON
function convertCSVToJSON() {
    try {
        const csvContent = fs.readFileSync('top_1000_italian_words.csv', 'utf8');
        const lines = csvContent.split('\n');
        const flashcards = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = line.split(',');
                if (values.length >= 5) {
                    const word = values[0];
                    const translations = values[1].split('/').map(t => t.trim());
                    const category = values[2];
                    const difficulty = values[3];
                    const partOfSpeech = values[4];

                    const flashcard = {
                        id: i,
                        word: word,
                        translations: translations,
                        part_of_speech: partOfSpeech,
                        difficulty: difficulty,
                        category: category,
                        examples: generateExamples(word, translations, partOfSpeech)
                    };

                    // Add cognates if they exist
                    const cognates = getCognates(word, translations, partOfSpeech);
                    if (cognates.length > 0) {
                        flashcard.cognates = cognates;
                    }

                    // Add etymology if it exists
                    const etymology = getEtymology(word, translations, partOfSpeech);
                    if (etymology) {
                        flashcard.etymology = etymology;
                        
                        // Add related English words if etymology exists
                        const relatedWords = getRelatedEnglishWords(word, etymology);
                        if (relatedWords.length > 0) {
                            flashcard.related_english_words = relatedWords;
                        }
                    }

                    // Add conjugations for verbs
                    const conjugations = getConjugations(word, partOfSpeech);
                    if (conjugations) {
                        flashcard.conjugations = conjugations;
                    }

                    flashcards.push(flashcard);
                }
            }
        }

        const jsonStructure = {
            flashcards: flashcards
        };

        fs.writeFileSync('italian_flashcards.json', JSON.stringify(jsonStructure, null, 2));
        console.log(`✅ Successfully converted ${flashcards.length} flashcards to JSON with examples!`);
        
    } catch (error) {
        console.error('❌ Error converting CSV to JSON:', error.message);
    }
}

// Run the conversion
convertCSVToJSON(); 