// TournamentLiveStream.tsx - Real live chess viewing with chessboard.js
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import '../components/ui/TournamentLiveStream.css';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Types
interface Tournament {
  id: string;
  name: string;
  status: string;
  currentStage: number;
  bracketName: string;
  maxPlayers: number;
  entryFee: number;
  prize: number;
}

interface Player {
  lichessId: string;
  username: string;
  rating: number;
  title: string | null;
}

interface Match {
  gameId: string;
  player1: string;
  player2: string;
  lichessUrl: string;
  result: string;
  winner: string | null;
  state?: any;
}

interface ChatMessage {
  username: string;
  lichessId: string;
  message: string;
  timestamp: Date;
  tournamentId: string;
}

interface GameState {
  moves: string;
  wtime?: number; // anchor time for white (ms) at the last server event
  btime?: number; // anchor time for black (ms) at the last server event
  status: string;
  winner?: string;
  // זמן האירוע כפי שהתרחש בשרת (בקירוב), לא זמן הקבלה אצלנו
  anchorServerTime?: number;
  // בתור מי? נגזר מה-FEN
  activeColor?: 'w' | 'b';
}

// שעון מסונכרן לשרת (offset, rtt)
interface ClockSync {
  offsetMs: number; // serverNow ≈ clientNow + offsetMs
  rttMs: number;    // round-trip time estimation
  lastSyncAt: number; // client Date.now() when last sync finished
}

