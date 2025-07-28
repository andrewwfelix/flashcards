# OpenAI Noun Review System

This folder contains scripts to improve your Italian noun flashcard data using OpenAI's GPT models.

## Setup

### 1. Install OpenAI Package
```bash
npm install openai
```

### 2. Set Your OpenAI API Key
You need an OpenAI API key to use this system.

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your_api_key_here
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your_api_key_here"
```

**Alternative: Create a .env file**
```bash
# Create .env file in the project root
echo OPENAI_API_KEY=your_api_key_here > .env
```

### 3. Get an OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Create a new API key
4. Add some credits to your account (this will cost a few dollars for all 101 nouns)

## Usage

### Test with a Few Nouns First
```bash
# Test with nouns 1-5 to see how it works
cd prompts
node review_nouns.js 1 5
```

### Review All Nouns
```bash
# This will process all 101 nouns (takes ~2 minutes, costs ~$1-3)
cd prompts
node review_nouns.js
```

## What It Does

### ✅ Improves
- **Examples**: Replaces generic examples with natural, varied Italian sentences
- **Etymology**: Provides accurate linguistic history and word evolution
- **Related Words**: Finds genuine English cognates with proper definitions
- **Translations**: Verifies and completes translation accuracy

### 🔒 Preserves
- **Word**: Keeps the Italian word exactly as-is
- **Gender**: Maintains masculine/feminine classification
- **ID**: Preserves frequency ranking (1-101)
- **Structure**: Maintains JSON format compatibility

## Output Files

- `../data/nouns_backup.json` - Backup of original data
- `../data/nouns_reviewed.json` - Improved noun data
- `review_errors.json` - Log of any processing errors

## Cost Estimate

- **Model**: GPT-4o-mini (cost-effective)
- **Rate**: ~$0.02-0.03 per noun
- **Total**: ~$2-3 for all 101 nouns
- **Time**: ~2 minutes (1 second delay between requests)

## Example Improvement

**Before:**
```json
{
  "word": "tempo",
  "examples": [{
    "italian": "Questo è un tempo importante.",
    "english": "This is an important time.",
    "context": "generic usage"
  }],
  "etymology": {
    "notes": "Evolved from Latin usage into modern Italian."
  }
}
```

**After:**
```json
{
  "word": "tempo", 
  "examples": [{
    "italian": "Il tempo vola quando ci si diverte.",
    "english": "Time flies when you're having fun.",
    "context": "idiomatic expression"
  }],
  "etymology": {
    "origin": "Latin",
    "source": "tempus", 
    "meaning": "time, season, proper time",
    "notes": "From Latin 'tempus' meaning time or season, which evolved directly into Italian 'tempo' with expanded meanings including weather and musical tempo."
  }
}
```

## Safety Features

- ✅ **Automatic backup** before processing
- ✅ **Rate limiting** (1 request per second)
- ✅ **Error handling** with detailed logs
- ✅ **JSON validation** to ensure proper format
- ✅ **Preserves original structure** and critical fields 