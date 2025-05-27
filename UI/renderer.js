const { ipcRenderer, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { floodPartyWithAllClients, updateAllClientCosmetics } = require('../BotLogic/bot');


let currentPage = 'home';

const colorMap = {
  "DefaultColor1": "#444444",
  "DefaultColor2": "#a70000",
  "DefaultColor3": "#b22b00",
  "DefaultColor4": "#c85c00",
  "DefaultColor5": "#ca9100",
  "DefaultColor6": "#c8a500",
  "DefaultColor7": "#c9b800",
  "DefaultColor8": "#a6c800",
  "DefaultColor9": "#77ca00",
  "DefaultColor10": "#00c800",
  "DefaultColor11": "#00ce7a",
  "DefaultColor12": "#00ceaa",
  "DefaultColor13": "#00cccc",
  "DefaultColor14": "#00a6c8",
  "DefaultColor15": "#007ace",
  "DefaultColor16": "#0000cc",
  "DefaultColor17": "#7e00d5",
  "DefaultColor18": "#a500c8",
  "DefaultColor19": "#d100d1",
  "DefaultColor20": "#cc00a8",
  "DefaultColor21": "#c80076",
  "DefaultColor22": "#0d0d0d",
  "DefaultColor23": "#3c0000",
  "DefaultColor24": "#410000",
  "DefaultColor25": "#513700",
  "DefaultColor26": "#3e4e00",
  "DefaultColor27": "#284e00",
  "DefaultColor28": "#004e00",
  "DefaultColor29": "#004f40",
  "DefaultColor30": "#00294e",
  "DefaultColor31": "#00004e",
  "DefaultColor32": "#28004e",
  "DefaultColor33": "#3e004e",
  "DefaultColor34": "#4f0029",
  "DefaultColor35": "#d3d3d3",
  "DefaultColor36": "#ff7272",
  "DefaultColor37": "#ffba58",
  "DefaultColor38": "#fff080",
  "DefaultColor39": "#b7f256",
  "DefaultColor40": "#82ff82",
  "DefaultColor41": "#86ffff",
  "DefaultColor42": "#8f8fff",
  "DefaultColor43": "#c681ff",
  "DefaultColor44": "#ff81ff"
}


document.addEventListener('DOMContentLoaded', () => {
  setupWindowControls();
  checkSavedKey();
  
  setupIPCHandlers();
});

function setupIPCHandlers() {}

function setupWindowControls() {
  const minimizeBtn = document.getElementById('minimize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      ipcRenderer.send('minimize-window');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      ipcRenderer.send('close-window');
    });
  }
}

function setupInitialUI() {
  createBackgroundOrbs();
  
  showHomePage();
}

function createBackgroundOrbs() {
  const root = document.getElementById('root');
  
  const orbs = document.createElement('div');
  orbs.className = 'background-orbs';
  
  for (let i = 0; i < 4; i++) {
    const orb = document.createElement('div');
    orb.className = 'orb';
    orbs.appendChild(orb);
  }
  
  root.appendChild(orbs);
}

function showHomePage() {
  currentPage = 'home';
  const root = document.getElementById('root');
  
  clearMainContent();
  
  const container = document.createElement('div');
  container.className = 'container';
  
  const logo = document.createElement('h1');
  logo.className = 'logo';
  logo.textContent = 'NexBL';
  container.appendChild(logo);
  
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Free Bot Lobbies for Fortnite Chapter 6';
  container.appendChild(subtitle);
  
  const getStartedBtn = document.createElement('button');
  getStartedBtn.id = 'get-started-btn';
  getStartedBtn.className = 'btn';
  getStartedBtn.textContent = 'Get Started';
  getStartedBtn.onclick = function() {
    console.log('Get Started button clicked!');
    showKeyEntryPage();
  };
  container.appendChild(getStartedBtn);
  
  root.appendChild(container);
}

function showKeyEntryPage() {
  currentPage = 'key-entry';
  const root = document.getElementById('root');
  
  clearMainContent();
  
  const container = document.createElement('div');
  container.className = 'container';
  
  const keyEntryContainer = document.createElement('div');
  keyEntryContainer.className = 'key-entry-container';
  
  const heading = document.createElement('h1');
  heading.className = 'key-entry-heading';
  heading.textContent = 'Enter Your Key';
  keyEntryContainer.appendChild(heading);
  
  const message = document.createElement('p');
  message.className = 'key-entry-message';
  message.textContent = 'Please enter your activation key to continue.';
  keyEntryContainer.appendChild(message);
  
  const formContainer = document.createElement('div');
  formContainer.className = 'key-form-container';
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.id = 'key-input';
  keyInput.className = 'key-input';
  keyInput.placeholder = 'XXXX-XXXX-XXXX-XXXX';
  formContainer.appendChild(keyInput);
  
  const submitButton = document.createElement('button');
  submitButton.id = 'submit-key-btn';
  submitButton.className = 'btn';
  submitButton.textContent = 'Submit';

  submitButton.onclick = function() {
    console.log('Submit key button clicked!');
    const keyValue = document.getElementById('key-input').value.trim();
    console.log('Key entered:', keyValue);
    
    if (!keyValue || !/^[a-f0-9]{32}$/i.test(keyValue)) {
      return showInvalidKeyModal('Please enter a valid activation key.');
    }
    
    showValidatingKeyModal();
    
    validateKeyWithAPI(keyValue);
  };
  formContainer.appendChild(submitButton);
  
  const getKeyButton = document.createElement('button');
  getKeyButton.className = 'get-key-btn';
  getKeyButton.textContent = 'Get Key';
  getKeyButton.style.marginTop = '15px';
  getKeyButton.style.padding = '10px 20px';
  getKeyButton.style.backgroundColor = '#5a8eff';
  getKeyButton.style.color = 'white';
  getKeyButton.style.border = 'none';
  getKeyButton.style.borderRadius = '4px';
  getKeyButton.style.cursor = 'pointer';
  getKeyButton.style.fontWeight = 'bold';
  getKeyButton.style.width = '100%';
  getKeyButton.style.fontSize = '14px';
  getKeyButton.style.display = 'flex';
  getKeyButton.style.justifyContent = 'center';
  getKeyButton.style.alignItems = 'center';
  getKeyButton.innerHTML = '<i class="fas fa-external-link-alt" style="margin-right: 8px;"></i> Get Key';
  
  getKeyButton.addEventListener('click', () => {
    shell.openExternal('https://bstlar.com/21Y/nexblapp');
  });
  
  formContainer.appendChild(getKeyButton);
  
  keyEntryContainer.appendChild(formContainer);
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'key-buttons-container';
  
  container.appendChild(keyEntryContainer);
  root.appendChild(container);
}

function showComingSoonPage() {
  currentPage = 'coming-soon';
  const root = document.getElementById('root');
  
  clearMainContent();
  
  const container = document.createElement('div');
  container.className = 'container';
  
  const tbdContainer = document.createElement('div');
  tbdContainer.className = 'tbd-page';
  tbdContainer.style.display = 'block';
  
  const heading = document.createElement('h1');
  heading.textContent = 'Coming Soon';
  tbdContainer.appendChild(heading);
  
  const message = document.createElement('p');
  message.textContent = 'This feature is currently under development. Stay tuned for updates!';
  tbdContainer.appendChild(message);
  
  const backButton = document.createElement('button');
  backButton.id = 'back-key-btn';
  backButton.className = 'back-btn';
  backButton.textContent = 'Back to Key Entry';
  backButton.onclick = function() {
    console.log('Back to Key Entry button clicked!');
    showKeyEntryPage();
  };
  tbdContainer.appendChild(backButton);
  
  container.appendChild(tbdContainer);
  root.appendChild(container);
}

function clearMainContent() {
  const root = document.getElementById('root');
  const containers = root.querySelectorAll('.container');
  
  containers.forEach(container => {
    container.remove();
  });
}

function removeExistingModals() {
  const existingModals = document.querySelectorAll('.modal-overlay');
  existingModals.forEach(modal => modal.remove());
}

function showValidatingKeyModal() {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  const modalTitle = document.createElement('h2');
  modalTitle.className = 'modal-title';
  modalTitle.textContent = 'Validating Key';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const loader = document.createElement('div');
  loader.className = 'loader';
  modalContent.appendChild(loader);
  
  const message = document.createElement('p');
  message.textContent = 'Please wait while we validate your key...';
  message.style.color = '#8abfd6';
  message.style.marginTop = '15px';
  modalContent.appendChild(message);
  
  modalContainer.appendChild(modalTitle);
  modalContainer.appendChild(modalContent);
  modalOverlay.appendChild(modalContainer);
  
  document.body.appendChild(modalOverlay);
}

function showKeyValidatedModal() {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  const modalTitle = document.createElement('h2');
  modalTitle.className = 'modal-title';
  modalTitle.textContent = 'Key Validated';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const successIcon = document.createElement('div');
  successIcon.className = 'success-icon';
  successIcon.innerHTML = '<i class="fas fa-check"></i>';
  modalContent.appendChild(successIcon);
  
  const message = document.createElement('p');
  message.className = 'modal-success';
  message.textContent = 'Your key has been successfully validated!';
  modalContent.appendChild(message);
  
  const continueButton = document.createElement('button');
  continueButton.className = 'modal-button';
  continueButton.textContent = 'Continue to Dashboard';
  continueButton.onclick = function() {
    console.log('Continue to dashboard');
    removeExistingModals();
    showDashboard();
  };
  
  modalContainer.appendChild(modalTitle);
  modalContainer.appendChild(modalContent);
  modalContainer.appendChild(continueButton);
  modalOverlay.appendChild(modalContainer);
  
  document.body.appendChild(modalOverlay);
}

function validateKeyWithAPI(key) {
  const apiUrl = `https://bstlar.com/keys/validate/${key}`;
  
  const headers = new Headers({
    'bstk': '3rpalCXWjsB8lh367STFW1z8RDYwjoTiIuNC'
  });
  
  fetch(apiUrl, {
    method: 'GET',
    headers: headers
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('API response:', data);
    
    if (data.valid === true) {
      saveKeyToFile(key);
      showKeyValidatedModal();
    } else {
      showInvalidKeyModal('This key is invalid or has already been used.');
    }
  })
  .catch(error => {
    console.error('Error validating key:', error);
    showInvalidKeyModal('There was an error validating your key. Please try again later.');
  });
}

function showInvalidKeyModal(errorMessage = 'The key you entered is invalid or has expired.') {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  const modalTitle = document.createElement('h2');
  modalTitle.className = 'modal-title';
  modalTitle.textContent = 'Invalid Key';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const errorIcon = document.createElement('div');
  errorIcon.className = 'error-icon';
  errorIcon.innerHTML = '<i class="fas fa-times"></i>';
  modalContent.appendChild(errorIcon);
  
  const message = document.createElement('p');
  message.className = 'modal-error';
  message.textContent = errorMessage;
  modalContent.appendChild(message);
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-button';
  closeButton.textContent = 'Close';
  closeButton.onclick = function() {
    console.log('Close error modal');
    removeExistingModals();
  };
  
  modalContainer.appendChild(modalTitle);
  modalContainer.appendChild(modalContent);
  modalContainer.appendChild(closeButton);
  modalOverlay.appendChild(modalContainer);
  
  document.body.appendChild(modalOverlay);
}

function checkSavedKey() {
  try {
    const dataFilePath = path.join(__dirname, 'data.json');
    
    if (fs.existsSync(dataFilePath)) {
      const rawData = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(rawData);
      
      if (data.key && data.key.length === 32) {
        validateSavedKeyWithAPI(data.key);
      } else {
        setupInitialUI();
      }
    } else {
      setupInitialUI();
    }
  } catch (error) {
    console.error('Error checking saved key:', error);
    setupInitialUI();
  }
}

function validateSavedKeyWithAPI(key) {
  const apiUrl = `https://bstlar.com/keys/validate/${key}`;
  
  const headers = new Headers({
    'bstk': '3rpalCXWjsB8lh367STFW1z8RDYwjoTiIuNC'
  });
  
  fetch(apiUrl, {
    method: 'GET',
    headers: headers
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.valid === true) {
      createBackgroundOrbs();
      showDashboard();
    } else {
      resetSavedKey();
      setupInitialUI();
    }
  })
  .catch(error => {
    console.error('Error validating saved key:', error);
    setupInitialUI();
  });
}

function saveKeyToFile(key) {
  try {
    const dataFilePath = path.join(__dirname, 'data.json');
    const data = { key: key };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Key saved to data.json');
  } catch (error) {
    console.error('Error saving key to file:', error);
  }
}

function resetSavedKey() {
  try {
    const dataFilePath = path.join(__dirname, 'data.json');
    const data = { key: "" };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Saved key reset');
  } catch (error) {
    console.error('Error resetting saved key:', error);
  }
}

let dashboardState = {
  currentTab: 'dashboard',
  isRunning: false,
  developerEnabled: false,
  consoleLines: [],
  botProcess: null,
  matchCountInterval: null,
  stats: {
    players: 0,
    uptime: '0h 0m 0s',
    bots: 0,
    version: '1.0.0'
  }
};

function showDashboard() {
  currentPage = 'dashboard';
  const root = document.getElementById('root');
  
  clearMainContent();
  
  const dashboardContainer = document.createElement('div');
  dashboardContainer.className = 'dashboard-container';
  
  const navBar = createDashboardNav();
  dashboardContainer.appendChild(navBar);
  
  const contentContainer = document.createElement('div');
  contentContainer.className = 'dashboard-content';
  contentContainer.id = 'dashboard-content';
  dashboardContainer.appendChild(contentContainer);
  
  root.appendChild(dashboardContainer);
  
  showTabContent(dashboardState.currentTab);
  
  startMatchCountUpdater();
  
  addConsoleMessage('Welcome to NexBL Bot Lobbies Control Panel', 'system');
  addConsoleMessage('System initialized successfully', 'success');
}

function createDashboardNav() {
  const navBar = document.createElement('div');
  navBar.className = 'dashboard-nav';
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'settings', label: 'Settings' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'developer', label: 'Developer', isDeveloper: true }
  ];
  
  tabs.forEach(tab => {
    const navItem = document.createElement('div');
    navItem.className = `dashboard-nav-item ${
      tab.id === dashboardState.currentTab ? 'active' : ''
    } ${tab.isDeveloper ? 'developer' : ''} ${
      tab.isDeveloper && dashboardState.developerEnabled ? 'visible' : ''
    }`;
    navItem.textContent = tab.label;
    navItem.dataset.tab = tab.id;
    
    navItem.addEventListener('click', () => {
      document.querySelectorAll('.dashboard-nav-item').forEach(item => {
        item.classList.remove('active');
      });
      navItem.classList.add('active');
      
      dashboardState.currentTab = tab.id;
      showTabContent(tab.id);
    });
    
    navBar.appendChild(navItem);
  });
  
  return navBar;
}

function showTabContent(tabName) {
  const contentContainers = document.querySelectorAll('.tab-content');
  contentContainers.forEach(container => {
    container.style.display = 'none';
  });

  const activeTab = document.getElementById(tabName + '-tab');
  if (activeTab) {
    activeTab.style.display = 'block';
    
    if (tabName === 'dashboard' && !dashboardState.matchCountInterval) {
      startMatchCountUpdater();
    }
  }
  
  const contentContainer = document.getElementById('dashboard-content');
  contentContainer.innerHTML = '';
  
  switch (tabName) {
    case 'dashboard':
      contentContainer.appendChild(createDashboardTab());
      break;
    case 'developer':
      contentContainer.appendChild(createDeveloperTab());
      break;
    case 'settings':
      contentContainer.appendChild(createSettingsTab());
      setTimeout(() => {
        document.querySelectorAll('.draggable').forEach(el => {
          el.style.pointerEvents = 'auto';
          el.style.zIndex = '9999';
        });
      }, 100);
      break;
    case 'cosmetics':
      contentContainer.appendChild(createCosmeticsTab());
      setTimeout(() => {
        document.querySelectorAll('.draggable').forEach(el => {
          el.style.pointerEvents = 'auto';
          el.style.zIndex = '9999';
        });
      }, 100);
      break;
    case 'accounts':
      contentContainer.appendChild(createAccountsTab());
      setTimeout(() => {
        document.querySelectorAll('.draggable').forEach(el => {
          el.style.pointerEvents = 'auto';
          el.style.zIndex = '9999';
        });
      }, 100);
      break;
    default:
      contentContainer.appendChild(createDashboardTab());
      break;
  }
}

function createDashboardTab() {
  const container = document.createElement('div');
  
  const statsSection = document.createElement('div');
  statsSection.className = 'stats-grid';
  
  const statItems = [
    { title: 'Match Count', value: dashboardState.stats.players, subtitle: 'Live matches' },
    { title: 'Server Uptime', value: dashboardState.stats.uptime, subtitle: 'Since startup' },
    { title: 'Active Bots', value: dashboardState.stats.bots, subtitle: 'In lobbies' },
    { title: 'Version', value: dashboardState.stats.version, subtitle: 'Current build' }
  ];
  
  statItems.forEach(stat => {
    const statCard = document.createElement('div');
    statCard.className = 'stat-card';
    
    const statTitle = document.createElement('div');
    statTitle.className = 'stat-title';
    statTitle.textContent = stat.title;
    
    const statValue = document.createElement('div');
    statValue.className = 'stat-value';
    statValue.textContent = stat.value;
    
    const statSubtitle = document.createElement('div');
    statSubtitle.className = 'stat-subtitle';
    statSubtitle.textContent = stat.subtitle;
    
    statCard.appendChild(statTitle);
    statCard.appendChild(statValue);
    statCard.appendChild(statSubtitle);
    
    statsSection.appendChild(statCard);
  });
  
  container.appendChild(statsSection);
  
  const consoleCard = document.createElement('div');
  consoleCard.className = 'console-card';
  
  const consoleTitle = document.createElement('div');
  consoleTitle.className = 'card-title';
  consoleTitle.textContent = 'Console';
  consoleCard.appendChild(consoleTitle);
  
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  
  const startStopBtn = document.createElement('button');
  startStopBtn.className = `control-btn ${dashboardState.isRunning ? 'stop' : 'start'}`;
  startStopBtn.id = 'start-stop-btn';
  startStopBtn.innerHTML = dashboardState.isRunning ? 
    '<i class="fas fa-stop"></i> Stop' : 
    '<i class="fas fa-play"></i> Start';
  startStopBtn.onclick = toggleStartStop;
  controlsContainer.appendChild(startStopBtn);
  
  const restartBtn = document.createElement('button');
  restartBtn.className = 'control-btn restart';
  restartBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Restart';
  restartBtn.onclick = restartServer;
  controlsContainer.appendChild(restartBtn);
  
  const clearBtn = document.createElement('button');
  clearBtn.className = 'control-btn clear';
  clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Logs';
  clearBtn.onclick = clearConsole;
  controlsContainer.appendChild(clearBtn);
  
  consoleCard.appendChild(controlsContainer);
  
  const consoleContainer = document.createElement('div');
  consoleContainer.className = 'console-container';
  consoleContainer.id = 'console-container';
  
  dashboardState.consoleLines.forEach(line => {
    const consoleLine = document.createElement('div');
    consoleLine.className = `console-line ${line.type}`;
    consoleLine.textContent = `[${line.timestamp}] ${line.message}`;
    consoleContainer.appendChild(consoleLine);
  });
  
  consoleCard.appendChild(consoleContainer);
  
  const commandContainer = createCommandInput();
  consoleCard.appendChild(commandContainer);
  
  container.appendChild(consoleCard);
  
  return container;
}

function createCommandInput() {
  const container = document.createElement('div');
  container.className = 'command-input-container';
  container.style.position = 'relative';
  container.style.zIndex = '100';
  container.style.pointerEvents = 'auto';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'command-input';
  input.placeholder = 'Enter command...';
  input.id = 'command-input';
  input.style.pointerEvents = 'auto';
  input.onkeydown = function(e) {
    if (e.key === 'Enter') {
      executeCommand(this.value);
      this.value = '';
    }
  };
  container.appendChild(input);
  
  const button = document.createElement('button');
  button.className = 'command-btn';
  button.textContent = 'Send';
  button.style.pointerEvents = 'auto';
  button.onclick = function() {
    const input = document.getElementById('command-input');
    if (input) {
      executeCommand(input.value);
      input.value = '';
    }
  };
  container.appendChild(button);
  
  return container;
}