const TournamentLiveStream: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  
  // State
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [viewers, setViewers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [debug, setDebug] = useState<string[]>([]);
  
  // Client animation tick (UI-only)
const [, setTick] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 100); // 10Hz
    return () => clearInterval(id);
  }, []);

  // ---------- Clock Sync (frontend-only) ----------
  const [clockSync, setClockSync] = useState<ClockSync>({
    offsetMs: 0,
    rttMs: 300,
    lastSyncAt: 0,
  });

  const addDebug = (message: string) => {
    console.log("DEBUG:", message);
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  const backendUrl = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL || '';
    return env || window.location.origin;
  }, []);

  // קבלת זמן שרת דרך כותרת Date + הערכת RTT → חישוב offset
  const syncClockOnce = async () => {
    try {
      // נשתמש ב-endpoint בטוח וקיים (ברירת מחדל: origin). מוסיפים פרמטר כדי לעקוף קאש.
      const url = `${backendUrl}/__clock_sync__?t=${Date.now()}`;
      const startMono = performance.now();
      const startWall = Date.now();

      // לא כל שרת תומך HEAD, לכן GET קצר עם no-store
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        // עדיף לא לבקש body; אם השרת מחזיר 404 זה עדיין תקף בשביל Date header (רוב השרתים מחזירים Date)
      });

      const endMono = performance.now();
      const endWall = Date.now();
      const rtt = Math.max(0, endMono - startMono);

      const dateHeader = res.headers.get('date') || res.headers.get('Date');
      if (!dateHeader) {
        addDebug('Clock sync: no Date header, skipping');
        return;
      }

      const serverResponseWall = new Date(dateHeader).getTime();
      // הערכת זמן השרת ברגע האמצע של ה־RTT
      const estimatedServerAtMid = serverResponseWall; // Date header משקף זמן יצירת התשובה בשרת
      const estimatedClientAtMid = startWall + (endWall - startWall) / 2;
      const newOffset = estimatedServerAtMid - estimatedClientAtMid;

      // החלקה קלה (EMA) כדי לייצב
      setClockSync(prev => {
        const alpha = 0.3; // משקל ערך חדש
        const blendedOffset = prev.lastSyncAt === 0 ? newOffset : (1 - alpha) * prev.offsetMs + alpha * newOffset;
        const blendedRtt = prev.lastSyncAt === 0 ? rtt : (1 - alpha) * prev.rttMs + alpha * rtt;
        addDebug(`Clock sync: offset=${Math.round(blendedOffset)}ms, rtt=${Math.round(blendedRtt)}ms`);
        return { offsetMs: blendedOffset, rttMs: blendedRtt, lastSyncAt: Date.now() };
      });
    } catch (e) {
      addDebug(`Clock sync failed: ${e}`);
    }
  };

  useEffect(() => {
    // סנכרון מיד בהעלאה
    syncClockOnce();
    // ועוד סנכרון תקופתי
    const id = setInterval(syncClockOnce, 60_000);
    return () => clearInterval(id);
  }, [backendUrl]);

  // פונקציה לקבל "זמן שרת" נוכחי משוער
  const serverNow = () => Date.now() + clockSync.offsetMs;

  // ---------- Simple chess board state ----------
  const [boardPosition, setBoardPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

  const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };

  const fenToBoard = (fen: string) => {
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    const position = fen.split(' ')[0];
    const rows = position.split('/');
    for (let row = 0; row < 8; row++) {
      let col = 0;
      for (const char of rows[row]) {
        if (char >= '1' && char <= '8') {
          col += parseInt(char);
        } else {
          board[row][col] = char;
          col++;
        }
      }
    }
    return board;
  };

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const gameStreamRef = useRef<EventSource | null>(null);

  // Update board position
  const updateBoardPosition = (fen: string) => {
    try {
      addDebug(`Updating board to FEN: ${fen}`);
      setBoardPosition(fen);
    } catch (error) {
      addDebug(`Error updating board: ${error}`);
    }
  };

  // Stream game from Lichess
  const streamGame = async (gameId: string) => {
    if (gameStreamRef.current) {
      gameStreamRef.current.close();
      gameStreamRef.current = null;
    }
    if (!gameId) return;

    addDebug(`Starting game stream for: ${gameId}`);
    
    try {
      const response = await fetch(`https://lichess.org/api/stream/game/${gameId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/x-ndjson' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      if (!response.body) throw new Error('No response body');

      addDebug(`Game stream opened for: ${gameId}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      gameStreamRef.current = {
        close: () => {
          reader.cancel();
          addDebug(`Game stream closed for: ${gameId}`);
        }
      } as any;

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              addDebug(`Game stream ended for: ${gameId}`);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              const receiveMono = performance.now(); // זמן קבלה (מונוטוני)
              try {
                const data = JSON.parse(line);
                processGameData(data, receiveMono);
              } catch (parseError) {
                console.warn('Failed to parse JSON line:', line, parseError);
                addDebug(`JSON parse error: ${parseError}`);
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          addDebug(`Stream reading error: ${streamError}`);
          setTimeout(() => {
            if (selectedMatch && selectedMatch.gameId === gameId) {
              addDebug(`Reconnecting game stream for: ${gameId}`);
              streamGame(gameId);
            }
          }, 5000);
        }
      };

      processStream();

    } catch (error) {
      console.error('Game stream error:', error);
      addDebug(`Game stream error: ${error}`);
      setTimeout(() => {
        if (selectedMatch && selectedMatch.gameId === gameId) {
          addDebug(`Reconnecting game stream for: ${gameId}`);
          streamGame(gameId);
        }
      }, 5000);
    }
  };

  // Parse active color from FEN ("w"/"b")
  const colorFromFEN = (fen?: string): 'w' | 'b' | undefined => {
    if (!fen) return undefined;
    const parts = fen.split(' ');
    return (parts[1] === 'w' || parts[1] === 'b') ? parts[1] : undefined;
  };

  // Process game data from stream (now clock-synced)
