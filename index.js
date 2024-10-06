
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
  // const $body = $('body');
  // $body.html(''); //clears body - will clear tag you call it on

  

//////////////////////////////////////////////sidebar///////////////////////////////////////////

const $contentWrapper = $('<div id="content-wrapper"></div>').css({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    padding: '20px'
});

const $titleContainer = $('<div id="title-container"></div>').css({
  width: '25%', // Match the sidebar width
  marginBottom: '30px',
  paddingLeft: '20px' // Align with sidebar padding
});

const $title = $('<h1>Twiddler!</h1>').css({
  fontFamily: 'Orbitron',
  color: '#00FFFF', // Neon blue color, adjust as needed
  textShadow: '0 0 10px #00FFFF',
  margin: '0'
});

$titleContainer.append($title);

const $sidebarWrapper = $('<div id="sidebar-wrapper"></div>').css({
  display: 'flex',
  flexDirection: 'column',
  flexBasis: '25%' // Match the sidebar width
});

// Create the sidebar container
const $sidebar = $('<div id="sidebar"></div>').css({
  flexBasis: '25%',                   // Sidebar width
  backgroundColor: '#333',      // Dark background
  border: '',
  padding: '20px',                 // Padding inside the sidebar
  borderRadius: '10px',            // Rounded corners
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',  // Soft shadow
  maxHeight: '600px',              // Limit height of the sidebar
  overflowY: 'auto',               // Enable scrolling if content overflows
  marginRight: '20px',             // Add spacing between sidebar and main content
  color: '#fff',                    // Text color in the sidebar
  boxSizing: 'border-box', // Ensures padding is included in width calculation
});

// Append title and sidebar to the sidebar wrapper
$sidebarWrapper.append($titleContainer).append($sidebar);

// Add title for the sidebar
const $sidebarTitle = $('<h2>Trending Hashtags</h2>').css({
  textAlign: 'left',
  fontSize: '1.5em',
  marginBottom: '10px',
  borderBottom: '2px solid #FF1493', // Neon pink underline
  paddingBottom: '10px'
});

// Add a list for trending hashtags
const $trendingList = $('<ul id="trending-list"></ul>').css({
  listStyle: 'none',
  paddingLeft: '0'
});

loadTrendingHashtags($trendingList);

// Append title and trending list to the sidebar
$sidebar.append($sidebarTitle).append($trendingList);
$sidebarWrapper.append($sidebar);

function showHashtagTimeline(hashtag) {
  clearTimeout(autoRefreshTimer);
  currentView = 'hashtag';
  $('#return-button').show();
  //clear the tweet feed before showing the hashtags
  $('#tweet-feed').html('');
  //get only the tweets that contain the hashtag
  const hashtagTweets = streams.home.filter(tweet => 
    tweet.message.toLowerCase().includes(hashtag.toLowerCase())
  );

// If no tweets are found for the hashtag, display a message
if (hashtagTweets.length === 0) {
$('#tweet-feed').html(`<p>No tweets available for the hashtag ${hashtag}.</p>`);
return;
}

// Display the hashtag's tweets
hashtagTweets.forEach((tweet) => {
const $tweetDiv = $('<div class="tweet"></div>').css({
border: '1px solid #ddd',
margin: '10px',
padding: '10px',
borderRadius: '5px',
textAlign: 'left',
});

const $user = $(`<span class="user">@${tweet.user}</span>`).css({
fontWeight: 'bold',
cursor: 'pointer',
color: '#00FFFF', // Neon blue for usernames
});

// Create a message element to hold the tweet's message
const $message = $('<p></p>').html(processMessage(tweet.message)).css({
margin: '5px 0'
});

const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
const relativeTime = moment(tweet.created_at).fromNow();
const $timeInfo = $('<span class="time"></span>')
.text(`${relativeTime} | ${formattedTime}`)
.css({
  fontSize: '0.8em',
  color: 'gray',
});

// Append user, message, and time to the tweet div
$tweetDiv.append($user).append($message).append($timeInfo);
$('#tweet-feed').prepend($tweetDiv);
});


}

