console.log("Content script for saving tweets has been loaded.");

function initializeTweetObserver() {
    const tweetSelector = 'article[role="article"]';
    const observedTweets = new Set();

    function saveTweetData(tweetData) {
        // Always save the tweet data normally first
        chrome.storage.local.set({ [tweetData.id]: tweetData }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving tweet data:', chrome.runtime.lastError);
            } else {
                console.log('Tweet saved:', tweetData);
            }
        });
    
        // Then try to get the embedding and update the tweet data
        chrome.runtime.sendMessage({action: "getEmbedding", text: tweetData.content}, (response) => {
            if (response && response.embedding) {
                // Update tweetData with embedding
                tweetData.embedding = response.embedding;

                // Update the saved tweet data with the embedding
                chrome.storage.local.set({ [tweetData.id]: tweetData }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Error updating tweet data with embedding:', chrome.runtime.lastError);
                    } else {
                        console.log('Tweet updated with embedding:', tweetData);
                    }
                });
            }
        });
    }
    

    function processTweetElement(tweetElement) {
        const tweetLinkElement = tweetElement.querySelector('a[href*="/status/"]');
        if (tweetLinkElement) {
            const link = tweetLinkElement.getAttribute('href');
            const linkParts = link.split('/');
            const username = linkParts[1];
            const tweetId = linkParts[3];

            if (!observedTweets.has(tweetId)) {
                observedTweets.add(tweetId);
                const tweetTextElement = tweetElement.querySelector('[lang]');
                const tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : 'No text content';
                const tweetData = {
                    id: tweetId,
                    username: username,
                    link: `https://x.com${link}`,
                    content: tweetText,
                    date: new Date().toISOString()
                };
                saveTweetData(tweetData);
            }
        }
    }

    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                processTweetElement(entry.target);
                intersectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function observeTweets() {
        const tweets = document.querySelectorAll(tweetSelector);
        tweets.forEach(tweet => {
            if (!observedTweets.has(tweet)) {
                intersectionObserver.observe(tweet);
            }
        });
    }

    const mutationObserver = new MutationObserver(() => {
        observeTweets();
    });

    const timeline = document.querySelector('main') || document.body;
    if (timeline) {
        mutationObserver.observe(timeline, { childList: true, subtree: true });
    } else {
        console.error('Unable to find the timeline element for the observer.');
    }

    observeTweets(); // Initial observation of existing tweets
}

// Start the script
initializeTweetObserver();

console.log("Content script for adding a button to Twitter has been loaded.");

function createModalOverlay() {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    return modalOverlay;
}

function createScrollContainer() {
    const scrollContainer = document.createElement('div');
    scrollContainer.style.cssText = `
        overflow-y: auto;
        max-height: 90vh;
        width: 100%;
    `;
    return scrollContainer;
}

function createModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        background-color: #000;
        color: #FFF;
        max-width: 600px;
        margin: auto;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    return modal;
}