const processGameData = (data: any, _receiveMono?: number) => {
    try {
      addDebug(`Received game data: ${JSON.stringify(data).substring(0, 100)}`);

      // חישוב זמן האירוע המשוער בשרת: serverNow (ברגע הקבלה) פחות RTT/2
      // הערה: ה-RTT נמדד מול backend שלך ולא מול lichess, אבל עדיין מספק תיקון טוב לרוב המקרים.
      const approxServerEventTime = serverNow() - (clockSync.rttMs / 2);

      if (data.id && data.variant) {
        // מצב התחלתי
        addDebug(`Initial game state - turns: ${data.turns}, status: ${data.status?.name}`);

        const gs: GameState = {
          moves: '',
          status: data.status?.name || 'unknown',
          winner: data.winner || undefined,
          anchorServerTime: approxServerEventTime,
          activeColor: colorFromFEN(data.fen),
        };
        setGameState(gs);

        if (data.fen) {
          addDebug(`Setting board to initial FEN: ${data.fen}`);
          updateBoardPosition(data.fen);
        } else {
          addDebug(`No FEN in initial game data`);
        }

      } else if (data.fen) {
        // עדכון מהלך + FEN
        addDebug(`Move update - FEN: ${data.fen}, last move: ${data.lm || 'none'}`);
        updateBoardPosition(data.fen);

        const active = colorFromFEN(data.fen);
        const gs: GameState = {
          moves: data.lm || '',
          // זמנים מה-stream בשניות → ms
          wtime: data.wc ? data.wc * 1000 : undefined,
          btime: data.bc ? data.bc * 1000 : undefined,
          status: 'started',
          anchorServerTime: approxServerEventTime,
          activeColor: active,
        };
        setGameState(gs);

      } else {
        addDebug(`Unknown game data format: ${JSON.stringify(data).substring(0, 200)}`);
      }
      
    } catch (error) {
      console.error('Error processing game data:', error);
      addDebug(`Error processing game data: ${error}`);
    }
  };

  // חישוב תצוגת זמן עם עיגון לשרת
  const formatTime = (ms: number) => {
    const secs = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDisplayTime = (baseTime: number | undefined, isWhite: boolean) => {
    if (!gameState || baseTime === undefined) return '0:00';

    if (gameState.status !== 'started' || !gameState.anchorServerTime) {
      return formatTime(baseTime);
    }

    // מי בתור?
    const whiteToMove = gameState.activeColor === 'w';
    const isActive = isWhite ? whiteToMove : !whiteToMove;

    if (!isActive) {
      // לא בתורו → הזמן קופא על ה-baseTime מה-stream
      return formatTime(baseTime);
    }

    // ריצה לפי זמן שרת נוכחי מול זמן האירוע (anchor)
    const elapsed = Math.max(0, serverNow() - gameState.anchorServerTime);
    const remaining = Math.max(0, baseTime - elapsed);
    return formatTime(remaining);
  };

  // Simple chess board rendering
  const renderChessBoard = () => {
    const board = fenToBoard(boardPosition);
    return (
      <div style={{
        display: 'inline-block',
        border: '3px solid #8B4513',
        backgroundColor: '#8B4513',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 50px)',
          gridTemplateRows: 'repeat(8, 50px)',
          gap: '0'
        }}>
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: isLight ? '#F0D9B5' : '#B58863',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    cursor: 'default',
                    transition: 'all 0.3s ease',
                    color: piece && piece >= 'a' && piece <= 'z' ? '#000000' : '#FFFFFF'
                  }}
                >
                  {piece ? (pieces as any)[piece] || piece : ''}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Tournament data and socket connection effect
  useEffect(() => {
    if (!tournamentId) {
      setError('Missing tournament ID');
      setLoading(false);
      return;
    }

    const fetchTournamentData = async () => {
      try {
        addDebug(`Fetching tournament data for ID: ${tournamentId}`);
        const backendBase = process.env.REACT_APP_BACKEND_URL || '';
        const base = backendBase || window.location.origin;
        const url = `${base}/api/live/tournaments/${tournamentId}/stream?t=${Date.now()}`;
        
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        addDebug(`Tournament data received`);
        
        if (data.tournament) setTournament(data.tournament);
        if (data.players) setPlayers(data.players);
        
        if (data.matches) {
          const processedMatches = data.matches.map((match: Match) => {
            const gameId = match.lichessUrl.split('/').pop()?.split('?')[0] || '';
            return { ...match, gameId };
          });
          
          setMatches(processedMatches);
          if (processedMatches.length > 0) {
            setSelectedMatch(processedMatches[0]);
            addDebug(`Setting first match as default: ${processedMatches[0].gameId}`);
          }
        }
        setLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error("Error fetching tournament data:", errorMsg);
        addDebug(`Error fetching tournament data: ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
      }
    };
    
    fetchTournamentData();
    
    // Socket.IO connection
    const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'https://automatch.cs.colman.ac.il';
    
    try {
      socketRef.current = io(SOCKET_SERVER, {
        path: "/socket.io",
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5, 
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
        autoConnect: true
      });
    } catch (error) {
      console.error("Error creating Socket.IO instance:", error);
    }
    
    if (socketRef.current) {
      const socket = socketRef.current;
      
      socket.on('connect', () => {
        console.log(`Socket connected: ${socket.id}`);
        addDebug(`Socket connected: ${socket.id}`);
        setConnected(true);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token') || '';
        const lichessId = (user as any).lichessId || localStorage.getItem('lichessId') || '';
        
        socket.emit('join_tournament', { 
          tournamentId, 
          token,
          lichessId
        });
      });
      
      socket.on('connect_error', (error) => {
        console.error(`Socket connection error:`, error);
        addDebug(`Socket connection error: ${error.message}`);
        setError(`Socket connection error: ${error.message}`);
        setConnected(false);
      });
      
      socket.on('disconnect', () => {
        console.warn(`Socket disconnected`);
        addDebug(`Socket disconnected`);
        setConnected(false);
      });
      
      socket.on('join_success', (data) => {
        console.log(`Successfully joined tournament room:`, data);
        addDebug(`Successfully joined tournament room`);
      });
      
      socket.on('chat_history', (history: ChatMessage[]) => {
        addDebug(`Received chat history: ${history?.length || 0} messages`);
        setMessages(history || []);
      });
      
      socket.on('new_message', (message: ChatMessage) => {
        addDebug(`New chat message from ${message.username}`);
        setMessages(prev => [...prev, message]);
      });
      
      socket.on('tournament_matches', (updatedMatches: Match[]) => {
        addDebug(`Received tournament matches update: ${updatedMatches.length} matches`);
        
        const processedMatches = updatedMatches.map((match: Match) => {
          const gameId = match.lichessUrl.split('/').pop()?.split('?')[0] || '';
          return { ...match, gameId };
        });
        
        setMatches(processedMatches);
        
        if (selectedMatch) {
          const updated = processedMatches.find(m => m.gameId === selectedMatch.gameId);
          if (updated) {
            setSelectedMatch(updated);
          } else if (processedMatches.length > 0) {
            setSelectedMatch(processedMatches[0]);
          }
        }
      });
      
      socket.on('viewers_count', (data: { count: number }) => {
        addDebug(`Viewers count update: ${data.count}`);
        setViewers(data.count);
      });
    }
    
    return () => {
      try { socketRef.current?.disconnect(); } catch (error) { console.warn('Error disconnecting socket:', error); }
      try { gameStreamRef.current?.close(); } catch (error) { console.warn('Error closing game stream:', error); }
    };
  }, [tournamentId]);

  // Stream selected match
  useEffect(() => {
    if (selectedMatch && selectedMatch.gameId && connected) {
      addDebug(`Starting to stream match: ${selectedMatch.gameId}`);
      streamGame(selectedMatch.gameId);
      
      socketRef.current?.emit('watch_match', {
        gameId: selectedMatch.gameId,
        tournamentId
      });
    }
    
    return () => {
      try { gameStreamRef.current?.close(); gameStreamRef.current = null; } catch (error) {
        console.warn('Error closing game stream:', error);
      }
    };
  }, [selectedMatch?.gameId, connected, tournamentId]);

  // Auto-scroll chat
  useEffect(() => {
    try {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.warn('Error scrolling chat:', error);
    }
  }, [messages]);

  // Utility functions
  const getPlayerName = (lichessId: string): string => {
    const player = players.find(p => p.lichessId === lichessId);
    return player ? player.username : lichessId;
  };
  
  const handleSelectMatch = (match: Match) => {
    addDebug(`Match selected: ${match.gameId}`);
    setSelectedMatch(match);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    const token = localStorage.getItem('token');
    socketRef.current.emit('send_message', {
      message: newMessage.trim(),
      tournamentId: tournamentId || '',
      token
    });
    setNewMessage('');
  };
  
  const reconnectSocket = () => {
    addDebug(`Attempting to reconnect socket`);
    socketRef.current?.connect();
  };

  return (
    <>
      {/* Part 1: The Navbar */}
      <Navbar showItems={false} />
      
      {/* Part 2: All other page content, with top padding to prevent overlap */}
      <main className="pt-6 md:pt-10">
        {loading && (
          <div className="loading">Loading tournament data...</div>
        )}
        
        {error && (
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={reconnectSocket} className="reconnect-button">
              Try to reconnect
            </button>
            <details>
              <summary>Debug Info</summary>
              <pre>{debug.join('\n')}</pre>
            </details>
          </div>
        )}
        
        {!loading && !error && !tournament && (
          <div className="not-found">Tournament not found</div>
        )}

        {tournament && (
          <div className="tournament-stream-container">
            <div className="tournament-header">
              <h1>{tournament.name}</h1>
              <div className="tournament-info flex justify-between items-center">
                <Link to={`/bracket/${tournamentId}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Bracket
                  </Button>
                </Link>

                <div className="flex items-center gap-x-4">
                  <p>Stage: {tournament.bracketName}</p>
                  <p>Prize: ₪{tournament.prize}</p>
                  <p>Status: {tournament.status === 'active' ? 'Active' : 'Completed'}</p>
                  <div className="connection-indicator">
                    {connected ? (
                      <span className="status-connected">✓ Connected</span>
                    ) : (
                      <span className="status-disconnected">✗ Disconnected</span>
                    )}
                    {!connected && (
                      <button onClick={reconnectSocket} className="reconnect-button">Reconnect</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="stream-content">
              {/* Matches Panel */}
              <div className="matches-panel">
                <h2>Current Games</h2>
                <ul className="match-list">
                  {matches.length > 0 ? (
                    matches.map(match => (
                      <li 
                        key={match.gameId} 
                        className={`match-item ${selectedMatch?.gameId === match.gameId ? 'selected' : ''} ${match.result !== 'pending' ? 'finished' : ''}`}
                        onClick={() => handleSelectMatch(match)}
                      >
                        <div className="players" style={{ color: 'black' }}>
                          <span>{getPlayerName(match.player1)}</span> vs <span>{getPlayerName(match.player2)}</span>
                        </div>
                        {match.result !== 'pending' && (
                          <div className="result" style={{ color: 'black' }}>
                            {match.result === 'draw' ? 'Draw' : `Winner: ${match.winner ? getPlayerName(match.winner) : ''}`}
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="no-matches">No active games</li>
                  )}
                </ul>
              </div>
              
              {/* Game Panel */}
              <div className="game-panel">
                {selectedMatch ? (
                  <>
                    <div className="game-header">
                      <h2 style={{ color: 'black', marginBottom: '15px' }}>
                        {getPlayerName(selectedMatch.player1)} vs {getPlayerName(selectedMatch.player2)}
                      </h2>
                      <div className="game-controls" style={{ 
                        color: 'black', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px', 
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <span className="viewers" style={{ fontSize: '14px' }}>
                          👥 {viewers} viewers
                        </span>

                        <span className="live-indicator" style={{ 
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#dc3545'
                        }}>
                          🔴 Live Stream
                        </span>
              
                      </div>
                    </div>
                    
                    {/* Live Chess Board */}
                    <div className="game-board-container">
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        {renderChessBoard()}
                      </div>
                      
                      {/* Game Info */}
                      {gameState && (
                        <div className="game-info">
                          <div className="game-status">
                            <strong>Status:</strong> {gameState.status}
                            {gameState.winner && (
                              <span className="winner"> - Winner: {gameState.winner}</span>
                            )}
                          </div>
                          
                          {gameState.wtime !== undefined && gameState.btime !== undefined && (
                            <div className="clocks">
                              <div className="clock white">
                                ⚪ {getDisplayTime(gameState.wtime, true)}
                              </div>
                              <div className="clock black">
                                ⚫ {getDisplayTime(gameState.btime, false)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="game-footer">
                      {selectedMatch.result !== 'pending' && (
                        <div className="game-result">
                          {selectedMatch.result === 'draw' 
                            ? 'Game ended in a draw' 
                            : `Winner: ${selectedMatch.winner ? getPlayerName(selectedMatch.winner) : ''}`}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-game-selected">
                    <p>Select a game to watch</p>
                  </div>
                )}
              </div>
              
              {/* Chat Panel */}
              <div className="chat-panel">
                <h2>Live Chat</h2>
                <div 
                  className="chat-messages" 
                  ref={chatContainerRef}
                >
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index} className="chat-message">
                        <div className="message-header">
                          <span className="username">{getPlayerName(msg.lichessId)}</span>
                          <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="message-content">{msg.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">No messages yet</div>
                  )}
                </div>
                
                <form className="chat-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..." 
                    disabled={!connected}
                    className="chat-input"
                  />
                <button 
                    type="submit" 
                    disabled={!connected || !newMessage.trim()}
                    className={!connected || !newMessage.trim() ? 'disabled' : ''}
                  >
                    Send
                  </button>
                </form>
                
                <div className="connection-status">
                  {connected ? (
                    <span className="status-connected">Connected</span>
                  ) : (
                    <span className="status-disconnected">Disconnected</span>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>
    </>
  );
};

// Add type declaration for window globals
declare global {
  interface Window {
    // We don't need these anymore since we're using a simple CSS board
  }
}

export default TournamentLiveStream;