// Function to load trending hashtags
function loadTrendingHashtags($trendingList) {
  tags.forEach(tag => {
    if(tag) {
      const $li = $('<li></li>')
      .text(tag)
      .css({
        padding: '5px 0',
        cursor: 'pointer',
        color: '#FF1493',
      })
      .on('click', function() {
        showHashtagTimeline(tag);
      });
      $trendingList.append($li);
    }
  });
}

function updateTrendingHashtags() {
  const hashtagCounts = {};
  const $tweetFeed = $('#tweet-feed');
  
  // Extract hashtags from all tweets
  $tweetFeed.find('.tweet').each(function() {
    const tweetText = $(this).find('p').text();
    const hashtags = tweetText.match(/#\w+/g) || [];
    hashtags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });

  // Sort hashtags by count
  const sortedHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)  // Get top 10 trending hashtags
    .map(entry => entry[0]);

  // Update the trending list
  const $trendingList = $('#trending-list');
  $trendingList.empty();
  sortedHashtags.forEach(tag => {
    $('<li></li>')
      .text(tag)
      .css({
        padding: '5px 0',
        cursor: 'pointer',
        color: '#FF1493',
      })
      .on('click', function() {
        showHashtagTimeline(tag);
      })
      .appendTo($trendingList);
  });
}

/////////////////////////////////////////////main/////////////////////////////////////////////////////////////////

  // const $layoutContainer = $('<div class="layout-container"></div>').css({
  //   display: 'flex',
  //   justifyContent: 'space-between',  // Space between sidebar and content
  // });

  //create the main container and title
  const $container = $('<div class="container"></div>').css({
    flexBasis: '70%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(27, 27, 27, 0.8)',
    borderRadius: '10px',
    padding: '20px',
    boxSizing: 'border-box',
    height: 'calc(100vh - 100px)', // Adjust the 100px as needed to account for the title
    overflow: 'hidden' // Prevent overflow
  });
 
  const $tweetFeedContainer = $('<div id="tweet-feed-container"></div>').css({
    flex: '1 1 auto',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px'
  });
  
  const $tweetControlsContainer = $('<div id="tweet-controls-container"></div>').css({
    flexShrink: 0,
    backgroundColor: 'rgba(27, 27, 27, 0.9)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 -5px 15px rgba(0,0,0,0.3)'
  });
  
  $container.append($tweetFeedContainer).append($tweetControlsContainer);