function createComingSoonTab(tabName) {
  const container = document.createElement('div');
  
  const comingSoonCard = document.createElement('div');
  comingSoonCard.className = 'dashboard-card';
  comingSoonCard.style.textAlign = 'center';
  comingSoonCard.style.padding = '50px';
  
  const icon = document.createElement('div');
  icon.innerHTML = '<i class="fas fa-tools" style="font-size: 3rem; color: #00c8ff; margin-bottom: 20px;"></i>';
  comingSoonCard.appendChild(icon);
  
  const title = document.createElement('h2');
  title.style.color = '#00c8ff';
  title.style.marginBottom = '15px';
  title.textContent = `${tabName} Coming Soon`;
  comingSoonCard.appendChild(title);
  
  const message = document.createElement('p');
  message.style.color = '#8abfd6';
  message.style.fontSize = '1.1rem';
  message.textContent = `The ${tabName} feature is currently under development. Stay tuned for updates!`;
  comingSoonCard.appendChild(message);
  
  container.appendChild(comingSoonCard);
  
  return container;
}

function createAccountsTab() {
  const container = document.createElement('div');
  container.style.padding = '20px';
  
  if (!document.querySelector('.background-orbs')) {
    createBackgroundOrbs();
  }
  
  const header = document.createElement('div');
  header.className = 'accounts-header';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';

  const titleSection = document.createElement('div');
  
  const title = document.createElement('h2');
  title.textContent = 'Fortnite Accounts';
  title.style.margin = '0 0 5px 0';
  title.style.color = '#00c2ff';
  title.style.fontSize = '24px';

  const description = document.createElement('p');
  description.textContent = 'Manage your bot accounts';
  description.style.margin = '0';
  description.style.opacity = '0.8';

  titleSection.appendChild(title);
  titleSection.appendChild(description);
  header.appendChild(titleSection);
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'accounts-buttons';
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '10px';
  
  const addButton = document.createElement('button');
  addButton.innerHTML = '<i class="fas fa-plus"></i> Add Account';
  addButton.style.padding = '8px 15px';
  addButton.style.backgroundColor = '#00c2ff';
  addButton.style.color = 'white';
  addButton.style.border = 'none';
  addButton.style.borderRadius = '4px';
  addButton.style.cursor = 'pointer';
  addButton.style.fontWeight = 'bold';
  addButton.addEventListener('click', () => {
    showAuthCodeModal();
  });
  buttonsContainer.appendChild(addButton);
  
  const refreshButton = document.createElement('button');
  refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
  refreshButton.style.padding = '8px';
  refreshButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  refreshButton.style.color = 'white';
  refreshButton.style.border = 'none';
  refreshButton.style.borderRadius = '4px';
  refreshButton.style.cursor = 'pointer';
  refreshButton.addEventListener('click', () => {
    refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
    refreshButton.disabled = true;
    
    loadAccounts(accountsList);
    
    setTimeout(() => {
      refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
      refreshButton.disabled = false;
    }, 1000);
  });
  buttonsContainer.appendChild(refreshButton);
  
  header.appendChild(buttonsContainer);
  container.appendChild(header);
  
  const accountsSection = document.createElement('div');
  accountsSection.className = 'accounts-section';
  accountsSection.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  accountsSection.style.borderRadius = '8px';
  accountsSection.style.padding = '15px';
  accountsSection.style.marginBottom = '20px';
  accountsSection.style.border = '1px solid rgba(0, 194, 255, 0.2)';
  container.appendChild(accountsSection);
  
  const accountsList = document.createElement('div');
  accountsList.className = 'accounts-list';
  accountsList.style.overflowY = 'auto';
  accountsList.style.maxHeight = 'calc(100vh - 300px)';
  accountsSection.appendChild(accountsList);
  
  loadAccounts(accountsList);
  
  return container;
}

