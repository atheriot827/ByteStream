$(document).ready(() => {
  // Constants
  const newTweetsCount = 3;
  const maxDisplayedTweets = 10;

  // Global variables
  let currentView = 'main';
  let autoRefreshTimer;
  const displayedTweetMessages = new Set();

  // Initialize the page
  initializeStyles();
  createLayout();
  initializeEventListeners();
  currentView = 'main';
  createTweets();
  autoRefreshTweets();

  // Main functions
  function initializeStyles() {
      $('body').css({
          fontFamily: 'Roboto, sans-serif',
          backgroundColor: '#1b1b1b',
          color: '#fff'
      });

      $('h1, h2, h3').css({
          fontFamily: "'Orbitron', sans-serif"
      });

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
                  box-shadow: 0 0 20px rgba(255, 20, 147, 0.2), 0 0 40px rgba(255, 20, 147, 0.1), inset 0 0 30px rgba(255, 20, 147, 0.1);
                  border: 1px solid rgba(255, 20, 147, 0.3);
              }
                .prop('type', 'text/css')
                .html('\
                @keyframes neonGlow {\
                    0% {\
                        box-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF;\
                            }\
                                50% {\
                                    box-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF;\
                                }\
                        100% {\
                    box-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF;\
                }\
            }\
        ')  
          </style>
      `;
      $('head').append(globalStyles);
  }

  function createLayout() {
      const $contentWrapper = createContentWrapper();
      const $mainContentWrapper = createMainContentWrapper();
      const $sidebarWrapper = createSidebarWrapper();
      const $container = createContainer();

      $mainContentWrapper.append($sidebarWrapper).append($container);
      $contentWrapper.append($mainContentWrapper);
      $('body').empty().append($contentWrapper);
  }

  function createContentWrapper() {
      return $('<div id="content-wrapper"></div>').css({
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          padding: '20px',
          overflow: 'hidden',
          backgroundColor: '#050505',
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

  function createMainContentWrapper() {
      return $('<div id="main-content-wrapper"></div>').css({
          display: 'flex',
          justifyContent: 'space-between',
          flex: '1 1 auto',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'transparent'
      });
  }

  function createSidebarWrapper() {
    const leftMargin = '30px';
    const bottomMargin = '30px';
    const $sidebarWrapper = $('<div id="sidebar-wrapper"></div>').css({
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '20%',
        marginRight: '10px',
        marginLeft: leftMargin,
        marginBottom: bottomMargin,
    });

    const $titleContainer = $('<div id="title-container"></div>').css({
        marginBottom: '5px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.30px',  // Reduce padding
        boxSizing: 'border-box'
    });

    // Create img element for the SVG logo
    const $logo = $('<img>').attr({
        id: 'logo-svg',
        src: 'images/bytestream-logo.svg',
        alt: 'ByteStream Logo'
    }).css({
        width: '100%',  // Adjust this value as needed
        maxWidth: '900px',  // Adjust this value as needed
        height: 'auto',
        display: 'block'
    });

    $titleContainer.append($logo);
    $sidebarWrapper.append($titleContainer);

    $logo.css({
        transition: 'transform 0.3s ease-in-out'
    });
    
    // Add this to the head of your document
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

    // Create sidebar content (trending hashtags, etc.)
    const $sidebar = createSidebar(); // Assuming you have this function
    $sidebarWrapper.append($sidebar);

    return $sidebarWrapper;
}

  function createSidebar() {
      const $sidebar = $('<div id="sidebar"></div>').css({
          flex: '1',
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
          overflowY: 'auto',
          color: '#fff',
          boxSizing: 'border-box',
          border: '1px solid rgba(0, 255, 255, 0.01)'
      });

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

      const $trendingList = $('<ul id="trending-list"></ul>').css({
          listStyle: 'none',
          padding: 0,
          margin: 0
      });
      

      $sidebar.append($sidebarTitle).append($trendingList);
      loadTrendingHashtags($trendingList);

      return $sidebar;
  }

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

  function createTweetFeedWrapper() {
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
          backgroundColor: 'rgba(20, 20, 20, 0.4)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          borderRadius: '15px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
      });

      $tweetFeedWrapper.append($tweetFeed);

      return $tweetFeedWrapper;
  }

  function createTweetControls() {
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

      const $usernameInput = createInput('username-input', 'Enter your username');
      const $tweetInput = createTextarea('tweet-input', "Take a Byte.");
      const $buttonContainer = createButtonContainer();

      $tweetControls.append($usernameInput).append($tweetInput).append($buttonContainer);

      return $tweetControls;
  }

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

    function createButtonContainer() {
      const $buttonContainer = $('<div></div>').css({
          display: 'flex',
          justifyContent: 'space-between'
      });
  
      const $leftButtonGroup = $('<div></div>').css({
          display: 'flex',
          gap: '10px'  // This adds space between the Tweet and Emoji buttons
      });
  
      const $tweetButton = $('<button id="tweet-button">Tweet</button>').css({
        padding: '8px 16px',
        backgroundColor: 'rgba(0, 255, 255, 0.3)', // More transparent cyan
        color: '#ffffff',
        border: '1px solid rgba(0, 255, 255, 0.5)',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
    }).hover(
        function() {
            $(this).css('backgroundColor', 'rgba(0, 255, 255, 0.5)'); // Slightly less transparent on hover
        },
        function() {
            $(this).css('backgroundColor', 'rgba(0, 255, 255, 0.3)'); // Back to original transparency
        }
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
          // Add any specific styles for the return button here
      });
  
      $leftButtonGroup.append($tweetButton).append($emojiButton);
      $buttonContainer.append($leftButtonGroup).append($returnButton);
  
      return $buttonContainer;
  }

    function initializeEventListeners() {
        initializeEmojiPicker();
        initializeTweetButton();
        initializeReturnButton();
        initializeInputFocus();
    }

    function initializeEmojiPicker() {
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

        $('#emoji-button').on('click', (event) => {
            event.preventDefault();
            picker.togglePicker(event.target);
        });

        picker.on('emoji', emoji => {
            $('#tweet-input').val($('#tweet-input').val() + emoji);
        });

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

    function initializeTweetButton() {
        $(document).on('click', '#tweet-button', function(e) {
            e.preventDefault();
            const $button = $(this);
            const originalText = $button.text();
            const username = $('#username-input').val().trim();
            const tweetMessage = $('#tweet-input').val().trim();

            if (username && tweetMessage) {
                $button.css({
                    backgroundColor: 'rgba(0, 255, 255, 0.6)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                    transform: 'scale(0.95)'
                });

                setTimeout(() => {
                    writeTweetAndDisplay(tweetMessage, username);
                    $('#tweet-input').val('');

                    $button.text('Posted!')
                        .css({
                            backgroundColor: 'rgba(0, 255, 255, 0.4)',
                            color: '#FFFFFF',
                            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
                            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
                            transform: 'scale(1.05)'
                        });

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

    function initializeReturnButton() {
        $(document).on('click', '#return-button', function() {
            const $button = $(this);
            const originalText = $button.text();

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

                $button.text('Returned!')
                    .css({
                        backgroundColor: 'rgba(255, 20, 147, 0.4)',
                        color: '#FFFFFF',
                        textShadow: '0 0 10px #FF1493, 0 0 20px #FF1493',
                        boxShadow: '0 0 30px rgba(255, 20, 147, 0.8)',
                        transform: 'scale(1.05)'
                    });

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

    // Helper functions
    function createTweetStyle() {
        return {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '15px',
            color: 'FF1493',
            border: '1px solid rgba(255, 255, 255, 0.1)',
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

    function processMessage(message) {
        return message.replace(/(#\w+)/g, '<span class="hashtag">$1</span>');
    }

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

    function updateTrendingHashtags() {
        const hashtagCounts = {};
        const $tweetFeed = $('#tweet-feed');

        $tweetFeed.find('.tweet').each(function() {
            const tweetText = $(this).find('p').text();
            const hashtags = tweetText.match(/#\w+/g) || [];
            hashtags.forEach(tag => {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            });
        });

        const sortedHashtags = Object.entries(hashtagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => entry[0]);

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

    function writeTweetAndDisplay(message, username) {
        try {
            // Check if the tweet already exists in streams.home
            const existingTweet = streams.home.find(tweet => tweet.user === username && tweet.message === message);
            
            if (!existingTweet) {
                // If the tweet doesn't exist, write it using the provided function
                writeTweet(message, username);
            }
    
            // Create the tweet element
            const $newTweet = $('<div class="tweet"></div>').css(createTweetStyle());
            const $user = $(`<span class="user">@${username}</span>`).css({
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#00FFFF',
                textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 0, 0, 0.9)'
            }).on('click', function(e) {
                e.stopPropagation();
                showUserTimeline(username);
            });
    
            const processedMessage = processMessage(message);
            const $message = $('<p></p>').html(processedMessage).css({
                margin: '10px 0',
                color: '#FFFFFF',
                textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
            });
    
            $message.on('click', '.hashtag', function(e) {
                e.stopPropagation();
                const clickedHashtag = $(this).text();
                showHashtagTimeline(clickedHashtag);
            });
    
            const tweet = existingTweet || streams.home[streams.home.length - 1];
            const formattedTime = moment(tweet.created_at).format('MMMM Do YYYY, h:mm A');
            const relativeTime = moment(tweet.created_at).fromNow();
            const $timeInfo = $('<span class="time"></span>')
                .text(`${relativeTime} | ${formattedTime}`)
                .css(createTimeStampStyle());
    
            $newTweet.append($user).append($message).append($timeInfo);
            
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

    function createTweets(additionalTweets = []) {
        $('#return-button').hide();
        const allTweets = streams.home.slice().reverse();
        const tweetsToDisplay = allTweets.slice(0, maxDisplayedTweets);
        $('#tweet-feed').empty();

        tweetsToDisplay.forEach((tweet) => {
            const $tweetDiv = $('<div class="tweet"></div>').css(createTweetStyle());

            $tweetDiv.hover(
                function() {
                    $(this).css({
                        boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.1)',
                        borderColor: 'rgba(0, 255, 255, 0.3)'
                    });
                },
                function() {
                    $(this).css({
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)',
                        borderColor: 'rgba(0, 255, 255, 0.1)'
                    });
                }
            );

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

function autoRefreshTweets() {
    console.log('autoRefreshTweets called');

    autoRefreshTimer = setTimeout(() => {
        console.log('Inside setTimeout, currentView:', currentView);
        if (currentView === 'main') {
            console.log('Current view is main, proceeding with refresh');
            
            // Get all new tweets since the last displayed tweet
            const newTweets = streams.home.slice(lastDisplayedTweetIndex);
            console.log('New tweets:', newTweets);

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
                writeTweetAndDisplay(tweet.message, tweet.user);
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