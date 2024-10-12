let isRunning = false;
let intervalId = null;
let stopPrompt = '';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    if (!isRunning) {
      const { interval, stopPrompt: promptText } = message;
      stopPrompt = promptText;

      intervalId = setInterval(() => {
        // Query the current active tab and refresh it
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: refreshTab,
              args: [stopPrompt],
            });
          }
        });
      }, interval);

      isRunning = true;
      sendResponse({ status: 'running' });
    }
  } else if (message.action === 'stop') {
    clearInterval(intervalId);
    isRunning = false;
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
      // If found, stop the auto-refresh by sending message to background script
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
