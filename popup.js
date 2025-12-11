document.addEventListener('DOMContentLoaded', function() {
    const tweetListDiv = document.getElementById('tweetList');

    // Function to display a tweet
    function displayTweet(tweet) {
        const tweetDiv = document.createElement('div');
        tweetDiv.classList.add('tweetItem');

        const tweetContent = document.createElement('div');
        tweetContent.classList.add('tweetContent');
        tweetContent.textContent = tweet.content; // Assuming tweet has a 'content' property
        tweetDiv.appendChild(tweetContent);

        const tweetDate = document.createElement('div');
        tweetDate.classList.add('tweetDate');
        tweetDate.textContent = new Date(tweet.date).toLocaleString(); // Assuming tweet has a 'date' property
        tweetDiv.appendChild(tweetDate);

        tweetListDiv.appendChild(tweetDiv);
    }

    // Function to fetch and display stored tweets
    function displayStoredTweets() {
        chrome.storage.local.get(null, function(items) {
            const allTweets = Object.values(items);
            if(allTweets.length === 0) {
                tweetListDiv.textContent = 'No tweets viewed yet.';
            } else {
                allTweets.forEach(tweet => displayTweet(tweet));
            }
        });
    }

    displayStoredTweets();
});