function loadAccounts(accountsList) {
  try {
    accountsList.innerHTML = '<div style="text-align: center; padding: 10px;"><i class="fas fa-spinner fa-spin"></i> Loading accounts...</div>';
    
    const accountsPath = path.join(__dirname, '..', 'BotLogic', 'accounts.json');
    
    if (!fs.existsSync(accountsPath)) {
      accountsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;"><i class="fas fa-exclamation-circle"></i> accounts.json not found</div>';
      addConsoleMessage('accounts.json not found', 'error');
      return;
    }
    
    fs.readFile(accountsPath, 'utf8', (err, data) => {
      if (err) {
        accountsList.innerHTML = `<div style="text-align: center; padding: 20px; color: #ff6b6b;"><i class="fas fa-exclamation-circle"></i> Error reading accounts: ${err.message}</div>`;
        addConsoleMessage(`Error reading accounts: ${err.message}`, 'error');
        return;
      }
      
      try {
        const accounts = JSON.parse(data);
        
        accountsList.innerHTML = '';
        
        if (!accounts || accounts.length === 0) {
          accountsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #ffcc00;"><i class="fas fa-info-circle"></i> No accounts found. Add an account to get started.</div>';
          return;
        }
        
        accounts.forEach((account, index) => {
          const accountItem = document.createElement('div');
          accountItem.className = 'account-item';
          accountItem.style.display = 'flex';
          accountItem.style.justifyContent = 'space-between';
          accountItem.style.alignItems = 'center';
          accountItem.style.padding = '12px';
          accountItem.style.marginBottom = '8px';
          accountItem.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
          accountItem.style.borderRadius = '6px';
          accountItem.style.border = '1px solid rgba(0, 194, 255, 0.15)';
          
          const accountInfo = document.createElement('div');
          accountInfo.className = 'account-info';
          
          const accountId = document.createElement('div');
          accountId.className = 'account-id';
          accountId.textContent = `Username: ${account.username}`;
          accountId.style.fontWeight = 'bold';
          accountId.style.fontSize = '14px';
          accountId.style.marginBottom = '4px';
          accountInfo.appendChild(accountId);
          
          const deviceId = document.createElement('div');
          deviceId.className = 'device-id';
          deviceId.textContent = `Account ID: ${account.account_id}`;
          deviceId.style.fontSize = '12px';
          deviceId.style.opacity = '0.8';
          accountInfo.appendChild(deviceId);
          
          accountItem.appendChild(accountInfo);
          
          const actionButtons = document.createElement('div');
          actionButtons.className = 'account-actions';
          actionButtons.style.display = 'flex';
          actionButtons.style.gap = '8px';
          
          const copyBtn = document.createElement('button');
          copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
          copyBtn.title = 'Copy account details';
          copyBtn.style.padding = '6px';
          copyBtn.style.backgroundColor = 'rgba(0, 194, 255, 0.3)';
          copyBtn.style.color = 'white';
          copyBtn.style.border = 'none';
          copyBtn.style.borderRadius = '4px';
          copyBtn.style.cursor = 'pointer';
          
          copyBtn.addEventListener('click', () => {
            const accountDetails = `Account ID: ${account.account_id}\nDevice ID: ${account.device_id}\nSecret: ${account.secret}`;
            navigator.clipboard.writeText(accountDetails)
              .then(() => {
                addConsoleMessage('Account details copied to clipboard', 'success');
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.backgroundColor = '#00ff7f';
                
                setTimeout(() => {
                  copyBtn.innerHTML = originalHTML;
                  copyBtn.style.backgroundColor = 'rgba(0, 194, 255, 0.3)';
                }, 1500);
              })
              .catch(err => {
                addConsoleMessage(`Error copying to clipboard: ${err.message}`, 'error');
              });
          });
          
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
          deleteBtn.title = 'Delete account';
          deleteBtn.style.padding = '6px';
          deleteBtn.style.backgroundColor = 'rgba(255, 99, 71, 0.7)';
          deleteBtn.style.color = 'white';
          deleteBtn.style.border = 'none';
          deleteBtn.style.borderRadius = '4px';
          deleteBtn.style.cursor = 'pointer';
          
          deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete account ${account.username}?`)) {
              deleteAccount(account.account_id, accountsList);
            }
          });
          
          actionButtons.appendChild(copyBtn);
          actionButtons.appendChild(deleteBtn);
          accountItem.appendChild(actionButtons);
          
          accountsList.appendChild(accountItem);
        });
        
        const accountCount = document.createElement('div');
        accountCount.className = 'account-count';
        accountCount.textContent = `Total accounts: ${accounts.length}`;
        accountCount.style.textAlign = 'center';
        accountCount.style.padding = '10px';
        accountCount.style.fontSize = '14px';
        accountCount.style.opacity = '0.8';
        accountsList.appendChild(accountCount);
        
      } catch (parseErr) {
        accountsList.innerHTML = `<div style="text-align: center; padding: 20px; color: #ff6b6b;"><i class="fas fa-exclamation-circle"></i> Error parsing accounts: ${parseErr.message}</div>`;
        addConsoleMessage(`Error parsing accounts: ${parseErr.message}`, 'error');
      }
    });
    
  } catch (error) {
    accountsList.innerHTML = `<div style="text-align: center; padding: 20px; color: #ff6b6b;"><i class="fas fa-exclamation-circle"></i> Error loading accounts: ${error.message}</div>`;
    addConsoleMessage(`Error loading accounts: ${error.message}`, 'error');
  }
}

function deleteAccount(accountId, accountsList) {
  try {
    const accountsPath = path.join(__dirname, '..', 'BotLogic', 'accounts.json');
    
    fs.readFile(accountsPath, 'utf8', (err, data) => {
      if (err) {
        addConsoleMessage(`Error reading accounts: ${err.message}`, 'error');
        return;
      }
      
      try {
        const accounts = JSON.parse(data);
        
        const accountIndex = accounts.findIndex(account => account.account_id === accountId);
        
        if (accountIndex === -1) {
          addConsoleMessage(`Account ${accountId} not found`, 'error');
          return;
        }
        
        accounts.splice(accountIndex, 1);
        
        fs.writeFile(accountsPath, JSON.stringify(accounts, null, 4), 'utf8', writeErr => {
          if (writeErr) {
            addConsoleMessage(`Error writing accounts: ${writeErr.message}`, 'error');
            return;
          }
          
          addConsoleMessage(`Account ${accountId} deleted successfully`, 'success');
          
          loadAccounts(accountsList);
        });
        
      } catch (parseErr) {
        addConsoleMessage(`Error parsing accounts: ${parseErr.message}`, 'error');
      }
    });
    
  } catch (error) {
    addConsoleMessage(`Error deleting account: ${error.message}`, 'error');
  }
}

function showAuthCodeModal() {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'rgba(10, 20, 30, 0.95)';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '500px';
  modalContent.style.width = '90%';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.3)';
  modalContent.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.style.padding = '15px';
  modalHeader.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Add Fortnite Account';
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.color = '#00c2ff';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => modalOverlay.remove());
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'modal-body';
  contentArea.style.padding = '20px';
  
  const instructions = document.createElement('div');
  instructions.className = 'auth-instructions';
  instructions.style.marginBottom = '20px';
  
  const instructionsTitle = document.createElement('h3');
  instructionsTitle.textContent = 'How to get an authorization code:';
  instructionsTitle.style.fontSize = '16px';
  instructionsTitle.style.marginBottom = '10px';
  instructionsTitle.style.color = '#00c2ff';
  
  const authCodeImage = document.createElement('div');
  authCodeImage.style.textAlign = 'center';
  authCodeImage.style.marginBottom = '15px';
  
  const image = document.createElement('img');
  image.src = './assets/authcode.png';
  image.alt = 'Authorization Code Example';
  image.style.maxWidth = '100%';
  image.style.borderRadius = '6px';
  image.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  image.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  
  authCodeImage.appendChild(image);
  
  
  const instructionsList = document.createElement('ol');
  instructionsList.style.paddingLeft = '20px';
  instructionsList.style.marginBottom = '15px';
  
  const instructionSteps = [
    'Click the "Get Code" button below to go to Epic Games Login',
    'Log in with your Fortnite account',
    'After login, you will be redirected to a page with a code',
    'Copy the authorization code from the URL (as shown in the image above)',
    'Paste the code below to add your account'
  ];
  
  instructionSteps.forEach(step => {
    const listItem = document.createElement('li');
    listItem.innerHTML = step;
    listItem.style.marginBottom = '8px';
    instructionsList.appendChild(listItem);
  });
  
  instructions.appendChild(instructionsTitle);
  instructions.appendChild(authCodeImage);
  instructions.appendChild(instructionsList);
  
  const inputGroup = document.createElement('div');
  inputGroup.className = 'auth-input-group';
  inputGroup.style.marginBottom = '20px';
  
  const inputLabel = document.createElement('label');
  inputLabel.textContent = 'Authorization Code:';
  inputLabel.style.display = 'block';
  inputLabel.style.marginBottom = '8px';
  inputLabel.style.fontWeight = 'bold';
  
  const authInput = document.createElement('input');
  authInput.type = 'text';
  authInput.placeholder = 'Paste your authorization code here';
  authInput.style.width = '100%';
  authInput.style.padding = '10px';
  authInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  authInput.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  authInput.style.borderRadius = '4px';
  authInput.style.color = 'white';
  authInput.style.fontSize = '14px';
  
  inputGroup.appendChild(inputLabel);
  inputGroup.appendChild(authInput);
  
  const statusMessage = document.createElement('div');
  statusMessage.className = 'auth-status';
  statusMessage.style.marginBottom = '20px';
  statusMessage.style.padding = '10px';
  statusMessage.style.borderRadius = '4px';
  statusMessage.style.display = 'none';
  
  contentArea.appendChild(instructions);
  contentArea.appendChild(inputGroup);
  contentArea.appendChild(statusMessage);
  modalContent.appendChild(contentArea);
  
  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';
  modalFooter.style.padding = '15px';
  modalFooter.style.borderTop = '1px solid rgba(0, 194, 255, 0.2)';
  modalFooter.style.display = 'flex';
  modalFooter.style.justifyContent = 'space-between';
  modalFooter.style.alignItems = 'center';
  
  const authLink = document.createElement('button');
  authLink.style.display = 'inline-block';
  authLink.style.padding = '8px 15px';
  authLink.style.backgroundColor = '#5a8eff';
  authLink.style.color = 'white';
  authLink.style.border = 'none';
  authLink.style.textDecoration = 'none';
  authLink.style.borderRadius = '4px';
  authLink.style.fontWeight = 'bold';
  authLink.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  authLink.style.cursor = 'pointer';
  authLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Get Code';
  
  authLink.addEventListener('click', () => {
    shell.openExternal('https://www.epicgames.com/id/api/redirect?clientId=3f69e56c7649492c8cc29f1af08a8a12&responseType=code');
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '8px 15px';
  cancelButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.addEventListener('click', () => modalOverlay.remove());
  
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Account';
  addButton.style.padding = '8px 15px';
  addButton.style.backgroundColor = '#00c2ff';
  addButton.style.color = 'white';
  addButton.style.border = 'none';
  addButton.style.borderRadius = '4px';
  addButton.style.cursor = 'pointer';
  addButton.style.fontWeight = 'bold';
  
  addButton.addEventListener('click', () => {
    const authCode = authInput.value.trim();
    
    if (!authCode) {
      showStatus('Please enter an authorization code', 'error');
      return;
    }
    
    addButton.disabled = true;
    addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    processAuthCode(authCode, statusMessage, modalOverlay);
  });
  
  const leftSide = document.createElement('div');
  leftSide.appendChild(authLink);
  
  const rightSide = document.createElement('div');
  rightSide.style.display = 'flex';
  rightSide.style.gap = '10px';
  rightSide.appendChild(cancelButton);
  rightSide.appendChild(addButton);
  
  modalFooter.appendChild(leftSide);
  modalFooter.appendChild(rightSide);
  modalContent.appendChild(modalFooter);
  
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    
    if (type === 'error') {
      statusMessage.style.backgroundColor = 'rgba(255, 99, 71, 0.3)';
      statusMessage.style.color = '#ff6b6b';
    } else if (type === 'success') {
      statusMessage.style.backgroundColor = 'rgba(0, 255, 127, 0.3)';
      statusMessage.style.color = '#00ff7f';
    } else if (type === 'info') {
      statusMessage.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
      statusMessage.style.color = '#00c2ff';
    }
  }
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  setTimeout(() => authInput.focus(), 100);
}

function processAuthCode(authCode, statusElement, modalOverlay) {
  function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    
    if (type === 'error') {
      statusElement.style.backgroundColor = 'rgba(255, 99, 71, 0.3)';
      statusElement.style.color = '#ff6b6b';
    } else if (type === 'success') {
      statusElement.style.backgroundColor = 'rgba(0, 255, 127, 0.3)';
      statusElement.style.color = '#00ff7f';
    } else if (type === 'info') {
      statusElement.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
      statusElement.style.color = '#00c2ff';
    }
  }
  
  showStatus('Getting access token...', 'info');
  
  const tokenUrl = 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token';
  const clientId = '3f69e56c7649492c8cc29f1af08a8a12';
  const clientSecret = 'b51ee9cb12234f50a69efa67ef53812e';
  
  const tokenOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: `grant_type=authorization_code&code=${authCode}`
  };
  
  fetch(tokenUrl, tokenOptions)
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(`Failed to get access token: ${errorData.errorMessage || response.statusText}`);
        });
      }
      return response.json();
    })
    .then(tokenData => {
      const accessToken = tokenData.access_token;
      const displayName = tokenData.displayName;
      const accountId = tokenData.account_id;
      
      showStatus('Access token obtained. Creating device authorization...', 'info');
      
      return createDeviceAuth(accessToken, accountId, displayName);
    })
    .then(deviceAuthData => {
      showStatus('Device authorization created. Saving account...', 'info');
      
      return saveAccount(deviceAuthData);
    })
    .then(() => {
      showStatus('Account added successfully!', 'success');
      addConsoleMessage('Account added successfully', 'success');
      
      setTimeout(() => {
        modalOverlay.remove();
        
        const accountsList = document.querySelector('.accounts-list');
        if (accountsList) {
          loadAccounts(accountsList);
        }
      }, 2000);
    })
    .catch(error => {
      showStatus(`Error: ${error.message}`, 'error');
      addConsoleMessage(`Error adding account: ${error.message}`, 'error');
      
      const addButton = modalOverlay.querySelector('.modal-footer button:last-child');
      if (addButton) {
        addButton.disabled = false;
        addButton.textContent = 'Add Account';
      }
    });
}

function createDeviceAuth(accessToken, accountId, displayName) {
  return new Promise((resolve, reject) => {
    const deviceAuthUrl = 'https://account-public-service-prod.ol.epicgames.com/account/api/public/account/' + accountId + '/deviceAuth';
    
    const deviceId = generateRandomString(32);
    const deviceName = 'NexBL-' + generateRandomString(8);
    
    const deviceAuthOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        deviceId: deviceId,
        deviceName: deviceName
      })
    };
    
    fetch(deviceAuthUrl, deviceAuthOptions)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(`Failed to create device auth: ${errorData.errorMessage || response.statusText}`);
          });
        }
        // console.log(response.json());
        return response.json();
      })
      .then(deviceAuthData => {
        resolve({
          account_id: accountId,
          device_id: deviceAuthData.deviceId,
          secret: deviceAuthData.secret,
          username: displayName
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

function saveAccount(accountData) {
  return new Promise((resolve, reject) => {
    try {
      const accountsPath = path.join(__dirname, '..', 'BotLogic', 'accounts.json');
      
      if (!fs.existsSync(accountsPath)) {
        fs.writeFileSync(accountsPath, JSON.stringify([], null, 4), 'utf8');
      }
      
      fs.readFile(accountsPath, 'utf8', (err, data) => {
        if (err) {
          reject(new Error(`Error reading accounts file: ${err.message}`));
          return;
        }
        
        try {
          let accounts = JSON.parse(data);
          
          if (!Array.isArray(accounts)) {
            accounts = [];
          }
          
          const existingAccountIndex = accounts.findIndex(account => account.account_id === accountData.account_id);
          
          if (existingAccountIndex !== -1) {
            accounts[existingAccountIndex] = accountData;
          } else {
            accounts.push(accountData);
          }
          
          fs.writeFile(accountsPath, JSON.stringify(accounts, null, 4), 'utf8', writeErr => {
            if (writeErr) {
              reject(new Error(`Error writing accounts file: ${writeErr.message}`));
              return;
            }
            
            resolve();
          });
          
        } catch (parseErr) {
          reject(new Error(`Error parsing accounts file: ${parseErr.message}`));
        }
      });
      
    } catch (error) {
      reject(new Error(`Error saving account: ${error.message}`));
    }
  });
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function createSettingsTab() {
  const container = document.createElement('div');
  
  const titleCard = document.createElement('div');
  titleCard.className = 'dashboard-card';
  titleCard.style.marginBottom = '20px';
  
  const titleHeader = document.createElement('h2');
  titleHeader.style.color = '#00c8ff';
  titleHeader.style.marginBottom = '15px';
  titleHeader.textContent = 'Bot Configuration Settings';
  
  const titleDesc = document.createElement('p');
  titleDesc.style.color = '#8abfd6';
  titleDesc.textContent = 'Changes to these settings will be applied to the config.json file in the BotLogic folder.';
  
  titleCard.appendChild(titleHeader);
  titleCard.appendChild(titleDesc);
  container.appendChild(titleCard);
  
  let configData = loadConfigData();
  if (!configData) {
    const errorCard = document.createElement('div');
    errorCard.className = 'dashboard-card';
    errorCard.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
    errorCard.style.padding = '20px';
    
    const errorIcon = document.createElement('div');
    errorIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff4d4d; margin-bottom: 15px;"></i>';
    errorIcon.style.textAlign = 'center';
    errorCard.appendChild(errorIcon);
    
    const errorText = document.createElement('p');
    errorText.style.color = '#ff4d4d';
    errorText.style.textAlign = 'center';
    errorText.textContent = 'Error loading configuration file. Please check if the file exists and has valid JSON format.';
    errorCard.appendChild(errorText);
    
    container.appendChild(errorCard);
    return container;
  }
  
  const settingsGrid = document.createElement('div');
  settingsGrid.className = 'settings-grid';
  
  const basicSettingsCard = createSettingsCard('Basic Settings');
  
  addSettingsSwitch(
    basicSettingsCard, 
    'add_friends', 
    'Add Friends', 
    'Allow bots to accept friend requests', 
    configData.general.add_friends,
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.add_friends = value;
      saveConfigData(generalSettings);
    }
  );
  
  addSettingsSwitch(
    basicSettingsCard, 
    'join_friends', 
    'Join Friends', 
    'Allow bots to join friends\'s parties', 
    configData.general.join_friends,
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.join_friends = value;
      saveConfigData(generalSettings);
    }
  );
  
  addSettingsSwitch(
    basicSettingsCard, 
    'leave_on_match_start', 
    'Leave on Match Start', 
    'Bots will leave when a match starts', 
    configData.general.leave_on_match_start,
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.leave_on_match_start = value;
      saveConfigData(generalSettings);
    }
  );
  
  addSettingsSwitch(
    basicSettingsCard, 
    'should_track_matches', 
    'Track Matches', 
    'Track match statistics', 
    configData.general.should_track_matches,
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.should_track_matches = value;
      saveConfigData(generalSettings);
    }
  );
  
  addSettingsSwitch(
    basicSettingsCard, 
    'disable_playlist_restriction', 
    'Disable Playlist Restriction', 
    'Allow joining any playlist, even if restricted', 
    configData.general.disable_playlist_restriction,
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.disable_playlist_restriction = value;
      saveConfigData(generalSettings);
    }
  );
  
  addSettingsInput(
    basicSettingsCard,
    'start_accounts',
    'Starting Accounts',
    'Number of accounts to start',
    configData.general.start_accounts,
    'number',
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.start_accounts = value;
      saveConfigData(generalSettings);
    }
  );
  
  addSettingsInput(
    basicSettingsCard,
    'starting_status',
    'Starting Status',
    'Status message when starting',
    configData.general.starting_status,
    'text',
    (value) => { 
      const generalSettings = { general: {} };
      generalSettings.general.starting_status = value;
      saveConfigData(generalSettings);
    }
  );
  
  const whitelistSettingsCard = createSettingsCard('Whitelist Settings');
  
  addSettingsSwitch(
    whitelistSettingsCard, 
    'whitelist_enabled', 
    'Enable Whitelist', 
    'Only allow whitelisted users to join', 
    configData.general.whitelist.enabled,
    (value) => { 
      const generalSettings = { general: { whitelist: {} } };
      generalSettings.general.whitelist.enabled = value;
      saveConfigData(generalSettings);
      
      const whitelistSection = document.getElementById('whitelist_users-section');
      if (whitelistSection) {
        if (value) {
          whitelistSection.classList.remove('setting-disabled');
          enableWhitelistControls(true);
        } else {
          whitelistSection.classList.add('setting-disabled');
          enableWhitelistControls(false);
        }
      }
    }
  );
  
  const whitelistUsersSection = document.createElement('div');
  whitelistUsersSection.id = 'whitelist_users-section';
  whitelistUsersSection.className = configData.general.whitelist.enabled ? '' : 'setting-disabled';
  whitelistSettingsCard.appendChild(whitelistUsersSection);
  
  addSettingsSwitch(
    whitelistUsersSection,
    'only_allow_whitelisted_joins',
    'Only Allow Whitelisted Joins',
    'Only allow whitelisted users to join the party',
    configData.general.whitelist.only_allow_whitelisted_joins || false,
    (value) => {
      if (configData.general.whitelist.enabled) {
        configData.general.whitelist.only_allow_whitelisted_joins = value;
        saveConfigData(configData);
      } else {
        const switchEl = document.getElementById('only_allow_whitelisted_joins-switch');
        const switchInput = switchEl ? switchEl.querySelector('input[type="checkbox"]') : null;
        if (switchInput) {
          switchInput.checked = configData.general.whitelist.only_allow_whitelisted_joins || false;
        }
      }
    }
  );

  addSettingsList(
    whitelistUsersSection,
    'whitelist_users',
    'Whitelisted Users',
    'Should the whitelist be enabled?',
    configData.general.whitelist.users,
    (value) => { 
      if (configData.general.whitelist.enabled) {
        configData.general.whitelist.users = value; 
        saveConfigData(configData);
      }
    }
  );
  
  function enableWhitelistControls(enabled) {
    const listInput = document.querySelector('#whitelist_users-section .setting-list-add .settings-input');
    const addBtn = document.querySelector('#whitelist_users-section .setting-list-add .command-btn');
    const removeButtons = document.querySelectorAll('#whitelist_users-section .setting-list-remove');
    const onlyAllowSwitch = document.querySelector('#only_allow_whitelisted_joins-switch');
    
    if (listInput) {
      listInput.disabled = !enabled;
      listInput.style.pointerEvents = enabled ? 'auto' : 'none';
    }
    
    if (addBtn) {
      addBtn.disabled = !enabled;
      addBtn.style.pointerEvents = enabled ? 'auto' : 'none';
      addBtn.style.opacity = enabled ? '1' : '0.5';
    }
    
    if (onlyAllowSwitch) {
      const switchSlider = onlyAllowSwitch.querySelector('.slider');
      onlyAllowSwitch.style.pointerEvents = enabled ? 'auto' : 'none';
      if (switchSlider) switchSlider.style.opacity = enabled ? '1' : '0.5';
    }
    
    removeButtons.forEach(btn => {
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.5';
      btn.style.pointerEvents = enabled ? 'auto' : 'none';
    });
  }
  
  setTimeout(() => enableWhitelistControls(configData.general.whitelist.enabled), 100);
  
  const leaveTimeSettingsCard = createSettingsCard('Leave Time Settings');
  
  const leaveTypeOptions = [
    { value: 'hours', label: 'Hours' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'seconds', label: 'Seconds' }
  ];
  
  addSettingsDropdown(
    leaveTimeSettingsCard,
    'leave_type',
    'Leave Time Type',
    'Unit of time for auto-leaving',
    leaveTypeOptions,
    configData.general.leave_time.leave_type,
    (value) => { configData.general.leave_time.leave_type = value; saveConfigData(configData); }
  );
  
  addSettingsInput(
    leaveTimeSettingsCard,
    'leave_time',
    'Leave Time Value',
    `Time in ${configData.general.leave_time.leave_type} before leaving`,
    configData.general.leave_time.time,
    'number',
    (value) => { configData.general.leave_time.time = parseFloat(value); saveConfigData(configData); }
  );
  
  const statusSettingsCard = createSettingsCard('Status Settings');
  
  addSettingsInput(
    statusSettingsCard,
    'in_use_status',
    'In Use Status',
    'Status message when bot is in use',
    configData.general.in_use.status,
    'text',
    (value) => { configData.general.in_use.status = value; saveConfigData(configData); }
  );
  
  const statusTypeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'xa', label: 'Away' }
  ];
  
  addSettingsDropdown(
    statusSettingsCard,
    'in_use_type',
    'In Use Status Type',
    'Status type when bot is in use',
    statusTypeOptions,
    configData.general.in_use.type,
    (value) => { configData.general.in_use.type = value; saveConfigData(configData); }
  );
  
  addSettingsInput(
    statusSettingsCard,
    'usable_status',
    'Available Status',
    'Status message when bot is available',
    configData.general.usable.status,
    'text',
    (value) => { configData.general.usable.status = value; saveConfigData(configData); }
  );
  
  addSettingsDropdown(
    statusSettingsCard,
    'usable_type',
    'Available Status Type',
    'Status type when bot is available',
    statusTypeOptions,
    configData.general.usable.type,
    (value) => { configData.general.usable.type = value; saveConfigData(configData); }
  );
  
  settingsGrid.appendChild(basicSettingsCard);
  settingsGrid.appendChild(whitelistSettingsCard);
  settingsGrid.appendChild(leaveTimeSettingsCard);
  settingsGrid.appendChild(statusSettingsCard);
  
  container.appendChild(settingsGrid);
  
  
  return container;
}

function createSettingsCard(title) {
  const card = document.createElement('div');
  card.className = 'dashboard-card settings-card';
  
  const cardTitle = document.createElement('div');
  cardTitle.className = 'card-title';
  cardTitle.textContent = title;
  card.appendChild(cardTitle);
  
  return card;
}

function addSettingsSwitch(card, id, label, description, value, onChange) {
  const settingRow = document.createElement('div');
  settingRow.className = 'setting-row';
  
  const labelContainer = document.createElement('div');
  labelContainer.className = 'setting-label';
  
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelContainer.appendChild(labelEl);
  
  const descEl = document.createElement('div');
  descEl.className = 'setting-description';
  descEl.textContent = description;
  labelContainer.appendChild(descEl);
  
  const controlContainer = document.createElement('div');
  controlContainer.className = 'setting-control';
  
  const switchContainer = document.createElement('label');
  switchContainer.className = 'switch';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.checked = value;
  checkbox.onchange = function() {
    onChange(this.checked);
  };
  
  const slider = document.createElement('span');
  slider.className = 'slider';
  
  switchContainer.appendChild(checkbox);
  switchContainer.appendChild(slider);
  controlContainer.appendChild(switchContainer);
  
  settingRow.appendChild(labelContainer);
  settingRow.appendChild(controlContainer);
  
  card.appendChild(settingRow);
}

function addSettingsInput(card, id, label, description, value, type, onChange) {
  const settingRow = document.createElement('div');
  settingRow.className = 'setting-row';
  
  const labelContainer = document.createElement('div');
  labelContainer.className = 'setting-label';
  
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelContainer.appendChild(labelEl);
  
  const descEl = document.createElement('div');
  descEl.className = 'setting-description';
  descEl.textContent = description;
  labelContainer.appendChild(descEl);
  
  const controlContainer = document.createElement('div');
  controlContainer.className = 'setting-control';
  
  const input = document.createElement('input');
  input.type = type === 'number' ? 'number' : 'text';
  input.id = id;
  input.className = 'settings-input';
  input.value = value;
  
  if (type === 'number') {
    input.min = '0';
    input.step = '1';
    if (id === 'leave_time') { // Special case for leave time which can have decimals
      input.step = '0.1';
    }
  }
  
  input.onchange = function() {
    onChange(this.value);
  };
  
  controlContainer.appendChild(input);
  
  settingRow.appendChild(labelContainer);
  settingRow.appendChild(controlContainer);
  
  card.appendChild(settingRow);
}

function addSettingsDropdown(card, id, label, description, options, value, onChange) {
  const settingRow = document.createElement('div');
  settingRow.className = 'setting-row';
  
  const labelContainer = document.createElement('div');
  labelContainer.className = 'setting-label';
  
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelContainer.appendChild(labelEl);
  
  const descEl = document.createElement('div');
  descEl.className = 'setting-description';
  descEl.textContent = description;
  labelContainer.appendChild(descEl);
  
  const controlContainer = document.createElement('div');
  controlContainer.className = 'setting-control';
  
  const select = document.createElement('select');
  select.id = id;
  select.className = 'settings-dropdown';
  
  options.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    if (option.value === value) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  });
  
  select.onchange = function() {
    onChange(this.value);
  };
  
  controlContainer.appendChild(select);
  
  settingRow.appendChild(labelContainer);
  settingRow.appendChild(controlContainer);
  
  card.appendChild(settingRow);
}

function addSettingsList(card, id, label, description, items, onChange) {
  const settingRow = document.createElement('div');
  settingRow.className = 'setting-row setting-row-list';
  
  const labelContainer = document.createElement('div');
  labelContainer.className = 'setting-label';
  
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelContainer.appendChild(labelEl);
  
  const descEl = document.createElement('div');
  descEl.className = 'setting-description';
  descEl.textContent = description;
  labelContainer.appendChild(descEl);
  
  settingRow.appendChild(labelContainer);
  
  const listContainer = document.createElement('div');
  listContainer.className = 'setting-list-container';
  
  const listEl = document.createElement('div');
  listEl.className = 'setting-list';
  listEl.id = `${id}-list`;
  
  function renderItems() {
    listEl.innerHTML = '';
    items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'setting-list-item';
      
      const itemText = document.createElement('span');
      itemText.textContent = item;
      itemEl.appendChild(itemText);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'setting-list-remove';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.onclick = function() {
        items.splice(index, 1);
        renderItems();
        onChange(items);
      };
      
      itemEl.appendChild(removeBtn);
      listEl.appendChild(itemEl);
    });
  }
  
  const addContainer = document.createElement('div');
  addContainer.className = 'setting-list-add';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'settings-input';
  input.placeholder = `Add new ${label.toLowerCase()}`;
  
  const addBtn = document.createElement('button');
  addBtn.className = 'command-btn';
  addBtn.textContent = 'Add';
  addBtn.onclick = function() {
    if (input.value.trim()) {
      items.push(input.value.trim());
      input.value = '';
      renderItems();
      onChange(items);
    }
  };
  
  addContainer.appendChild(input);
  addContainer.appendChild(addBtn);
  
  listContainer.appendChild(listEl);
  listContainer.appendChild(addContainer);
  
  settingRow.appendChild(listContainer);
  card.appendChild(settingRow);
  
  renderItems();
}

function loadConfigData() {
  try {
    const configFilePath = path.join(__dirname, '..', 'BotLogic', 'config.json');
    
    if (fs.existsSync(configFilePath)) {
      const rawData = fs.readFileSync(configFilePath, 'utf8');
      return JSON.parse(rawData);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading config.json:', error);
    return null;
  }
}

function createDeveloperTab() {
  const container = document.createElement('div');
  container.style.pointerEvents = 'auto';
  container.style.position = 'relative';
  container.style.zIndex = '1';
  
  const forceStopCard = document.createElement('div');
  forceStopCard.className = 'dev-card';
  
  const forceStopTitle = document.createElement('div');
  forceStopTitle.className = 'dev-card-title';
  forceStopTitle.textContent = 'Emergency Controls';
  forceStopCard.appendChild(forceStopTitle);
  
  const forceStopBtn = document.createElement('button');
  forceStopBtn.className = 'force-stop-btn';
  forceStopBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Force Stop All Processes';
  forceStopBtn.onclick = function() {
    forceStop();
  };
  forceStopCard.appendChild(forceStopBtn);
  
  container.appendChild(forceStopCard);
  
  const devToolsGrid = document.createElement('div');
  devToolsGrid.className = 'dev-tools-grid';
  
  const evalCard = document.createElement('div');
  evalCard.className = 'dev-card';
  
  const evalTitle = document.createElement('div');
  evalTitle.className = 'dev-card-title';
  evalTitle.textContent = 'JavaScript Eval';
  evalCard.appendChild(evalTitle);
  
  const evalWarning = document.createElement('p');
  evalWarning.style.color = '#ffcc00';
  evalWarning.style.fontSize = '0.8rem';
  evalWarning.style.marginBottom = '10px';
  evalWarning.textContent = 'Warning: Execute code at your own risk.';
  evalCard.appendChild(evalWarning);
  
  const evalArea = document.createElement('textarea');
  evalArea.className = 'eval-area';
  evalArea.id = 'eval-area';
  evalArea.placeholder = '// Enter JavaScript code here\nreturn dashboardState;';
  evalCard.appendChild(evalArea);
  
  const evalOutput = document.createElement('div');
  evalOutput.className = 'eval-output';
  evalOutput.id = 'eval-output';
  evalOutput.textContent = '// Output will appear here';
  evalCard.appendChild(evalOutput);
  
  const evalBtnContainer = document.createElement('div');
  evalBtnContainer.style.display = 'flex';
  evalBtnContainer.style.justifyContent = 'flex-end';
  
  const evalBtn = document.createElement('button');
  evalBtn.className = 'command-btn';
  evalBtn.textContent = 'Execute';
  evalBtn.onclick = function() {
    executeEval();
  };
  evalBtnContainer.appendChild(evalBtn);
  
  evalCard.appendChild(evalBtnContainer);
  devToolsGrid.appendChild(evalCard);
  
  const fileBrowserCard = document.createElement('div');
  fileBrowserCard.className = 'dev-card';
  
  const fileBrowserTitle = document.createElement('div');
  fileBrowserTitle.className = 'dev-card-title';
  fileBrowserTitle.textContent = 'File Browser';
  fileBrowserCard.appendChild(fileBrowserTitle);
  
  const fileBrowser = document.createElement('div');
  fileBrowser.className = 'file-browser';
  
  const fileList = document.createElement('div');
  fileList.className = 'file-list';
  fileList.id = 'file-list';
  
  setTimeout(() => {
    loadFilesFromDirectory('');
  }, 100);
  
  fileBrowser.appendChild(fileList);
  
  const fileContent = document.createElement('textarea');
  fileContent.className = 'file-content';
  fileContent.id = 'file-content';
  fileContent.placeholder = '// Select a file to view or edit its content';
  fileContent.disabled = true;
  
  fileBrowser.appendChild(fileContent);
  
  const fileBtnContainer = document.createElement('div');
  fileBtnContainer.style.display = 'flex';
  fileBtnContainer.style.justifyContent = 'space-between';
  
  const filePathIndicator = document.createElement('div');
  filePathIndicator.style.color = '#8abfd6';
  filePathIndicator.style.alignSelf = 'center';
  filePathIndicator.id = 'file-path';
  filePathIndicator.textContent = 'No file selected';
  fileBtnContainer.appendChild(filePathIndicator);
  
  const saveFileBtn = document.createElement('button');
  saveFileBtn.className = 'command-btn';
  saveFileBtn.textContent = 'Save';
  saveFileBtn.disabled = true;
  saveFileBtn.id = 'save-file-btn';
  saveFileBtn.onclick = function() {
    saveFile();
  };
  fileBtnContainer.appendChild(saveFileBtn);
  
  fileBrowser.appendChild(fileBtnContainer);
  
  fileBrowserCard.appendChild(fileBrowser);
  devToolsGrid.appendChild(fileBrowserCard);
  
  container.appendChild(devToolsGrid);
  
  return container;
}

function forceStop() {
  if (!confirm('WARNING: This will force stop all processes. Are you sure?')) {
    return;
  }
  
  addConsoleMessage('EMERGENCY SHUTDOWN INITIATED', 'error');
  addConsoleMessage('Killing all active processes...', 'system');
  
  if (dashboardState.botProcess) {
    try {
      if (process.platform === 'win32') {
        try {
          dashboardState.botProcess.kill('SIGKILL');
        } catch (err) {
          console.error('Error killing process:', err);
          const { exec } = require('child_process');
          exec(`taskkill /pid ${dashboardState.botProcess.pid} /T /F`);
        }
      } else {
        dashboardState.botProcess.kill('SIGKILL');
      }
    } catch (error) {
      addConsoleMessage(`Error in force stop: ${error.message}`, 'error');
    }
    
    dashboardState.botProcess = null;
  }
  
  dashboardState.isRunning = false;
  dashboardState.stats.players = 0;
  dashboardState.stats.bots = 0;
  dashboardState.stats.uptime = '0h 0m 0s';
  updateStats();
  
  stopUptimeCounter();
  
  const startStopBtn = document.getElementById('start-stop-btn');
  if (startStopBtn) {
    startStopBtn.className = 'control-btn start';
    startStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
  }
  
  setTimeout(() => {
    addConsoleMessage('Emergency shutdown complete', 'success');
    addConsoleMessage('All processes terminated', 'system');
  }, 1500);
}

function executeEval() {
  const evalArea = document.getElementById('eval-area');
  const evalOutput = document.getElementById('eval-output');
  
  if (!evalArea || !evalOutput) return;
  
  const code = evalArea.value.trim();
  if (!code) {
    evalOutput.className = 'eval-output eval-error';
    evalOutput.textContent = 'Error: No code to execute';
    return;
  }
  
  try {
    const func = new Function(code);
    const result = func();
    
    evalOutput.className = 'eval-output eval-success';
    evalOutput.textContent = typeof result === 'object' ? 
      JSON.stringify(result, null, 2) : 
      String(result);
  } catch (error) {
    evalOutput.className = 'eval-output eval-error';
    evalOutput.textContent = `Error: ${error.message}`;
  }
}

let currentPath = '';
let fileContentCache = {};

function loadFilesFromDirectory(directoryPath) {
  try {
    const basePath = path.join(__dirname, '..');
    const fullPath = directoryPath ? path.join(basePath, directoryPath) : basePath;
    currentPath = directoryPath || '';
    
    const files = fs.readdirSync(fullPath);
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    if (directoryPath && directoryPath !== '') {
      const parentItem = document.createElement('div');
      parentItem.className = 'file-item directory';
      parentItem.textContent = '📁 ..';
      parentItem.onclick = function() {
        const parentPath = path.dirname(directoryPath);
        loadFilesFromDirectory(parentPath === '.' ? '' : parentPath);
      };
      fileList.appendChild(parentItem);
    }
    
    files.forEach(file => {
      try {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        const isDir = stats.isDirectory();
        
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${isDir ? 'directory' : ''}`;
        fileItem.textContent = isDir ? `📁 ${file}` : `📄 ${file}`;
        
        fileItem.onclick = function() {
          const relativePath = directoryPath ? path.join(directoryPath, file) : file;
          selectFile(this, file, isDir, relativePath);
        };
        
        fileList.appendChild(fileItem);
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    });
    
    const filePathElem = document.getElementById('file-path');
    if (filePathElem) {
      filePathElem.textContent = currentPath || 'BotLogic (Root)';
    }
  } catch (error) {
    console.error('Error loading files:', error);
    addConsoleMessage(`Error loading files: ${error.message}`, 'error');
  }
}

function selectFile(element, fileName, isDir, relativePath) {
  document.querySelectorAll('.file-item.selected').forEach(item => {
    item.classList.remove('selected');
  });
  
  element.classList.add('selected');
  
  const fileContent = document.getElementById('file-content');
  const filePath = document.getElementById('file-path');
  const saveBtn = document.getElementById('save-file-btn');
  
  if (!fileContent || !filePath || !saveBtn) return;
  
  if (isDir) {
    loadFilesFromDirectory(relativePath);
    fileContent.value = '';
    fileContent.disabled = true;
    saveBtn.disabled = true;
  } else {
    try {
      const basePath = path.join(__dirname, '..');
      const fullPath = path.join(basePath, relativePath);
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      fileContentCache = {
        path: relativePath,
        content: content
      };
      
      fileContent.value = content;
      fileContent.disabled = false;
      saveBtn.disabled = false;
      filePath.textContent = relativePath;
    } catch (error) {
      console.error('Error reading file:', error);
      fileContent.value = `// Error reading file: ${error.message}`;
      fileContent.disabled = true;
      saveBtn.disabled = true;
    }
  }
}

function saveFile() {
  try {
    const filePath = document.getElementById('file-path');
    const fileContent = document.getElementById('file-content');
    if (!filePath || !fileContent) return;
    
    const relativePath = filePath.textContent;
    if (!relativePath || relativePath === 'BotLogic (Root)') {
      addConsoleMessage('Cannot save: No file selected', 'error');
      return;
    }
    
    const basePath = path.join(__dirname, '..');
    const fullPath = path.join(basePath, relativePath);
    
    const content = fileContent.value;
    fs.writeFileSync(fullPath, content, 'utf8');
    
    addConsoleMessage(`Saving file: ${relativePath}...`, 'system');
    setTimeout(() => {
      addConsoleMessage(`File ${relativePath} saved successfully`, 'success');
    }, 300);
  } catch (error) {
    console.error('Error saving file:', error);
    addConsoleMessage(`Error saving file: ${error.message}`, 'error');
  }
}

function clearConsole() {
  dashboardState.consoleLines = [];
  const consoleContainer = document.getElementById('console-container');
  if (consoleContainer) {
    consoleContainer.innerHTML = '';
  }
  addConsoleMessage('Console cleared', 'system');
}

function addConsoleMessage(message, type = 'info') {
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const consoleLine = {
    timestamp,
    message,
    type
  };
  
  dashboardState.consoleLines.push(consoleLine);
  
  if (dashboardState.consoleLines.length > 100) {
    dashboardState.consoleLines.shift();
  }
  
  const consoleContainer = document.getElementById('console-container');
  if (consoleContainer) {
    const lineElement = document.createElement('div');
    lineElement.className = `console-line ${type}`;
    lineElement.textContent = `[${timestamp}] ${message}`;
    consoleContainer.appendChild(lineElement);
    
    consoleContainer.scrollTop = consoleContainer.scrollHeight;
  }
}

function toggleStartStop() {
  dashboardState.isRunning = !dashboardState.isRunning;
  
  const startStopBtn = document.getElementById('start-stop-btn');
  if (!startStopBtn) return;
  
  if (dashboardState.isRunning) {
    startStopBtn.className = 'control-btn stop';
    startStopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
    
    addConsoleMessage('Initializing bot server...', 'system');
    
    startBotProcess();
  } else {
    startStopBtn.className = 'control-btn start';
    startStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    
    addConsoleMessage('Server stopping...', 'system');
    
    stopBotProcess();
  }
}

function startBotProcess() {
  try {
    const botPath = path.join(__dirname, '..', 'BotLogic', 'bot.js');
    
    if (!fs.existsSync(botPath)) {
      addConsoleMessage(`Error: Could not find bot.js at ${botPath}`, 'error');
      dashboardState.isRunning = false;
      const startStopBtn = document.getElementById('start-stop-btn');
      if (startStopBtn) {
        startStopBtn.className = 'control-btn start';
        startStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
      }
      return;
    }
    
    
    const botProcess = spawn('node', [botPath], {
      cwd: path.join(__dirname, '..', 'BotLogic')
    });
    
    dashboardState.botProcess = botProcess;
    
    botProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const cleanLine = line.replace(/\u001b\[\d+(;\d+)*m/g, '');
          
          let type = 'info';
          
          if (cleanLine.includes('[LOGS]') || cleanLine.includes('[ACCOUNTS]') || cleanLine.includes('[COSMETICS]')) {
            type = 'success';
          } else if (cleanLine.includes('Error') || cleanLine.includes('Failed') || cleanLine.includes('[ERROR]') || cleanLine.includes('[ERR]')) {
            type = 'error';
          } else if (cleanLine.includes('[FRIEND]') || cleanLine.includes('[PARTY]') || cleanLine.includes('Warning') || cleanLine.includes('[STARTUP]')) {
            type = 'warning';
          } else if (cleanLine.includes('[DATA]') || cleanLine.includes('[CONFIG]') || cleanLine.includes('[VERSION]') || cleanLine.includes('[MATCHMAKING]')) {
            type = 'blue';
          }
          
          addConsoleMessage(cleanLine, type);
          
          updateStatsFromOutput(cleanLine);
        }
      });
    });
    
    botProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const cleanLine = line.replace(/\u001b\[\d+(;\d+)*m/g, '');
          addConsoleMessage(cleanLine, 'error');
        }
      });
    });
    
    botProcess.on('close', (code) => {
      if (code === null) {
        code = 0;
        addConsoleMessage('Bot process stopped', 'system');
      } else {
        addConsoleMessage(`Bot process exited with code ${code}`, code === 0 ? 'info' : 'error');
      }
      
      
      if (dashboardState.isRunning) {
        dashboardState.isRunning = false;
        const startStopBtn = document.getElementById('start-stop-btn');
        if (startStopBtn) {
          startStopBtn.className = 'control-btn start';
          startStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        }
        
        stopUptimeCounter();
      }
      
      dashboardState.botProcess = null;
    });
    
    startUptimeCounter();
    
  } catch (error) {
    addConsoleMessage(`Error starting bot process: ${error.message}`, 'error');
    
    dashboardState.isRunning = false;
    const startStopBtn = document.getElementById('start-stop-btn');
    if (startStopBtn) {
      startStopBtn.className = 'control-btn start';
      startStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    }
  }
}

