document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const intervalInput = document.getElementById('interval');
  const stopPromptInput = document.getElementById('stopPrompt');
  const alertToggle = document.getElementById('alertToggle');
  const statusDiv = document.getElementById('status');
  const themeToggle = document.getElementById('themeToggle');
  const randomToggle = document.getElementById('randomToggle');


  // Load the saved theme setting from chrome.storage when the popup is opened
  chrome.storage.sync.get(['theme', 'interval', 'randomize'], (data) => {
    // Set theme based on saved value
    if (data.theme === 'light') {
      document.body.classList.remove('dark-mode');
      themeToggle.checked = false;
    } else {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    }

    // Set interval input based on saved value (fallback to 1 second if not set)
    intervalInput.value = data.interval ? data.interval : 1;


    // Set random toggle based on saved value (default is false)
    randomToggle.checked = data.randomize ? data.randomize : false;
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

  // Function to set button to "Start"
  function setButtonToStart() {
    toggleButton.textContent = 'Start Auto Refresh';
    toggleButton.classList.remove('stop');
    toggleButton.classList.add('start');
  }

  // Function to set button to "Stop"
  function setButtonToStop() {
    toggleButton.textContent = 'Stop Auto Refresh';
    toggleButton.classList.remove('start');
    toggleButton.classList.add('stop');
  }

  // Get current auto-refresh status on load
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    updateStatus(response.isRunning);
  });

  // Handle click to toggle start/stop
  toggleButton.addEventListener('click', () => {
    if (toggleButton.classList.contains('start')) {
      // Start auto-refresh
      const baseInterval = Math.max(1, parseInt(intervalInput.value, 10)) * 1000;
      const randomize = randomToggle.checked;
      let finalInterval = baseInterval;

      if (randomize) {
        const randomOffset = baseInterval * 0.1 * (Math.random() * 2 - 1);
        finalInterval = baseInterval + randomOffset;
      }

      const stopPrompt = stopPromptInput.value;
      const showAlert = alertToggle.checked;

      // Save interval value and randomize state to chrome.storage.sync
      chrome.storage.sync.set({
        interval: intervalInput.value,
        randomize: randomToggle.checked,
        isRunning: true
      });

      chrome.runtime.sendMessage({ action: 'start', interval: finalInterval, stopPrompt, showAlert }, (response) => {
        if (response.status === 'running') {
          setButtonToStop();
          updateStatus(true);
        }
      });
    } else {
      // Stop auto-refresh
      chrome.runtime.sendMessage({ action: 'stop' }, (response) => {
        if (response.status === 'stopped') {
          setButtonToStart();
          updateStatus(false);
          chrome.storage.sync.set({ isRunning: false });
        }
      });
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
});