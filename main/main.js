const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const SwarmOrchestrator = require('./SwarmOrchestrator');

// Initialize the local Express server for the Swarm Bridge (API compatibility)
const bridgeServer = express();
bridgeServer.use(express.json());

let mainWindow;

function createWindow() {
  // Create the browser window with Chromium engine
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // For MVP simplicity. In prod, use preload scripts.
    }
  });

  // Load the React frontend
  // In development, this would be a localhost URL from Vite
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  // Start the Swarm Bridge API on port 11434 (Standard local AI port)
  bridgeServer.post('/v1/chat/completions', async (req, res) => {
    // Intercept requests from Cursor/Claude Code and route to our Swarm
    const { messages } = req.body;
    
    // Apply Local Token Optimizer logic here before sending to API
    const compressedPrompt = optimizeTokens(messages);
    
    // Dispatch to the Swarm
    const response = await SwarmOrchestrator.dispatchTask(compressedPrompt);
    res.json(response);
  });

  bridgeServer.listen(11434, () => {
    console.log('Swarm Bridge running on http://localhost:11434');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Simple token compression mock (Local Token Optimizer)
function optimizeTokens(messages) {
  // E.g., remove redundant system prompts, compress context
  return messages; 
}

// IPC listener for UI commands
ipcMain.handle('start-swarm-task', async (event, taskDescription) => {
  return await SwarmOrchestrator.dispatchTask(taskDescription, mainWindow);
});