function stopBotProcess() {
  try {
    if (dashboardState.botProcess) {
      if (process.platform === 'win32') {
        try {
          dashboardState.botProcess.kill();
        } catch (err) {
          addConsoleMessage(`Error stopping bot process: ${err.message}`, 'error');
        }
      } else {
        dashboardState.botProcess.kill();
      }
      
      setTimeout(() => {
        addConsoleMessage('Server stopped successfully', 'success');
        dashboardState.botProcess = null;
        
        dashboardState.stats.players = 0;
        dashboardState.stats.bots = 0;
        dashboardState.stats.uptime = '0h 0m 0s';
        updateStats();
        
        stopUptimeCounter();
      }, 1500);
    } else {
      addConsoleMessage('Server stopped successfully', 'success');
      
      dashboardState.stats.players = 0;
      dashboardState.stats.bots = 0;
      dashboardState.stats.uptime = '0h 0m 0s';
      updateStats();
      
      stopUptimeCounter();
    }
  } catch (error) {
    addConsoleMessage(`Error stopping bot process: ${error.message}`, 'error');
  }
}

function updateStatsFromOutput(line) {
  try {
    if (line.includes('Starting') && line.includes('accounts')) {
      const match = line.match(/Starting (\d+) accounts/);
      if (match && match[1]) {
        dashboardState.stats.bots = parseInt(match[1]);
        updateStats();
      }
    }
    
    if (line.includes('match')) {
      if (line.includes('starting') || line.includes('joined')) {
        dashboardState.stats.players += 1;
        updateStats();
      }
    }
  } catch (err) {
    console.error('Error updating stats from output:', err);
  }
}

function restartServer() {
  addConsoleMessage('Restarting server...', 'system');
  
  if (dashboardState.isRunning) {
    stopBotProcess();
    
    setTimeout(() => {
      addConsoleMessage('Initializing server...', 'system');
      
      setTimeout(() => {
        dashboardState.isRunning = true;
        
        const startStopBtn = document.getElementById('start-stop-btn');
        if (startStopBtn) {
          startStopBtn.className = 'control-btn stop';
          startStopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        }
        
        startBotProcess();
        
        addConsoleMessage('Server restarted successfully', 'success');
      }, 1500);
    }, 2000);
  } else {
    dashboardState.isRunning = true;
    
    const startStopBtn = document.getElementById('start-stop-btn');
    if (startStopBtn) {
      startStopBtn.className = 'control-btn stop';
      startStopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
    }
    
    startBotProcess();
    
    addConsoleMessage('Server started successfully', 'success');
  }
}

function updateStats() {
  if (dashboardState.currentTab !== 'dashboard') return;
  
  const statValueElements = document.querySelectorAll('.stat-value');
  if (statValueElements.length >= 4) {
    statValueElements[0].textContent = dashboardState.stats.players.toLocaleString();
    statValueElements[1].textContent = dashboardState.stats.uptime;
    statValueElements[2].textContent = dashboardState.stats.bots;
    statValueElements[3].textContent = dashboardState.stats.version;
  }
}

let uptimeInterval = null;
let uptimeSeconds = 0;

function startUptimeCounter() {
  stopUptimeCounter();
  uptimeSeconds = 0;
  
  updateUptimeDisplay();
  
  uptimeInterval = setInterval(() => {
    uptimeSeconds++;
    updateUptimeDisplay();
  }, 1000);
}

function updateUptimeDisplay() {
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  dashboardState.stats.uptime = `${hours}h ${minutes}m ${seconds}s`;
  updateStats();
}

function stopUptimeCounter() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
    uptimeInterval = null;
  }
}

function startMatchCountUpdater() {
  stopMatchCountUpdater();
  
  updateMatchCountFromFile();
  
  dashboardState.matchCountInterval = setInterval(() => {
    updateMatchCountFromFile();
  }, 1000);
}

function stopMatchCountUpdater() {
  if (dashboardState.matchCountInterval) {
    clearInterval(dashboardState.matchCountInterval);
    dashboardState.matchCountInterval = null;
  }
}

function updateMatchCountFromFile() {
  try {
    const matchesFilePath = path.join(__dirname, '..', 'BotLogic', 'matches.json');
    
    if (fs.existsSync(matchesFilePath)) {
      const rawData = fs.readFileSync(matchesFilePath, 'utf8');
      const matchData = JSON.parse(rawData);
      
      if (matchData && typeof matchData.total === 'number') {
        dashboardState.stats.players = matchData.total;
        updateStats();
      }
    }
  } catch (error) {
    console.error('Error reading matches.json:', error);
  }
}

async function executeCommand(commandText) {
  let command = '';
  let originalCommand = '';
  
  if (typeof commandText === 'string') {
    originalCommand = commandText.trim();
    command = originalCommand.toLowerCase();
  } else {
    const input = document.getElementById('command-input');
    if (!input) return;
    originalCommand = input.value.trim();
    command = originalCommand.toLowerCase();
    input.value = '';
  }
  
  if (!command) return;
  
  addConsoleMessage(`> ${originalCommand}`, 'user');
  
  if (originalCommand === 'dev:page:enable') {
    dashboardState.developerEnabled = true;
    const developerTab = document.querySelector('.dashboard-nav-item.developer');
    if (developerTab) {
      developerTab.classList.add('visible');
    }
    addConsoleMessage('Developer mode enabled', 'success');
    return;
  }
  
  if (command === 'start') {
    if (!dashboardState.isRunning) {
      toggleStartStop();
    } else {
      addConsoleMessage('Server is already running', 'warning');
    }
  } else if (command === 'stop') {
    if (dashboardState.isRunning) {
      toggleStartStop();
    } else {
      addConsoleMessage('Server is already stopped', 'warning');
    }
  } else if (command === 'restart') {
    restartServer();
  } else if (command === 'help') {
    addConsoleMessage('Available commands:', 'system');
    addConsoleMessage('start - Start the server', 'system');
    addConsoleMessage('stop - Stop the server', 'system');
    addConsoleMessage('restart - Restart the server', 'system');
    addConsoleMessage('help - Show this help message', 'system');
  } else if (dashboardState.isRunning && dashboardState.botProcess) {
    try {
      if (dashboardState.botProcess && dashboardState.botProcess.stdin) {
        dashboardState.botProcess.stdin.write(originalCommand + '\n');
        addConsoleMessage(`Command sent to bot: ${originalCommand}`, 'system');
      } else {
        addConsoleMessage(`Cannot send command: Bot process not accepting input`, 'error');
      }
    } catch (err) {
      addConsoleMessage(`Error sending command to bot: ${err.message}`, 'error');
    }
  } else if (command === 'dev:joinparty') {
    floodPartyWithAllClients();
  } else {
    addConsoleMessage(`Unknown command: ${originalCommand}. Type 'help' for available commands.`, 'error');
  }
}

function createCosmeticsTab() {
  const container = document.createElement('div');
  container.className = 'cosmetics-container';
  container.style.padding = '20px';
  
  if (!document.querySelector('.background-orbs')) {
    createBackgroundOrbs();
  }
  
  const configData = loadConfigData();
  if (!configData) {
    return createErrorMessage('Could not load config data');
  }
  
  const header = document.createElement('div');
  header.className = 'cosmetics-header';
  header.style.marginBottom = '20px';
  header.style.textAlign = 'center';

  const title = document.createElement('h2');
  title.textContent = 'Bot Cosmetics';
  title.style.margin = '0 0 5px 0';
  title.style.color = '#00c2ff';
  title.style.fontSize = '24px';

  const description = document.createElement('p');
  description.textContent = 'Customize the appearance of your bots';
  description.style.margin = '0';
  description.style.opacity = '0.8';

  header.appendChild(title);
  header.appendChild(description);
  container.appendChild(header);

  const mainGrid = document.createElement('div');
  mainGrid.className = 'cosmetics-main-grid';
  mainGrid.style.display = 'grid';
  mainGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  mainGrid.style.gap = '15px';
  mainGrid.style.marginBottom = '20px';
  
  const mainCosmetics = [
    { type: 'character', label: 'Skin', icon: 'fa-user', apiType: 'outfit', id: configData.cosmetics.character.id },
    { type: 'backpack', label: 'Back Bling', icon: 'fa-suitcase', apiType: 'backpack', id: configData.cosmetics.backpack.id },
    { type: 'emote', label: 'Emote', icon: 'fa-drum', apiType: 'emote', id: configData.cosmetics.eid }
  ];

  mainCosmetics.forEach(item => {
    const cosmeticBox = createCosmeticBox(item.type, item.label, item.icon, item.id, configData);
    mainGrid.appendChild(cosmeticBox);
  });

  container.appendChild(mainGrid);

  const secondarySection = document.createElement('div');
  secondarySection.className = 'cosmetics-secondary-section';
  secondarySection.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  secondarySection.style.borderRadius = '8px';
  secondarySection.style.padding = '15px';
  secondarySection.style.marginBottom = '20px';


  const bannerSection = document.createElement('div');
  createBannerSection(bannerSection, configData);
  secondarySection.appendChild(bannerSection);

  container.appendChild(secondarySection);
  
  return container;
}