//////////////////////////////////////////////////////TWEET CONTROLS/////////////////////////////////////////////////

  //Create a div to hold tweet controls
  const $tweetControls = $('<div id="tweet-controls"></div>').css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  });


  //create a username input field
  const $usernameInput = $('<input id="username-input" placeholder="Enter your username" />').css({
    width: '100%',
    height: '40px',
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  });
  
  // Create the tweet input textarea
  const $tweetInput = $('<textarea id="tweet-input" placeholder="What\'s happening?"></textarea>').css({
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '60px'
  });

  // Adjust button container
  const $buttonContainer = $('<div></div>').css({
    display: 'flex',
    justifyContent: 'space-between'
  });

  // Create the tweet button
  const $tweetButton = $('<button id="tweet-button">Tweet</button>').css({
    padding: '10px 15px',
    margin: '5px',
    border: '2px solid #00FF00',
    borderRadius: '5px',
    backgroundColor: 'transparent',
    color: '#00FF00',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 10px #00FF00', // Neon glow
    textShadow: '0 0 5px #00FF00', // Text glow
    outline: 'none'
  }).hover(
    function() {
      $(this).css({
        backgroundColor: 'rgba(0, 255, 0, 0.2)', // Slight green tint
        boxShadow: '0 0 20px #00FF00, 0 0 30px #00FF00', // Intensify glow
        textShadow: '0 0 10px #00FF00',
        transform: 'scale(1.05)' // Slight grow effect
      });
    },
    function() {
      $(this).css({
        backgroundColor: 'transparent',
        boxShadow: '0 0 10px #00FF00',
        textShadow: '0 0 5px #00FF00',
        transform: 'scale(1)'
      });
    }
  ).on('mousedown', function() { // Mouse press
    $(this).css({
      transform: 'scale(0.95)', // Slight shrink effect
      boxShadow: '0 0 5px #00FF00', // Reduce glow
      textShadow: '0 0 2px #00FF00'
    });
  }).on('mouseup mouseleave', function() { // Mouse release or leave
    $(this).css({
      transform: 'scale(1)',
      boxShadow: '0 0 10px #00FF00',
      textShadow: '0 0 5px #00FF00'
    });
  });
  
  // Update click handler
  $(document).on('click', '#tweet-button', function(e) {
    console.log('Tweet button clicked');
    e.preventDefault();
    const username = $('#username-input').val().trim();
    const tweetMessage = $('#tweet-input').val().trim();
    if (username && tweetMessage) {
        writeTweetAndDisplay(tweetMessage, username);
        $('#tweet-input').val('');
        // Add success animation
        $(this).text('Posted!').css({
            backgroundColor: 'rgba(0, 255, 0, 0.3)',
            color: '#FFFFFF',
            textShadow: '0 0 10px #00FF00, 0 0 20px #00FF00',
            boxShadow: '0 0 30px #00FF00, 0 0 50px #00FF00',
            transform: 'scale(1.1)'
        });
        // Reset button after animation
        setTimeout(() => {
            $(this).text('Tweet').css({
                backgroundColor: 'transparent',
                color: '#00FF00',
                textShadow: '0 0 5px #00FF00',
                boxShadow: '0 0 10px #00FF00',
                transform: 'scale(1)'
            });
        }, 1000);
    } else {
        alert('Please enter both a username and a tweet message.');
    }
});

  
const $returnButton = $('<button id="return-button">Return to All Tweets</button>').css({
  padding: '10px 20px',
  margin: '5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: 'transparent',
  color: '#FF1493', // Neon pink text
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 0 10px #FF1493', // Neon glow
  textShadow: '0 0 5px #FF1493', // Text glow
  outline: 'none'
}).hover(
  function() { // Mouse over
    $(this).css({
      backgroundColor: 'rgba(255, 20, 147, 0.2)', // Slight pink tint
      boxShadow: '0 0 20px #FF1493, 0 0 30px #FF1493', // Intensify glow
      textShadow: '0 0 10px #FF1493',
      transform: 'scale(1.05)' // Slight grow effect
    });
  },
  function() { // Mouse out
    $(this).css({
      backgroundColor: 'transparent',
      boxShadow: '0 0 10px #FF1493',
      textShadow: '0 0 5px #FF1493',
      transform: 'scale(1)'
    });
  }
).on('mousedown', function() { // Mouse press
  $(this).css({
    transform: 'scale(0.95)', // Slight shrink effect
    boxShadow: '0 0 5px #FF1493', // Reduce glow
    textShadow: '0 0 2px #FF1493'
  });
}).on('mouseup mouseleave', function() { // Mouse release or leave
  $(this).css({
    transform: 'scale(1)',
    boxShadow: '0 0 10px #FF1493',
    textShadow: '0 0 5px #FF1493'
  });
});

$(document).on('click', '#return-button', function() {
  console.log('Return button clicked');
  currentView = 'main';
  $('#tweet-feed').empty();
  createTweets();
  autoRefreshTweets();
  $(this).hide();
  // Add click animation
  $(this).css({
      backgroundColor: 'rgba(255, 20, 147, 0.3)',
      color: '#FFFFFF',
      textShadow: '0 0 10px #FF1493, 0 0 20px #FF1493',
      boxShadow: '0 0 30px #FF1493, 0 0 50px #FF1493',
      transform: 'scale(1.1)'
  });
  // Reset button after animation
  setTimeout(() => {
      $(this).css({
          backgroundColor: 'transparent',
          color: '#FF1493',
          textShadow: '0 0 5px #FF1493',
          boxShadow: '0 0 10px #FF1493',
          transform: 'scale(1)'
      });
  }, 300);
});
  
