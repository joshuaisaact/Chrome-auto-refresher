chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refresh') {
    const stopPrompt = request.stopPrompt;
    if (stopPrompt && document.body.innerText.includes(stopPrompt)) {
      sendResponse({ stopped: true });
    } else {
      location.reload();
      sendResponse({ reloaded: true });
    }
  }
  return true;
});