function createCosmeticBox(type, label, iconClass, itemId, configData) {
  const box = document.createElement('div');
  box.className = 'cosmetic-main-box';
  box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  box.style.borderRadius = '8px';
  box.style.padding = '15px';
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.alignItems = 'center';
  box.style.justifyContent = 'space-between';
  box.style.minHeight = '200px';
  box.style.position = 'relative';
  box.style.overflow = 'hidden';
  box.style.border = '1px solid rgba(0, 194, 255, 0.2)';
  
  const titleSection = document.createElement('div');
  titleSection.style.width = '100%';
  titleSection.style.textAlign = 'center';
  titleSection.style.marginBottom = '10px';
  
  const titleIcon = document.createElement('i');
  titleIcon.className = `fas ${iconClass}`;
  titleIcon.style.fontSize = '16px';
  titleIcon.style.marginRight = '5px';
  titleIcon.style.color = '#00c2ff';
  
  const titleText = document.createElement('span');
  titleText.textContent = label;
  titleText.style.fontSize = '16px';
  titleText.style.fontWeight = 'bold';
  
  titleSection.appendChild(titleIcon);
  titleSection.appendChild(titleText);
  box.appendChild(titleSection);
  
  const cosmeticDisplay = document.createElement('div');
  cosmeticDisplay.className = 'cosmetic-display';
  cosmeticDisplay.style.flex = '1';
  cosmeticDisplay.style.display = 'flex';
  cosmeticDisplay.style.flexDirection = 'column';
  cosmeticDisplay.style.alignItems = 'center';
  cosmeticDisplay.style.justifyContent = 'center';
  cosmeticDisplay.style.width = '100%';
  cosmeticDisplay.style.padding = '10px 0';
  
  const iconContainer = document.createElement('div');
  iconContainer.style.width = '80px';
  iconContainer.style.height = '80px';
  iconContainer.style.marginBottom = '10px';
  iconContainer.style.position = 'relative';
  iconContainer.style.borderRadius = '10px';
  iconContainer.style.overflow = 'hidden';
  iconContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  
  const icon = document.createElement('img');
  icon.style.width = '100%';
  icon.style.height = '100%';
  icon.style.objectFit = 'contain';
  icon.alt = label;
  icon.src = './assets/loading.gif';
  
  iconContainer.appendChild(icon);
  cosmeticDisplay.appendChild(iconContainer);
  
  const nameDisplay = document.createElement('div');
  nameDisplay.style.textAlign = 'center';
  nameDisplay.style.width = '100%';
  nameDisplay.style.overflow = 'hidden';
  nameDisplay.style.textOverflow = 'ellipsis';
  nameDisplay.style.whiteSpace = 'nowrap';
  nameDisplay.style.fontSize = '14px';
  nameDisplay.style.padding = '0 5px';
  nameDisplay.textContent = 'Loading...';
  
  cosmeticDisplay.appendChild(nameDisplay);
  box.appendChild(cosmeticDisplay);
  
  const buttonSection = document.createElement('div');
  buttonSection.className = 'cosmetic-button-section';
  buttonSection.style.width = '100%';
  buttonSection.style.display = 'flex';
  buttonSection.style.justifyContent = 'center';
  buttonSection.style.gap = '10px';
  buttonSection.style.marginTop = '10px';
  
  const styleButton = document.createElement('button');
  styleButton.className = 'style-button';
  styleButton.innerHTML = '<i class="fas fa-palette"></i> Styles';
  styleButton.style.padding = '8px 15px';
  styleButton.style.backgroundColor = '#9932CC';
  styleButton.style.color = 'white';
  styleButton.style.border = 'none';
  styleButton.style.borderRadius = '4px';
  styleButton.style.cursor = 'pointer';
  styleButton.style.fontWeight = 'bold';
  styleButton.style.fontSize = '14px';
  styleButton.style.display = 'none'; // Initially hidden until we confirm styles exist
  
  const changeButton = document.createElement('button');
  changeButton.textContent = 'Change';
  changeButton.style.padding = '8px 15px';
  changeButton.style.backgroundColor = '#00c2ff';
  changeButton.style.color = 'white';
  changeButton.style.border = 'none';
  changeButton.style.borderRadius = '4px';
  changeButton.style.cursor = 'pointer';
  changeButton.style.fontWeight = 'bold';
  changeButton.style.fontSize = '14px';
  
  changeButton.addEventListener('click', () => {
    showCosmeticSelectionModal(type, configData);
  });
  
  box.dataset.cosmeticType = type;
  box.dataset.cosmeticId = itemId;
  
  buttonSection.appendChild(styleButton);
  buttonSection.appendChild(changeButton);
  box.appendChild(buttonSection);
  
  fetchCosmeticDetails(type, itemId, icon, nameDisplay, styleButton, box, configData);
  
  return box;
}


function createBannerSection(container, configData) {
  const bannerId = configData.cosmetics?.banner?.id || '';
  const bannerColor = configData.cosmetics?.banner?.color || '';
  const level = parseInt(configData.cosmetics?.lvl) || 100;
  
  container.className = 'banner-section';
  container.style.marginTop = '15px';
  container.style.padding = '20px';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.2)';
  container.style.border = '1px solid rgba(0, 194, 255, 0.15)';
  
  const twoColumnLayout = document.createElement('div');
  twoColumnLayout.style.display = 'flex';
  twoColumnLayout.style.gap = '20px';
  container.appendChild(twoColumnLayout);
  
  const levelColumn = document.createElement('div');
  levelColumn.style.flex = '1';
  levelColumn.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  levelColumn.style.borderRadius = '8px';
  levelColumn.style.padding = '15px';
  levelColumn.style.border = '1px solid rgba(0, 194, 255, 0.1)';
  twoColumnLayout.appendChild(levelColumn);
  
  const levelHeaderContainer = document.createElement('div');
  levelHeaderContainer.style.display = 'flex';
  levelHeaderContainer.style.alignItems = 'center';
  levelHeaderContainer.style.marginBottom = '12px';
  
  const levelIcon = document.createElement('div');
  levelIcon.innerHTML = '<i class="fas fa-medal"></i>';
  levelIcon.style.color = '#00c2ff';
  levelIcon.style.fontSize = '18px';
  levelIcon.style.marginRight = '8px';
  
  const levelHeader = document.createElement('h3');
  levelHeader.textContent = 'Account Level';
  levelHeader.style.margin = '0';
  levelHeader.style.fontSize = '16px';
  levelHeader.style.color = '#00c2ff';
  levelHeader.style.fontWeight = 'bold';
  
  levelHeaderContainer.appendChild(levelIcon);
  levelHeaderContainer.appendChild(levelHeader);
  levelColumn.appendChild(levelHeaderContainer);
  
  const levelControls = document.createElement('div');
  levelControls.style.display = 'flex';
  levelControls.style.flexDirection = 'column';
  levelControls.style.gap = '10px';
  
  const levelDisplay = document.createElement('div');
  levelDisplay.style.fontSize = '32px';
  levelDisplay.style.fontWeight = 'bold';
  levelDisplay.style.color = 'white';
  levelDisplay.style.textAlign = 'center';
  levelDisplay.style.margin = '5px 0 15px';
  levelDisplay.textContent = level.toString();
  
  const levelSlider = document.createElement('input');
  levelSlider.type = 'range';
  levelSlider.min = 0;
  levelSlider.max = 99999;
  levelSlider.value = level;
  levelSlider.style.width = '100%';
  levelSlider.style.accentColor = '#00c2ff';
  
  const levelInput = document.createElement('input');
  levelInput.type = 'number';
  levelInput.value = level;
  levelInput.min = -2147483647;
  levelInput.max = 2147483647;
  levelInput.style.width = '100%';
  levelInput.style.padding = '8px';
  levelInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  levelInput.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  levelInput.style.borderRadius = '4px';
  levelInput.style.color = 'white';
  levelInput.style.textAlign = 'center';
  levelInput.style.fontSize = '16px';
  
  levelSlider.addEventListener('input', () => {
    const newLevel = parseInt(levelSlider.value, 10);
    levelInput.value = newLevel;
    levelDisplay.textContent = newLevel.toString();
  });
  
  function saveLevelToConfig(newLevel) {
    try {
      newLevel = parseInt(newLevel, 10) || 0;
      
      levelDisplay.textContent = newLevel.toString();
      levelInput.value = newLevel;
      
      const sliderValue = Math.min(Math.max(newLevel, 0), 99999);
      levelSlider.value = sliderValue;
      
      const configPath = path.resolve(__dirname, '../BotLogic/config.json');
      console.log(`Saving level ${newLevel} to ${configPath}`);
      
      const fileContent = fs.readFileSync(configPath, 'utf8');
      let data = JSON.parse(fileContent);
      
      data.cosmetics.lvl = newLevel.toString();
      
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Level updated to ${newLevel} and saved successfully`);
      
      addConsoleMessage(`Bot level updated to ${newLevel}`, 'success');
      return true;
    } catch (error) {
      console.error('Error saving level:', error);
      addConsoleMessage(`Error saving level: ${error.message}`, 'error');
      return false;
    }
  }
  
  levelSlider.addEventListener('input', () => {
    const newLevel = parseInt(levelSlider.value, 10);
    levelDisplay.textContent = newLevel.toString();
    levelInput.value = newLevel;
  });
  
  levelSlider.addEventListener('change', () => {
    const newLevel = parseInt(levelSlider.value, 10);
    saveLevelToConfig(newLevel);
  });
  
  levelInput.addEventListener('change', () => {
    saveLevelToConfig(levelInput.value);
  });
  
  levelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveLevelToConfig(levelInput.value);
    }
  });
  
  levelInput.addEventListener('blur', () => {
    saveLevelToConfig(levelInput.value);
  });
  
  levelControls.appendChild(levelDisplay);
  levelControls.appendChild(levelSlider);
  levelControls.appendChild(levelInput);
  levelColumn.appendChild(levelControls);
  
  const bannerColumn = document.createElement('div');
  bannerColumn.style.flex = '1';
  bannerColumn.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  bannerColumn.style.borderRadius = '8px';
  bannerColumn.style.padding = '15px';
  bannerColumn.style.border = '1px solid rgba(0, 194, 255, 0.1)';
  twoColumnLayout.appendChild(bannerColumn);
  
  const bannerHeaderContainer = document.createElement('div');
  bannerHeaderContainer.style.display = 'flex';
  bannerHeaderContainer.style.alignItems = 'center';
  bannerHeaderContainer.style.marginBottom = '12px';
  
  const bannerHeaderIcon = document.createElement('div');
  bannerHeaderIcon.innerHTML = '<i class="fas fa-flag"></i>';
  bannerHeaderIcon.style.color = '#00c2ff';
  bannerHeaderIcon.style.fontSize = '18px';
  bannerHeaderIcon.style.marginRight = '8px';
  
  const bannerHeader = document.createElement('h3');
  bannerHeader.textContent = 'Banner & Color';
  bannerHeader.style.margin = '0';
  bannerHeader.style.fontSize = '16px';
  bannerHeader.style.color = '#00c2ff';
  bannerHeader.style.fontWeight = 'bold';
  
  bannerHeaderContainer.appendChild(bannerHeaderIcon);
  bannerHeaderContainer.appendChild(bannerHeader);
  bannerColumn.appendChild(bannerHeaderContainer);
  
  const bannerDisplay = document.createElement('div');
  bannerDisplay.style.display = 'flex';
  bannerDisplay.style.alignItems = 'center';
  bannerDisplay.style.marginBottom = '15px';
  bannerDisplay.style.padding = '10px';
  bannerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  bannerDisplay.style.borderRadius = '8px';
  bannerDisplay.style.border = '1px solid rgba(0, 194, 255, 0.1)';
  
  const bannerPreview = document.createElement('div');
  bannerPreview.style.width = '70px';
  bannerPreview.style.height = '70px';
  bannerPreview.style.marginRight = '15px';
  bannerPreview.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  bannerPreview.style.borderRadius = '8px';
  bannerPreview.style.overflow = 'hidden';
  bannerPreview.style.padding = '8px';
  bannerPreview.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.25)';
  bannerPreview.style.border = '1px solid rgba(0, 194, 255, 0.2)';
  
  const bannerIcon = document.createElement('img');
  bannerIcon.style.width = '100%';
  bannerIcon.style.height = '100%';
  bannerIcon.style.objectFit = 'contain';
  bannerIcon.alt = 'Banner';
  bannerIcon.src = './assets/loading.gif';
  
  bannerPreview.appendChild(bannerIcon);
  bannerDisplay.appendChild(bannerPreview);
  
  const bannerInfo = document.createElement('div');
  bannerInfo.style.flex = '1';
  
  const bannerName = document.createElement('div');
  bannerName.textContent = 'Loading...';
  bannerName.style.fontSize = '16px';
  bannerName.style.fontWeight = 'bold';
  bannerName.style.marginBottom = '8px';
  bannerName.style.color = 'white';
  
  const bannerColorLabel = document.createElement('div');
  bannerColorLabel.textContent = 'Color:';
  bannerColorLabel.style.fontSize = '12px';
  bannerColorLabel.style.color = 'rgba(255, 255, 255, 0.7)';
  bannerColorLabel.style.marginBottom = '4px';
  
  const bannerColorPreview = document.createElement('div');
  bannerColorPreview.style.display = 'flex';
  bannerColorPreview.style.alignItems = 'center';
  
  const colorSquare = document.createElement('div');
  colorSquare.style.width = '24px';
  colorSquare.style.height = '24px';
  colorSquare.style.borderRadius = '4px';
  colorSquare.style.backgroundColor = '#666666';
  colorSquare.style.marginRight = '8px';
  colorSquare.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  colorSquare.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
  
  const colorName = document.createElement('span');
  colorName.textContent = 'Default';
  colorName.style.fontSize = '14px';
  colorName.style.color = 'white';
  
  bannerColorPreview.appendChild(colorSquare);
  bannerColorPreview.appendChild(colorName);
  
  bannerInfo.appendChild(bannerName);
  bannerInfo.appendChild(bannerColorLabel);
  bannerInfo.appendChild(bannerColorPreview);
  bannerDisplay.appendChild(bannerInfo);
  
  bannerColumn.appendChild(bannerDisplay);
  
  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.gap = '10px';
  
  const changeBannerButton = document.createElement('button');
  changeBannerButton.innerHTML = '<i class="fas fa-flag"></i> Change Banner';
  changeBannerButton.style.flex = '1';
  changeBannerButton.style.padding = '10px';
  changeBannerButton.style.backgroundColor = '#00c2ff';
  changeBannerButton.style.color = 'white';
  changeBannerButton.style.border = 'none';
  changeBannerButton.style.borderRadius = '6px';
  changeBannerButton.style.cursor = 'pointer';
  changeBannerButton.style.fontWeight = 'bold';
  changeBannerButton.style.transition = 'all 0.2s ease';
  changeBannerButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  
  changeBannerButton.addEventListener('mouseenter', () => {
    changeBannerButton.style.backgroundColor = '#00a8db';
    changeBannerButton.style.transform = 'translateY(-2px)';
    changeBannerButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  });
  
  changeBannerButton.addEventListener('mouseleave', () => {
    changeBannerButton.style.backgroundColor = '#00c2ff';
    changeBannerButton.style.transform = 'translateY(0)';
    changeBannerButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  });
  
  changeBannerButton.addEventListener('click', () => {
    showBannerSelectionModal(bannerId, configData);
  });
  
  const changeColorButton = document.createElement('button');
  changeColorButton.innerHTML = '<i class="fas fa-palette"></i> Change Color';
  changeColorButton.style.flex = '1';
  changeColorButton.style.padding = '10px';
  changeColorButton.style.backgroundColor = '#00c2ff';
  changeColorButton.style.color = 'white';
  changeColorButton.style.border = 'none';
  changeColorButton.style.borderRadius = '6px';
  changeColorButton.style.cursor = 'pointer';
  changeColorButton.style.fontWeight = 'bold';
  changeColorButton.style.transition = 'all 0.2s ease';
  changeColorButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  
  changeColorButton.addEventListener('mouseenter', () => {
    changeColorButton.style.backgroundColor = '#00a8db';
    changeColorButton.style.transform = 'translateY(-2px)';
    changeColorButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  });
  
  changeColorButton.addEventListener('mouseleave', () => {
    changeColorButton.style.backgroundColor = '#00c2ff';
    changeColorButton.style.transform = 'translateY(0)';
    changeColorButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  });
  
  changeColorButton.addEventListener('click', () => {
    showBannerColorSelectionModal(bannerColor, configData);
  });
  
  buttonGroup.appendChild(changeBannerButton);
  buttonGroup.appendChild(changeColorButton);
  bannerColumn.appendChild(buttonGroup);
  
  fetchBannerDetails(bannerId, bannerColor, bannerIcon, bannerName, colorSquare, colorName);
  
  return container;
}

function showCosmeticSelectionModal(type, configData) {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'rgba(10, 20, 30, 0.95)';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.3)';
  modalContent.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.style.padding = '15px';
  modalHeader.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  let typeName = type;
  if (type === 'character') typeName = 'Skin';
  if (type === 'backpack') typeName = 'Back Bling';
  if (type === 'emote') typeName = 'Emote';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = `Select ${typeName}`;
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.color = '#00c2ff';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => modalOverlay.remove());
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  const searchSection = document.createElement('div');
  searchSection.className = 'modal-search';
  searchSection.style.padding = '15px';
  searchSection.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  searchSection.style.display = 'flex';
  searchSection.style.gap = '10px';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = `Search ${typeName}s...`;
  searchInput.style.flex = '1';
  searchInput.style.padding = '8px 12px';
  searchInput.style.borderRadius = '4px';
  searchInput.style.border = '1px solid rgba(0, 194, 255, 0.5)';
  searchInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  searchInput.style.color = 'white';
  
  const searchButton = document.createElement('button');
  searchButton.innerHTML = '<i class="fas fa-search"></i> Search';
  searchButton.style.padding = '8px 15px';
  searchButton.style.backgroundColor = '#00c2ff';
  searchButton.style.color = 'white';
  searchButton.style.border = 'none';
  searchButton.style.borderRadius = '4px';
  searchButton.style.cursor = 'pointer';
  
  searchSection.appendChild(searchInput);
  searchSection.appendChild(searchButton);
  modalContent.appendChild(searchSection);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'modal-results';
  contentArea.style.flex = '1';
  contentArea.style.padding = '15px';
  contentArea.style.overflowY = 'auto';
  contentArea.style.display = 'grid';
  contentArea.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
  contentArea.style.gap = '15px';
  contentArea.style.alignContent = 'start';
  
  const initialMessage = document.createElement('div');
  initialMessage.textContent = `Search for ${typeName}s to get started`;
  initialMessage.style.gridColumn = '1 / -1';
  initialMessage.style.textAlign = 'center';
  initialMessage.style.padding = '20px';
  initialMessage.style.color = 'rgba(255, 255, 255, 0.7)';
  
  contentArea.appendChild(initialMessage);
  modalContent.appendChild(contentArea);
  
  searchButton.addEventListener('click', () => {
    searchCosmeticsForModal(searchInput.value, type, contentArea, configData);
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchCosmeticsForModal(searchInput.value, type, contentArea, configData);
    }
  });
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  setTimeout(() => searchInput.focus(), 100);
}

function removeExistingModals() {
  const existingModals = document.querySelectorAll('.modal-overlay');
  existingModals.forEach(modal => modal.remove());
}

function searchCosmeticsForModal(query, type, container, configData) {
  if (!query || query.trim() === '') {
    addConsoleMessage('Please enter a search term', 'warning');
    return;
  }
  
  container.innerHTML = '';
  
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'cosmetic-loading';
  loadingMsg.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Searching...';
  loadingMsg.style.gridColumn = '1 / -1';
  loadingMsg.style.textAlign = 'center';
  loadingMsg.style.padding = '20px';
  container.appendChild(loadingMsg);
  
  let apiType = type;
  if (type === 'character') apiType = 'outfit';
  if (type === 'backpack') apiType = 'backpack';
  
  fetch(`https://fortnite-api.com/v2/cosmetics/br/search/all?name=${encodeURIComponent(query)}&matchMethod=contains&type=${apiType}&responseFlags=0x7`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    container.innerHTML = '';
    
    if (data.status === 200) {
      let items = [];
      
      if (Array.isArray(data.data)) {
        items = data.data;
      } else if (data.data) {
        items = [data.data];
      }
      
      if (items.length > 0) {
        items.sort((a, b) => a.name.localeCompare(b.name));
        
        items.forEach(item => {
          const cosmeticItem = createCosmeticItemForModal(item, type, configData);
          container.appendChild(cosmeticItem);
        });
      } else {
        const noResultsMsg = document.createElement('div');
        noResultsMsg.textContent = 'No cosmetics found';
        noResultsMsg.style.gridColumn = '1 / -1';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.padding = '20px';
        container.appendChild(noResultsMsg);
      }
    } else {
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'Error searching cosmetics';
      errorMsg.style.gridColumn = '1 / -1';
      errorMsg.style.textAlign = 'center';
      errorMsg.style.padding = '20px';
      errorMsg.style.color = 'red';
      container.appendChild(errorMsg);
    }
  })
  .catch(error => {
    console.error('Error searching cosmetics:', error);
    container.innerHTML = '';
    const errorMsg = document.createElement('div');
    errorMsg.textContent = 'Error connecting to API';
    errorMsg.style.gridColumn = '1 / -1';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.padding = '20px';
    errorMsg.style.color = 'red';
    container.appendChild(errorMsg);
  });
}

