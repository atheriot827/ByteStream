
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

  //create a tweet feed section where all tweets will be displayed
  const $tweetFeed = $('<div id="tweet-feed"></div>');

  //create a new tweet section with a text area and a button
  const $newTweet = $(`
    <div id="new-tweet">
      <textarea id ="tweet-input" placeholder="What\'s happening?"></textarea>
      <button id="tweet-button">Tweet</button>
      <button id="refresh-button">Refresh Tweets</button>
    </div>
  `);

  //append the title, tweet feed, and new feed section to the container
  $container.append($title).append($tweetFeed).append($newTweet);

  //append entire container to the body
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
  padding: '10px, 15px',
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

  //function to create and display tweets
  function createTweets() {
  //clear the tweet feed first before appending new tweets to avoid duplicates
  $('#tweet-feed').html('');
  
  //map over the streams.home array to create tweet elements
  streams.home.forEach((tweet) => {
    //create a new div for each tweet
    const $tweet = $('<div class="tweet"></div>');

    //create a clickable user element (wrap username in a span)
  const $user = $(`<span class="user">@${tweet.user}</span>`);

  //create a message element to hold the tweet's message
  const $message = $('<p></p>').text(tweet.message);

  //format the time using moment.js (from created_at property)
  const $time = $('<span class="time"></span>').text(moment(tweet.created_at).fromNow());

  //append user, message, and time to the tweet div
  $tweet.append($user).append($message).append($time);

  //append the newly created tweet to the tweet feed
  $('#tweet-feed').append($tweet);

  });
}

  //event listener for posting a new tweet
  $('#tweet-button').on('click', () => {
    //get the tweet message from the textarea input
    const tweetMessage = $('#tweet-input').val();

    //if there is a message, proceed to add the message
    if (tweetMessage) {
      //function from data-generator.js
      writeTweet(tweetMessage); 

      //clear input after tweeting
      $('#tweet-input').val('');

      //refresh the tweet feed to include the new tweet
      createTweets();
    }
  });

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
