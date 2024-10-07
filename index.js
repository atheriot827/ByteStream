
//ALL CODE GOES INSIDE HERE 

//wait until the document is fully loaded
$(document).ready(() => {

  // Set global styles
$('body').css({
  fontFamily: 'Roboto, sans-serif',
  backgroundColor: '#1b1b1b',
  color: '#fff'
});

$('h1, h2, h3').css({
  fontFamily: "'Orbitron', sans-serif"
});

// Create a style for user and hashtag elements
const globalStyles = `
  <style>
      .user { color: #00FFFF; }
      .hashtag { color: #FF1493; cursor: pointer; }
  </style>
`;
$('head').append(globalStyles);

$('head').append(`
  <style>
      #tweet-feed::-webkit-scrollbar {
          display: none;
      }
  </style>
`);

// Tweet styles
function createTweetStyle() {
  return {
      background: 'rgba(255, 255, 255, 0.05)', 
      backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '15px',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
  };
}


function createTimeStampStyle() {
  return {
      fontSize: '0.8em',
      color: 'rgba(0, 255, 255, 0.7)',
      textShadow: '0 0 3px rgba(0, 0, 0, 0.8)'
  };
}

// Apply tweet hover effect
$(document).on('mouseenter', '.tweet', function() {
  $(this).css({
      boxShadow: '0px 0px 15px #FF1493',
      borderColor: '#FF1493'
  });
}).on('mouseleave', '.tweet', function() {
  $(this).css({
      boxShadow: 'none',
      borderColor: 'rgba(255, 255, 255, 0.2)'
  });
});
  

//number of new tweets to generate at a time, and max number of tweets to display
const newTweetsCount = 3; // Number of new tweets to generate at a time
const maxDisplayedTweets = 10; // Maximum number of tweets to display


const $contentWrapper = $('<div id="content-wrapper"></div>').css({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    padding: '20px',
    overflow: 'hidden',
    backgroundColor: '#050505', // Darker base color
    backgroundImage: `
        linear-gradient(30deg, #0a0a0a 12%, transparent 12.5%, transparent 87%, #0a0a0a 87.5%, #0a0a0a),
        linear-gradient(150deg, #0a0a0a 12%, transparent 12.5%, transparent 87%, #0a0a0a 87.5%, #0a0a0a),
        linear-gradient(30deg, #0a0a0a 12%, transparent 12.5%, transparent 87%, #0a0a0a 87.5%, #0a0a0a),
        linear-gradient(150deg, #0a0a0a 12%, transparent 12.5%, transparent 87%, #0a0a0a 87.5%, #0a0a0a),
        linear-gradient(60deg, #15151580 25%, transparent 25.5%, transparent 75%, #15151580 75%, #15151580),
        linear-gradient(60deg, #15151580 25%, transparent 25.5%, transparent 75%, #15151580 75%, #15151580)
    `,
    backgroundSize: '80px 140px',
    backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
});

const $titleContainer = $('<div id="title-container"></div>').css({
  marginBottom: '20px',
    flexShrink: 0,
});

const $title = $('<h1>Twiddler!</h1>').css({
  fontFamily: 'Orbitron, sans-serif',
    color: '#00FFFF',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5), 0 0 30px rgba(138, 43, 226, 0.3)',
    margin: '0 0 20px 0',
    fontSize: '2.5em',
    textAlign: 'center'
});

$titleContainer.append($title);

const $sidebarWrapper = $('<div id="sidebar-wrapper"></div>').css({
  display: 'flex',
  flexDirection: 'column',
  flexBasis: '25%',
  marginRight: '20px'
});

// Create the sidebar container
const $sidebar = $('<div id="sidebar"></div>').css({
  flex: '1',
  backgroundColor: 'rgba(20, 20, 20, 0.4)', // Match tweet feed background
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
  padding: '20px',
  borderRadius: '15px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)', // Add cyan glow
  overflowY: 'auto',
  color: '#fff',
  boxSizing: 'border-box',
  border: '1px solid rgba(0, 255, 255, 0.1)' // Add subtle cyan border
});

// Append title and sidebar to the sidebar wrapper
$sidebarWrapper.append($titleContainer).append($sidebar);

// Add title for the sidebar
const $sidebarTitle = $('<h2>Trending Hashtags</h2>').css({
  fontFamily: 'Orbitron, sans-serif',
  textAlign: 'left',
  fontSize: '1.5em',
  marginBottom: '20px',
  color: '#00FFFF',
  textShadow: '0 0 10px rgba(0, 255, 255, 0.7)',
  borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
  paddingBottom: '10px'
});

// Add a list for trending hashtags
const $trendingList = $('<ul id="trending-list"></ul>').css({
    listStyle: 'none',
    padding: 0,
    margin: 0 // Allow scrolling if there are many trending hashtags
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
  const $tweetDiv = $('<div class="tweet"></div>').css(createTweetStyle());

  const $user = $(`<span class="user">@${tweet.user}</span>`).css({
      fontWeight: 'bold',
      cursor: 'pointer',
      color: '#00FFFF',
      textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 0, 0, 0.9)'
  });

  const $message = $('<p></p>').html(processMessage(tweet.message)).css({
      margin: '10px 0',
      color: '#FFFFFF',
      textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
  });

  const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
  const relativeTime = moment(tweet.created_at).fromNow();
  const $timeInfo = $('<span class="time"></span>')
      .text(`${relativeTime} | ${formattedTime}`)
      .css(createTimeStampStyle());

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
                  padding: '8px 0',
                  cursor: 'pointer',
                  color: '#FF1493',
                  textShadow: '0 0 5px rgba(255, 20, 147, 0.7)',
                  transition: 'all 0.3s ease'
              })
              .hover(
                  function() { $(this).css({ textShadow: '0 0 10px rgba(255, 20, 147, 0.9)' }); },
                  function() { $(this).css({ textShadow: '0 0 5px rgba(255, 20, 147, 0.7)' }); }
              )
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
    backgroundColor: 'transparent', // Completely transparent
    backdropFilter: 'none', // Remove any backdrop filter
    WebkitBackdropFilter: 'none', // Remove for Safari support
    borderRadius: '20px',
    padding: '30px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    boxShadow: 'none', // Remove any shadow
    border: 'none' // Remove any border
     
});

  const $tweetFeedWrapper = $('<div id="tweet-feed-wrapper"></div>').css({
    flex: '1 1 auto',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '20px',
    borderRadius: '15px',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
    height: '400px',  
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
});