function createCosmeticItemForModal(item, type, configData) {
  const cosmeticItem = document.createElement('div');
  cosmeticItem.className = 'cosmetic-modal-item';
  cosmeticItem.style.display = 'flex';
  cosmeticItem.style.flexDirection = 'column';
  cosmeticItem.style.alignItems = 'center';
  cosmeticItem.style.padding = '10px';
  cosmeticItem.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  cosmeticItem.style.borderRadius = '6px';
  cosmeticItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  cosmeticItem.style.cursor = 'pointer';
  cosmeticItem.style.transition = 'all 0.2s ease';
  cosmeticItem.style.position = 'relative';

  cosmeticItem.addEventListener('mouseenter', () => {
    cosmeticItem.style.backgroundColor = 'rgba(0, 194, 255, 0.1)';
    cosmeticItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.3)';
  });

  cosmeticItem.addEventListener('mouseleave', () => {
    cosmeticItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    cosmeticItem.style.boxShadow = 'none';
  });

  const itemImg = document.createElement('img');
  itemImg.src = item.images.icon || item.images.smallIcon || './assets/placeholder.png';
  itemImg.alt = item.name;
  itemImg.style.width = '75px';
  itemImg.style.height = '75px';
  itemImg.style.marginBottom = '8px';
  itemImg.style.objectFit = 'contain';

  const itemName = document.createElement('div');
  itemName.textContent = item.name;
  itemName.style.fontSize = '12px';
  itemName.style.textAlign = 'center';
  itemName.style.fontWeight = 'bold';
  itemName.style.whiteSpace = 'nowrap';
  itemName.style.overflow = 'hidden';
  itemName.style.textOverflow = 'ellipsis';
  itemName.style.width = '100%';

  if (item.rarity && item.rarity.value) {
    let rarityColor = '#808080'; // Default gray

    switch (item.rarity.value.toLowerCase()) {
      case 'common': rarityColor = '#607D8B'; break;
      case 'uncommon': rarityColor = '#1B5E20'; break;
      case 'rare': rarityColor = '#0D47A1'; break;
      case 'epic': rarityColor = '#4A148C'; break;
      case 'legendary': rarityColor = '#FF6F00'; break;
      case 'dark': rarityColor = '#f542e6'; break;
      case 'starwars': rarityColor = '#0082ff'; break;
      case 'marvel': rarityColor = '#E63E3E'; break;
      case 'dc': rarityColor = '#2587FF'; break;
      case 'icon': rarityColor = '#3DBDE0'; break;
      case 'frozen': rarityColor = '#96EDF9'; break;
      case 'lava': rarityColor = '#FF7539'; break;
      case 'slurp': rarityColor = '#24dfc5'; break;
      case 'shadow': rarityColor = '#5A4B89'; break;
    }
    
    cosmeticItem.style.borderColor = rarityColor;
    const rarityTop = document.createElement('div');
    rarityTop.style.position = 'absolute';
    rarityTop.style.top = '0';
    rarityTop.style.left = '0';
    rarityTop.style.width = '100%';
    rarityTop.style.height = '3px';
    rarityTop.style.backgroundColor = rarityColor;
    rarityTop.style.borderTopLeftRadius = '5px';
    rarityTop.style.borderTopRightRadius = '5px';
    cosmeticItem.appendChild(rarityTop);
  }
  
  cosmeticItem.addEventListener('click', () => {
    try {
      const updateData = {};
      
      if (type === 'character') {
        updateData.character = item.id;
        updateData.cosmetics = {
          character: {
            id: item.id,
            styles: [] // ALWAYS reset styles when changing character
          }
        };
        console.log(`Updating character ID to: ${item.id} and resetting styles`);
      } else if (type === 'backpack') {
        updateData.backpack = item.id;
        updateData.cosmetics = {
          backpack: {
            id: item.id,
            styles: [] // ALWAYS reset styles when changing backpack
          }
        };
        console.log(`Updating backpack ID to: ${item.id} and resetting styles`);
      } else if (type === 'emote') {
        updateData.emote = item.id;
        console.log(`Updating emote ID to: ${item.id}`);
      }
      
      saveConfigData(updateData);
      
      if (dashboardState && dashboardState.currentTab === 'cosmetics') {
        setTimeout(() => {
          const contentContainer = document.getElementById('dashboard-content');
          if (contentContainer) {
            contentContainer.innerHTML = '';
            contentContainer.appendChild(createCosmeticsTab());
          }
        }, 100); // Small delay to ensure config is saved first
      }
      
      if (type === 'character') {
        const box = document.querySelector('.cosmetic-box.skin');
        if (box) {
          const iconElement = box.querySelector('.cosmetic-icon');
          const nameElement = box.querySelector('.cosmetic-name');
          const styleButton = box.querySelector('.style-button');
          iconElement.src = item.images?.icon || item.icon || 'loading.gif';
          nameElement.textContent = item.name;
          
          if (styleButton) {
            styleButton.style.display = item.variants && item.variants.length > 0 ? 'block' : 'none';
          }
        }
      } else if (type === 'backpack') {
        const box = document.querySelector('.cosmetic-box.backpack');
        if (box) {
          const iconElement = box.querySelector('.cosmetic-icon');
          const nameElement = box.querySelector('.cosmetic-name');
          const styleButton = box.querySelector('.style-button');
          iconElement.src = item.images?.icon || item.icon || 'loading.gif';
          nameElement.textContent = item.name;
          
          if (styleButton) {
            styleButton.style.display = item.variants && item.variants.length > 0 ? 'block' : 'none';
          }
        }
      } else if (type === 'emote') {
        const box = document.querySelector('.cosmetic-box.emote');
        if (box) {
          const iconElement = box.querySelector('.cosmetic-icon');
          const nameElement = box.querySelector('.cosmetic-name');
          iconElement.src = item.images?.icon || item.icon || 'loading.gif';
          nameElement.textContent = item.name;
        }
      }
      
      updateSelectedCosmetics(document.querySelector('.selected-cosmetics-container'), {
        cosmetics: {
          character: { id: type === 'character' ? item.id : configData.cosmetics.character.id },
          backpack: { id: type === 'backpack' ? item.id : configData.cosmetics.backpack.id },
          eid: type === 'emote' ? item.id : configData.cosmetics.eid,
          banner: configData.cosmetics.banner
        }
      });
      
      addConsoleMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} updated to ${item.name}`, 'success');
    } catch (error) {
      console.error('Error saving cosmetic:', error);
      addConsoleMessage(`Error updating cosmetic: ${error.message}`, 'error');
    }
    
    removeExistingModals();
  });
  
  cosmeticItem.appendChild(itemImg);
  cosmeticItem.appendChild(itemName);
  
  return cosmeticItem;
}

function createBannerItem(banner, currentBannerId, configData, modalOverlay) {
  const bannerItem = document.createElement('div');
  bannerItem.className = 'banner-item';
  bannerItem.style.display = 'flex';
  bannerItem.style.flexDirection = 'column';
  bannerItem.style.alignItems = 'center';
  bannerItem.style.padding = '10px';
  bannerItem.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  bannerItem.style.borderRadius = '6px';
  bannerItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  bannerItem.style.cursor = 'pointer';
  bannerItem.style.transition = 'all 0.2s ease';
  
  if (banner.id === currentBannerId) {
    bannerItem.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
    bannerItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
  }
  
  bannerItem.addEventListener('mouseenter', () => {
    bannerItem.style.backgroundColor = 'rgba(0, 194, 255, 0.1)';
    bannerItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.3)';
  });
  
  bannerItem.addEventListener('mouseleave', () => {
    if (banner.id === currentBannerId) {
      bannerItem.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
      bannerItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
    } else {
      bannerItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      bannerItem.style.boxShadow = 'none';
    }
  });
  
  const bannerImg = document.createElement('img');
  
  const bannerIconUrl = `https://fortnite-api.com/images/banners/${banner.id}/icon.png`;
  bannerImg.src = bannerIconUrl;
  
  bannerImg.onerror = () => {
    if (banner.images && banner.images.icon) {
      bannerImg.src = banner.images.icon;
    } else if (banner.images && banner.images.smallIcon) {
      bannerImg.src = banner.images.smallIcon;
    } else if (banner.imageUrl) {
      bannerImg.src = banner.imageUrl;
    } else {
      bannerImg.src = './assets/placeholder.png';
    }
  };
  
  bannerImg.alt = banner.name || banner.id;
  bannerImg.style.width = '60px';
  bannerImg.style.height = '60px';
  bannerImg.style.marginBottom = '5px';
  bannerImg.style.objectFit = 'contain';
  
  const bannerName = document.createElement('div');
  
  if (banner.devName) {
    bannerName.textContent = banner.devName;
  } else if (banner.name) {
    bannerName.textContent = banner.name;
  } else {
    bannerName.textContent = banner.id;
  }
  
  bannerName.style.fontSize = '10px';
  bannerName.style.textAlign = 'center';
  bannerName.style.whiteSpace = 'nowrap';
  bannerName.style.overflow = 'hidden';
  bannerName.style.textOverflow = 'ellipsis';
  bannerName.style.width = '100%';
  
  bannerItem.addEventListener('click', () => {
    selectBanner(banner.id, configData);
    modalOverlay.remove();
  });
  
  bannerItem.appendChild(bannerImg);
  bannerItem.appendChild(bannerName);
  
  return bannerItem;
}

function showBannerColorSelectionModal(currentColorId, configData) {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'rgba(10, 20, 30, 0.95)';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.3)';
  modalContent.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.style.padding = '15px';
  modalHeader.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Select Banner Color';
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.color = '#00c2ff';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => modalOverlay.remove());
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'modal-results';
  contentArea.style.flex = '1';
  contentArea.style.padding = '15px';
  contentArea.style.overflowY = 'auto';
  contentArea.style.display = 'grid';
  contentArea.style.gridTemplateColumns = 'repeat(auto-fill, minmax(60px, 1fr))';
  contentArea.style.gap = '15px';
  contentArea.style.alignContent = 'start';
  
  const loadingMessage = document.createElement('div');
  loadingMessage.textContent = 'Loading banner colors...';
  loadingMessage.style.gridColumn = '1 / -1';
  loadingMessage.style.textAlign = 'center';
  loadingMessage.style.padding = '20px';
  contentArea.appendChild(loadingMessage);
  
  modalContent.appendChild(contentArea);
  
  contentArea.innerHTML = '';
  
  try {
    Object.entries(colorMap).forEach(([colorId, hexColor]) => {
      const colorData = {
        id: colorId,
        color: hexColor.replace('#', '') // Remove # for consistency with the old format
      };
      const colorItem = createBannerColorItem(colorData, currentColorId, configData, modalOverlay);
      contentArea.appendChild(colorItem);
    });
  } catch (error) {
    console.error('Error creating banner colors:', error);
    contentArea.innerHTML = '';
    const errorMsg = document.createElement('div');
    errorMsg.textContent = 'Error loading banner colors';
    errorMsg.style.gridColumn = '1 / -1';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.padding = '20px';
    errorMsg.style.color = 'red';
    contentArea.appendChild(errorMsg);
  }
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

function createBannerColorItem(color, currentColorId, configData, modalOverlay) {
  const colorItem = document.createElement('div');
  colorItem.className = 'banner-color-item';
  colorItem.style.display = 'flex';
  colorItem.style.flexDirection = 'column';
  colorItem.style.alignItems = 'center';
  colorItem.style.padding = '10px';
  colorItem.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  colorItem.style.borderRadius = '6px';
  colorItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  colorItem.style.cursor = 'pointer';
  colorItem.style.transition = 'all 0.2s ease';
  
  if (color.id === currentColorId) {
    colorItem.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
    colorItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
  }
  
  colorItem.addEventListener('mouseenter', () => {
    colorItem.style.backgroundColor = 'rgba(0, 194, 255, 0.1)';
    colorItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.3)';
  });
  
  colorItem.addEventListener('mouseleave', () => {
    if (color.id === currentColorId) {
      colorItem.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
      colorItem.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
    } else {
      colorItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      colorItem.style.boxShadow = 'none';
    }
  });
  
  const colorSquare = document.createElement('div');
  const colorHex = color.color.startsWith('#') ? color.color : '#' + color.color;
  colorSquare.style.backgroundColor = colorHex;
  colorSquare.style.width = '40px';
  colorSquare.style.height = '40px';
  colorSquare.style.borderRadius = '4px';
  colorSquare.style.marginBottom = '5px';
  colorSquare.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  
  const colorCode = document.createElement('div');
  colorCode.textContent = color.id.replace('DefaultColor', '');
  colorCode.style.fontSize = '9px';
  colorCode.style.textAlign = 'center';
  colorCode.style.whiteSpace = 'nowrap';
  colorCode.style.overflow = 'hidden';
  colorCode.style.textOverflow = 'ellipsis';
  colorCode.style.width = '100%';
  
  colorItem.addEventListener('click', () => {
    selectBannerColor(color.id, configData);
    modalOverlay.remove();
  });
  
  colorItem.appendChild(colorSquare);
  colorItem.appendChild(colorCode);
  
  return colorItem;
}

function selectCosmetic(type, itemId, configData) {
  console.log(`Selecting ${type} with ID: ${itemId}`);
  
  const updatedConfig = {};
  
  if (type === 'character') {
    updatedConfig.character = itemId;
  } else if (type === 'backpack') {
    updatedConfig.backpack = itemId;
  } else if (type === 'emote') {
    updatedConfig.emote = itemId;
  }
  
  saveConfigData(updatedConfig);
  
  if (type === 'character') {
    const characterBox = document.querySelector('.cosmetic-box.skin');
    if (characterBox) {
      const iconElement = characterBox.querySelector('.cosmetic-icon');
      const nameElement = characterBox.querySelector('.cosmetic-name');
      fetchCosmeticDetails(type, itemId, iconElement, nameElement);
    }
  } else if (type === 'backpack') {
    const backpackBox = document.querySelector('.cosmetic-box.backpack');
    if (backpackBox) {
      const iconElement = backpackBox.querySelector('.cosmetic-icon');
      const nameElement = backpackBox.querySelector('.cosmetic-name');
      fetchCosmeticDetails(type, itemId, iconElement, nameElement);
    }
  } else if (type === 'emote') {
    const emoteBox = document.querySelector('.cosmetic-box.emote');
    if (emoteBox) {
      const iconElement = emoteBox.querySelector('.cosmetic-icon');
      const nameElement = emoteBox.querySelector('.cosmetic-name');
      fetchCosmeticDetails(type, itemId, iconElement, nameElement);
    }
  }
}

function selectBanner(bannerId, configData) {
  const updateData = {
    banner: bannerId,
    cosmetics: {
      banner: {
        id: bannerId
      }
    }
  };
  
  configData.cosmetics.banner.id = bannerId;
  
  const bannerSection = document.querySelector('.banner-section');
  if (bannerSection) {
    const iconElement = bannerSection.querySelector('.banner-icon');
    const nameElement = bannerSection.querySelector('.banner-name');
    const colorSquare = bannerSection.querySelector('.color-square');
    const colorName = bannerSection.querySelector('.color-name');
    const bannerColor = configData.cosmetics?.banner?.color || configData.bannerColor;
    fetchBannerDetails(bannerId, bannerColor, iconElement, nameElement, colorSquare, colorName);
  }
  
  updateSelectedCosmetics(document.querySelector('.selected-cosmetics-container'), configData);
  
  saveConfigData(updateData);
  
  if (dashboardState && dashboardState.currentTab === 'cosmetics') {
    setTimeout(() => {
      const contentContainer = document.getElementById('dashboard-content');
      if (contentContainer) {
        contentContainer.innerHTML = '';
        contentContainer.appendChild(createCosmeticsTab());
      }
    }, 100); // Small delay to ensure config is saved first
  }
  
  addConsoleMessage('Banner updated successfully', 'success');
}

function selectBannerColor(colorId, configData) {
  const updateData = {
    bannerColor: colorId,
    cosmetics: {
      banner: {
        color: colorId
      }
    }
  };
  
  configData.cosmetics.banner.color = colorId;
  
  const bannerSection = document.querySelector('.banner-section');
  if (bannerSection) {
    const iconElement = bannerSection.querySelector('.banner-icon');
    const nameElement = bannerSection.querySelector('.banner-name');
    const colorSquare = bannerSection.querySelector('.color-square');
    const colorName = bannerSection.querySelector('.color-name');
    const bannerId = configData.cosmetics?.banner?.id || configData.banner;
    fetchBannerDetails(bannerId, colorId, iconElement, nameElement, colorSquare, colorName);
  }
  
  updateSelectedCosmetics(document.querySelector('.selected-cosmetics-container'), configData);
  
  saveConfigData(updateData);
  
  if (dashboardState && dashboardState.currentTab === 'cosmetics') {
    setTimeout(() => {
      const contentContainer = document.getElementById('dashboard-content');
      if (contentContainer) {
        contentContainer.innerHTML = '';
        contentContainer.appendChild(createCosmeticsTab());
      }
    }, 100); // Small delay to ensure config is saved first
  }
  
  addConsoleMessage('Banner color updated successfully', 'success');
}

