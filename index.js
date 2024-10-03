
//ALL CODE GOES INSIDE HERE 

//wait until the document is fully loaded
$(document).ready(() => {

  //number of new tweets to generate at a time, and max number of tweets to display
  const newTweetsCount = 3; // Number of new tweets to generate at a time
  const maxDisplayedTweets = 10; // Maximum number of tweets to display

  //clear the body - dynamically add content
  const $body = $('body');
  $body.html(''); //clears body - will clear tag you call it on

  //create the main container and title
  const $container = $('<div class="container"></div>').css({
    width: '80%',
    //centers the container
    margin: '0 auto',
    //centers the text
    textAlign: 'center'
  });

  const $title = $('<h1>Twiddler!</h1>');

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
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer'
  });
  
  // Create the refresh button
  const $refreshButton = $('<button id="refresh-button">Refresh Tweets</button>').css({
    padding: '10px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer'
  });
  
  // Append the tweet input, tweet button, and refresh button to the tweet controls
  $tweetControls.append($tweetInput).append($tweetButton).append($refreshButton);

  //create a tweet feed section where all tweets will be displayed
  const $tweetFeed = $('<div id="tweet-feed"></div>');
  // Append the title, tweet controls, and tweet feed to the container
  $container.append($title).append($tweetControls).append($tweetFeed);

  // Append the entire container to the body
  $body.append($container);

  // initialize an array to track displayed tweet ids to avoid duplicates
  const displayedTweetMessages = new Set();

  const writeTweetAndDisplay = (message, username) => {
    writeTweet(message, username);
    // create the new tweet object with user, message, and creation time
    const tweet = {
      user: username,
      message: message,
      created_at: new Date(),
    };

    // add user-written tweet to streams.home so it persists on feed
    streams.home.push(tweet);

    // dynamically create the new tweet HTML and style it
    const $newTweet = $('<div class="tweet"></div>').css({
      border: '1px solid #ddd',
      margin: '10px',
      padding: '10px',
      borderRadius: '5px',
      textAlign: 'left',
    });

    //format the actual time and human-friendly time
    const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A'); // e.g., "October 3rd 2024, 3:45 PM"
    const relativeTime = moment(tweet.created_at).fromNow(); // e.g., "a few seconds ago"

    //add both formatted time and relative time to the text
    $newTweet.text(`@${tweet.user}: ${tweet.message} (${relativeTime})`);
    $newTweet.append($('<span class="actual-time"></span>').text(` - ${formattedTime}`).css({
      fontSize: '0.8em',
      color: 'gray',
    }));

    // add the tweet id to the displayedTweetIds set to track it
    displayedTweetMessages.add(tweet.message);
    // Prepend the new tweet to the top of the tweet feed
    $('#tweet-feed').prepend($newTweet);
  };

  const processMessage  = (message) => {
    //use regex to find hashtags
    return message.replace(/(#\w+)/g, (tag) => {
      return `<span class="hashtag" style="color:blue; cursor:pointer;">${tag}</span>`
    });
  };


  //function to create and display tweets
  function createTweets(additionalTweets = []) {
    const allTweets = streams.home.slice().reverse();
    const newTweets = additionalTweets.length ? additionalTweets : allTweets.slice(0, maxDisplayedTweets);
  
    //clear current tweet feed if its empty
    if ($('#tweet-feed').is(':empty')) {
      $('#tweet-feed').html('');
    }

    //map over the streams.home array to create tweet elements
    newTweets.forEach((tweet) => {
      //check if the tweet has already been displayed by checking the tweet message id
      if (displayedTweetMessages.has(tweet.message)) {
        //skip already displayed tweets
        return;
      }
      
      //create tweet styling
      const $tweetDiv = $('<div class="tweet"></div>').css({
        border: '1px solid #ddd',
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        textAlign: 'left',
      });

      //create a clickable user element (wrap username in a span)
      const $user = $(`<span class="user">@${tweet.user}</span>`).css({
        fontWeight: 'bold',
        color: 'blue',
        cursor: 'pointer'
      }).on('click', () => {
        showUserTimeline(tweet.user);   //call function to show user timeline
      })

      //add onclick function for username
      $user.on('click', () => {
        //implement this function to filter by user timeline
        showUserTimeline(tweet.user);
      });

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
    userTweets.slice(0, maxUserTweets).forEach((tweet) => {
      // Create tweet styling
      const $tweetDiv = $('<div class="tweet"></div>').css({
        border: '1px solid #ddd',
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        textAlign: 'left',
      });

      //create a message element to hold the tweet's message
      const $message = $('<p></p>').text(tweet.message).css({
        margin: '5px 0'
      });

      //format the actual time and human-friendly time
      const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
      const relativeTime = moment(tweet.created_at).fromNow();

      const $time = $('<span class="time"></span>').text(`${relativeTime} | ${formattedTime}`).css({
        fontSize: '0.8em',
        color: 'gray',
      });

      //append user, message, and time to the tweet div
      $tweetDiv.append($message).append($time);
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