const $tweetFeed = $('<div id="tweet-feed"></div>').css({
    flex: '1 1 auto',
    overflowY: 'scroll',
    padding: '20px',
    backgroundColor: 'rgba(20, 20, 20, 0.4)', // Darker, similar to tweet controls
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    borderRadius: '15px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Subtle shadow
    border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
});

$tweetFeedWrapper.append($tweetFeed);

// Add a style tag to hide webkit scrollbar
$('head').append(`
  <style>
      #tweet-feed::-webkit-scrollbar {
          display: none;
      }
  </style>
`);

// const $customScrollbar = $('<div id="custom-scrollbar"></div>').css({
//   position: 'absolute',
//   right: '0',
//   top: '0',
//   width: '12px',
//   height: '100%',
//   backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   borderRadius: '6px'
// });

// const $customScrollbarThumb = $('<div id="custom-scrollbar-thumb"></div>').css({
//   position: 'absolute',
//   width: '100%',
//   background: 'linear-gradient(to bottom, #00FFFF, #FF1493)',
//   borderRadius: '6px',
//   cursor: 'pointer',
//   transition: 'background 0.3s'
// });

// $customScrollbarThumb.hover(
//   function() { $(this).css('background', 'linear-gradient(to bottom, #FF1493, #00FFFF)'); },
//   function() { $(this).css('background', 'linear-gradient(to bottom, #00FFFF, #FF1493)'); }
// );

//Create a div to hold tweet controls
const $tweetControls = $('<div id="tweet-controls"></div>').css({ 
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '20px',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  borderRadius: '15px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
  border: '1px solid rgba(0, 255, 255, 0.1)'
});

// $customScrollbar.append($customScrollbarThumb);
$container.append($tweetFeedWrapper).append($tweetControls);

// Custom scrollbar functionality
// $tweetFeed.on('scroll', function() {
//   const scrollPercentage = ($(this).scrollTop() / (this[0].scrollHeight - $(this).height())) * 100;
//   const thumbHeight = ($(this).height() / this[0].scrollHeight) * 100;
  
//   $customScrollbarThumb.css({
//       height: `${thumbHeight}%`,
//       top: `${thumbPosition}px`
//   });


// Make the custom scrollbar draggable
// let isScrollbarDragging = false;
// let scrollbarStartY;
// let scrollbarStartScrollTop;

// $customScrollbarThumb.on('mousedown', function(e) {
//   isScrollbarDragging = true;
//   scrollbarStartY = e.clientY - $customScrollbarThumb.position().top;
//   scrollbarStartScrollTop = $tweetFeed.scrollTop();
//   $('body').css('user-select', 'none');
// });

// $(document).on('mousemove', function(e) {
//   if (!isScrollbarDragging) return;
//   const y = e.clientY - $customScrollbar.offset().top;
//   const percentage = y / $customScrollbar.height();
//   $tweetFeed.scrollTop(percentage * ($tweetFeed[0].scrollHeight - $tweetFeed.height()));
// }).on('mouseup', function() {
//   isScrollbarDragging = false;
//   $('body').css('user-select', '');
// });
 