function saveConfigData(configData) {
  try {
    const configPath = path.join(__dirname, '..', 'BotLogic', 'config.json');
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    console.log('Config path:', configPath);
    
    const currentPageBeforeSave = currentPage;
    
    
    try {
      console.log('Reading config file...');
      let fileContent = fs.readFileSync(configPath, 'utf8');
      let data = JSON.parse(fileContent);
      
      if (configData.general) {
        console.log('Current general config:', JSON.stringify(data.general, null, 2));
        console.log('General changes to apply:', JSON.stringify(configData.general, null, 2));
      } else {
        console.log('Current cosmetics config:', JSON.stringify(data.cosmetics, null, 2));
        console.log('Cosmetic changes to apply:', JSON.stringify(configData, null, 2));
      }
      
      let changed = false;
      
      if (configData.general) {
        if (configData.general.add_friends !== undefined) {
          data.general.add_friends = configData.general.add_friends;
          console.log(`Add friends updated to: ${configData.general.add_friends}`);
          changed = true;
        }
        
        if (configData.general.join_friends !== undefined) {
          data.general.join_friends = configData.general.join_friends;
          console.log(`Join friends updated to: ${configData.general.join_friends}`);
          changed = true;
        }
        
        if (configData.general.leave_on_match_start !== undefined) {
          data.general.leave_on_match_start = configData.general.leave_on_match_start;
          console.log(`Leave on match start updated to: ${configData.general.leave_on_match_start}`);
          changed = true;
        }
        
        if (configData.general.should_track_matches !== undefined) {
          data.general.should_track_matches = configData.general.should_track_matches;
          console.log(`Should track matches updated to: ${configData.general.should_track_matches}`);
          changed = true;
        }
        
        if (configData.general.disable_playlist_restriction !== undefined) {
          data.general.disable_playlist_restriction = configData.general.disable_playlist_restriction;
          console.log(`Disable playlist restriction updated to: ${configData.general.disable_playlist_restriction}`);
          changed = true;
        }
        
        if (configData.general.start_accounts) {
          data.general.start_accounts = configData.general.start_accounts;
          console.log(`Start accounts updated to: ${configData.general.start_accounts}`);
          changed = true;
        }
        
        if (configData.general.starting_status) {
          data.general.starting_status = configData.general.starting_status;
          console.log(`Starting status updated to: ${configData.general.starting_status}`);
          changed = true;
        }
        
        if (configData.general.whitelist) {
          if (configData.general.whitelist.enabled !== undefined) {
            data.general.whitelist.enabled = configData.general.whitelist.enabled;
            console.log(`Whitelist enabled updated to: ${configData.general.whitelist.enabled}`);
            changed = true;
          }
          
          if (configData.general.whitelist.only_allow_whitelisted_joins !== undefined) {
            data.general.whitelist.only_allow_whitelisted_joins = configData.general.whitelist.only_allow_whitelisted_joins;
            console.log(`Only allow whitelisted joins updated to: ${configData.general.whitelist.only_allow_whitelisted_joins}`);
            changed = true;
          }
          
          if (configData.general.whitelist.users) {
            data.general.whitelist.users = [...configData.general.whitelist.users];
            console.log(`Whitelist users updated`);
            changed = true;
          }
        }
        
        if (configData.general.leave_time) {
          if (configData.general.leave_time.leave_type) {
            data.general.leave_time.leave_type = configData.general.leave_time.leave_type;
            console.log(`Leave type updated to: ${configData.general.leave_time.leave_type}`);
            changed = true;
          }
          
          if (configData.general.leave_time.time !== undefined) {
            data.general.leave_time.time = configData.general.leave_time.time;
            console.log(`Leave time updated to: ${configData.general.leave_time.time}`);
            changed = true;
          }
        }
        
        if (configData.general.in_use) {
          if (configData.general.in_use.status) {
            data.general.in_use.status = configData.general.in_use.status;
            console.log(`In use status updated to: ${configData.general.in_use.status}`);
            changed = true;
          }
          
          if (configData.general.in_use.type) {
            data.general.in_use.type = configData.general.in_use.type;
            console.log(`In use type updated to: ${configData.general.in_use.type}`);
            changed = true;
          }
        }
        
        if (configData.general.usable) {
          if (configData.general.usable.status) {
            data.general.usable.status = configData.general.usable.status;
            console.log(`Usable status updated to: ${configData.general.usable.status}`);
            changed = true;
          }
          
          if (configData.general.usable.type) {
            data.general.usable.type = configData.general.usable.type;
            console.log(`Usable type updated to: ${configData.general.usable.type}`);
            changed = true;
          }
        }
      } else {
        if (configData.character) {
          data.cosmetics.character.id = configData.character;
          data.cosmetics.character.styles = [];
          console.log(`Character updated to: ${configData.character} and styles reset`);
          changed = true;
        }
        
        if (configData.cosmetics && configData.cosmetics.character && configData.cosmetics.character.styles) {
          data.cosmetics.character.styles = [...configData.cosmetics.character.styles];
          console.log(`Character styles updated: ${JSON.stringify(data.cosmetics.character.styles)}`);
          changed = true;
        }
        
        if (configData.backpack) {
          data.cosmetics.backpack.id = configData.backpack;
          data.cosmetics.backpack.styles = [];
          console.log(`Backpack updated to: ${configData.backpack} and styles reset`);
          changed = true;
        }
        
        if (configData.cosmetics && configData.cosmetics.backpack && configData.cosmetics.backpack.styles) {
          data.cosmetics.backpack.styles = [...configData.cosmetics.backpack.styles];
          console.log(`Backpack styles updated: ${JSON.stringify(data.cosmetics.backpack.styles)}`);
          changed = true;
        }
        
        if (configData.emote) {
          data.cosmetics.eid = configData.emote;
          console.log(`Emote updated to: ${configData.emote}`);
          changed = true;
        }
        
        if (configData.level) {
          data.cosmetics.lvl = configData.level.toString();
          console.log(`Level updated to: ${configData.level}`);
          changed = true;
        }
        
        if (configData.banner) {
          data.cosmetics.banner.id = configData.banner;
          console.log(`Banner updated to: ${configData.banner}`);
          changed = true;
        }
        
        if (configData.bannerColor) {
          data.cosmetics.banner.color = configData.bannerColor;
          console.log(`Banner color updated to: ${configData.bannerColor}`);
          changed = true;
        }
        
        if (configData.cosmetics && configData.cosmetics.banner) {
          if (configData.cosmetics.banner.id) {
            data.cosmetics.banner.id = configData.cosmetics.banner.id;
            console.log(`Banner ID updated from cosmetics object: ${configData.cosmetics.banner.id}`);
            changed = true;
          }
          
          if (configData.cosmetics.banner.color) {
            data.cosmetics.banner.color = configData.cosmetics.banner.color;
            console.log(`Banner color updated from cosmetics object: ${configData.cosmetics.banner.color}`);
            changed = true;
          }
        }
      }
      
      if (!changed) {
        console.log('No changes detected, skipping file write');
        return;
      }
      
      const jsonString = JSON.stringify(data, null, 2);
      
      console.log('Writing to config file using direct fs.writeFileSync...');
      fs.writeFileSync(configPath, jsonString, 'utf8');
      console.log('Config saved with fs.writeFileSync');
      
      if (dashboardState && dashboardState.currentTab === 'cosmetics') {
        console.log('Refreshing cosmetics tab after config save');
        const contentContainer = document.getElementById('dashboard-content');
        if (contentContainer) {
          contentContainer.innerHTML = '';
          contentContainer.appendChild(createCosmeticsTab());
        }
      }
      
      addConsoleMessage('Settings saved successfully', 'success');
      return;
    } catch (fsError) {
      console.error('Standard fs approach failed:', fsError);
      addConsoleMessage(`Error saving settings: ${fsError.message}`, 'error');
      
      try {
        const { execSync } = require('child_process');
        const tempPath = path.join(__dirname, 'temp_config.json');
        
        let fileContent = fs.readFileSync(configPath, 'utf8');
        let data = JSON.parse(fileContent);
        
        if (configData.character) data.cosmetics.character.id = configData.character;
        if (configData.cosmetics && configData.cosmetics.character && configData.cosmetics.character.styles) {
          data.cosmetics.character.styles = [...configData.cosmetics.character.styles];
        }
        
        if (configData.backpack) data.cosmetics.backpack.id = configData.backpack;
        if (configData.cosmetics && configData.cosmetics.backpack && configData.cosmetics.backpack.styles) {
          data.cosmetics.backpack.styles = [...configData.cosmetics.backpack.styles];
        }
        
        if (configData.emote) data.cosmetics.eid = configData.emote;
        if (configData.level) data.cosmetics.lvl = configData.level.toString();
        if (configData.banner) data.cosmetics.banner.id = configData.banner;
        if (configData.bannerColor) data.cosmetics.banner.color = configData.bannerColor;
        
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
        
        const powershellCommand = `Copy-Item -Path "${tempPath.replace(/\\/g, '\\\\')}" -Destination "${configPath.replace(/\\/g, '\\\\')}" -Force`;
        execSync(`powershell -Command "${powershellCommand}"`, { encoding: 'utf8' });
        
        fs.unlinkSync(tempPath);
        
        console.log('Config saved with PowerShell method');
        addConsoleMessage('Settings saved successfully', 'success');
        return;
      } catch (psError) {
        console.error('PowerShell approach failed:', psError);
        addConsoleMessage(`Error saving settings: ${psError.message}`, 'error');
        
        try {
          addConsoleMessage('Trying alternative save method...', 'info');
          const jsonString = JSON.stringify(data, null, 2);
          fs.writeFileSync(path.join(__dirname, 'config_backup.json'), jsonString, 'utf8');
          addConsoleMessage('Backup saved to UI folder. Please manually copy it to BotLogic folder.', 'warning');
        } catch (finalError) {
          console.error('All save approaches failed:', finalError);
          addConsoleMessage('Could not save settings. Please check console for details.', 'error');
        }
      }
    }
  } catch (error) {
    console.error('All save approaches failed:', error);
    addConsoleMessage(`Error saving settings: ${error.message}. Please try again.`, 'error');
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showBannerSelectionModal(currentBannerId, configData) {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'rgba(10, 20, 30, 0.95)';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.3)';
  modalContent.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.style.padding = '15px';
  modalHeader.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Select Banner';
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.color = '#00c2ff';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => modalOverlay.remove());
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  const searchSection = document.createElement('div');
  searchSection.className = 'modal-search';
  searchSection.style.padding = '15px';
  searchSection.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  searchSection.style.display = 'flex';
  searchSection.style.gap = '10px';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search banners...';
  searchInput.style.flex = '1';
  searchInput.style.padding = '8px 12px';
  searchInput.style.borderRadius = '4px';
  searchInput.style.border = '1px solid rgba(0, 194, 255, 0.5)';
  searchInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  searchInput.style.color = 'white';
  
  const searchButton = document.createElement('button');
  searchButton.innerHTML = '<i class="fas fa-search"></i> Search';
  searchButton.style.padding = '8px 15px';
  searchButton.style.backgroundColor = '#00c2ff';
  searchButton.style.color = 'white';
  searchButton.style.border = 'none';
  searchButton.style.borderRadius = '4px';
  searchButton.style.cursor = 'pointer';
  
  searchSection.appendChild(searchInput);
  searchSection.appendChild(searchButton);
  modalContent.appendChild(searchSection);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'modal-results';
  contentArea.style.flex = '1';
  contentArea.style.padding = '15px';
  contentArea.style.overflowY = 'auto';
  contentArea.style.display = 'grid';
  contentArea.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
  contentArea.style.gap = '15px';
  contentArea.style.alignContent = 'start';
  
  const loadingMessage = document.createElement('div');
  loadingMessage.textContent = 'Loading banners...';
  loadingMessage.style.gridColumn = '1 / -1';
  loadingMessage.style.textAlign = 'center';
  loadingMessage.style.padding = '20px';
  contentArea.appendChild(loadingMessage);
  
  modalContent.appendChild(contentArea);
  
  fetch('https://fortnite-api.com/v1/banners', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    contentArea.innerHTML = '';
    
    if (data.status === 200 && data.data) {
      data.data.forEach(banner => {
        const bannerItem = createBannerItem(banner, currentBannerId, configData, modalOverlay);
        contentArea.appendChild(bannerItem);
      });
      
      searchButton.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        if (!query) return;
        
        const filtered = data.data.filter(banner => 
          banner.devName.toLowerCase().includes(query) || 
          banner.name.toLowerCase().includes(query) ||
          banner.id.toLowerCase().includes(query)
        );
        
        contentArea.innerHTML = '';
        
        if (filtered.length > 0) {
          filtered.forEach(banner => {
            const bannerItem = createBannerItem(banner, currentBannerId, configData, modalOverlay);
            contentArea.appendChild(bannerItem);
          });
        } else {
          const noResults = document.createElement('div');
          noResults.textContent = 'No banners found matching your search';
          noResults.style.gridColumn = '1 / -1';
          noResults.style.textAlign = 'center';
          noResults.style.padding = '20px';
          contentArea.appendChild(noResults);
        }
      });
      
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          searchButton.click();
        }
      });
    } else {
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'Error loading banners';
      errorMsg.style.gridColumn = '1 / -1';
      errorMsg.style.textAlign = 'center';
      errorMsg.style.padding = '20px';
      errorMsg.style.color = 'red';
      contentArea.appendChild(errorMsg);
    }
  })
  .catch(error => {
    console.error('Error fetching banners:', error);
    contentArea.innerHTML = '';
    const errorMsg = document.createElement('div');
    errorMsg.textContent = 'Error loading banners';
    errorMsg.style.gridColumn = '1 / -1';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.padding = '20px';
    errorMsg.style.color = 'red';
    contentArea.appendChild(errorMsg);
  });
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  setTimeout(() => searchInput.focus(), 100);
}

function showBannerColorSelectionModal(currentColorId, configData) {
  removeExistingModals();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'rgba(10, 20, 30, 0.95)';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.3)';
  modalContent.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.style.padding = '15px';
  modalHeader.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Select Banner Color';
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.color = '#00c2ff';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => modalOverlay.remove());
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'modal-results';
  contentArea.style.flex = '1';
  contentArea.style.padding = '15px';
  contentArea.style.overflowY = 'auto';
  contentArea.style.display = 'grid';
  contentArea.style.gridTemplateColumns = 'repeat(auto-fill, minmax(60px, 1fr))';
  contentArea.style.gap = '15px';
  contentArea.style.alignContent = 'start';
  
  const loadingMessage = document.createElement('div');
  loadingMessage.textContent = 'Loading banner colors...';
  loadingMessage.style.gridColumn = '1 / -1';
  loadingMessage.style.textAlign = 'center';
  loadingMessage.style.padding = '20px';
  contentArea.appendChild(loadingMessage);
  
  modalContent.appendChild(contentArea);
  
  contentArea.innerHTML = '';
  
  try {
    Object.entries(colorMap).forEach(([colorId, hexColor]) => {
      const colorData = {
        id: colorId,
        color: hexColor.replace('#', '') // Remove # for consistency with the old format
      };
      const colorItem = createBannerColorItem(colorData, currentColorId, configData, modalOverlay);
      contentArea.appendChild(colorItem);
    });
  } catch (error) {
    console.error('Error creating banner colors:', error);
    contentArea.innerHTML = '';
    const errorMsg = document.createElement('div');
    errorMsg.textContent = 'Error loading banner colors';
    errorMsg.style.gridColumn = '1 / -1';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.padding = '20px';
    errorMsg.style.color = 'red';
    contentArea.appendChild(errorMsg);
  }
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

function updateCosmeticContent(container, type, configData) {
  container.innerHTML = '';
  console.log('updateCosmeticContent is deprecated in the new UI design');
}

function fetchCosmeticDetails(type, itemId, iconElement, nameElement, styleButton, boxElement, configData) {
  if (!itemId || itemId === '') {
    iconElement.src = './assets/placeholder.png';
    nameElement.textContent = 'None Selected';
    return;
  }
  
  let apiType = type;
  if (type === 'character') apiType = 'outfit';
  if (type === 'backpack') apiType = 'backpack';
  if (type === 'emote') apiType = 'emote';
  
  if (type !== 'banner') {
    fetch(`https://fortnite-api.com/v2/cosmetics/br/${itemId}?responseFlags=0x7`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 200 && data.data) {
        iconElement.src = data.data.images.icon || data.data.images.smallIcon || './assets/placeholder.png';
        nameElement.textContent = data.data.name || 'Unknown';
        
        if (styleButton && (type === 'character' || type === 'backpack')) {
          const hasVariants = data.data.variants && data.data.variants.length > 0;
          
          if (boxElement) {
            boxElement.cosmeticData = data.data;
          }
          
          if (hasVariants) {
            styleButton.style.display = 'block';
            
            if (!styleButton.hasClickListener) {
              styleButton.addEventListener('click', () => {
                showStyleSelectionModal(data.data, type, configData);
              });
              styleButton.hasClickListener = true;
            }
          } else {
            styleButton.style.display = 'none';
          }
        }
      } else {
        iconElement.src = './assets/placeholder.png';
        nameElement.textContent = 'Unknown Item';
        if (styleButton) {
          styleButton.style.display = 'none';
        }
      }
    })
    .catch(error => {
      console.error(`Error fetching ${type} details:`, error);
      iconElement.src = './assets/placeholder.png';
      nameElement.textContent = 'Error Loading';
      if (styleButton) {
        styleButton.style.display = 'none';
      }
    });
  }
}

function fetchBannerDetails(bannerId, colorId, iconElement, nameElement, colorSquare, colorNameElement) {
  if (!iconElement || !nameElement) {
    console.warn('Banner elements not found in the DOM');
    return;
  }
  
  if (bannerId) {
    const bannerIconUrl = `https://fortnite-api.com/images/banners/${bannerId}/icon.png`;
    
    iconElement.src = bannerIconUrl;
    iconElement.onerror = () => {
      console.warn(`Failed to load banner icon for ${bannerId}, using fallback`);
      iconElement.src = 'https://fortnite-api.com/images/cosmetics/br/defaultbanner/icon.png';
    };
    
    console.log(`Setting initial banner name to ID: ${bannerId}`);
    nameElement.textContent = bannerId;
    
    fetch('https://fortnite-api.com/v1/banners', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 200 && data.data) {
        const bannerData = data.data.find(b => b.id === bannerId);
        if (bannerData) {
          if (bannerData.images && bannerData.images.icon) {
            iconElement.src = bannerData.images.icon;
          } else if (bannerData.imageUrl) {
            iconElement.src = bannerData.imageUrl;
          }
          
          console.log(`Banner API data for ${bannerId}:`, {
            id: bannerData.id,
            name: bannerData.name,
            devName: bannerData.devName
          });
          
        }
      }
    })
    .catch(error => {
      console.error('Error fetching banner details from API:', error);
    });
  } else {
    iconElement.src = 'https://fortnite-api.com/images/cosmetics/br/defaultbanner/icon.png';
    nameElement.textContent = 'Default';
  }
  
  if (colorId && colorSquare && colorNameElement) {
    const hexColor = colorMap[colorId] || '#7d7d7d';
    
    colorSquare.style.backgroundColor = hexColor;
    
    const colorNumber = colorId.replace('DefaultColor', '');
    colorNameElement.textContent = `Color ${colorNumber}`;
  } else if (colorSquare && colorNameElement) {
    colorSquare.style.backgroundColor = '#7d7d7d';
    colorNameElement.textContent = 'Default';
  }
}

