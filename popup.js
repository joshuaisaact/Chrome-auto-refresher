document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const intervalInput = document.getElementById('interval');
  const stopPromptInput = document.getElementById('stopPrompt');
  const statusDiv = document.getElementById('status');

  // Update status text
  function updateStatus(isRunning) {
    statusDiv.textContent = isRunning ? 'Auto-refresh is running' : 'Auto-refresh is stopped';
  }

  // Get current auto-refresh status on load
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    updateStatus(response.isRunning);
  });

  // Start auto-refresh
  startButton.addEventListener('click', () => {
    const interval = Math.max(1, parseInt(intervalInput.value, 10)) * 1000; // Convert to milliseconds
    const stopPrompt = stopPromptInput.value;

    chrome.runtime.sendMessage({ action: 'start', interval, stopPrompt }, (response) => {
      if (response.status === 'running') {
        updateStatus(true);
      }
    });
  });

  // Stop auto-refresh
  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop' }, (response) => {
      if (response.status === 'stopped') {
        updateStatus(false);
      }
    });
  });
});
