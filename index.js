
//ALL CODE GOES INSIDE HERE 

//wait until the document is fully loaded
$(document).ready(() => {

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

// Create tweet controls (textarea and buttons)
const $tweetControls = $(`
  <div id="tweet-controls">
    ${$usernameInput.prop('outerHTML')} 
    <textarea id="tweet-input" placeholder="What's happening?"></textarea>
    <button id="tweet-button">Tweet</button>
    <button id="refresh-button">Refresh Tweets</button>
  </div>
`);


//create a tweet feed section where all tweets will be displayed
const $tweetFeed = $('<div id="tweet-feed"></div>');
// Append the title, tweet controls, and tweet feed to the container
$container.append($title).append($tweetControls).append($tweetFeed);

// Append the entire container to the body
$body.append($container);

//textarea and button styling
$('#tweet-input').css({
  //full width
  width: '100%',
  //height of textarea
  height: '60px',
  //space below textarea
  marginBottom: '10px',
  //inner padding
  padding: '5px',
  //border styling
  border: '1px solid #ddd',
  //rounded corners
  borderRadius: '4px',
});

$('#tweet-button, #refresh-button').css({
  //padding inside buttons
  padding: '10px 15px',
  //margin between buttons
  margin: '5px',
  //no border
  border: 'none',
  //border radius
  borderRadius: '4px',
  //background color
  backgroundColor: '#007bff',
  //text color
  color: 'white',
  //pointer cursor on hover
  cursor: 'pointer'
});

$('#tweet-button, #refresh-button').hover(
  //hover effect
  function() { $(this).css('backgroundColor', '#0056b3'); },
  //restore color
  function () { $(this).css('backgroundColor', '#007bff'); }
)

const writeTweetAndDisplay = (message, username) => {
  // Call the writeTweet function to add the tweet to the data structure
  writeTweet(message, username);

  // Now, dynamically update the DOM to show the tweet at the top of the tweet feed
  const tweet = {
    user: username,
    message: message,
    created_at: new Date(),
  };

  // Create a new div for the tweet
  const $newTweet = $('<div class="tweet"></div>').css({
    border: '1px solid #ddd',
    margin: '10px',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'left',
  });
  $newTweet.text(`@${tweet.user}: ${tweet.message} (${moment(tweet.created_at).fromNow()})`);

  // Prepend the new tweet to the top of the tweet feed
  $('#tweet-feed').prepend($newTweet);
};

  //function to create and display tweets
  function createTweets() {
  //clear the tweet feed first before appending new tweets to avoid duplicates
  $('#tweet-feed').html('');
  
  //map over the streams.home array to create tweet elements
  streams.home.slice().reverse().forEach((tweet) => {

    //create tweet styling
    const $tweetDiv = $('<div class="tweet"></div>').css({
      //border around tweets
      border: '1px solid #ddd',
      //margin around each tweet
      margin: '10px',
      //padding inside tweet
      padding: '10px',
      //rounded corners
      borderRadius: '5px',
      //align text to the left
      textAlign: 'left',
    });

    //create a clickable user element (wrap username in a span)
  const $user = $(`<span class="user">@${tweet.user}</span>`).css({
    //bold username
    fontWeight: 'bold',
    //blue color for clickable username
    color: 'blue',
    //cursor changes to pointer on hover
    cursor: 'pointer'
  });

  //add onclick function for username
  //display timeline when user clicked
  $user.on('click', () => {
    showUserTimeline(tweet.user);
  })

  //create a message element to hold the tweet's message
  //create a message element to hold the tweets message
  const $message = $('<p></p>').text(tweet.message).css({
    margin: '5px 0'
  });

  //format the time using moment.js (from created_at property)
  const $time = $('<span class="time"></span>').text(moment(tweet.created_at).fromNow()).css({
    //smaller font size for the timestamp
    fontSize: '0.8em',
    //gray color for time
    color: 'gray',
  })

  //append user, message, and time to the tweet div
  $tweetDiv.append($user).append($message).append($time)
  //prepend the newly created tweet to the tweet feed to maintain reverse chronological order
  $('#tweet-feed').prepend($tweetDiv);
  });
}

  //event listener for posting a new tweet
  $('#tweet-button').on('click', () => {

    // Set the global visitor property when the tweet button is clicked
    const username = $('#username-input').val().trim(); // Get username input

    // Ensure a valid username is entered
    if (username) {

      const tweetMessage = $('#tweet-input').val().trim();

    //if there is a message, proceed to add the message
      if (tweetMessage) {

      //call the writeTweet function
        writeTweetAndDisplay(tweetMessage, username); 

        //clear input after tweeting
        $('#tweet-input').val('');
        $('#username-input').val('');
    } else {
      alert('Please enter a tweet message.')
    }
      } else {
    alert('Please enter a valid username.')
      }
    });

//refresh button functionality
$('#refresh-button').on('click', () => {
  //clear existing tweets
  streams.home = [];

  //generate a new set of random tweets
  for (let i = 0; i < 10; i++) {
    generateRandomTweet();
  }

  //reload all tweets when "Refresh Tweets" button is clicked
  createTweets();
});

  //function to create and display tweets
  function createTweets() {
    $('#tweet-feed').html(''); //clear the tweet feed before displaying new tweets

    //iterate over the streams.home array to create tweet elements
    streams.home.slice().reverse().forEach((tweet) => {
      const $tweetDiv = $('<div class="tweet"></div>').css({
        border: '1px solid #ddd',
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        textAlign: 'left',
      });

      const $user = $(`<span class="user">@${tweet.user}</span>`).css({
        fontWeight: 'bold',
        color: 'blue',
        cursor: 'pointer',
      });

      //add click event to show user timeline
      $user.on('click', () => {
        showUserTimeline(tweet.user);
      });

      const $message = $('<p></p>').text(tweet.message).css({
        margin: '5px 0',
      });

      const $time = $('<span class="time"></span>').text(moment(tweet.created_at).fromNow()).css({
        fontSize: '0.8em',
        color: 'gray',
      });

      // Append elements to the tweet div
      $tweetDiv.append($user).append($message).append($time);
      $('#tweet-feed').prepend($tweetDiv); // prepend the tweet to the feed
    });
  }

//show users timeline functionality
function showUserTimeline(username) {
  //clear the tweet feed before appending new tweets
  $('#tweet-feed').html('');

//fetch the user's tweets from the streams object and reverse them for RCO
const userTweets = (streams.users[username] || []).slice().reverse();

//loop through user's tweets and prepend them to the tweet feed
userTweets.forEach((tweet) => {
  const $userTweetDiv = $('<div class="tweet"></div>').css({
    border: '1px solid #ddd',
    margin: '10px',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'left'
  });

  const $user = $(`<span class="user">@${tweet.user}</span>`).css({
    fontWeight: 'bold',
    color: 'blue',
    cursor: 'pointer'
  });

  const $message = $('<p></p>').text(tweet.message).css({
    margin: '5px 0'
  });

  const $time = $('<span class="time"></span>').text(moment(tweet.created_at).fromNow()).css({
    fontSize: '0.8em',
    color: 'gray'
  });

  //appending to userTweetDiv
  $userTweetDiv.append($user).append($message).append($time);
  //prepend userTweetDiv to tweet feed
  $('#tweet-feed').prepend($userTweetDiv);
})
}


  //initial load: display the pre-generated tweets
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
