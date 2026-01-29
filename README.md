# XDelete

Script to delete all X/Twitter tweets and undo retweets from your profile.

> Forked from [techleadhd/XDelete](https://github.com/techleadhd/XDelete) - thanks to the original author for the initial implementation!

## Features

- Deletes your original tweets
- Undoes retweets
- Auto-scrolls to load more tweets
- Handles rate limiting with randomized delays
- Processes entire timeline until complete

## How to Use

1. Open Chrome and go to your X profile: `https://x.com/USERNAME/with_replies`
2. Open Developer Tools (F12 or Ctrl+Shift+J)
3. Go to the Console tab
4. Copy/paste the script below and press Enter

```javascript
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
```

## Notes

- Keep the browser tab focused while running
- The script will automatically stop when it reaches the end of your timeline
- If you get rate limited, wait a few minutes and run again

<img width="813" alt="Screenshot 2023-12-31 at 7 18 45 PM" src="https://github.com/techleadhd/XDelete/assets/61847557/473165c5-9b7c-4065-98fd-5856fcbfb3a8">
