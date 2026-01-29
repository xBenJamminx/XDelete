const deleteAllTweets = async () => {
  const processed = new Set();
  const selectors = {
    tweet: '[data-testid="tweet"]',
    caret: '[data-testid="caret"]',
    menuItem: '[role="menuitem"]',
    deleteConfirm: '[data-testid="confirmationSheetConfirm"]',
    unretweet: '[data-testid="unretweet"]',
    unretweetConfirm: '[data-testid="unretweetConfirm"]'
  };

  const delay = ms => {
    const jitter = ms * 0.25;
    const actual = ms + (Math.random() * jitter * 2 - jitter);
    return new Promise(resolve => setTimeout(resolve, actual));
  };

  const getTweets = () =>
    Array.from(document.querySelectorAll(selectors.tweet))
      .filter(t => !processed.has(t));

  const scrollToEnd = () =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  const attemptDelete = async tweet => {
    try {
      processed.add(tweet);

      // Check if it's a retweet first (unretweet button is directly on the tweet)
      const unretweet = tweet.querySelector(selectors.unretweet);
      if (unretweet) {
        unretweet.click();
        await delay(250);
        const confirm = document.querySelector(selectors.unretweetConfirm);
        if (confirm) {
          confirm.click();
          await delay(2000);
          return true;
        }
      }

      // Otherwise try to delete via caret menu
      const caret = tweet.querySelector(selectors.caret);
      if (caret) {
        caret.click();
        await delay(250);

        const menuItems = Array.from(document.querySelectorAll(selectors.menuItem));
        const deleteOption = menuItems.find(item => item.textContent.includes('Delete'));

        if (deleteOption) {
          deleteOption.click();
          await delay(250);
          const confirm = document.querySelector(selectors.deleteConfirm);
          if (confirm) {
            confirm.click();
            await delay(2000);
            return true;
          }
        }

        // Close menu if no delete option found
        document.body.click();
        await delay(100);
      }
    } catch (err) {
      console.error('Error attempting to delete/unretweet:', err);
    }
    return false;
  };

  while (true) {
    const tweets = getTweets();
    if (!tweets.length) {
      scrollToEnd();
      await delay(5000);
      if (!getTweets().length) break;
      continue;
    }

    for (const tweet of tweets) {
      await attemptDelete(tweet);
      await delay(500);
    }

    scrollToEnd();
    await delay(2000);
  }

  console.log('All tweets processed (deleted or unretweeted).');
};

deleteAllTweets().catch(err => console.error('Script failed:', err));
