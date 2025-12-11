chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message from content script:", request);

    if (request.action === "getEmbedding") {
        console.log("Fetching embedding for text:", request.text);
        fetchEmbedding(request.text).then(embedding => {
            console.log("Embedding fetched:", embedding);
            sendResponse({embedding: embedding});
        }).catch(error => {
            console.error('Error fetching embedding:', error);
            sendResponse({embedding: null});
        });
        // Return true only for async operations
        return true;
    }

    // For unhandled messages, don't keep the port open
    return false;
});

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
        console.log("Response data: " + JSON.stringify(data, null, 2)); // Log the response data
        return data.data;
    } catch (error) {
        console.error("Error in fetchEmbedding:", error);
        throw error; // Re-throw the error for the caller to handle
    }
}