$buttonContainer.append($tweetButton).append($returnButton);
$tweetControls.append($usernameInput).append($tweetInput).append($buttonContainer);

 
  ////////////////////////////////////////TWEET FEED///////////////////////////////////////////////////////////

  //create a tweet feed section where all tweets will be displayed
  const $tweetFeed = $('<div id="tweet-feed"></div>').css({
    width: '100%',
    'background-color': '#222',          // Dark background for the feed container
    'padding': '10px',                   // Padding inside the feed
    'border-radius': '10px',             // Rounded corners for a modern look
    'box-shadow': '0 4px 10px rgba(0,0,0,0.3)',  // Soft shadow effect
    'max-height': '600px',               // Max height for the feed
    'overflow-y': 'auto',                // Enable scrolling for overflow content
    'margin': '20px 0',                  // Space around the tweet feed
    'boxSizing': 'border-box'
  });


$tweetFeedContainer.append($tweetFeed);
$tweetControlsContainer.append($tweetControls);

 // Append the content wrapper to the body
 const $body = $('body').empty().append($contentWrapper);

  // initialize an array to track displayed tweet ids to avoid duplicates
  const displayedTweetMessages = new Set();

  const writeTweetAndDisplay = (message, username) => {
    console.log('Attempting to write tweet:', { message, username });

    try {
    writeTweet(message, username); 

    console.log('Tweet written successfully');

    // Create a new tweet object with user details, message, and creation time
    const tweet = {
      user: username,
      message: message,
      created_at: new Date(), // Timestamp of when the tweet was created
    };

    console.log('New tweet object:', tweet);


    // Push the newly written tweet to streams.home so it persists on the feed
    streams.home.push(tweet);
    console.log('Tweet added to streams.home');

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
    const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
    const relativeTime = moment(tweet.created_at).fromNow(); // e.g., "a few seconds ago"
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
    console.log('New tweet added to the DOM');

    // Update trending hashtags
    updateTrendingHashtags();
    console.log('Trending hashtags updated');
  } catch (error) {
    console.error('Error in writeTweetAndDisplay:', error);
  }
};
  

  const processMessage  = (message) => {
    //use regex to find hashtags
    return message.replace(/(#\w+)/g, (tag) => {
      return `<span class="hashtag" style="color:#FF1493; cursor:pointer;">${tag}</span>`
    });
  };

  //function to create and display tweets
  function createTweets(additionalTweets = []) {
    console.log('Creating tweets. Current view:', currentView);
    $('#return-button').hide();
    // $('#tweet-feed').empty();
    const $tweetFeed = $('#tweet-feed-container #tweet-feed');
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
        showHashtagTimeline(hashtag); //call function to show tweets with this hashtag
      });


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
      $('#tweet-feed-container #tweet-feed').prepend($tweetDiv);
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
    updateTrendingHashtags();
  }


  function showUserTimeline(username) {
    clearTimeout(autoRefreshTimer);
    currentView = 'user';
    $('#return-button').show();
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

  let currentView = 'main'
  let autoRefreshTimer;

  const autoRefreshTweets = () => {
    console.log('Auto-refreshing. Current view:', currentView);
    clearTimeout(autoRefreshTimer); // Clear any existing timer

    if (currentView === 'main') {
    const newTweets = [];
    for (let i = 0; i < newTweetsCount; i++) {
      generateRandomTweet();
      newTweets.push(streams.home[streams.home.length - 1]);
    }
    createTweets(newTweets);
  }
  autoRefreshTimer = setTimeout(autoRefreshTweets, 10000);
};

// Create main content wrapper
const $mainContentWrapper = $('<div id="main-content-wrapper"></div>').css({
  display: 'flex',
  justifyContent: 'space-between',
  flex: 1
});

// Append main content wrapper to content wrapper
$contentWrapper.append($mainContentWrapper);

// Append sidebar and container to main content wrapper
$mainContentWrapper.append($sidebarWrapper).append($container);

// Populate the containers
$tweetFeedContainer.append($tweetFeed);
$tweetControlsContainer.append($tweetControls);

// Append the content wrapper to the body
$('body').empty().append($contentWrapper);

// // Append title container to content wrapper
// $contentWrapper.append($titleContainer);


// Initialize the page by creating tweets
currentView = 'main';
createTweets();
autoRefreshTweets(); // Start auto-refresh

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
