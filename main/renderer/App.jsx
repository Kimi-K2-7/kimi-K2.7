import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

export default function App() {
  const [task, setTask] = useState('');
  const [agents, setAgents] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Listen for live updates from the SwarmOrchestrator
    ipcRenderer.on('swarm-update', (event, activeAgents) => {
      setAgents(activeAgents);
    });

    return () => {
      ipcRenderer.removeAllListeners('swarm-update');
    };
  }, []);

  const handleDispatch = async () => {
    setIsRunning(true);
    // Send task to the main process to trigger the 300-agent swarm
    await ipcRenderer.invoke('start-swarm-task', task);
    setIsRunning(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Main Workspace */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#0f172a', color: 'white' }}>
        <h2>🐝 Kimi K2.7 Swarm Workstation</h2>
        <p>Distribute your task across up to 300 MCP-enabled agents.</p>
        
        <textarea 
          style={{ width: '100%', height: '150px', backgroundColor: '#1e293b', color: '#fff', padding: '10px' }}
          placeholder="Enter your complex task (e.g., 'Analyze 100 competitor ad campaigns')..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        
        <button 
          onClick={handleDispatch}
          disabled={isRunning}
          style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {isRunning ? 'Swarm is active...' : 'Dispatch Swarm'}
        </button>
      </div>

      {/* ThoughtStream Visualizer (Sidebar) */}
      <div style={{ width: '350px', backgroundColor: '#1e293b', borderLeft: '1px solid #334155', padding: '20px', overflowY: 'auto' }}>
        <h3 style={{ color: '#fff' }}>🧠 ThoughtStream</h3>
        <p style={{ color: '#94a3b8', fontSize: '12px' }}>Live mapping of active sub-agents.</p>
        
        {agents.map(([id, data]) => (
          <div key={id} style={{ 
            marginBottom: '10px', 
            padding: '10px', 
            backgroundColor: data.status === 'completed' ? '#065f46' : '#3b82f6',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px'
          }}>
            <strong>{id}</strong> - {data.status}
            <div style={{ opacity: 0.8, marginTop: '4px' }}>{data.task.substring(0, 40)}...</div>
          </div>
        ))}
      </div>

    </div>
  );
}
