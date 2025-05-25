// TournamentLiveStream.tsx - Real live chess viewing with chessboard.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import '../components/ui/TournamentLiveStream.css';

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
  wtime?: number;
  btime?: number;
  status: string;
  winner?: string;
  lastMoveTime?: number;
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
  
  // State for live clock updates
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update clocks in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time for display
  const getDisplayTime = (baseTime: number | undefined, isWhiteTurn: boolean) => {
    if (baseTime === undefined) return '0:00';
    
    // Only countdown if it's this player's turn and game is active
    if (gameState?.status === 'started') {
      const elapsed = currentTime - (gameState as any).lastMoveTime || 0;
      const remaining = isWhiteTurn ? baseTime - elapsed : baseTime;
      const timeInSeconds = Math.max(0, Math.floor(remaining / 1000));
      
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Static display when not active
    const timeInSeconds = Math.floor(baseTime / 1000);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to add debug messages
  const addDebug = (message: string) => {
    console.log("DEBUG:", message);
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  // State for simple chess board
  const [boardPosition, setBoardPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

  // Chess piece symbols - Fixed to be WHITE vs BLACK (not white vs white outline)
  const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙', // White pieces 
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'  // Black pieces 
  };

  // Convert FEN to board array
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
    // Close existing stream
    if (gameStreamRef.current) {
      gameStreamRef.current.close();
      gameStreamRef.current = null;
    }

    if (!gameId) return;

    addDebug(`Starting game stream for: ${gameId}`);
    
    try {
      // Use fetch instead of EventSource to handle NDJSON
      const response = await fetch(`https://lichess.org/api/stream/game/${gameId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/x-ndjson'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      addDebug(`Game stream opened for: ${gameId}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Create a fake EventSource-like object for cleanup
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

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines (NDJSON format)
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  processGameData(data);
                } catch (parseError) {
                  console.warn('Failed to parse JSON line:', line, parseError);
                  addDebug(`JSON parse error: ${parseError}`);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          addDebug(`Stream reading error: ${streamError}`);
          
          // Try to reconnect after a delay if we're still watching this game
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
      
      // Try to reconnect after a delay if we're still watching this game
      setTimeout(() => {
        if (selectedMatch && selectedMatch.gameId === gameId) {
          addDebug(`Reconnecting game stream for: ${gameId}`);
          streamGame(gameId);
        }
      }, 5000);
    }
  };

  // Process game data from stream
  const processGameData = (data: any) => {
    try {
      addDebug(`Received game data: ${JSON.stringify(data).substring(0, 100)}`);
      
      // Check if this is initial game state (has id, variant, etc.)
      if (data.id && data.variant) {
        addDebug(`Initial game state received - turns: ${data.turns}, status: ${data.status?.name}`);
        
        // Convert to our GameState format
        const gameState: GameState = {
          moves: '', // Will be built from moves in subsequent messages
          status: data.status?.name || 'unknown',
          winner: data.winner || undefined
        };
        
        setGameState(gameState);
        
        // Set board to current position using FEN
        if (data.fen) {
          addDebug(`Setting board to initial FEN: ${data.fen}`);
          updateBoardPosition(data.fen);
        } else {
          addDebug(`No FEN in initial game data`);
        }
        
      } else if (data.fen) {
        // This is a move update with FEN position
        addDebug(`Move update - FEN: ${data.fen}, last move: ${data.lm || 'none'}`);
        
        // Update board position directly with FEN
        addDebug(`Move update - FEN: ${data.fen}, last move: ${data.lm || 'none'}`);
        updateBoardPosition(data.fen);
        
        // Update game state with current timestamp
        const gameState: GameState = {
          moves: data.lm || '', // Last move
          wtime: data.wc ? data.wc * 1000 : undefined, // Convert to milliseconds
          btime: data.bc ? data.bc * 1000 : undefined, // Convert to milliseconds
          status: 'started', // Assume ongoing if we're getting moves
          lastMoveTime: Date.now() // Track when this update happened
        };
        
        setGameState(gameState);
        
      } else {
        addDebug(`Unknown game data format: ${JSON.stringify(data).substring(0, 200)}`);
      }
      
    } catch (error) {
      console.error('Error processing game data:', error);
      addDebug(`Error processing game data: ${error}`);
    }
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
                    color: piece && piece >= 'a' && piece <= 'z' ? '#000000' : '#FFFFFF' // Black pieces black, white pieces white
                  }}
                >
                  {piece ? pieces[piece as keyof typeof pieces] || piece : ''}
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

    // Fetch tournament data
    const fetchTournamentData = async () => {
      try {
        addDebug(`Fetching tournament data for ID: ${tournamentId}`);
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const url = `${backendUrl}/live/tournaments/${tournamentId}/stream`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        addDebug(`Tournament data received`);
        
        if (data.tournament) {
          setTournament(data.tournament);
        }
        
        if (data.players) {
          setPlayers(data.players);
        }
        
        if (data.matches) {
          const processedMatches = data.matches.map((match: Match) => {
            // Extract game ID from Lichess URL
            const gameId = match.lichessUrl.split('/').pop()?.split('?')[0] || '';
            return {
              ...match,
              gameId
            };
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
    
    // Socket event handlers
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
          return {
            ...match,
            gameId
          };
        });
        
        setMatches(processedMatches);
        
        if (selectedMatch) {
          const updated = processedMatches.find(m => 
            m.gameId === selectedMatch.gameId
          );
          
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
      // Safer cleanup
      try {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      } catch (error) {
        console.warn('Error disconnecting socket:', error);
      }
      
      try {
        if (gameStreamRef.current) {
          gameStreamRef.current.close();
        }
      } catch (error) {
        console.warn('Error closing game stream:', error);
      }
    };
  }, [tournamentId]);

  // Stream selected match
  useEffect(() => {
    if (selectedMatch && selectedMatch.gameId && connected) {
      addDebug(`Starting to stream match: ${selectedMatch.gameId}`);
      streamGame(selectedMatch.gameId);
      
      // Also notify socket about watching this match
      if (socketRef.current) {
        socketRef.current.emit('watch_match', {
          gameId: selectedMatch.gameId,
          tournamentId
        });
      }
    }
    
    return () => {
      // Safer cleanup
      try {
        if (gameStreamRef.current) {
          gameStreamRef.current.close();
          gameStreamRef.current = null;
        }
      } catch (error) {
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
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };
  
  const openGameInNewTab = () => {
    if (selectedMatch && selectedMatch.lichessUrl) {
      window.open(selectedMatch.lichessUrl, '_blank');
    }
  };

  // Render
  if (loading) {
    return <div className="loading">Loading tournament data...</div>;
  }
  
  if (error) {
    return (
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
    );
  }
  
  if (!tournament) {
    return <div className="not-found">Tournament not found</div>;
  }

  // Wrap everything in a try-catch to prevent crashes
  try {
    return (
      <div className="tournament-stream-container">
        <div className="tournament-header">
          <h1>{tournament.name}</h1>
          <div className="tournament-info">
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
                    <button 
                      onClick={openGameInNewTab} 
                      className="open-button"
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Open in Lichess
                    </button>
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
        
        {/* Debug Panel */}
        {debug.length > 0 && (
          <details className="debug-panel">
            <summary>Debug Info ({debug.length} entries)</summary>
            <pre className="debug-content">
              {debug.slice(-20).join('\n')}
            </pre>
          </details>
        )}
      </div>
    );
  } catch (renderError) {
    console.error('Render error:', renderError);
    return (
      <div className="error">
        <h3>Display Error</h3>
        <p>An error occurred while displaying the component</p>
        <details>
          <summary>Error Details</summary>
          <pre>{String(renderError)}</pre>
        </details>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }
};

// Add type declaration for window globals
declare global {
  interface Window {
    // We don't need these anymore since we're using a simple CSS board
  }
}

export default TournamentLiveStream;