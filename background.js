let isRunning = false;
let intervalId = null;
let stopPrompt = '';
let showAlert = false;
let currentTabId = null;  // Store the tabId of the current tab

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    if (!isRunning) {
      const { interval, stopPrompt: promptText, showAlert: alertEnabled } = message; // Changed to 'interval'
      stopPrompt = promptText;
      showAlert = alertEnabled;

      // Get the current active tab and store its tabId
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          currentTabId = tabs[0].id; // Store the ID of the current tab

          intervalId = setInterval(() => {
            // Refresh the stored tab, even if it's not active
            chrome.scripting.executeScript({
              target: { tabId: currentTabId },
              func: refreshTab,
              args: [stopPrompt],
            });
          }, interval); // Use 'interval'

          isRunning = true;
          sendResponse({ status: 'running' });
        }
      });
    }
  } else if (message.action === 'stop') {
    clearInterval(intervalId);
    isRunning = false;

    if (showAlert) {
      // Show a desktop notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Auto-refresh Stopped',
        message: 'The auto-refresh has stopped for the tab.',
        priority: 2
      });

      // Play a sound alert
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        func: playSoundAlert,
      });
    }

    sendResponse({ status: 'stopped' });
  } else if (message.action === 'getStatus') {
    sendResponse({ isRunning });
  }

  return true; // Required for asynchronous response
});

// Function to be injected and executed in the current page
function refreshTab(prompt) {
  if (prompt && prompt.trim().length > 0) {
    // Check if the stop word is found on the page
    if (document.body.innerText.includes(prompt)) {
      // If found, stop the auto-refresh by sending a message to the background script
      chrome.runtime.sendMessage({ action: 'stop' });
    } else {
      // If not found, refresh the page
      window.location.reload();
    }
  } else {
    // If no stop word is provided, just refresh the page
    window.location.reload();
  }
}

// Function to play a sound when refreshing stops
function playSoundAlert() {
  const audio = new Audio('https://www.myinstants.com/media/sounds/bell.mp3'); // You can provide any URL or use your own sound file
  audio.play();
}
