# Twitter History - Never Lose a Tweet Again

A Chrome extension that automatically tracks every tweet you scroll past on Twitter/X and lets you search through them later using AI-powered semantic search.

## Why I Built This

Ever scrolled past an interesting tweet and thought "I'll check that later" only to completely forget it? Twitter/X doesn't give us an easy way to track what we've seen - bookmarks require manual action, and the algorithm makes finding old tweets nearly impossible.

I built Twitter History to solve this problem. Now every tweet you see is automatically saved and searchable - even if you don't remember the exact words.

## Features

- **Automatic Tracking** - Saves tweets as you scroll, no manual action needed
- **AI-Powered Search** - Uses OpenAI embeddings for semantic search (find "tech news" even if the tweet says "Google announces new AI glasses")
- **Regex Fallback** - Works without API key using simple text matching
- **History Button** - Adds a convenient "History" button to Twitter's sidebar
- **Dark/Light Theme Support** - Matches your Twitter theme
- **Privacy First** - All data stored locally in your browser, nothing sent to external servers (except OpenAI for search embeddings)

## Demo

https://github.com/user-attachments/assets/your-video-id

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    You browse Twitter/X                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Content Script detects tweets as they appear in viewport       │
│  Extracts: username, content, link, timestamp                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Saves to Chrome Local Storage + generates OpenAI embedding     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Click "History" → Search using AI semantic similarity          │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/AyushJHANWAR03/TwitterHistory.git
cd TwitterHistory
```

### Step 2: Add Your OpenAI API Key (Optional - for AI search)

Open `background.js` and `content.js`, replace `YOUR_OPENAI_API_KEY` with your actual key:

```javascript
const openAIKey = 'sk-proj-your-actual-key-here';
```

> **Note:** The extension works without an API key too - it will use regex-based search instead of AI search.

### Step 3: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `TwitterHistory` folder

### Step 4: Start Browsing

1. Go to [twitter.com](https://twitter.com) or [x.com](https://x.com)
2. Scroll through your feed - tweets are automatically saved
3. Click the **"History"** button in the left sidebar to view and search your tweets

## Usage

### Viewing History

- Click the **History** button (clock icon) in Twitter's left sidebar
- Or click the extension icon in Chrome's toolbar

### Searching Tweets

1. Open History modal
2. Type your search query
3. Click **Search**

**With AI Search (OpenAI key configured):**
- Semantic search: "machine learning" finds tweets about "AI", "neural networks", etc.
- Natural language: "funny cat videos" finds related content

**Without AI Search:**
- Regex-based matching on tweet content
- Supports regex patterns: `google.*AI`, `^Breaking`, etc.

## Tech Stack

- **Chrome Extension** - Manifest V3
- **OpenAI API** - text-embedding-ada-002 for semantic embeddings
- **Chrome Storage API** - Local persistence (~5MB, ~10,000 tweets)
- **Vanilla JavaScript** - No frameworks, fast and lightweight

## Storage

- Tweets are stored in Chrome's local storage
- Capacity: ~10,000 tweets (5MB limit)
- Data persists across browser restarts
- Cleared if you uninstall the extension or clear browser data

## Privacy

- All tweet data is stored **locally** on your device
- OpenAI API is only called for generating search embeddings (if configured)
- No data is sent to any other external servers
- No analytics or tracking

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - feel free to use, modify, and distribute.

## Author

Built by [Ayush Jhanwar](https://github.com/AyushJHANWAR03)

---

**If you find this useful, give it a star!**
