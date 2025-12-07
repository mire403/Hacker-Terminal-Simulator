
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MatrixRain from './components/MatrixRain';
import CRTOverlay from './components/CRTOverlay';
import { GameMode, LogEntry, LogType, FileSystemNode, PasswordGameData, DecryptionGameData, TraceGameData } from './types';
import { ASCII_HEADER, HELP_TEXT, generateFilesystem, PASSWORD_LIST_EASY, PASSWORD_LIST_HARD } from './constants';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.BOOT);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystemNode>(generateFilesystem());
  
  // Terminal History State
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Game Specific State
  const [passwordGame, setPasswordGame] = useState<PasswordGameData | null>(null);
  const [decryptionGame, setDecryptionGame] = useState<DecryptionGameData | null>(null);
  const [traceGame, setTraceGame] = useState<TraceGameData | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const traceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Helpers ---

  const addLog = useCallback((text: string, type: LogType = LogType.INFO) => {
    setLogs(prev => [...prev, { id: generateId(), text, type }]);
  }, []);

  const addMultiLog = useCallback((text: string, type: LogType = LogType.INFO) => {
    const lines = text.split('\n');
    const newLogs = lines.map(line => ({ id: generateId(), text: line, type }));
    setLogs(prev => [...prev, ...newLogs]);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, gameMode, traceGame]);

  // Focus input
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    document.addEventListener('click', focusInput);
    focusInput();
    return () => document.removeEventListener('click', focusInput);
  }, []);

  // --- Game Logic Sequences ---

  // Boot Sequence
  useEffect(() => {
    if (gameMode === GameMode.BOOT) {
      // Re-generate filesystem on boot/retry
      setFileSystem(generateFilesystem()); 
      
      const bootSequence = async () => {
        addLog("Initializing Kernel...", LogType.SYSTEM);
        await new Promise(r => setTimeout(r, 600));
        addLog("Loading Drivers...", LogType.SYSTEM);
        await new Promise(r => setTimeout(r, 600));
        addLog("Connecting to NeuroLink...", LogType.SYSTEM);
        await new Promise(r => setTimeout(r, 800));
        addLog("Connection Established.", LogType.SUCCESS);
        await new Promise(r => setTimeout(r, 400));
        addMultiLog(ASCII_HEADER, LogType.SUCCESS);
        addLog("Type 'help' for available commands.", LogType.WARNING);
        setGameMode(GameMode.MENU);
      };
      bootSequence();
    }
  }, [gameMode, addLog, addMultiLog]);

  // --- Trace Minigame Logic ---
  useEffect(() => {
    if (gameMode === GameMode.TRACE && traceGame) {
      if (traceGame.timeLeft <= 0) {
         setGameMode(GameMode.GAME_OVER);
         addLog("!!! TRACE COMPLETE. CONNECTION TERMINATED !!!", LogType.ERROR);
         addLog("Type 'retry' to re-establish connection.", LogType.INFO);
         if (traceTimerRef.current) clearInterval(traceTimerRef.current);
         return;
      }

      traceTimerRef.current = setInterval(() => {
        setTraceGame(prev => prev ? ({ ...prev, timeLeft: prev.timeLeft - 1 }) : null);
      }, 1000);

      return () => {
        if (traceTimerRef.current) clearInterval(traceTimerRef.current);
      };
    }
  }, [gameMode, traceGame?.timeLeft]);

  const triggerTraceEvent = (returnMode: GameMode) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTraceGame({
      targetCode: `OVERRIDE-${code}`,
      timeLeft: 12, // 12 Seconds to type it
      totalTime: 12,
      returnMode: returnMode
    });
    setGameMode(GameMode.TRACE);
    addLog("⚠️ WARNING: INTRUSION DETECTION SYSTEM ACTIVE ⚠️", LogType.ERROR);
    addLog(`TRACE IN PROGRESS. ENTER OVERRIDE CODE: OVERRIDE-${code}`, LogType.WARNING);
  };

  const handleTraceInput = (inputCmd: string) => {
    if (!traceGame) return;
    
    if (inputCmd === traceGame.targetCode) {
      addLog(">> OVERRIDE SUCCESSFUL. TRACE EVADED.", LogType.SUCCESS);
      setGameMode(traceGame.returnMode);
      setTraceGame(null);
    } else {
      addLog(`INVALID CODE. TRACE PROGRESS: ${Math.floor(((traceGame.totalTime - traceGame.timeLeft) / traceGame.totalTime) * 100)}%`, LogType.ERROR);
    }
  };


  // --- Command Processing ---

  const resolvePath = (path: string[]): FileSystemNode | null => {
    let current = fileSystem;
    for (const p of path) {
      if (current.children && current.children[p]) {
        current = current.children[p];
      } else {
        return null;
      }
    }
    return current;
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add to History
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const [command, ...args] = trimmed.split(' ');
    const arg = args.join(' ');

    addLog(`guest@mainframe: ${currentPath.join('/') || '/'} $ ${trimmed}`, LogType.INFO);

    // Global Commands
    if (command === 'clear') {
      setLogs([]);
      return;
    }
    if (command === 'exit') {
      addLog("Terminating session...", LogType.ERROR);
      setTimeout(() => window.location.reload(), 1500);
      return;
    }

    // Mode Specific Logic
    switch (gameMode) {
      case GameMode.MENU:
        handleMenuCommands(command, arg);
        break;
      case GameMode.DIRECTORY_HUNT:
        // Random Trace Chance (10%)
        if (Math.random() < 0.1) {
             triggerTraceEvent(GameMode.DIRECTORY_HUNT);
             return; 
        }
        handleDirectoryHuntCommands(command, arg);
        break;
      case GameMode.TRACE:
        handleTraceInput(trimmed);
        break;
      case GameMode.PASSWORD_CRACKER:
        handlePasswordGameInput(trimmed.toUpperCase());
        break;
      case GameMode.DECRYPTION:
        handleDecryptionInput(trimmed);
        break;
      case GameMode.WIN:
        if (command === 'reboot') window.location.reload();
        break;
      case GameMode.GAME_OVER:
        if (command === 'retry') window.location.reload();
        break;
      default:
        break;
    }
  };

  // 1. Menu Mode
  const handleMenuCommands = (command: string, arg: string) => {
    switch (command) {
      case 'help':
        addMultiLog(HELP_TEXT, LogType.SYSTEM);
        break;
      case 'start':
        setGameMode(GameMode.DIRECTORY_HUNT);
        addLog("--- INITIATING PHASE 1: RECONNAISSANCE ---", LogType.WARNING);
        addLog("OBJECTIVE: Find the 'key_fragment.dat' file in the filesystem to retrieve the access code.", LogType.INFO);
        break;
      default:
        addLog(`Command not found: ${command}. Type 'help' for options.`, LogType.ERROR);
    }
  };

  // 2. Directory Hunt Mode (Bash Simulation)
  const handleDirectoryHuntCommands = (command: string, arg: string) => {
    const currentNode = resolvePath(currentPath);

    switch (command) {
      case 'help':
        addMultiLog(`COMMANDS: ls, cd [dir], cat [file], pwd`, LogType.SYSTEM);
        break;
      case 'pwd':
        addLog(`/${currentPath.join('/')}`, LogType.INFO);
        break;
      case 'ls':
        if (!currentNode || currentNode.type !== 'dir' || !currentNode.children) {
          addLog("Error: Invalid directory", LogType.ERROR);
          return;
        }
        const files = Object.values(currentNode.children).map(n => 
          n.type === 'dir' ? `${n.name}/` : n.name
        ).join('  ');
        addLog(files, LogType.SUCCESS);
        break;
      case 'cd':
        if (!arg) {
          setCurrentPath([]);
          return;
        }
        if (arg === '..') {
          if (currentPath.length > 0) {
            setCurrentPath(prev => prev.slice(0, -1));
          }
          return;
        }
        // Simple relative path
        if (currentNode?.children && currentNode.children[arg] && currentNode.children[arg].type === 'dir') {
          setCurrentPath(prev => [...prev, arg]);
        } else {
          addLog(`cd: ${arg}: No such directory`, LogType.ERROR);
        }
        break;
      case 'cat':
        if (!arg) {
          addLog("usage: cat [filename]", LogType.WARNING);
          return;
        }
        if (currentNode?.children && currentNode.children[arg] && currentNode.children[arg].type === 'file') {
          const content = currentNode.children[arg].content || "";
          addLog(content, LogType.SUCCESS);
          
          // Win condition for Phase 1
          if (content.includes("CODE_FRAGMENT")) {
             addLog(">> DATA FRAGMENT ACQUIRED.", LogType.SUCCESS);
             // Trigger a trace event before allowing them to proceed
             triggerTraceEvent(GameMode.PASSWORD_CRACKER); 
          }
        } else {
          addLog(`cat: ${arg}: No such file`, LogType.ERROR);
        }
        break;
      default:
        addLog(`Command not found: ${command}`, LogType.ERROR);
    }
  };

  // 3. Password Game Logic
  // Called after Trace success if transitioning from DIRECTORY_HUNT -> PASSWORD_CRACKER
  useEffect(() => {
     if (gameMode === GameMode.PASSWORD_CRACKER && !passwordGame) {
        const words = PASSWORD_LIST_EASY;
        const target = words[Math.floor(Math.random() * words.length)];
        setPasswordGame({
          words,
          target,
          attemptsLeft: 4
        });
        addLog("--- PHASE 2: SECURITY BYPASS ---", LogType.WARNING);
        addLog(`Target Password Length: ${target.length}. Possible matches:`, LogType.INFO);
        addLog(words.join('  '), LogType.SYSTEM);
        addLog("Enter the correct password to bypass the firewall.", LogType.INFO);
     }
  }, [gameMode, passwordGame, addLog]);


  const handlePasswordGameInput = (guess: string) => {
    if (!passwordGame) return;

    if (!passwordGame.words.includes(guess)) {
      addLog("Error: Invalid token. Select from the list.", LogType.ERROR);
      return;
    }

    if (guess === passwordGame.target) {
      addLog(">> ACCESS GRANTED.", LogType.SUCCESS);
      addLog(">> DECRYPTING FINAL PAYLOAD...", LogType.WARNING);
      setTimeout(initDecryptionGame, 2000);
    } else {
      // Calculate matching characters
      let matches = 0;
      for (let i = 0; i < passwordGame.target.length; i++) {
        if (guess[i] === passwordGame.target[i]) matches++;
      }
      
      const newAttempts = passwordGame.attemptsLeft - 1;
      setPasswordGame(prev => prev ? ({ ...prev, attemptsLeft: newAttempts }) : null);

      addLog(`Entry Denied. ${matches}/${passwordGame.target.length} correct.`, LogType.ERROR);
      addLog(`Attempts remaining: ${newAttempts}`, LogType.WARNING);

      if (newAttempts <= 0) {
        setGameMode(GameMode.GAME_OVER);
        addLog("!!! SYSTEM LOCKDOWN INITIATED !!!", LogType.ERROR);
        addLog("Type 'retry' to restart.", LogType.INFO);
      }
    }
  };

  // 4. Decryption Game Logic
  const initDecryptionGame = () => {
    setGameMode(GameMode.DECRYPTION);
    const num = Math.floor(Math.random() * 255);
    const hex = num.toString(16).toUpperCase().padStart(2, '0');
    setDecryptionGame({
      encrypted: `0x${hex}`,
      solution: num.toString(),
      hint: "Convert HEX to DECIMAL"
    });
    addLog("--- PHASE 3: CORE DECRYPTION ---", LogType.WARNING);
    addLog(`Encrypted Packet Received: 0x${hex}`, LogType.SYSTEM);
    addLog("Enter the decimal value to decrypt.", LogType.INFO);
  };

  const handleDecryptionInput = (input: string) => {
    if (!decryptionGame) return;

    if (input === decryptionGame.solution) {
      setGameMode(GameMode.WIN);
      addLog(">> DECRYPTION SUCCESSFUL.", LogType.SUCCESS);
      addLog(">> MAINFRAME CONTROL: ACTIVE", LogType.SUCCESS);
      addMultiLog(`
      SYSTEM BREACH COMPLETE
      ----------------------
      YOU ARE NOW ROOT.
      
      THANKS FOR PLAYING.
      Type 'reboot' to restart.
      `, LogType.SUCCESS);
    } else {
      addLog("Decryption Failed. Incorrect value.", LogType.ERROR);
    }
  };

  // --- Input Handling & Smart Features ---

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // History Navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
    // Tab Completion
    else if (e.key === 'Tab') {
      e.preventDefault();
      if (gameMode === GameMode.DIRECTORY_HUNT) {
        const parts = input.split(' ');
        const partial = parts[parts.length - 1];
        const currentNode = resolvePath(currentPath);
        
        if (currentNode && currentNode.children && partial) {
          const matches = Object.keys(currentNode.children).filter(k => k.startsWith(partial));
          if (matches.length === 1) {
            // Complete it
            parts[parts.length - 1] = matches[0];
            setInput(parts.join(' '));
          } else if (matches.length > 1) {
             // Show options? For now just stay silent or maybe flash input
             // Simple version: just autocomplete first match
             parts[parts.length - 1] = matches[0];
             setInput(parts.join(' '));
          }
        }
      }
    }
    // Command Execution
    else if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  // --- Render ---

  // Trace Alert UI
  const isTraceActive = gameMode === GameMode.TRACE && traceGame;
  
  return (
    <div className={`relative w-screen h-screen bg-black text-green-500 overflow-hidden flex flex-col items-center justify-center p-4 terminal-text animate-text-flicker ${isTraceActive ? 'animate-pulse' : ''}`}>
      <MatrixRain />
      <CRTOverlay />
      
      {/* Trace Alert Overlay */}
      {isTraceActive && (
        <div className="absolute top-10 left-0 w-full text-center z-50 pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-bold text-red-600 bg-black/80 inline-block px-6 py-2 border border-red-600">
            TRACE DETECTED
          </h1>
          <p className="text-2xl text-red-500 mt-2 bg-black/80 inline-block px-4">
            CONNECTION SEVERED IN: {(traceGame.timeLeft).toFixed(1)}s
          </p>
        </div>
      )}

      {/* Main Terminal Container */}
      <div className={`relative z-10 w-full max-w-4xl h-full max-h-[90vh] bg-black bg-opacity-90 border rounded shadow-[0_0_50px_rgba(0,255,0,0.15)] flex flex-col p-6 backdrop-blur-sm transition-colors duration-200
         ${isTraceActive ? 'border-red-600 shadow-[0_0_50px_rgba(255,0,0,0.3)]' : 'border-green-700/50'}
      `}>
        
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm md:text-base leading-relaxed break-words pb-4 pr-2">
          {logs.map((log) => (
            <div key={log.id} className={`${log.type} mb-1 whitespace-pre-wrap`}>
              {log.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className={`flex items-center font-mono text-base md:text-lg border-t pt-4 ${isTraceActive ? 'text-red-500 border-red-900/50' : 'text-green-500 border-green-900/50'}`}>
           <span className="mr-3 hidden md:inline opacity-80">
             {gameMode === GameMode.BOOT ? 'booting...' : 
              (isTraceActive ? 'ALERT!!!' :
              (currentPath.length > 0 ? `${currentPath[currentPath.length-1]} $` : 'guest@mainframe ~$'))}
           </span>
           <span className="mr-2 md:hidden">$</span>
           <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent border-none outline-none terminal-text focus:ring-0 ${isTraceActive ? 'text-red-500 placeholder-red-800' : 'text-green-400 placeholder-green-800'}`}
            placeholder={gameMode === GameMode.BOOT ? "" : (isTraceActive ? "ENTER OVERRIDE CODE..." : "awaiting command...")}
            disabled={gameMode === GameMode.BOOT}
            autoComplete="off"
            autoFocus
           />
        </div>
      </div>
    </div>
  );
};

export default App;
