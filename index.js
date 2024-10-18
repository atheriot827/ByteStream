$(document).ready(() => {
  // Constants ////////////////////////////////////////////////////////////////////////////////

  //these constants define the number of the new tweets to display and the max number of tweets to show in the feed

  const newTweetsCount = 3;
  const maxDisplayedTweets = 10;

  // Global variables /////////////////////////////////////////////////////////////////////////

  //keep track of current view ('main', 'user', or 'hashtag')
  let currentView = 'main';
  //store the timer for auto-refreshing tweets
  let autoRefreshTimer;
  //a set to store unique tweet messages to avoid duplicates
  const displayedTweetMessages = new Set();

  // Initialize the page ///////////////////////////////////////////////////////////////////////

  //ensure that the code runs only after the DOM is fully loaded
  initializeStyles();
  createLayout();
  createSidebar();
  updateTrendingReactions();
  initializeEventListeners();
  currentView = 'main';
  createTweets();
  autoRefreshTweets();

  // Main functions ///////////////////////////////////////////////////////////////////////////

  //set up the global styles for the application, including fonts, colors and animations
  function initializeStyles() {
    //set the body's font family and background color
      $('body').css({
          fontFamily: 'Roboto, sans-serif',
          backgroundColor: '#1b1b1b',
          color: '#fff'
      });

      //set the font family for headings
      $('h1, h2, h3').css({
          fontFamily: "'Orbitron', sans-serif"
      });

      //define and append global styles
      const globalStyles = `
          <style>
              .user { color: #00FFFF; }
              .tweet .user {
                  font-weight: bold;
                  cursor: pointer;
                  color: #00FFFF;
                  text-shadow: 0 0 5px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 255, 255, 0.6), 0 0 15px rgba(0, 255, 255, 0.4), 0 0 20px rgba(0, 255, 255, 0.2);
                  transition: all 0.3s ease;
              }
              .tweet .user:hover {
                  color: #FFFFFF;
                  text-shadow: 0 0 5px rgba(0, 255, 255, 1), 0 0 10px rgba(0, 255, 255, 0.8), 0 0 15px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2);
              }
              .hashtag { color: #FF1493; cursor: pointer; }
              #tweet-feed::-webkit-scrollbar { display: none; }
              #tweet-button, #return-button {
                  padding: 10px 20px;
                  background-color: rgba(0, 255, 255, 0.2);
                  border: 1px solid rgba(0, 255, 255, 0.5);
                  border-radius: 5px;
                  color: #00FFFF;
                  font-size: 16px;
                  font-weight: bold;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  outline: none;
                  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
                  position: relative;
                  overflow: hidden;
              }
              #tweet-button:hover, #return-button:hover {
                  background-color: rgba(0, 255, 255, 0.4);
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4);
                  text-shadow: 0 0 10px rgba(0, 255, 255, 1), 0 0 20px rgba(0, 255, 255, 0.8);
                  color: #FFFFFF;
              }
              #tweet-button::after, #return-button::after {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, rgba(0, 255, 255, 0) 70%);
                  opacity: 0;
                  transition: opacity 0.3s ease;
                  pointer-events: none;
              }
              #tweet-button:hover::after, #return-button:hover::after { opacity: 1; }
              .time {
                  font-size: 0.8em;
                  color: #B14AED;
                  text-shadow: 0 0 3px rgba(177, 74, 237, 0.5), 0 0 10px rgba(177, 74, 237, 0.3);
              }
              .container {
                  background-color: rgba(20, 20, 20, 0.6);
                  border-radius: 20px;
                  padding: 30px;
                  box-sizing: border-box;
                  overflow: hidden;
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2), 0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 60px rgba(0, 255, 255, 0.1);
                  border: 1px solid rgba(0, 255, 255, 0.3);
              }
              #tweet-controls {
                  background-color: rgba(20, 20, 20, 0.8);
                  border-radius: 15px;
                  padding: 20px;
                  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.1);
                  border: 1px solid rgba(0, 255, 255, 0.4);
              }
              #sidebar {
                  background-color: rgba(20, 20, 20, 0.6);
                  border-radius: 15px;
                  padding: 20px;
                  box-shadow: 0 0 20px rgba(255, 20, 147, 0.5), 0 0 40px rgba(255, 20, 147, 0.5), inset 0 0 30px rgba(255, 20, 147, 0.1);
                  border: 1px solid rgba(255, 20, 147, 0.3);
              }
                .prop('type', 'text/css')
                .html('\
                @keyframes neonGlow {
        0% {
            box-shadow: 0 0 5px #FF1493, 0 0 10px #FF1493, 0 0 15px #FF1493, 0 0 20px #FF1493;
        }
        50% {
            box-shadow: 0 0 10px #FF1493, 0 0 20px #FF1493, 0 0 30px #FF1493, 0 0 40px #FF1493;
        }
        100% {
            box-shadow: 0 0 5px #FF1493, 0 0 10px #FF1493, 0 0 15px #FF1493, 0 0 20px #FF1493;
        }
    }
          </style>
      `;
      //append the global styles to the head of the document
      $('head').append(globalStyles);
  }

  //create the main layout structure of the application, including content wrapper, main content, and sidebar
  function createLayout() {
    //create the main components of the layout
      const $contentWrapper = createContentWrapper();
      const $mainContentWrapper = createMainContentWrapper();
      const $sidebarWrapper = createSidebarWrapper();
      const $container = createContainer();

      //append the sidebar and the main container to the main content wrapper
      $mainContentWrapper.append($sidebarWrapper).append($container);
      //append main content wrapper to the content wrapper
      $contentWrapper.append($mainContentWrapper);
      //clear the body and append the new layout
      $('body').empty().append($contentWrapper);
  }

  //create and return the main content wrapper with specific styles
  function createContentWrapper() {
    //create a new div element with id 'content-wrapper'
      return $('<div id="content-wrapper"></div>').css({
        //set various CSS properties for the content wrapper
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          padding: '20px',
          overflow: 'hidden',
          backgroundColor: '#050505',
          //complex background with a cyberpunk feel
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
  }

  //create and return the wrapper for the main content area
  function createMainContentWrapper() {
    //create a new div element with id 'main-content-wrapper'
      return $('<div id="main-content-wrapper"></div>').css({
        //set various CSS properties for the main content wrapper
          display: 'flex',
          justifyContent: 'space-between',
          flex: '1 1 auto',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'transparent'
      });
  }

  function createSidebarWrapper() {
    //define margin values
    const leftMargin = '30px';
    const bottomMargin = '30px';
    //create the sidebar wrapper with specific styling
    const $sidebarWrapper = $('<div id="sidebar-wrapper"></div>').css({
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '20%',
        marginRight: '10px',
        marginLeft: leftMargin,
        marginBottom: bottomMargin,
    });

    //create container for the title (logo)
    const $titleContainer = $('<div id="title-container"></div>').css({
        marginBottom: '5px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.30px',  //reduce padding
        boxSizing: 'border-box'
    });

    //create img element for the SVG logo
    const $logo = $('<img>').attr({
        id: 'logo-svg',
        src: 'images/bytestream-logo.svg',
        alt: 'ByteStream Logo'
    }).css({
        width: '270px',  
        maxWidth: '1200px',  
        height: 'auto',
        display: 'block'
    });

    //append logo to the title container
    $titleContainer.append($logo);
    //append the title container to the sidebar wrapper
    $sidebarWrapper.append($titleContainer);

    //add transition effect to the logo
    $logo.css({
        transition: 'transform 0.3s ease-in-out'
    });
    
    //add pulsing animation to the logo
    $('<style>')
        .text(`
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            #logo-svg {
                animation: pulse 2s infinite;
            }
        `)
        .appendTo('head');

    //create and append the sidebar content (trending hashtags, etc.)
    const $sidebar = createSidebar(); 
    $sidebarWrapper.append($sidebar);

    return $sidebarWrapper;
}


  //generate the sidebar content, including the logo, celebrate button, trending reactions, and trending hashtags
  function createSidebar() {
      //create the main sidebar container with styling
      const $sidebar = $('<div id="sidebar"></div>').css({
          flex: '1',
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
          overflowY: 'auto',
          color: '#fff',
          boxSizing: 'border-box',
          border: '1px solid rgba(0, 255, 255, 0.05)'
      });

      //create the celebration button
    const $celebrateButton = $('<button id="celebrate-button">Byte-sized Fun!</button>').css({
        fontFamily: 'Orbitron, sans-serif',
        width: '100%',
        padding: '10px',
        marginBottom: '25px',
        backgroundColor: 'rgba(255, 20, 147, 0.1)', 
        color: '#ffffff',
        border: '1px solid rgba(255, 20, 147, 0.5)',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 0 10px rgba(255, 20, 147, 0.9)',
        textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
    });

    //add hover effect
    $celebrateButton.hover(
        function() {
            $(this).css({
                backgroundColor: 'rgba(255, 20, 147, 1)',
                boxShadow: '0 0 15px rgba(255, 20, 147, 0.8)'
            });
        },
        function() {
            $(this).css({
                backgroundColor: 'rgba(255, 20, 147, 0.1)',
                boxShadow: '0 0 10px rgba(255, 20, 147, 0.5)'
            });
        }
    );

    //add click event for confetti
    $celebrateButton.on('click', triggerConfetti);

    //add the button to the sidebar
    $sidebar.prepend($celebrateButton);

      //add trending reactions section
    const $trendingReactionsTitle = $('<h2>Trending Reactions</h2>').css({
        fontFamily: 'Orbitron, sans-serif',
        textAlign: 'left',
        fontSize: '1.5em',
        marginBottom: '20px',
        color: '#00FFFF',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.9)',
        borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
        paddingBottom: '10px'
    })

    const $trendingReactions = $('<div id="trending-reactions"></div>');
    $sidebar.append($trendingReactionsTitle).append($trendingReactions);

    //add trending hashtags section
    const $trendingHashtagsTitle = $('<h2>Trending Hashtags</h2>').css({
        fontFamily: 'Orbitron, sans-serif',
        textAlign: 'left',
        fontSize: '1.5em',
        marginTop: '30px',
        marginBottom: '20px',
        color: '#00FFFF',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.9)',
        borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
        paddingBottom: '10px'
    });
    const $trendingList = $('<ul id="trending-list"></ul>').css({
        listStyle: 'none',
        padding: 0,
        margin: 0
    });
    $sidebar.append($trendingHashtagsTitle).append($trendingList);

    //load initial trending hashtags
    loadTrendingHashtags($trendingList);
    return $sidebar;
  }

  //confetti function
function triggerConfetti() {
    confetti({
        particleCount: 300,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF1493', '#00FFFF', '#B14AED']
    });
}

  //add feature to side bar showing top reactions
  function getTopReactions() {
    //create an empty object to store the total count for each emoji reaction
    const reactionCounts = {};
    //use jQuery to select all elements with the class 'reaction-button' and iterate over them
    $('.reaction-button').each(function() {
        //for each reaction button extract the emoji text
        const emoji = $(this).find('.reaction-emoji').text();
        //extract the reaction count and parse it as an integer
        const count = parseInt($(this).find('.reaction-count').text());
        //add the count to the total for that emoji to the reactionCounts object
        reactionCounts[emoji] = (reactionCounts[emoji] || 0) + count;
        //(this) refers to the current DOM element in the iteration
        //when using jQuery's .each()method, it iterated over a set of elements (all elements with the class 'reaction-button')
        //inside the callback function passed to .each(), this is set to the current element being processed in the iteration
        //$(this) wraps the current DOM element in a jQuery object, allowing the use of jQuery methods on it
        //so, $(this).find('.reaction-emoji') is looking for an element with the class 'reaction-emoji' within the current reaction button
        //$(this).find('.reaction-count') is looking for an element with the class 'reaction-count' within the current reaction button
    });
    //convert the reactionCount object into an array of [emoji, count] pairs
    return Object.entries(reactionCounts)
        //sort this array in descending order based on the count
        .sort((a, b) => b[1] - a[1])
        //return the top 5 reactions using slice 
        .slice(0, 5);
}

//create function to update trending reactions in the sidebar
function updateTrendingReactions() {
    const $trendingReactions = $('#trending-reactions');
    const topReactions = getTopReactions();
    //clear the existing reactions
    $trendingReactions.empty();
    //add each top reaction to the sidebar
    topReactions.forEach(([emoji, count]) => {
        const $reactionItem = $(`
            <div class="trending-reaction-item">
                <span class="trending-reaction-emoji">${emoji}</span>
                <span class="trending-reaction-count">${count}</span>
            </div>
        `).css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '5px 0',
            borderBottom: '1px solid rgba(0, 255, 255, 0.2)'
        });

        $reactionItem.find('.trending-reaction-emoji').css({
            fontSize: '18px'
        });

        $reactionItem.find('.trending-reaction-count').css({
            color: '#00FFFF',
            fontSize: '14px'
        });

        $trendingReactions.append($reactionItem);
    });
}

  //create the main container for tweets and tweet controls
  function createContainer() {
      const $container = $('<div class="container"></div>').css({
          flexBasis: '70%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'transparent',
          borderRadius: '20px',
          padding: '30px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          boxShadow: 'none',
          border: 'none'
      });

      const $tweetFeedWrapper = createTweetFeedWrapper();
      const $tweetControls = createTweetControls();

      $container.append($tweetFeedWrapper).append($tweetControls);

      return $container;
  }

  //function to create the wrapper for the tweet feed
  function createTweetFeedWrapper() {
      const $tweetFeedWrapper = $('<div id="tweet-feed-wrapper"></div>').css({
          flex: '1 1 auto',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '15px',
          borderRadius: '15px',
          border: '1px solid rgba(0, 255, 255, 0.1)',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
      });

      const $tweetFeed = $('<div id="tweet-feed"></div>').css({
          flex: '1 1 auto',
          overflowY: 'scroll',
          padding: '20px',
          backgroundColor: 'rgba(20, 20, 20, 0.4)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          borderRadius: '15px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
      });

      $tweetFeedWrapper.append($tweetFeed);

      return $tweetFeedWrapper;
  }

  //function to create the tweet controls section
  function createTweetControls() {
      const $tweetControls = $('<div id="tweet-controls"></div>').css({
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '20px',
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          borderRadius: '15px',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
          border: '1px solid rgba(0, 255, 255, 0.1)'
      });

      const $usernameInput = createInput('username-input', 'Enter your username');
      const $tweetInput = createTextarea('tweet-input', "Take a Byte.");
      const $buttonContainer = createButtonContainer();

      $tweetControls.append($usernameInput).append($tweetInput).append($buttonContainer);

      return $tweetControls;
  }

  //function to create an input element with specified id and placeholder
  function createInput(id, placeholder) {
      return $(`<input id="${id}" placeholder="${placeholder}" />`).css({
          width: '100%',
          padding: '10px',
          backgroundColor: 'rgba(30, 30, 30, 0.6)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '5px',
          color: '#fff',
          fontSize: '14px',
          outline: 'none'
      });
  }

  //function to create a textarea element with specified id and placeholder
  function createTextarea(id, placeholder) {
      return $(`<textarea id="${id}" placeholder="${placeholder}"></textarea>`).css({
          width: '100%',
          padding: '10px',
          backgroundColor: 'rgba(30, 30, 30, 0.6)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '5px',
            color: '#ffffff',
            fontSize: '14px',
            resize: 'vertical',
            minHeight: '60px',
            outline: 'none',
            caretColor: '#00FFFF',
            textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
        });
    }

    //function to create the container for the tweet and emoji buttons
    function createButtonContainer() {
      const $buttonContainer = $('<div></div>').css({
          display: 'flex',
          justifyContent: 'space-between'
      });
  
      const $leftButtonGroup = $('<div></div>').css({
          display: 'flex',
          gap: '10px'  //this adds space between the Tweet and Emoji buttons
      });
  
      const $tweetButton = $('<button id="tweet-button">Tweet</button>').css({
        padding: '8px 16px',
        backgroundColor: 'rgba(0, 255, 255, 0.3)', 
        color: '#ffffff',
        border: '1px solid rgba(0, 255, 255, 0.5)',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
    }).hover(
        function() {
            $(this).css('backgroundColor', 'rgba(0, 255, 255, 0.5)'); //slightly less transparent on hover
        },
        function() {
            $(this).css('backgroundColor', 'rgba(0, 255, 255, 0.3)'); //back to original transparency
        }
        //(this) refers to the DOM element that triggered the hover event (the tweet button)
        //the hover method takes two functions: one for mouseenter and one for mouseleave
        //in both cases (this) is the button element
    );

  
      const $emojiButton = $('<button id="emoji-button">😀</button>').css({
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
      });
  
      const $returnButton = $('<button id="return-button">Return to All Tweets</button>').css({
      });
  
      $leftButtonGroup.append($tweetButton).append($emojiButton);
      $buttonContainer.append($leftButtonGroup).append($returnButton);
  
      return $buttonContainer;
  }

    //set up event listener for various interactive elements like the emoji picker, tweet button, and return button

    //function to initialize all event listeners
    function initializeEventListeners() {
        initializeEmojiPicker();
        initializeTweetButton();
        initializeReturnButton();
        initializeInputFocus();
    }

    //function to initialize the emoji picker
    function initializeEmojiPicker() {
        //create a new EmojiButton instance
        const picker = new EmojiButton({
            position: 'top-start',
            theme: 'dark',
            emojisPerRow: 8,
            rows: 4,
            emojiSize: '1.5em',
            style: {
                backgroundColor: '#1b1b1b',
                border: '1px solid #00FFFF',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
            }
        });

        //add click event listener to the emoji button
        $('#emoji-button').on('click', (event) => {
            event.preventDefault();
            picker.togglePicker(event.target);
        });

        //add emoji to tweet input when an emoji is selected
        picker.on('emoji', emoji => {
            $('#tweet-input').val($('#tweet-input').val() + emoji);
        });

        //add hover effects tot he emoji button
        $('#emoji-button').hover(
            function() {
                $(this).css({
                    backgroundColor: 'rgba(0, 255, 255, 0.4)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                    textShadow: '0 0 10px rgba(0, 255, 255, 1), 0 0 20px rgba(0, 255, 255, 0.8)'
                });
            },
            function() {
                $(this).css({
                    backgroundColor: 'rgba(0, 255, 255, 0.2)',
                    boxShadow: 'none',
                    textShadow: '0 0 5px rgba(0, 255, 255, 0.7)'
                });
            }
        );
    }

    //function to initialize the tweet button
    function initializeTweetButton() {
        $(document).on('click', '#tweet-button', function(e) {
            e.preventDefault();
            const $button = $(this);
            const originalText = $button.text();
            const username = $('#username-input').val().trim();
            const tweetMessage = $('#tweet-input').val().trim();

            if (username && tweetMessage) {
                //visual feedback when tweet is being posted
                $button.css({
                    backgroundColor: 'rgba(0, 255, 255, 0.6)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                    transform: 'scale(0.95)'
                });

                setTimeout(() => {
                    writeTweetAndDisplay(tweetMessage, username);
                    $('#tweet-input').val('');

                    //change button appearance to indicate successful posting
                    $button.text('Posted!')
                        .css({
                            backgroundColor: 'rgba(0, 255, 255, 0.4)',
                            color: '#FFFFFF',
                            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
                            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
                            transform: 'scale(1.05)'
                        });

                    //reset  button after a delay
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
                //visual feedback for invalid input
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
    }

    //function to initialize the return button
    function initializeReturnButton() {
        $(document).on('click', '#return-button', function() {
            const $button = $(this);
            const originalText = $button.text();

            //visual feedback when button is clicked
            $button.css({
                backgroundColor: 'rgba(255, 20, 147, 0.6)',
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

                //change button appearance to indicate successful return
                $button.text('Returned!')
                    .css({
                        backgroundColor: 'rgba(255, 20, 147, 0.4)',
                        color: '#FFFFFF',
                        textShadow: '0 0 10px #FF1493, 0 0 20px #FF1493',
                        boxShadow: '0 0 30px rgba(255, 20, 147, 0.8)',
                        transform: 'scale(1.05)'
                    });

                //reset and hide button after a delay
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
    }

    //function to initialize input focus effects
    function initializeInputFocus() {
        $('#username-input, #tweet-input').on('focus', function() {
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
    }

    // Helper functions //////////////////////////////////////////////////////////////////////////

    //generate CSS styles for tweets and timestamps
    function createTweetStyle() {
        return {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            borderRadius: '10px',
            padding: '10px',
            marginBottom: '10px',
            color: '#00FFFF',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            animation: 'neonGlow 2s infinite',
        };
    }

    function createTimeStampStyle() {
        return {
            fontSize: '0.8em',
            color: '#B14AED',
            textShadow: '0 0 3px rgba(177, 74, 237, 0.5), 0 0 5px rgba(177, 74, 237, 0.3)'
        };
    }

    //process tweet messages to highlight hashtags
    function processMessage(message) {
        return message.replace(/(#\w+)/g, '<span class="hashtag">$1</span>');
    }

    //populate the trending hashtags list in the sidebar
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
                        function() {
                            $(this).css({
                                textShadow: '0 0 10px rgba(255, 20, 147, 0.9), 0 0 15px rgba(255, 20, 147, 0.7)',
                                color: '#00FFFF'
                            });
                        },
                        function() {
                            $(this).css({
                                textShadow: '0 0 5px rgba(255, 20, 147, 0.7)',
                                color: '#FF1493'
                            });
                        }
                    )
                    .on('click', function() {
                        showHashtagTimeline(tag);
                    });
                $trendingList.append($li);
            }
        });
    }

    //update the trending hashtags based on the current tweets
    function updateTrendingHashtags() {
        const hashtagCounts = {};
        const $tweetFeed = $('#tweet-feed');

        //count hashtags in all tweets
        $tweetFeed.find('.tweet').each(function() {
            const tweetText = $(this).find('p').text();
            const hashtags = tweetText.match(/#\w+/g) || [];
            hashtags.forEach(tag => {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            });
        });

        //sort hashtags by count and get top 10
        const sortedHashtags = Object.entries(hashtagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => entry[0]);

        const $trendingList = $('#trending-list');
        $trendingList.empty();

        //add sorted hashtags to the trending list
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

    //write a new tweet and display it in the feed
    function writeTweetAndDisplay(message, username) {
        try {
            // Check if the tweet already exists in streams.home
            const existingTweet = streams.home.find(tweet => tweet.user === username && tweet.message === message);
            if (!existingTweet) {
                // If the tweet doesn't exist, write it using the provided function
                writeTweet(message, username);
            }
            // Create the tweet element
            const tweet = existingTweet || streams.home[streams.home.length - 1];
            const $newTweet = createTweetElement(tweet);
            
            // Prepend the new tweet to the feed
            $('#tweet-feed').prepend($newTweet);
    
            // Remove the oldest tweet if we've exceeded the maximum
            const $tweetFeed = $('#tweet-feed');
            if ($tweetFeed.children().length > maxDisplayedTweets) {
                $tweetFeed.children().last().remove();
            }
            updateTrendingHashtags();
        } catch (error) {
            console.error('Error in writeTweetAndDisplay:', error);
        }
    }

    //create a random reaction count for tweets
    function getRandomReactions() {
        const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
        const counts = {};
        reactions.forEach(reaction => {
            counts[reaction] = Math.floor(Math.random() * 50);
        });
        return counts;
    }

    //add reaction buttons to a tweet
    function addReactions($tweetDiv) {
        const initialReactions = getRandomReactions();
        const $reactionContainer = $('<div class="reaction-container"></div>').css({
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            marginTop: '8px'  
        });
    
        Object.keys(initialReactions).forEach(reaction => {
            const $reactionButton = $(`
                <button class="reaction-button">
                    <span class="reaction-emoji">${reaction}</span>
                    <span class="reaction-count">${initialReactions[reaction]}</span>
                </button>
            `).css({
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                color: '#00FFFF',
                cursor: 'pointer',
                fontSize: '12px',  
                padding: '3px 8px',  
                borderRadius: '15px',
                marginRight: '4px', 
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease'
            });
    
            $reactionButton.find('.reaction-emoji').css({
                marginRight: '3px'  
            });
    
            $reactionButton.find('.reaction-count').css({
                fontSize: '10px'
            });
    
            $reactionButton.hover(
                function() {
                    $(this).css({
                        background: 'rgba(0, 255, 255, 0.2)',
                        boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)'
                    });
                },
                function() {
                    $(this).css({
                        background: 'rgba(0, 255, 255, 0.1)',
                        boxShadow: 'none'
                    });
                }
            );
    
            $reactionButton.on('click', function() {
                const $countSpan = $(this).find('.reaction-count');
                const currentCount = parseInt($countSpan.text());
                $countSpan.text(currentCount + 1);
                
                // Add a quick animation effect
                $(this).css('transform', 'scale(1.1)');
                setTimeout(() => $(this).css('transform', 'scale(1)'), 200);
            });
    
            $reactionContainer.append($reactionButton);
        });
    
        $tweetDiv.append($reactionContainer);
        updateTrendingReactions();
    }

    //create a DOM element for a single tweet
    function createTweetElement(tweet) {
        const $tweetDiv = $('<div class="tweet"></div>').css(createTweetStyle());
        
        //add hoer effect to the tweet
        $tweetDiv.hover(
            function() {
                $(this).css({
                    boxShadow: '0 0 15px rgba(255, 20, 147, 0.3), 0 0 30px rgba(255, 20, 147, 0.1)',
                    borderColor: 'rgba(255, 20, 147, 0.3)'
                });
            },
            function() {
                $(this).css({
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)',
                    borderColor: 'rgba(0, 255, 255, 0.1)'
                });
            }
        );
    
        //create and style the username element
        const $user = $(`<span class="user">@${tweet.user}</span>`).css({
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#00FFFF',
            textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 0, 0, 0.9)'
        }).on('click', function(e) {
            e.stopPropagation();
            showUserTimeline(tweet.user);
        });
    
        //create and style the message element
        const $message = $('<p></p>').html(processMessage(tweet.message)).css({
            margin: '10px 0',
            color: '#FFFFFF',
            textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
        });
    
        //add click event to hashtags in the message
        $message.on('click', '.hashtag', function(e) {
            e.stopPropagation();
            const hashtag = $(this).text();
            showHashtagTimeline(hashtag);
        });
    
        //format and add timestamp
        const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
        const relativeTime = moment(tweet.created_at).fromNow();
        const $timeInfo = $('<span class="time"></span>')
            .text(`${relativeTime} | ${formattedTime}`)
            .css(createTimeStampStyle());
    
        //assemble the tweet elements
        $tweetDiv.append($user).append($message).append($timeInfo);
        //add reaction buttons to the tweet
        addReactions($tweetDiv);
    
        return $tweetDiv;
    }

    //populate the tweet feed with tweets
    function createTweets(additionalTweets = []) {
        $('#return-button').hide();
        const allTweets = streams.home.slice().reverse();
        const tweetsToDisplay = allTweets.slice(0, maxDisplayedTweets);
        $('#tweet-feed').empty();
        tweetsToDisplay.forEach((tweet) => {
            const $tweetDiv = createTweetElement(tweet);
            $('#tweet-feed').append($tweetDiv);
        });
        displayedTweetMessages.clear();
        tweetsToDisplay.forEach(tweet => {
            displayedTweetMessages.add(tweet.message);
        });
        updateTrendingHashtags();
        updateTrendingReactions();
    }

    //display tweets from a specific user
  function showUserTimeline(username) {
      clearTimeout(autoRefreshTimer);
      currentView = 'user';
      $('#return-button').show();
      $('#tweet-feed').empty();

      const maxUserTweets = 10;
      const userTweets = streams.users[username].slice().reverse().slice(0, maxUserTweets);

      if (userTweets.length === 0) {
          $('#tweet-feed').html('<p>No tweets available for this user.</p>');
          return;
      }

      userTweets.forEach((tweet) => {
          const $tweetDiv = $('<div class="tweet"></div>').css(createTweetStyle());
          const $user = $(`<span class="user">@${tweet.user}</span>`).css({
              fontWeight: 'bold',
              cursor: 'pointer',
              color: '#00FFFF',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 0, 0, 0.9)'
          }).on('click', function(e) {
              e.stopPropagation();
              showUserTimeline(tweet.user);
          });

          const $message = $('<p></p>').html(processMessage(tweet.message)).css({
              margin: '10px 0',
              color: '#FFFFFF',
              textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
          });

          $message.on('click', '.hashtag', function(e) {
              e.stopPropagation();
              const hashtag = $(this).text();
              showHashtagTimeline(hashtag);
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

  //show tweets containing a specific hashtag
  function showHashtagTimeline(hashtag) {
      clearTimeout(autoRefreshTimer);
      currentView = 'hashtag';
      $('#return-button').show();
      $('#tweet-feed').empty();

      const hashtagTweets = streams.home.filter(tweet => tweet.message.toLowerCase().includes(hashtag.toLowerCase()));

      if (hashtagTweets.length === 0) {
          $('#tweet-feed').html(`<p>No tweets available for the hashtag ${hashtag}.</p>`);
          return;
      }

      hashtagTweets.forEach((tweet) => {
          const $tweetDiv = $('<div class="tweet"></div>').css(createTweetStyle());
          const $user = $(`<span class="user">@${tweet.user}</span>`).css({
              fontWeight: 'bold',
              cursor: 'pointer',
              color: '#00FFFF',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 0, 0, 0.9)'
          }).on('click', function(e) {
              e.stopPropagation();
              showUserTimeline(tweet.user);
          });

          const $message = $('<p></p>').html(processMessage(tweet.message)).css({
              margin: '10px 0',
              color: '#FFFFFF',
              textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
          });

          $message.on('click', '.hashtag', function(e) {
              e.stopPropagation();
              const clickedHashtag = $(this).text();
              showHashtagTimeline(clickedHashtag);
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

  let lastDisplayedTweetIndex = 0;

  //automatically refresh tweet feed at regular intervals
function autoRefreshTweets() {
    console.log('autoRefreshTweets called');

    autoRefreshTimer = setTimeout(() => {
        console.log('Inside setTimeout, currentView:', currentView);
        if (currentView === 'main') {
            console.log('Current view is main, proceeding with refresh');
            
            // Get all new tweets since the last displayed tweet
            const newTweets = streams.home.slice(lastDisplayedTweetIndex);
            console.log('New tweets:', newTweets);

            updateTrendingHashtags();
            updateTrendingReactions();

            // Display only unique tweets
            const uniqueTweets = [];
            const seenMessages = new Set();

            for (const tweet of newTweets) {
                if (!seenMessages.has(tweet.message)) {
                    uniqueTweets.push(tweet);
                    seenMessages.add(tweet.message);
                }
            }

            console.log('Unique tweets to add:', uniqueTweets);

            uniqueTweets.forEach(tweet => {
                console.log('Adding tweet:', tweet);
                const $newTweet = createTweetElement(tweet);
                $('#tweet-feed').prepend($newTweet);
            });

            // Update the last displayed tweet index
            lastDisplayedTweetIndex = streams.home.length;

            // Remove excess tweets from the display
            const $tweetFeed = $('#tweet-feed');
            while ($tweetFeed.children().length > maxDisplayedTweets) {
                $tweetFeed.children().last().remove();
            }
        } else {
            console.log('Current view is not main, skipping refresh');
        }
        autoRefreshTweets();
    }, 5000);
}
});