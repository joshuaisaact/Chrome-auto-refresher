document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const intervalInput = document.getElementById('interval');
  const stopPromptInput = document.getElementById('stopPrompt');
  const alertToggle = document.getElementById('alertToggle');
  const statusDiv = document.getElementById('status');
  const themeToggle = document.getElementById('themeToggle');

  // Load the saved theme setting from chrome.storage when the popup is opened
  chrome.storage.sync.get('theme', (data) => {
    if (data.theme === 'light') {
      document.body.classList.remove('dark-mode');
      themeToggle.checked = false;
    } else {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    }
  });

  // Toggle theme and save the setting when the switch is clicked
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('dark-mode');
      chrome.storage.sync.set({ theme: 'dark' });
    } else {
      document.body.classList.remove('dark-mode');
      chrome.storage.sync.set({ theme: 'light' });
    }
  });

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
    const showAlert = alertToggle.checked;

    chrome.runtime.sendMessage({ action: 'start', interval, stopPrompt, showAlert }, (response) => {
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
