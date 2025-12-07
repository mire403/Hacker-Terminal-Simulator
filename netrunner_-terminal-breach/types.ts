
export enum GameMode {
  BOOT = 'BOOT',
  MENU = 'MENU',
  DIRECTORY_HUNT = 'DIRECTORY_HUNT',
  TRACE = 'TRACE',
  PASSWORD_CRACKER = 'PASSWORD_CRACKER',
  DECRYPTION = 'DECRYPTION',
  WIN = 'WIN',
  GAME_OVER = 'GAME_OVER'
}

export enum LogType {
  INFO = 'text-green-400',
  SUCCESS = 'text-green-300 font-bold',
  ERROR = 'text-red-500',
  WARNING = 'text-yellow-400',
  SYSTEM = 'text-blue-400'
}

export interface LogEntry {
  id: string;
  text: string;
  type: LogType;
  delay?: number; // For typing effect delay
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'dir';
  content?: string; // For files
  children?: { [key: string]: FileSystemNode }; // For dirs
  locked?: boolean;
}

export interface PasswordGameData {
  words: string[];
  target: string;
  attemptsLeft: number;
}

export interface DecryptionGameData {
  encrypted: string;
  solution: string;
  hint: string;
}

export interface TraceGameData {
  targetCode: string;
  timeLeft: number;
  totalTime: number;
  returnMode: GameMode; // To resume where we left off
}
