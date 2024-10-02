
//ALL CODE GOES INSIDE HERE 

//wait until the document is fully loaded
$(document).ready(() => {

  //clear the body - dynamically add content
  const $body = $('body');
  $body.html(''); //clears body - will clear tag you call it on

  //create the main container and title
  const $container = $('<div class="container"></div>');
  const $title = $('<h1>Twiddler!</h1>');

  //create a tweet feed section where all tweets will be displayed
  const $tweetFeed = $('<div id="tweet-feed"></div>');

  //create a new tweet section with a text area and a button
  const $newTweet = $(`
    <div id="new-tweet">
      <textarea id ="tweet-input" placeholder="What\'s happening?"></textarea>
      <button id="tweet-button">Tweet</button>
    </div>
  `);

  //append the title, tweet feed, and new feed section to the container
  $container.append($title).append($tweetFeed).append($newTweet);

  //append entire container to the body
  $body.append($container);

  //function to create and display tweets
  function createTweets() {
  //clear the tweet feed first before appending new tweets to avoid duplicates
  $('#tweet-feed').html('');
  
  //map over the streams.home array to create tweet elements
  streams.home.forEach((tweet) => {
    //create a new div for each tweet
    const $tweet = $('<div class="tweet"></div>');
  });

  //create a clickable user element (wrap username in a span)
  const $user = $(`<span class="user">@${tweet.user}</span>`);

  //create a message element to hold the tweet's message
  const $message = $('<p></p>').text(tweet.message);

  //format the time using moment.js (from created_at property)
  const $time = $('<span class="time"></span>').text(moment(tweet.created_at).fromNow());

  





  const $tweets = streams.home.map((tweet) => {
    const $tweet = $('<div></div>');
    const text = `@${tweet.user}: ${tweet.message}`;

    $tweet.text(text);

    return $tweet;
  });
  $body.append($tweets);
}
});

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