//   $('body').css({
//     backgroundColor: '#050505',
//     color: '#fff',
//     fontFamily: 'Roboto, sans-serif',
//     margin: 0,
//     padding: 0
// });
  
  //create a username input field
  const $usernameInput = $('<input id="username-input" placeholder="Enter your username" />').css({
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  });
  
  // Create the tweet input textarea
  const $tweetInput = $('<textarea id="tweet-input" placeholder="What\'s happening?"></textarea>').css({
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '60px',
    outline: 'none'
  });

  // Style for both inputs on focus
$usernameInput.add($tweetInput).on('focus', function() {
  $(this).css({
      boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
      border: '1px solid rgba(0, 255, 255, 0.5)'
  });
}).on('blur', function() {
  $(this).css({
      boxShadow: 'none',
      border: '1px solid rgba(0, 255, 255, 0.3)'
  });
});

  // Adjust button container
  const $buttonContainer = $('<div></div>').css({
    display: 'flex',
    justifyContent: 'space-between'
  });

  // Create the tweet button
  const $tweetButton = $('<button id="tweet-button">Tweet</button>').css({
    padding: '10px 20px',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    border: '1px solid rgba(0, 255, 255, 0.5)',
    borderRadius: '5px',
    color: '#00FFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    textShadow: '0 0 5px rgba(0, 255, 255, 0.7)'
}).hover(
    function() {
        $(this).css({
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
        });
    },
    function() {
        $(this).css({
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: 'none'
        });
    }
);
  
  // Update click handler
  $(document).on('click', '#tweet-button', function(e) {
    console.log('Tweet button clicked');
    e.preventDefault();
    
    const $button = $(this);
    const originalText = $button.text();
    const username = $('#username-input').val().trim();
    const tweetMessage = $('#tweet-input').val().trim();
    
    if (username && tweetMessage) {
        // Visual feedback on click
        $button.css({
            backgroundColor: 'rgba(0, 255, 255, 0.6)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
            transform: 'scale(0.95)'
        });
        
        setTimeout(() => {
            writeTweetAndDisplay(tweetMessage, username);
            $('#tweet-input').val('');
            
            // Success animation
            $button.text('Posted!')
                   .css({
                       backgroundColor: 'rgba(0, 255, 255, 0.4)',
                       color: '#FFFFFF',
                       textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
                       boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
                       transform: 'scale(1.05)'
                   });
            
            // Return to original state
            setTimeout(() => {
                $button.text(originalText)
                       .css({
                           backgroundColor: 'rgba(0, 255, 255, 0.2)',
                           color: '#00FFFF',
                           textShadow: '0 0 5px rgba(0, 255, 255, 0.7)',
                           boxShadow: 'none',
                           transform: 'scale(1)'
                       });
            }, 1500);
        }, 100);
    } else {
        // Error feedback
        $button.css({
            backgroundColor: 'rgba(255, 0, 0, 0.4)',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)'
        });
        
        setTimeout(() => {
            $button.css({
                backgroundColor: 'rgba(0, 255, 255, 0.2)',
                boxShadow: 'none'
            });
        }, 200);
        
        alert('Please enter both a username and a tweet message.');
    }
});

const $returnButton = $('<button id="return-button">Return to All Tweets</button>').css({
  padding: '10px 20px',
  backgroundColor: 'rgba(0, 255, 255, 0.2)',
  border: '1px solid rgba(0, 255, 255, 0.5)',
  borderRadius: '5px',
  color: '#00FFFF',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 0 5px rgba(0, 255, 255, 0.7)'
}).hover(
  function() {
      $(this).css({
          backgroundColor: 'rgba(0, 255, 255, 0.4)',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
      });
  },
  function() {
      $(this).css({
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          boxShadow: 'none'
      });
  }
);

$(document).on('click', '#return-button', function() {
  console.log('Return button clicked');
  const $button = $(this);
  const originalText = $button.text();

  // Visual feedback on click
  $button.css({
      backgroundColor: 'rgba(255, 20, 147, 0.6)', // Brighter pink
      boxShadow: '0 0 20px rgba(255, 20, 147, 0.8)',
      transform: 'scale(0.95)',
      color: '#FFFFFF',
      textShadow: '0 0 10px rgba(255, 20, 147, 1)'
  });

  setTimeout(() => {
      currentView = 'main';
      $('#tweet-feed').empty();
      createTweets();
      autoRefreshTweets();

      // Success animation
      $button.text('Returned!')
             .css({
                 backgroundColor: 'rgba(255, 20, 147, 0.4)',
                 color: '#FFFFFF',
                 textShadow: '0 0 10px #FF1493, 0 0 20px #FF1493',
                 boxShadow: '0 0 30px rgba(255, 20, 147, 0.8)',
                 transform: 'scale(1.05)'
             });

      // Return to original state and hide
      setTimeout(() => {
          $button.text(originalText)
                 .css({
                     backgroundColor: 'rgba(0, 255, 255, 0.2)',
                     color: '#00FFFF',
                     textShadow: '0 0 5px rgba(0, 255, 255, 0.7)',
                     boxShadow: 'none',
                     transform: 'scale(1)'
                 })
                 .hide();
      }, 1000);
  }, 100);
});
  
