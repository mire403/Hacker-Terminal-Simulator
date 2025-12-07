
import { FileSystemNode } from "./types";

export const ASCII_HEADER = `
  _   _  ______ _______ _____  _    _ _   _ _   _ ______ _____  
 | \\ | |/ _____|__   __|  __ \\| |  | | \\ | | \\ | |  ____|  __ \\ 
 |  \\| | |        | |  | |__) | |  | |  \\| |  \\| | |__  | |__) |
 | . \` | |  ___   | |  |  _  /| |  | | . \` | . \` |  __| |  _  / 
 | |\\  | |__|  |  | |  | | \\ \\| |__| | |\\  | |\\  | |____| | \\ \\ 
 |_| \\_|\\______|  |_|  |_|  \\_\\____/|_| \\_|_| \\_|______|_|  \\_\\
                                                                
      >>> SYSTEM ACCESS TERMINAL v4.0.2 <<<
`;

export const HELP_TEXT = `
AVAILABLE COMMANDS:
-------------------
help        : Show this message
clear       : Clear terminal output
ls          : List directory contents
cd [dir]    : Change directory
cat [file]  : Read file content
start       : Begin breach protocol
exit        : Abort session
`;

export const PASSWORD_LIST_EASY = [
  "ACCESS", "SYSTEM", "HACKER", "SERVER", "BINARY", "CODING", "SCRIPT", "BYPASS"
];

export const PASSWORD_LIST_HARD = [
  "MAINFRAME", "ENCRYPTION", "FIREWALL", "PROTOCOL", "DATABASE", "ALGORITHM", "BACKDOOR"
];

/**
 * Generates a randomized filesystem.
 * The key_fragment.dat will be hidden in one of several candidate locations.
 */
export const generateFilesystem = (): FileSystemNode => {
  const fragment = "CODE_FRAGMENT: 7B3A";
  
  // Base structure
  const root: FileSystemNode = {
    name: "root",
    type: "dir",
    children: {
      "sys": {
        name: "sys",
        type: "dir",
        children: {
          "config.txt": { name: "config.txt", type: "file", content: "sys_ver=4.0.2\nsecurity_level=HIGH" },
          "logs": { 
            name: "logs", 
            type: "dir", 
            children: {
              "error.log": { name: "error.log", type: "file", content: "[ERR] Failed login attempt from IP 192.168.X.X" }
            }
          }
        }
      },
      "home": {
        name: "home",
        type: "dir",
        children: {
          "guest": {
            name: "guest",
            type: "dir",
            children: {
              "notes.txt": { name: "notes.txt", type: "file", content: "Don't forget to backup the data." },
              "todo.md": { name: "todo.md", type: "file", content: "- Update firewall\n- Rotate encryption keys" }
            }
          }
        }
      },
      "var": {
        name: "var",
        type: "dir",
        children: {
          "spool": {
             name: "spool",
             type: "dir",
             children: {
               "mail": { name: "mail", type: "dir", children: {} }
             }
          }
        }
      },
      "opt": {
        name: "opt",
        type: "dir",
        children: {
          "backup": {
            name: "backup",
            type: "dir",
            children: {
              "archive.tar": { name: "archive.tar", type: "file", content: "Binary data..." }
            }
          }
        }
      },
      "readme.txt": { name: "readme.txt", type: "file", content: "Welcome to NetRunner.\nUse 'ls' to look around.\nUse 'cd' to move folders.\nUse 'cat' to read files.\nFind the code to proceed." }
    }
  };

  // Logic to hide the key randomly
  const candidatePaths = [
    ['home', 'guest', 'documents'],
    ['var', 'spool', 'mail'],
    ['opt', 'backup'],
    ['sys', 'logs', 'audit']
  ];

  const choice = Math.floor(Math.random() * candidatePaths.length);
  const selectedPath = candidatePaths[choice];

  // Traverse and create path if needed
  let current = root;
  for (const part of selectedPath) {
    if (!current.children) current.children = {};
    if (!current.children[part]) {
      current.children[part] = { name: part, type: 'dir', children: {} };
    }
    current = current.children[part];
  }

  // Plant the file
  if (current.children) {
    current.children["key_fragment.dat"] = { 
      name: "key_fragment.dat", 
      type: "file", 
      content: fragment 
    };
    
    // Add a decoy file
    current.children["sys_dump.log"] = {
      name: "sys_dump.log",
      type: "file",
      content: "System dump 0xFA42... No critical data found."
    };
  }

  return root;
};