function createCloseButton(modalOverlay) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 20px;
        border: none;
        background-color: #1DA1F2;
        color: white;
        border-radius: 20px;
        padding: 6px 12px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.9em;
    `;
    closeButton.onclick = function() {
        document.body.removeChild(modalOverlay);
    };
    return closeButton;
}

function createTweetDiv(tweet) {
    const tweetDiv = document.createElement('div');
    tweetDiv.style.cssText = `
        background-color: #000;
        color: #FFF;
        margin-bottom: 10px;
        border-radius: 10px;
        padding: 10px;
        width: 100%;
        border-bottom: 1px solid #38444d;
    `;

    const tweetUsername = document.createElement('p');
    tweetUsername.textContent = `@${tweet.username}`;
    tweetUsername.style.cssText = `
        color: #FFF;
        font-weight: bold;
        margin-bottom: 5px;
    `;

    const tweetDate = document.createElement('p');
    tweetDate.textContent = new Date(tweet.date).toLocaleString();
    tweetDate.style.cssText = `
        color: #8899A6;
        font-size: 0.8em;
        margin-bottom: 5px;
    `;

    const tweetContent = document.createElement('p');
    tweetContent.textContent = tweet.content;
    tweetContent.style.cssText = `
        color: #D9D9D9;
        margin-bottom: 10px;
    `;

    const tweetLink = document.createElement('a');
    tweetLink.href = tweet.link;
    tweetLink.textContent = 'View on Twitter';
    tweetLink.target = '_blank';
    tweetLink.style.cssText = `
        color: #1DA1F2;
        text-decoration: none;
        font-size: 0.85em;
    `;

    tweetDiv.appendChild(tweetUsername);
    tweetDiv.appendChild(tweetDate);
    tweetDiv.appendChild(tweetContent);
    tweetDiv.appendChild(tweetLink);

    return tweetDiv;
}

function showSavedTweets() {
    chrome.storage.local.get(null, function(items) {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving tweets:', chrome.runtime.lastError);
            return;
        }

        const modalOverlay = createModalOverlay();
        const scrollContainer = createScrollContainer();
        const modal = createModal();
        const closeButton = createCloseButton(modalOverlay);
        const searchInput = createSearchInput();
        const searchButton = createSearchButton();

        modal.appendChild(closeButton);
        modal.appendChild(searchInput);
        modal.appendChild(searchButton);
        modal.appendChild(scrollContainer);

        // Initially populate with all tweets
        populateTweets(Object.values(items), scrollContainer);

        // Event listener for search button
        searchButton.addEventListener('click', async function() {
            const query = searchInput.value;
            if (query) {
                searchButton.textContent = 'Searching...';
                searchButton.disabled = true;
                try {
                    const searchedTweets = await searchTweets(query);
                    populateTweets(searchedTweets, scrollContainer);
                } catch (error) {
                    console.error('AI search failed, falling back to regex:', error);
                    const searchedTweets = await searchTweetsRegex(query);
                    populateTweets(searchedTweets, scrollContainer);
                }
                searchButton.textContent = 'Search';
                searchButton.disabled = false;
            } else {
                // If no query, show all tweets
                populateTweets(Object.values(items), scrollContainer);
            }
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    });
}

function createSearchInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search tweets...';
    input.style.cssText = `
        padding: 8px;
        margin: 10px 5px 10px 0;
        border-radius: 20px;
        border: 1px solid #38444d;
        background-color: #192734;
        color: #FFF;
        outline: none;
        width: calc(100% - 120px); // Adjust width based on your modal's size
    `;
    return input;
}

function createSearchButton() {
    const button = document.createElement('button');
    button.textContent = 'Search';
    button.style.cssText = `
        padding: 8px 15px;
        border-radius: 20px;
        border: none;
        background-color: #1DA1F2;
        color: white;
        cursor: pointer;
        font-weight: bold;
    `;
    return button;
}

function populateTweets(tweets, container) {
    container.innerHTML = ''; // Clear existing tweets
    tweets.forEach(tweet => {
        const tweetDiv = createTweetDiv(tweet);
        container.appendChild(tweetDiv);
    });
}

// Define createModalOverlay, createScrollContainer, createModal, createCloseButton, createTweetDiv
// as per your existing implementation






function injectCustomButton() {
    // Check if the navigation bar is loaded
    const checkNavBarLoaded = setInterval(() => {
        const navigationList = document.querySelector('nav[aria-label="Primary"]');
        if (navigationList) {
            clearInterval(checkNavBarLoaded);

            // Create the custom button
            const customButton = document.createElement('a');
            customButton.href = '#';
            customButton.className = 'custom-twitter-button-class'; // Use Twitter's classes for styling

            var theme = getTwitterTheme();


            if (theme === 'dark') {

                const svgHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                    <path d="M12 7v5l4 2" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>History</span>`; // Add a span for the button text
                customButton.innerHTML = svgHTML;
    
                }
    
                else{
    
                const svgHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="black" stroke-width="2"/>
                    <path d="M12 7v5l4 2" stroke="black" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>History</span>`; // Add a span for the button text
                customButton.innerHTML = svgHTML;
    
                }


            if (theme === 'dark') {
                // Dark mode styles
                customButton.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 19px;
                color: #FFFFFF; /* White text */
                cursor: pointer;
                font-size: 19px; /* Match the font-size with Twitter's */
                font-family: 'Twitter Chirp', sans-serif; /* Twitter's font-family */
                text-decoration: none; /* Remove underline */
                margin-left: 0px; /* Add some left margin if needed */
            `;            
            } 
            else {
                customButton.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 19px;
                color: #000000; /* Black text */
                cursor: pointer;
                font-size: 19px; /* Match the font-size with Twitter's */
                font-family: 'Twitter Chirp', sans-serif; /* Twitter's font-family */
                text-decoration: none; /* Remove underline */
                margin-left: 0px; /* Add some left margin if needed */
            `;      
            }

              // Style the SVG icon
            const svgIcon = customButton.querySelector('svg');
            svgIcon.style.marginRight = '20px'; // Decrease space between icon and text
            svgIcon.style.marginLeft = '-5px'; // Move the icon slightly to the left

            // Find the 'More' button to determine where to place the 'History' button
            const moreButton = navigationList.querySelector('[aria-label="More menu items"]');
            if (moreButton) {
                // Insert the 'History' button before the 'More' button
                navigationList.insertBefore(customButton, moreButton);
            } else {
                // Append the 'History' button at the end if the 'More' button is not found
                navigationList.appendChild(customButton);
            }

            // Add click event listener for custom button
            customButton.addEventListener('click', (e) => {
                e.preventDefault();
                // Call your function to show saved tweets
                showSavedTweets();
            });

            // Add hover effect
            const style = document.createElement('style');
            style.textContent = `
                .custom-twitter-button-class:hover {
                    background-color: rgba(29, 161, 242, 0.1); /* Adjust the color as needed */
                    border-radius: 9999px;
                    transition: background-color 0.2s;
                }
            `;

            customButton.classList.add('custom-hover-effect');

            document.head.append(style);
        }
    }, 1000); // Check every second
}





// Call the function to inject the custom button
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectCustomButton);
} else {
    // DOMContentLoaded has already fired
    injectCustomButton();
}


// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    // Extract the numerical embeddings from the vecA and vecB objects
    const embeddingA = vecA[0].embedding; // Assuming vecA has only one object with an embedding array
    const embeddingB = vecB[0].embedding; // Assuming vecB has only one object with an embedding array

    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;

    for (let i = 0; i < embeddingA.length; i++) {
        dotProduct += embeddingA[i] * embeddingB[i];
        normA += embeddingA[i] * embeddingA[i];
        normB += embeddingB[i] * embeddingB[i];
    }

    // Check for zero division (to avoid division by zero error)
    if (Math.sqrt(normA) === 0 || Math.sqrt(normB) === 0) {
        return 0; // Return 0 similarity if either vector is zero
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}



// Function to search tweets based on a query
async function searchTweets(query) {
    try {
        // Fetch all saved tweets
        const allTweets = await chrome.storage.local.get(null);
        if (chrome.runtime.lastError) {
            throw new Error('Error fetching tweets: ' + chrome.runtime.lastError.message);
        }

        // Get the embedding for the search query
        const queryEmbedding = await fetchEmbedding(query);

        // Compute similarity scores between the query embedding and all tweet embeddings
        const scores = Object.values(allTweets).map(tweet => {
            if (tweet.embedding) {
                const similarity = cosineSimilarity(queryEmbedding, tweet.embedding);
                return { tweet, score: similarity };
            }
            return { tweet, score: 0 };
        });

        // Sort tweets based on the highest similarity score
        scores.sort((a, b) => b.score - a.score);

        // Return top 10 tweets sorted by relevance
        return scores.slice(0, 10).map(score => score.tweet);
    } catch (error) {
        console.error('Error in searchTweets:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}

function searchTweetsRegex(query) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, function(items) {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving tweets:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError.message);
                return;
            }

            const regex = new RegExp(query, 'i'); // 'i' flag for case-insensitive matching
            let matchedTweets = [];

            // Iterate over all tweets and check if they match the query
            for (const key in items) {
                const tweet = items[key];
                if (regex.test(tweet.content)) {
                    matchedTweets.push(tweet);
                }
            }

            // Resolve the promise with the matched tweets
            resolve(matchedTweets);
        });
    });
}

async function fetchEmbedding(text) {
    const openAIKey = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key

    try {
        const requestBody = {
            input: text,
            model: "text-embedding-ada-002", // Using the specified model
            encoding_format: "float" // Specifying the encoding format
        };

        console.log("Request body:", requestBody); // Log the request body

        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data); // Log the response data
        return data.data;
    } catch (error) {
        console.error("Error in fetchEmbedding:", error);
        throw error; // Re-throw the error for the caller to handle
    }
}

function getTwitterTheme() {
    // Get the computed style of the html element
    var style = getComputedStyle(document.documentElement);

    // Check the color-scheme property
    var colorScheme = style.getPropertyValue('color-scheme');

    // Determine if it includes 'dark'
    var isDark = colorScheme.includes('dark');

    // Return 'dark' or 'light' based on the presence of 'dark' in the color-scheme
    return isDark ? 'dark' : 'light';
}