$buttonContainer.append($tweetButton).append($returnButton);
$tweetControls.append($usernameInput).append($tweetInput).append($buttonContainer);

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

    // Push the newly written tweet to streams.home so it persists on the feed
    streams.home.unshift(tweet);
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
      cursor: 'pointer',
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
      return `<span class="hashtag" style="color:#FF1493; text-shadow: 0 0 5px rgba(255, 20, 147, 0.7), 0 0 10px rgba(0, 0, 0, 0.8); cursor:pointer;">${tag}</span>`;
    });
  };

  function createTweets(additionalTweets = []) {
    console.log('Creating tweets. Current view:', currentView);
    $('#return-button').hide();
    const allTweets = streams.home.slice().reverse();
    const tweetsToDisplay = allTweets.slice(0, maxDisplayedTweets);
    $('#tweet-feed').empty();

    tweetsToDisplay.forEach((tweet) => {
        const $tweetDiv = $('<div class="tweet"></div>').css({
          backgroundColor: 'rgba(20, 20, 20, 0.4)', // More transparent
          border: '1px solid rgba(0, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '15px',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)'
        });

        // Add hover effect
$tweetDiv.hover(
  function() {
      $(this).css({
        background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)'
      });
  },
  function() {
      $(this).css(createTweetStyle());
  }
);

        const $user = $(`<span class="user">@${tweet.user}</span>`).css({
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#00FFFF', // Neon cyan
            textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 0, 0, 0.9)'
        }).on('click', () => {
            console.log(`Username clicked: ${tweet.user}`);
            showUserTimeline(tweet.user);
        });

        const $message = $('<p></p>').html(processMessage(tweet.message)).css({
            margin: '10px 0',
            color: '#FFFFFF',
            textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
        });

        $message.on('click', '.hashtag', function() {
            const hashtag = $(this).text();
            showHashtagTimeline(hashtag);
        });

        const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
        const relativeTime = moment(tweet.created_at).fromNow();
        const $timeInfo = $('<span class="time"></span>').text(`${relativeTime} | ${formattedTime}`).css(createTimeStampStyle());

        $tweetDiv.append($user).append($message).append($timeInfo);
        $('#tweet-feed').append($tweetDiv);
    });

    displayedTweetMessages.clear();
    tweetsToDisplay.forEach(tweet => {
    displayedTweetMessages.add(tweet.message);
    });

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
      const $tweetDiv = $('<div class="tweet"></div>').css(createTweetStyle());

      const $message = $('<p></p>').html(processMessage(tweet.message)).css({
          margin: '10px 0',
          color: '#FFFFFF',
          textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
      });

      const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
      const relativeTime = moment(tweet.created_at).fromNow();
      const $timeInfo = $('<span class="time"></span>')
          .text(`${relativeTime} | ${formattedTime}`)
          .css(createTimeStampStyle());

      $tweetDiv.append($message).append($timeInfo);
      $('#tweet-feed').prepend($tweetDiv);
  });
}

  let currentView = 'main'
  let autoRefreshTimer;

  const autoRefreshTweets = () => {
    console.log('Auto-refreshing. Current view:', currentView);
    clearTimeout(autoRefreshTimer);

    if (currentView === 'main') {
        for (let i = 0; i < newTweetsCount; i++) {
            generateRandomTweet();
        }

        createTweets();
        updateTrendingHashtags();
    }

    autoRefreshTimer = setTimeout(autoRefreshTweets, 10000); // Refresh every 10 seconds
};

// Create main content wrapper
const $mainContentWrapper = $('<div id="main-content-wrapper"></div>').css({
  display: 'flex',
  justifyContent: 'space-between',
  flex: '1 1 auto',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: 'transparent' 
});

// Append sidebar and container to main content wrapper
$mainContentWrapper.append($sidebarWrapper).append($container);

// Append main content wrapper to content wrapper
$contentWrapper.append($mainContentWrapper);

// Append the content wrapper to the body
$('body').empty().append($contentWrapper);

// Initialize the page by creating tweets
currentView = 'main';
createTweets();
autoRefreshTweets(); // Start auto-refresh

});