function searchCosmetics(query, type, container, configData) {
  if (!query || query.trim() === '') {
    addConsoleMessage('Please enter a search term', 'warning');
    return;
  }
  
  container.innerHTML = '';
  
  
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'cosmetic-loading';
  loadingMsg.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Searching for cosmetics...';
  container.appendChild(loadingMsg);
  
  let apiType = type;
  if (type === 'character') apiType = 'outfit';
  if (type === 'backpack') apiType = 'backpack';
  if (type === 'emote') apiType = 'emote';
  if (type === 'banner') apiType = 'banner';
  
  fetch(`https://fortnite-api.com/v2/cosmetics/br/search/all?name=${encodeURIComponent(query)}&matchMethod=contains&type=${apiType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    container.innerHTML = '';
    console.log('Search response:', data);
    
    if (data.status === 200) {
      if (data.data) {
        let itemsToDisplay = [];
        
        if (!Array.isArray(data.data) && typeof data.data === 'object') {
          console.log('Single item result detected');
          itemsToDisplay = [data.data];
        }
        else if (Array.isArray(data.data)) {
          console.log('Array result detected with', data.data.length, 'items');
          itemsToDisplay = data.data;
        }
        
        if (itemsToDisplay.length > 0) {
          console.log('Processing', itemsToDisplay.length, 'cosmetic items');
          
          itemsToDisplay.sort((a, b) => a.name.localeCompare(b.name));
          
          const resultCount = document.createElement('div');
          resultCount.className = 'search-result-count';
          resultCount.textContent = `Found ${itemsToDisplay.length} ${type}${itemsToDisplay.length === 1 ? '' : 's'}`;
          resultCount.style.margin = '10px 0';
          resultCount.style.padding = '10px';
          resultCount.style.fontWeight = 'bold';
          resultCount.style.color = 'white';
          resultCount.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
          resultCount.style.borderRadius = '5px';
          resultCount.style.width = '100%';
          resultCount.style.textAlign = 'center';
          container.appendChild(resultCount);
          
          
          itemsToDisplay.forEach((item, index) => {
            console.log(`Adding item ${index + 1}/${itemsToDisplay.length}:`, item.id);
            try {
              if (!item.id || !item.name) {
                console.error('Item missing essential properties:', item);
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'Error: Invalid item data';
                errorMsg.style.color = 'red';
                errorMsg.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                errorMsg.style.padding = '5px';
                errorMsg.style.margin = '5px 0';
                container.appendChild(errorMsg);
                return; // Skip this item
              }
              
              
              addCosmeticItem(container, item, type, configData);
            } catch (error) {
              console.error('Error adding cosmetic item:', error);
              addConsoleMessage('Error displaying cosmetic: ' + error.message, 'error');
            }
          });
          return; // Successfully processed items
        }
      }
      
      container.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No results found. Try a different search term.</p></div>';
    } else {
      container.innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Error from API. Try a different search term.</p></div>';
      console.error('API Error:', data);
    }
  })
  .catch(error => {
    console.error('Error searching cosmetics:', error);
    container.innerHTML = `<div class="no-results"><i class="fas fa-exclamation-circle"></i><p>Error searching cosmetics. Please try again.</p></div>`;
    addConsoleMessage('Failed to search cosmetics: ' + error.message, 'error');
  });
}

function fetchCosmeticById(id, type, container, configData, isCurrentSelection = false) {
  if (isCurrentSelection) {
    container.innerHTML = `<div class="cosmetic-loading"><i class="fas fa-spinner fa-pulse"></i>Loading cosmetic...</div>`;
  }

  if (!id || id === '') {
    if (isCurrentSelection) {
      container.innerHTML = `<div class="current-selection-status"><i class="fas fa-info-circle"></i>No ${type} currently selected. Use the search to select one.</div>`;
    }
    return;
  }

  fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (isCurrentSelection) {
      container.innerHTML = '';
    }
    
    if (data.status === 200 && data.data) {
      addCosmeticItem(container, data.data, type, configData, isCurrentSelection);
    } else {
      if (isCurrentSelection) {
        container.innerHTML = `<div class="current-selection-status"><i class="fas fa-exclamation-triangle"></i>Current ${type} (ID: ${id}) could not be loaded. Search to select a new one.</div>`;
      }
    }
  })
  .catch(error => {
    console.error('Error fetching cosmetic:', error);
    if (isCurrentSelection) {
      container.innerHTML = `<div class="current-selection-status"><i class="fas fa-exclamation-circle"></i>Error loading ${type}. Please search to select a new one.</div>`;
    }
    addConsoleMessage('Failed to fetch cosmetic details: ' + error.message, 'error');
  });
}

function addCosmeticItem(container, item, type, configData) {
  if (!item || !item.images) {
    return;
  }
  
  const cosmeticItem = document.createElement('div');
  cosmeticItem.className = 'cosmetic-item';
  cosmeticItem.style.display = 'flex';
  cosmeticItem.style.margin = '4px 0';
  cosmeticItem.style.padding = '6px';
  cosmeticItem.style.borderRadius = '6px';
  cosmeticItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  cosmeticItem.style.width = 'calc(100% - 6px)';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'cosmetic-icon';
  iconDiv.style.width = '32px';
  iconDiv.style.height = '32px';
  iconDiv.style.flexShrink = '0';
  iconDiv.style.marginRight = '8px';

  const iconImg = document.createElement('img');
  iconImg.src = item.images.icon || item.images.smallIcon || './assets/placeholder.png';
  iconImg.alt = item.name;
  iconImg.loading = 'lazy';
  iconImg.style.width = '100%';
  iconImg.style.height = '100%';
  iconImg.style.objectFit = 'contain';
  iconImg.style.maxHeight = '32px';
  iconImg.style.maxWidth = '32px';
  iconDiv.appendChild(iconImg);

  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'cosmetic-details';
  detailsDiv.style.flexGrow = '1';
  detailsDiv.style.overflow = 'hidden';

  const nameElem = document.createElement('h3');
  nameElem.className = 'cosmetic-name';
  nameElem.textContent = item.name;
  nameElem.style.margin = '0 0 2px 0';
  nameElem.style.fontSize = '12px';
  nameElem.style.whiteSpace = 'nowrap';
  nameElem.style.overflow = 'hidden';
  nameElem.style.textOverflow = 'ellipsis';
  nameElem.style.color = 'white';
  detailsDiv.appendChild(nameElem);

  const rarityElem = document.createElement('div');
  let rarityClass = '';
  let rarityText = 'Common';
  
  try {
    if (item.rarity && item.rarity.value) {
      rarityClass = item.rarity.value.toLowerCase();
      rarityText = item.rarity.displayValue || rarityClass;
    }
  } catch (err) {
    console.error('Error with rarity:', err);
  }
  
  rarityElem.className = `cosmetic-rarity ${rarityClass}`;
  rarityElem.textContent = rarityText;
  rarityElem.style.fontSize = '12px';
  rarityElem.style.color = getRarityColor(rarityClass);
  detailsDiv.appendChild(rarityElem);

  cosmeticItem.appendChild(iconDiv);
  cosmeticItem.appendChild(detailsDiv);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '4px';
  buttonsContainer.style.marginLeft = '4px';
  buttonsContainer.style.alignSelf = 'center';

  const hasStyles = item.variants && item.variants.length > 0;

  if (hasStyles && (type === 'character' || type === 'backpack')) {
    const styleBtn = document.createElement('button');
    styleBtn.className = 'style-cosmetic';
    styleBtn.innerHTML = '<i class="fas fa-palette"></i>';
    styleBtn.style.padding = '4px';
    styleBtn.style.borderRadius = '4px';
    styleBtn.style.border = 'none';
    styleBtn.style.backgroundColor = '#9932CC';
    styleBtn.style.color = 'white';
    styleBtn.style.cursor = 'pointer';
    styleBtn.style.fontWeight = 'bold';
    styleBtn.style.fontSize = '10px';
    styleBtn.style.width = '26px';
    styleBtn.style.height = '26px';
    styleBtn.title = 'Select styles';
    
    styleBtn.addEventListener('click', () => {
      showStyleSelectionModal(item, type, configData);
    });
    
    buttonsContainer.appendChild(styleBtn);
  }

  const selectBtn = document.createElement('button');
  selectBtn.className = 'select-cosmetic';
  selectBtn.innerHTML = '<i class="fas fa-check"></i>';
  selectBtn.style.padding = '4px';
  selectBtn.style.borderRadius = '4px';
  selectBtn.style.border = 'none';
  selectBtn.style.backgroundColor = '#00c2ff';
  selectBtn.style.color = 'white';
  selectBtn.style.cursor = 'pointer';
  selectBtn.style.fontWeight = 'bold';
  selectBtn.style.fontSize = '10px';
  selectBtn.style.width = '26px';
  selectBtn.style.height = '26px';
  selectBtn.title = 'Select cosmetic';
  
  selectBtn.addEventListener('click', () => {
    selectCosmetic(item.id, type, configData);

    const originalText = selectBtn.innerHTML;
    selectBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
    selectBtn.style.backgroundColor = '#00ff7f';
    
    setTimeout(() => {
      selectBtn.innerHTML = originalText;
      selectBtn.style.backgroundColor = '#00c2ff';
    }, 1500);

    const selectedGrid = document.querySelector('.selected-grid');
    if (selectedGrid) {
      updateSelectedCosmetics(selectedGrid, configData);
    }

    addConsoleMessage(`Selected ${type}: ${item.name}`, 'success');
  });

  buttonsContainer.appendChild(selectBtn);
  cosmeticItem.appendChild(buttonsContainer);

  container.appendChild(cosmeticItem);
}

function showStyleSelectionModal(item, type, configData) {
  removeExistingModals();
  
  let tempStyles = [];
  if (type === 'character' && configData.cosmetics.character.styles) {
    tempStyles = JSON.parse(JSON.stringify(configData.cosmetics.character.styles));
  } else if (type === 'backpack' && configData.cosmetics.backpack.styles) {
    tempStyles = JSON.parse(JSON.stringify(configData.cosmetics.backpack.styles));
  }
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  modalOverlay.style.backdropFilter = 'blur(5px)';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'rgba(10, 20, 30, 0.95)';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.boxShadow = '0 0 20px rgba(0, 194, 255, 0.3)';
  modalContent.style.border = '1px solid rgba(0, 194, 255, 0.3)';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.style.padding = '15px';
  modalHeader.style.borderBottom = '1px solid rgba(0, 194, 255, 0.2)';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  let typeName = type === 'character' ? 'Skin' : type === 'backpack' ? 'Back Bling' : type;
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = `${item.name} Styles`;
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.color = '#00c2ff';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => modalOverlay.remove());
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'modal-styles';
  contentArea.style.flex = '1';
  contentArea.style.padding = '15px';
  contentArea.style.overflowY = 'auto';
  
  if (item.variants && item.variants.length > 0) {
    item.variants.forEach(variant => {
      const variantSection = document.createElement('div');
      variantSection.className = 'variant-section';
      variantSection.style.marginBottom = '20px';
      
      const variantTypeHeader = document.createElement('h3');
      variantTypeHeader.textContent = variant.type || 'STYLE';
      variantTypeHeader.style.margin = '0 0 10px 0';
      variantTypeHeader.style.fontSize = '16px';
      variantTypeHeader.style.color = '#00c2ff';
      variantTypeHeader.style.fontWeight = 'bold';
      variantTypeHeader.style.textTransform = 'uppercase';
      variantSection.appendChild(variantTypeHeader);
      
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'style-options';
      optionsContainer.style.display = 'flex';
      optionsContainer.style.flexWrap = 'nowrap';
      optionsContainer.style.overflowX = 'auto';
      optionsContainer.style.gap = '15px';
      optionsContainer.style.padding = '10px 0';
      
      if (variant.options && variant.options.length > 0) {
        variant.options.forEach(option => {
          const styleOption = document.createElement('div');
          styleOption.className = 'style-option';
          styleOption.style.display = 'flex';
          styleOption.style.flexDirection = 'column';
          styleOption.style.alignItems = 'center';
          styleOption.style.minWidth = '80px';
          styleOption.style.borderRadius = '8px';
          styleOption.style.padding = '10px';
          styleOption.style.cursor = 'pointer';
          styleOption.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          styleOption.style.border = '1px solid rgba(0, 194, 255, 0.1)';
          
          const isSelected = tempStyles.some(style => 
            style.channel === variant.channel && style.variant === option.tag
          );
          
          if (isSelected) {
            styleOption.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
            styleOption.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
            styleOption.style.border = '1px solid rgba(0, 194, 255, 0.5)';
          }
          
          const styleImage = document.createElement('img');
          styleImage.src = option.image || item.images.icon || './assets/placeholder.png';
          styleImage.alt = option.name;
          styleImage.style.width = '60px';
          styleImage.style.height = '60px';
          styleImage.style.objectFit = 'contain';
          styleImage.style.marginBottom = '8px';
          styleImage.style.borderRadius = '4px';
          styleOption.appendChild(styleImage);
          
          const styleName = document.createElement('div');
          styleName.textContent = option.name;
          styleName.style.fontSize = '12px';
          styleName.style.textAlign = 'center';
          styleName.style.whiteSpace = 'nowrap';
          styleName.style.overflow = 'hidden';
          styleName.style.textOverflow = 'ellipsis';
          styleName.style.width = '100%';
          styleOption.appendChild(styleName);
          
          styleOption.addEventListener('click', () => {
            
            const existingIndex = tempStyles.findIndex(style => 
              style.channel === variant.channel
            );
            
            if (existingIndex !== -1) {
              if (tempStyles[existingIndex].variant === option.tag) {
                tempStyles.splice(existingIndex, 1);
              } else {
                tempStyles[existingIndex] = { channel: variant.channel, variant: option.tag };
              }
            } else {
              tempStyles.push({ channel: variant.channel, variant: option.tag });
            }
            
            const allOptions = optionsContainer.querySelectorAll('.style-option');
            allOptions.forEach(opt => {
              opt.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
              opt.style.boxShadow = 'none';
              opt.style.border = '1px solid rgba(0, 194, 255, 0.1)';
            });
            
            const isNowSelected = tempStyles.some(style => 
              style.channel === variant.channel && style.variant === option.tag
            );
            
            if (isNowSelected) {
              styleOption.style.backgroundColor = 'rgba(0, 194, 255, 0.2)';
              styleOption.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
              styleOption.style.border = '1px solid rgba(0, 194, 255, 0.5)';
            }
          });
          
          optionsContainer.appendChild(styleOption);
        });
      }
      
      variantSection.appendChild(optionsContainer);
      contentArea.appendChild(variantSection);
    });
  } else {
    const noStyles = document.createElement('div');
    noStyles.textContent = 'This item does not have any styles available.';
    noStyles.style.textAlign = 'center';
    noStyles.style.padding = '20px';
    noStyles.style.color = 'rgba(255, 255, 255, 0.7)';
    contentArea.appendChild(noStyles);
  }
  
  modalContent.appendChild(contentArea);
  
  const buttonSection = document.createElement('div');
  buttonSection.style.padding = '15px';
  buttonSection.style.borderTop = '1px solid rgba(0, 194, 255, 0.2)';
  buttonSection.style.display = 'flex';
  buttonSection.style.justifyContent = 'space-between';
  
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset Styles';
  resetButton.style.padding = '8px 15px';
  resetButton.style.backgroundColor = 'rgba(255, 99, 71, 0.7)';
  resetButton.style.color = 'white';
  resetButton.style.border = 'none';
  resetButton.style.borderRadius = '4px';
  resetButton.style.cursor = 'pointer';
  
  resetButton.addEventListener('click', () => {
    tempStyles = [];
    
    modalOverlay.remove();
    showStyleSelectionModal(item, type, configData);
  });
  
  const doneButton = document.createElement('button');
  doneButton.textContent = 'Done';
  doneButton.style.padding = '8px 20px';
  doneButton.style.backgroundColor = '#00c2ff';
  doneButton.style.color = 'white';
  doneButton.style.border = 'none';
  doneButton.style.borderRadius = '4px';
  doneButton.style.cursor = 'pointer';
  doneButton.style.fontWeight = 'bold';
  
  doneButton.addEventListener('click', () => {
    const updateData = {
      cosmetics: {}
    };
    
    if (type === 'character') {
      updateData.cosmetics.character = {
        styles: tempStyles
      };
    } else if (type === 'backpack') {
      updateData.cosmetics.backpack = {
        styles: tempStyles
      };
    }
    
    saveConfigData(updateData);
    addConsoleMessage(`Styles saved for ${item.name}`, 'success');
    
    modalOverlay.remove();
    
    if (dashboardState && dashboardState.currentTab === 'cosmetics') {
      setTimeout(() => {
        const contentContainer = document.getElementById('dashboard-content');
        if (contentContainer) {
          contentContainer.innerHTML = '';
          contentContainer.appendChild(createCosmeticsTab());
        }
      }, 100); // Small delay to ensure config is saved first
    }
  });
  
  buttonSection.appendChild(resetButton);
  buttonSection.appendChild(doneButton);
  modalContent.appendChild(buttonSection);
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

function selectCosmetic(id, type, configData) {
  const updateData = {};
  
  if (type === 'character') {
    let newId;
    if (id.startsWith('Character_')) {
      newId = id;
    } else {
      newId = `Character_${id}`;
    }
    
    updateData.character = newId;
    updateData.cosmetics = {
      character: {
        id: newId,
        styles: [] // Always reset styles for consistency
      }
    };
    
    configData.cosmetics.character.id = newId;
    configData.cosmetics.character.styles = [];
    
    console.log(`Character set to ${newId}, styles reset`);
  } else if (type === 'backpack') {
    let newId;
    if (id.startsWith('Backpack_')) {
      newId = id;
    } else {
      newId = `Backpack_${id}`;
    }
    
    updateData.backpack = newId;
    updateData.cosmetics = {
      backpack: {
        id: newId,
        styles: [] // Always reset styles for consistency
      }
    };
    
    configData.cosmetics.backpack.id = newId;
    configData.cosmetics.backpack.styles = [];
    
    console.log(`Backpack set to ${newId}, styles reset`);
  } else if (type === 'emote') {
    updateData.emote = id;
    
    configData.cosmetics.eid = id;
  } else if (type === 'banner') {
    updateData.banner = id;
    
    configData.cosmetics.banner.id = id;
  }
  
  updateSelectedCosmetics(document.querySelector('.selected-cosmetics-container'), configData);
  
  saveConfigData(updateData);
  
  if (dashboardState && dashboardState.currentTab === 'cosmetics') {
    setTimeout(() => {
      const contentContainer = document.getElementById('dashboard-content');
      if (contentContainer) {
        contentContainer.innerHTML = '';
        contentContainer.appendChild(createCosmeticsTab());
      }
    }, 100); // Small delay to ensure config is saved first
  }
}

function updateSelectedCosmetics(container, configData) {
  if (!container) {
    console.log('Selected cosmetics container not found, skipping update');
    return;
  }
  
  container.innerHTML = '';
  
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.gap = '10px';
  container.style.justifyContent = 'space-between';
  
  const types = [
    { type: 'character', label: 'Character', id: configData.cosmetics.character.id, apiType: 'outfit' },
    { type: 'backpack', label: 'Back Bling', id: configData.cosmetics.backpack.id, apiType: 'backpack' },
    { type: 'emote', label: 'Emote', id: configData.cosmetics.eid, apiType: 'emote' },
    { type: 'banner', label: 'Banner', id: configData.cosmetics.banner.id, apiType: 'banner' }
  ];
  
  types.forEach(item => {
    const selectedItem = document.createElement('div');
    selectedItem.className = 'selected-cosmetic';
    selectedItem.style.display = 'flex';
    selectedItem.style.alignItems = 'center';
    selectedItem.style.padding = '5px';
    selectedItem.style.borderRadius = '5px';
    selectedItem.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'selected-cosmetic-icon';
    iconWrapper.style.width = '40px';
    iconWrapper.style.height = '40px';
    iconWrapper.style.flexShrink = '0';
    iconWrapper.style.marginRight = '8px';
    
    const icon = document.createElement('img');
    icon.src = './assets/loading.gif';
    icon.alt = 'Loading...';
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.style.objectFit = 'contain';
    iconWrapper.appendChild(icon);
    
    const textContainer = document.createElement('div');
    textContainer.style.overflow = 'hidden';
    textContainer.style.flexGrow = '1';
    
    const typeLabel = document.createElement('div');
    typeLabel.className = 'selected-cosmetic-type';
    typeLabel.textContent = item.label;
    typeLabel.style.fontSize = '11px';
    typeLabel.style.color = 'rgba(255, 255, 255, 0.7)';
    typeLabel.style.fontWeight = 'bold';
    
    const name = document.createElement('div');
    name.className = 'selected-cosmetic-name';
    name.textContent = 'Loading...';
    name.style.fontSize = '13px';
    name.style.whiteSpace = 'nowrap';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.maxWidth = '100%';
    
    textContainer.appendChild(typeLabel);
    textContainer.appendChild(name);
    
    selectedItem.appendChild(iconWrapper);
    selectedItem.appendChild(textContainer);
    container.appendChild(selectedItem);
    
    if (!item.id || item.id === '') {
      name.textContent = 'None Selected';
      icon.src = 'https://cdn.ajaxfnc.com/uploads/.%2FnoImageFound.png';
      return;
    }
    
    fetch(`https://fortnite-api.com/v2/cosmetics/br/${item.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 200 && data.data) {
        icon.src = data.data.images.icon || data.data.images.smallIcon || '';
        name.textContent = data.data.name;
      } else {
        icon.src = './assets/placeholder.png';
        name.textContent = 'Unknown Cosmetic';
      }
    })
    .catch(error => {
      console.error(`Error fetching details for ${item.type}:`, error);
      icon.src = './assets/placeholder.png';
      name.textContent = 'Error Loading';
    });
  });
}

function getRarityColor(rarity) {
  switch (rarity) {
    case 'common':
      return '#b1b1b1';
    case 'uncommon':
      return '#60d394';
    case 'rare':
      return '#4d96f0';
    case 'epic':
      return '#c359ff';
    case 'legendary':
      return '#f5ae41';
    case 'icon':
      return '#5cf2f3';
    case 'mythic':
      return '#ff8f52';
    default:
      return 'white';
  }
}

function createErrorMessage(message) {
  const container = document.createElement('div');
  container.className = 'error-container';
  
  const icon = document.createElement('div');
  icon.className = 'error-icon';
  icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
  container.appendChild(icon);
  
  const heading = document.createElement('h2');
  heading.textContent = 'Error';
  container.appendChild(heading);
  
  const text = document.createElement('p');
  text.textContent = message;
  container.appendChild(text);
  
  return container;
}