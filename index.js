
//ALL CODE GOES INSIDE HERE 

//wait until the document is fully loaded
$(document).ready(() => {

  $('head').append(`
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <style>
      h1, h2, h3 {
        font-family: 'Orbitron', sans-serif;
      }
      body {
        font-family: 'Roboto', sans-serif;
        background-color: #1b1b1b; /* dark charcoal */
        color: #fff;
        background: url('https://i.imgur.com/eurGxJ8.jpeg') center center / cover, #1b1b1b;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
      }
      ::-webkit-scrollbar-track {
        background: #1b1b1b; /* Dark background */
      }
      ::-webkit-scrollbar-thumb {
        background: #9400D3; /* electric purple */
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #FF1493; /* neon pink */
      }

      /* Tweet styles with glassmorphism */
      #tweet-feed .tweet {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 15px;
        color: #fff;
      }
      #tweet-feed .tweet {
        background: rgba(255, 255, 255, 0.1); /* Semi-transparent white */
        border: 1px solid rgba(255, 255, 255, 0.2); /* Semi-transparent border */
        backdrop-filter: blur(10px); /* Glassmorphism effect */
        border-radius: 10px; /* Rounded corners */
        padding: 10px;
        margin-bottom: 15px;
        color: #fff;
      }
      #tweet-feed .tweet:hover {
        box-shadow: 0px 0px 15px #FF1493; /* Neon pink glow */
        border-color: #FF1493; /* neon pink border on hover */
      }

      /* User and Hashtag Colors */
      .user {
        color: #00FFFF; /* neon blue */
      }
      .hashtag {
        color: #FF1493; /* neon pink */
        cursor: pointer;
      }
    </style>
  `);
  


  //number of new tweets to generate at a time, and max number of tweets to display
  const newTweetsCount = 3; // Number of new tweets to generate at a time
  const maxDisplayedTweets = 10; // Maximum number of tweets to display

  //clear the body - dynamically add content
  const $body = $('body');
  $body.html(''); //clears body - will clear tag you call it on

  //create the main container and title
  const $container = $('<div class="container"></div>').css({
    width: '80%',
    margin: '0 auto',                         
    textAlign: 'center',
    backgroundColor: 'rgba(27, 27, 27, 0.8)', // Make it semi-transparent
    borderRadius: '10px',                     // Optional: Adds rounded corners
    padding: '20px',                          // Optional: Adds padding
  });

  const $title = $('<h1>Twiddler!</h1>').css({
    fontfamily: 'Orbitron'
  })

  //create a username input field
  const $usernameInput = $('<input id="username-input" placeholder="Enter your username" />').css({
    width: '100%',
    height: '40px',
    marginBottom: '10px',
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  });

  //Create a div to hold tweet controls
  const $tweetControls = $('<div id="tweet-controls"></div>');
  
  // Append the username input to the tweet controls
  $tweetControls.append($usernameInput);
  
  // Create the tweet input textarea
  const $tweetInput = $('<textarea id="tweet-input" placeholder="What\'s happening?"></textarea>').css({
    width: '100%',
    height: '60px',
    marginBottom: '10px',
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  });
  
  
  // Create the tweet button
  const $tweetButton = $('<button id="tweet-button">Tweet</button>').css({
    padding: '10px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#00FF00',
    color: '#000',
    cursor: 'pointer'
  }).hover(
    function() {
      $(this).css({
        backgroundColor: '#9400D3',
        boxShadow: '0px 0px 15px #00FF00',
        transform: 'scale(1.20)' 
      });
    },
    function() {
      $(this).css({
        backgroundColor: '#00FF00',
        boxShadow: 'none',
        transform: 'scale(1)'
      });
    }
  );
  
  // Create the refresh button
  const $refreshButton = $('<button id="refresh-button">Refresh Tweets</button>').css({
    padding: '10px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#00FF00',
    color: '#000',
    cursor: 'pointer'
  }).hover(
    function() { // Mouse over
        $(this).css({
            backgroundColor: '#9400D3', // Electric purple
            boxShadow: '0px 0px 15px #00FF00', // Bright green glow
            transform: 'scale(1.15)'
        });
    },
    function() { // Mouse out
        $(this).css({
            backgroundColor: '#00FF00', // Back to bright green
            boxShadow: 'none', // Remove glow
            transform: 'scale(1)'
        });
    }
);
  
  // Append the tweet input, tweet button, and refresh button to the tweet controls
  $tweetControls.append($tweetInput).append($tweetButton).append($refreshButton);

  ////////////////////////////////////////TWEET FEED///////////////////////////////////////////////////////////

  //create a tweet feed section where all tweets will be displayed
  const $tweetFeed = $('<div id="tweet-feed"></div>');

  $tweetFeed.css({
    'background-color': '#222',          // Dark background for the feed container
    'padding': '20px',                   // Padding inside the feed
    'border-radius': '10px',             // Rounded corners for a modern look
    'box-shadow': '0 4px 10px rgba(0,0,0,0.3)',  // Soft shadow effect
    'max-height': '600px',               // Max height for the feed
    'overflow-y': 'auto',                // Enable scrolling for overflow content
    'margin': '20px 0',                  // Space around the tweet feed
  });


  // Append the title, tweet controls, and tweet feed to the container
  $container.append($title).append($tweetControls).append($tweetFeed);

  // Append the entire container to the body
  $body.append($container);

  // initialize an array to track displayed tweet ids to avoid duplicates
  const displayedTweetMessages = new Set();

  const writeTweetAndDisplay = (message, username) => {
    writeTweet(message, username); // This writes the new tweet using the provided writeTweet function

    // Create a new tweet object with user details, message, and creation time
    const tweet = {
      user: username,
      message: message,
      created_at: new Date(), // Timestamp of when the tweet was created
    };

    // Push the newly written tweet to streams.home so it persists on the feed
    streams.home.push(tweet);

    // Format the tweet timestamp using moment.js (formatted time and relative time)
    const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
    const relativeTime = moment(tweet.created_at).fromNow(); // e.g., "a few seconds ago"

    // Dynamically create the tweet's HTML structure with styling
    const $newTweet = $('<div class="tweet"></div>').css({
      border: '1px solid #ddd',
      margin: '10px',
      padding: '10px',
      borderRadius: '5px',
      textAlign: 'left',
    });

    // Create a clickable user element and bind a click event to show the user's timeline
    const $user = $(`<span class="user">@${tweet.user}</span>`).css({
      fontWeight: 'bold',
      cursor: 'pointer'
    }).on('click', () => {
      showUserTimeline(tweet.user); // Call the function to show the user's timeline
    });

    // Process hashtags in the tweet's message and make them clickable
    const processedMessage = processMessage(tweet.message); // Apply regex to format hashtags
    const $message = $('<p></p>').html(processedMessage).css({
      margin: '5px 0'
    });

    // Format and display time info (relative and actual time)
    const $timeInfo = $('<span class="time"></span>').text(`${relativeTime} | ${formattedTime}`).css({
      fontSize: '0.8em',
      color: 'gray',
    });

    // Append the tweet details (user, message, time) to the new tweet div
    $newTweet.append($user).append($message).append($timeInfo);

    // Track the tweet message to avoid displaying duplicates
    displayedTweetMessages.add(tweet.message);

    // Prepend the new tweet to the tweet feed (to display it at the top)
    $('#tweet-feed').prepend($newTweet);
  };

  const processMessage  = (message) => {
    //use regex to find hashtags
    return message.replace(/(#\w+)/g, (tag) => {
      return `<span class="hashtag" style="color:#FF1493; cursor:pointer;">${tag}</span>`
    });
  };


  //function to create and display tweets
  function createTweets(additionalTweets = []) {
    const $tweetFeed = $('#tweet-feed');
    const allTweets = streams.home.slice().reverse();
    const newTweets = additionalTweets.length ? additionalTweets : allTweets.slice(0, maxDisplayedTweets);
  
    //clear current tweet feed if its empty
    if ($('#tweet-feed').is(':empty')) {
      $('#tweet-feed').html('');
    }

    //map over the streams.home array to create tweet elements
    newTweets.forEach((tweet) => {
      if (displayedTweetMessages.has(tweet.message)) {
        //skip already displayed tweets
        return;
      }
      
      //create tweet styling
      const $tweetDiv = $('<div class="tweet"></div>')
      .css({
        border: '1px solid #ddd',
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        textAlign: 'left',
      });

      //create a clickable user element (wrap username in a span)
      const $user = $(`<span class="user">@${tweet.user}</span>`).css({
        fontWeight: 'bold',
        cursor: 'pointer'
      }).on('click', () => {
        console.log(`Username clicked: ${tweet.user}`)
        showUserTimeline(tweet.user);   //call function to show user timeline
      })


      //create a message element to hold the tweet's message
      const $message = $('<p></p>').html(processMessage(tweet.message)).css({
        margin: '5px 0'
      });

      //after creating the message element
      $message.on('click', '.hashtag', function() {
        const hashtag = $(this).text();
        showHashtagTimeLine(hashtag); //call function to show tweets with this hashtag
      });

      function showHashtagTimeLine(hashtag) {
        //clear the tweet feed before showing the hashtags
        $('#tweet-feed').html('');

        //get only the tweets that contain the hashtag
        const hashtagTweets = streams.home.filter(tweet => tweet.message.includes(hashtag));

  // If no tweets are found for the hashtag, display a message
  if (hashtagTweets.length === 0) {
    $('#tweet-feed').html(`<p>No tweets available for the hashtag ${hashtag}.</p>`);
    return;
  }

  // Display the hashtag's tweets
  hashtagTweets.forEach((tweet) => {
    // Create tweet styling (similar to createTweets function)
    const $tweetDiv = $('<div class="tweet"></div>').css({
      border: '1px solid #ddd',
      margin: '10px',
      padding: '10px',
      borderRadius: '5px',
      textAlign: 'left',
    });

    // Create a message element to hold the tweet's message
    const $message = $('<p></p>').text(tweet.message).css({
      margin: '5px 0'
    });

    // Format and display time (similar to createTweets function)
    const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
    const relativeTime = moment(tweet.created_at).fromNow();
    const actualTime = moment(tweet.created_at).format('h:mm A');
    
    const $time = $('<span class="time"></span>').text(`${relativeTime} | ${formattedTime}`).css({
      fontSize: '0.8em',
      color: 'gray',
    });

    // Append user, message, and time to the tweet div
    $tweetDiv.append($message).append($time);
    // Prepend the newly created tweet to the tweet feed
    $('#tweet-feed').prepend($tweetDiv);
  });
}
      //format the actual time and human-friendly time
      const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
      const relativeTime = moment(tweet.created_at).fromNow();
      const $timeInfo = $('<span class="time"></span>').text(`${relativeTime} | ${formattedTime}`).css({
        fontSize: '0.8em',
        color: 'gray',
      });

      //add the tweet message to the displayedTweetsMessages set to track it
      displayedTweetMessages.add(tweet.message);

      //append user, message, and time to the tweet div
      $tweetDiv.append($user).append($message).append($timeInfo);
      //prepend the newly created tweet to the tweet feed to maintain reverse chronological order
      $('#tweet-feed').prepend($tweetDiv);
    });
    
    //ensure the feed does not exceed the maximum number of displayed tweets
    const tweetCount = $('#tweet-feed .tweet').length; 
    //get the current count of displayed tweets
    if (tweetCount > maxDisplayedTweets) {
      $('#tweet-feed .tweet:gt(' + (maxDisplayedTweets - 1) + ')').remove(); 
      //remove the oldest tweets
      displayedTweetMessages.clear(); 
      //clear the displayed messages set
      $('#tweet-feed .tweet').each((_, tweetDiv) => {
        const message = $(tweetDiv).find('p').text(); 
        //extract the message from the tweet div
        displayedTweetMessages.add(message); 
        //add remaining tweets to the set
      });
    }
  }


  function showUserTimeline(username) {
    //maximum number of tweets to display per user
    const maxUserTweets = 10;
    // Clear the tweet feed before showing the user's tweets
    $('#tweet-feed').html('');
  
    // Get only the tweets from the selected user and reverse them for chronological order
    const userTweets = streams.users[username].slice().reverse();
  
    // If no tweets are found for the user, display a message
    if (userTweets.length === 0) {
      $('#tweet-feed').html('<p>No tweets available for this user.</p>');
      return;
    }
  
    // Display the user's tweets
    userTweets.forEach((tweet) => {
      // Create tweet styling
      const $tweetDiv = $('<div class="tweet"></div>').css({
        border: '1px solid #ddd',
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        textAlign: 'left',
      });

      //format the actual time and human-friendly time
      const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
      const relativeTime = moment(tweet.created_at).fromNow();

      const $timeInfo = $('<span class="time"></span>').text(`${relativeTime} | ${formattedTime}`).css({
        fontSize: '0.8em',
        color: 'gray',
      });

      //create a message element to hold the tweet's message
      const $message = $('<p></p>').text(tweet.message).css({
        margin: '5px 0'
      });

      //append user, message, and time to the tweet div
      $tweetDiv.append($message).append($timeInfo);
      //prepend the newly created tweet to the tweet feed
      $('#tweet-feed').prepend($tweetDiv);
    });
  }

  //event listener for posting a new tweet
  $('#tweet-button').on('click', () => {
    const username = $('#username-input').val().trim();
    const tweetMessage = $('#tweet-input').val().trim();

    if (username && tweetMessage) {
      writeTweetAndDisplay(tweetMessage, username); 
      $('#tweet-input').val(''); // Clear input after tweeting
    } else {
      alert('Please enter both a username and a tweet message.');
    }
  });

  
  //event listener for refreshing the tweet feed
  $('#refresh-button').on('click', () => {
    const newTweets = [];
    for (let i =0; i < newTweetsCount; i++) {
      generateRandomTweet();
      newTweets.push(streams.home[streams.home.length - 1]);
    }
    createTweets(newTweets); // Call createTweets function on refresh
  });

  const autoRefreshTweets = () => {
    const newTweets = [];
    for (let i = 0; i < newTweetsCount; i++) {
      generateRandomTweet();
      newTweets.push(streams.home[streams.home.length - 1]);
    }
    createTweets(newTweets);
  }

  //automatic interval to refresh tweets every 1 minute
  setInterval(autoRefreshTweets, 60000);
  
  //initialize the page by creating tweets
  createTweets(); 

});
  

  // const $tweets = streams.home.map((tweet) => {
  //   const $tweet = $('<div></div>');
  //   const text = `@${tweet.user}: ${tweet.message}`;

  //   $tweet.text(text);

  //   return $tweet;
  // });
  // $body.append($tweets);



//create a tweets div
//streams.home is an array of tweets
//console.log streams.home -> constantly new tweets(?) are being added to streams.home because of data-generator.js
//will need the actual time (moment - format dates) and the human friendly time (moment - relative time)
  //google cdn moment -> we're using jQuery so add script tag to head of html file and paste in link from the google search of cdn moment
//everything should be done in jQuery even styling
//all tweets are being put into body - suggests having tweets go into a separate div (instead of appending to body, add a tweets div)
//inside function createTweets():
  //tweet.user will need to be clickable -> out in own tag
  //add timestamp
  //const test will change
