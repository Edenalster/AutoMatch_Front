// TournamentLiveStream.tsx - Fixed for live game viewing
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import '../components/ui/TournamentLiveStream.css';

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

const TournamentLiveStream: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  console.log("🚀 TournamentLiveStream mounted, tournamentId:", tournamentId);
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
  const [debug, setDebug] = useState<string[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Helper function to add debug messages
  const addDebug = (message: string) => {
    console.log("DEBUG:", message);
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };
  
  // גלילה למטה כשיש הודעות חדשות בצ'אט
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // התחבר לסוקט והתחל לקבל עדכונים
  useEffect(() => {
    console.log("🔄 Socket connection effect triggered, tournamentId:", tournamentId);
    
    if (!tournamentId) {
      console.error("❌ No tournament ID provided");
      setError('חסר מזהה טורניר');
      setLoading(false);
      return;
    }

    // טען את נתוני הטורניר
    const fetchTournamentData = async () => {
      try {
        console.log(`📊 Fetching tournament data for ID: ${tournamentId}`);
        addDebug(`Fetching tournament data for ID: ${tournamentId}`);
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const url = `${backendUrl}/live/tournaments/${tournamentId}/stream`;
        console.log(`🌐 API URL: ${url}`);
        addDebug(`API URL: ${url}`);
        
        console.log("📡 Starting API request...");
        const response = await fetch(url);
        console.log(`📥 API response received: status ${response.status}`);
        
        if (!response.ok) {
          console.error(`❌ API error: ${response.status} ${response.statusText}`);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        console.log("🔄 Parsing API response...");
        const data = await response.json();
        console.log("📦 API data received:", data);
        addDebug(`Tournament data received: ${data.tournament?.name || 'unknown'}`);
        
        if (data.tournament) {
          console.log("🏆 Tournament data:", data.tournament);
          setTournament(data.tournament);
        } else {
          console.error("❌ Tournament data missing in API response");
        }
        
        if (data.players) {
          console.log(`👥 Players data: ${data.players.length} players`);
          setPlayers(data.players);
        } else {
          console.error("❌ Players data missing in API response");
        }
        
        if (data.matches) {
          console.log(`🎮 Matches data: ${data.matches.length} matches`);
          console.log("🎮 Matches details:", data.matches);
          
          // Ensure all match URLs are properly formatted
          const processedMatches = data.matches.map((match: Match) => {
            // Make sure lichessUrl is properly formed
            if (match.lichessUrl && !match.lichessUrl.startsWith('http')) {
              match.lichessUrl = `https://lichess.org/${match.gameId}`;
            }
            return match;
          });
          
          setMatches(processedMatches);
          
          // בחר משחק ראשון כברירת מחדל אם קיים
          if (processedMatches.length > 0) {
            console.log(`🎯 Setting first match as default: ${processedMatches[0].gameId}`);
            console.log("🎯 Match details:", processedMatches[0]);
            addDebug(`Setting first match as default: ${processedMatches[0].gameId}`);
            setSelectedMatch(processedMatches[0]);
          } else {
            console.warn("⚠️ No matches available to select");
          }
        } else {
          console.error("❌ Matches data missing in API response");
        }
        
        setLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
        console.error("❌ Error fetching tournament data:", errorMsg);
        addDebug(`Error fetching tournament data: ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
      }
    };
    
    fetchTournamentData();
    
    // התחבר לשרת Socket.IO
    const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'https://automatch.cs.colman.ac.il';
    console.log(`🔌 Connecting to Socket.IO server: ${SOCKET_SERVER}`);
    addDebug(`Connecting to Socket.IO server: ${SOCKET_SERVER}`);
    
    try {
      console.log("🔄 Creating Socket.IO instance...");
      socketRef.current = io(SOCKET_SERVER, {
        path: "/socket.io",
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5, 
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
        autoConnect: true
      });
      console.log("✅ Socket.IO instance created successfully");
    } catch (error) {
      console.error("❌ Error creating Socket.IO instance:", error);
    }
    
    // השג משתמש מה-localStorage (אם קיים)
    try {
      console.log("🔄 Getting user data from localStorage...");
      let user = {};
      let token = '';
      let lichessId = '';
      
      try {
        const userStr = localStorage.getItem('user');
        console.log("📦 User string from localStorage:", userStr);
        user = JSON.parse(userStr || '{}');
        console.log("👤 Parsed user object:", user);
      } catch (e) {
        console.error("❌ Error parsing user from localStorage:", e);
      }
      
      token = localStorage.getItem('token') || '';
      console.log("🔑 Token from localStorage:", token ? "present (length: " + token.length + ")" : "not found");
      
      lichessId = (user as any).lichessId || localStorage.getItem('lichessId') || '';
      console.log("👤 LichessId:", lichessId || 'Not found');
      addDebug(`User data from localStorage: ${lichessId || 'Not found'}`);
    } catch (error) {
      console.error("❌ Error getting user data from localStorage:", error);
    }
    
    // טפל באירועי סוקט
    if (socketRef.current) {
      console.log("🔄 Setting up Socket.IO event handlers...");
      
      // Connect event
      socketRef.current.on('connect', () => {
        console.log(`✅ Socket connected successfully! ID: ${socketRef.current?.id}`);
        addDebug(`Socket connected successfully! ID: ${socketRef.current?.id}`);
        setConnected(true);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token') || '';
        const lichessId = (user as any).lichessId || localStorage.getItem('lichessId') || '';
        
        // הצטרף לחדר הטורניר אחרי התחברות מוצלחת
        console.log(`🔄 Joining tournament room: ${tournamentId}, lichessId: ${lichessId}`);
        addDebug(`Joining tournament room: ${tournamentId}`);
        socketRef.current?.emit('join_tournament', { 
          tournamentId, 
          token,
          lichessId
        });
        console.log("📤 join_tournament event emitted");
      });
      
      // Connection error event
      socketRef.current.on('connect_error', (error) => {
        console.error(`❌ Socket connection error:`, error);
        addDebug(`Socket connection error: ${error.message}`);
        setError(`Socket connection error: ${error.message}`);
        setConnected(false);
      });
      
      // Disconnect event
      socketRef.current.on('disconnect', () => {
        console.warn(`⚠️ Socket disconnected`);
        addDebug(`Socket disconnected`);
        setConnected(false);
      });
      
      // Socket error event
      socketRef.current.on('error', (data: { message: string }) => {
        console.error(`❌ Socket error:`, data);
        addDebug(`Socket error: ${data.message}`);
        setError(data.message);
      });
      
      // Join success event
      socketRef.current.on('join_success', (data: { tournamentId: string, userId: string }) => {
        console.log(`✅ Successfully joined tournament room:`, data);
        addDebug(`Successfully joined tournament room as: ${data.userId}`);
      });
      
      // Chat history event
      socketRef.current.on('chat_history', (history: ChatMessage[]) => {
        console.log(`📜 Received chat history: ${history?.length || 0} messages`);
        addDebug(`Received chat history: ${history?.length || 0} messages`);
        setMessages(history || []);
      });
      
      // New message event
      socketRef.current.on('new_message', (message: ChatMessage) => {
        console.log(`💬 New chat message:`, message);
        addDebug(`New chat message from ${message.username}: ${message.message.substring(0, 20)}...`);
        setMessages(prev => [...prev, message]);
      });
      
      // Tournament matches event
      socketRef.current.on('tournament_matches', (updatedMatches: Match[]) => {
        console.log(`🎮 Received tournament matches update: ${updatedMatches.length} matches`);
        console.log("🎮 Updated matches:", updatedMatches);
        addDebug(`Received tournament matches update: ${updatedMatches.length} matches`);
        
        // Ensure all match URLs are properly formatted
        const processedMatches = updatedMatches.map((match: Match) => {
          // Make sure lichessUrl is properly formed
          if (match.lichessUrl && !match.lichessUrl.startsWith('http')) {
            match.lichessUrl = `https://lichess.org/${match.gameId}`;
          }
          return match;
        });
        
        setMatches(processedMatches);
        
        // עדכן את המשחק הנבחר אם הוא בין המשחקים המעודכנים
        if (selectedMatch) {
          console.log(`🔍 Looking for selected match (${selectedMatch.gameId}) in updated matches...`);
          const updated = processedMatches.find(m => 
            m.gameId === selectedMatch.gameId
          );
          
          if (updated) {
            console.log(`✅ Found selected match in updates: ${selectedMatch.gameId}`);
            addDebug(`Updating selected match: ${selectedMatch.gameId}`);
            console.log("📊 Updated match data:", updated);
            setSelectedMatch(updated);
          } else if (processedMatches.length > 0) {
            console.log(`⚠️ Selected match not found in updates, selecting first match`);
            addDebug(`Selected match not found in updates, selecting first match`);
            setSelectedMatch(processedMatches[0]);
          }
        }
      });
      
      // Game state change event
      socketRef.current.on('game_state_change', (data: { gameId: string, state: any }) => {
        console.log(`🎲 Game state changed for: ${data.gameId}`, data.state);
        addDebug(`Game state changed for: ${data.gameId}, status: ${data.state.status}`);
        
        if (selectedMatch && data.gameId === selectedMatch.gameId) {
          console.log(`🔄 Updating state for selected match ${selectedMatch.gameId}`);
          console.log("Before update:", selectedMatch);
          setSelectedMatch(prev => {
            const updated = prev ? {
              ...prev,
              state: data.state
            } : null;
            console.log("After update:", updated);
            return updated;
          });
        } else {
          console.log(`ℹ️ Game state update is not for selected match, ignoring...`);
        }
      });
      
      // Viewers count event
      socketRef.current.on('viewers_count', (data: { count: number }) => {
        console.log(`👁️ Viewers count update: ${data.count}`);
        addDebug(`Viewers count update: ${data.count}`);
        setViewers(data.count);
      });
      
      console.log("✅ Socket.IO event handlers setup complete");
    } else {
      console.error("❌ Socket.IO instance not created, cannot set up event handlers");
    }
    
    // פונקציית ניקוי
    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up socket connection");
        addDebug(`Cleaning up socket connection`);
        socketRef.current.disconnect();
      }
    };
  }, [tournamentId]);
  
  // כאשר משחק נבחר, צפה בו
  useEffect(() => {
    console.log("🔄 Selected match effect triggered:", selectedMatch?.gameId);
    
    if (selectedMatch && socketRef.current && tournamentId && connected) {
      console.log(`👁️ Watching match: ${selectedMatch.gameId}`);
      addDebug(`Watching match: ${selectedMatch.gameId}`);
      
      console.log("📤 Emitting watch_match event:", {
        gameId: selectedMatch.gameId,
        tournamentId
      });
      
      socketRef.current.emit('watch_match', {
        gameId: selectedMatch.gameId,
        tournamentId
      });
      
      // גישה חדשה - ריענון מלא של ה-iframe כל שנייה
      if (iframeRef.current) {
        // שימוש בפרמטר tv=1 שמיועד לצפייה חיה
        const liveUrl = `https://lichess.org/embed/${selectedMatch.gameId}?theme=auto&bg=auto&tv=1`;
        console.log(`🌐 Setting iframe src with TV parameter: ${liveUrl}`);
        addDebug(`Setting iframe src with TV parameter: ${liveUrl}`);
        iframeRef.current.src = liveUrl;
        
        // הגדר טיימר לרענון האייפריים כל 3 שניות
        const refreshTimer = setInterval(() => {
          if (iframeRef.current) {
            console.log("🔄 Refreshing iframe...");
            // שמירה על אותה URL אבל הוספת טיימסטמפ כדי לכפות רענון
            iframeRef.current.src = `${liveUrl}&t=${Date.now()}`;
          }
        }, 3000);
        
        // נקה את הטיימר כשהקומפוננטה מתפרקת או כשבוחרים משחק אחר
        return () => {
          console.log("🧹 Cleaning up refresh timer");
          clearInterval(refreshTimer);
        };
      } else {
        console.warn("⚠️ iframe reference is null, cannot update src");
      }
    } else {
      console.log(`ℹ️ Not watching any match:`, {
        selectedMatch: selectedMatch ? `gameId: ${selectedMatch.gameId}` : 'null',
        socketConnected: connected,
        tournamentId
      });
    }
  }, [selectedMatch?.gameId, tournamentId, connected]);
  
  // Function to manually check iframe status - used in debugging UI
  const checkIframeStatus = () => {
    if (iframeRef.current) {
      console.log("🔍 Current iframe details:");
      console.log("  - src:", iframeRef.current.src);
      console.log("  - contentWindow:", iframeRef.current.contentWindow ? "available" : "not available");
      console.log("  - contentDocument:", iframeRef.current.contentDocument ? "available" : "not available");
      
      addDebug(`Iframe check - src: ${iframeRef.current.src}`);
      
      // Try to check if embedded content has loaded
      try {
        if (iframeRef.current.contentDocument) {
          console.log("  - Document loaded:", iframeRef.current.contentDocument.readyState);
        }
      } catch (e) {
        console.log("  - Cannot access contentDocument (cross-origin restriction)");
      }
    } else {
      console.log("❌ iframe reference is null");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  // מצא שם שחקן לפי מזהה Lichess
  const getPlayerName = (lichessId: string): string => {
    const player = players.find(p => p.lichessId === lichessId);
    return player ? player.username : lichessId;
  };
  
  // טיפול בבחירת משחק
  const handleSelectMatch = (match: Match) => {
    console.log(`🎮 Match selected:`, match);
    addDebug(`Match selected: ${match.gameId}`);
    setSelectedMatch(match);
  };
  
  // טיפול בשליחת הודעה בצ'אט
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      console.log("❌ Cannot send empty message");
      addDebug(`Cannot send empty message`);
      return;
    }
    
    console.log(`💬 Sending chat message: ${newMessage}`);
    addDebug(`Sending chat message: ${newMessage}`);
    
    // השג את הטוקן מה-localStorage
    const token = localStorage.getItem('token');
    
    if (socketRef.current) {
      console.log("📤 Emitting send_message event");
      socketRef.current.emit('send_message', {
        message: newMessage.trim(),
        tournamentId: tournamentId || '',
        token
      }, (response: any) => {
        // Acknowledgement callback
        console.log("📨 Message send acknowledgement:", response);
        if (response && response.success) {
          console.log("✅ Message sent successfully");
          addDebug(`Message sent successfully`);
        }
      });
      
      setNewMessage('');
    } else {
      console.error("❌ Cannot send message: Socket not connected");
      addDebug(`Cannot send message: Socket not connected`);
    }
  };
  
  // Function to attempt reconnection
  const reconnectSocket = () => {
    console.log("🔄 Attempting to reconnect socket...");
    addDebug(`Attempting to reconnect socket...`);
    if (socketRef.current) {
      socketRef.current.connect();
    } else {
      console.error("❌ Socket instance is null, cannot reconnect");
    }
  };
  
  // Function to open the game in a new tab
  const openGameInNewTab = () => {
    if (selectedMatch && selectedMatch.lichessUrl) {
      window.open(selectedMatch.lichessUrl, '_blank');
    }
  };

  if (loading) {
    return <div className="loading">טוען נתוני טורניר...</div>;
  }
  
  if (error) {
    return (
      <div className="error">
        <h3>שגיאה</h3>
        <p>{error}</p>
        <button onClick={reconnectSocket} className="reconnect-button">
          נסה להתחבר מחדש
        </button>
        <details>
          <summary>Debug Info</summary>
          <pre>{debug.join('\n')}</pre>
        </details>
      </div>
    );
  }
  
  if (!tournament) {
    return <div className="not-found">הטורניר לא נמצא</div>;
  }

  return (
    <div className="tournament-stream-container">
      <div className="tournament-header">
        <h1>{tournament.name}</h1>
        <div className="tournament-info">
          <p>שלב: {tournament.bracketName}</p>
          <p>פרס: ₪{tournament.prize}</p>
          <p>סטטוס: {tournament.status === 'active' ? 'פעיל' : 'הושלם'}</p>
          <div className="connection-indicator">
            {connected ? (
              <span className="status-connected">✓ מחובר</span>
            ) : (
              <span className="status-disconnected">✗ מנותק</span>
            )}
            {!connected && (
              <button onClick={reconnectSocket} className="reconnect-button">התחבר מחדש</button>
            )}
          </div>
        </div>
      </div>
      
      <div className="stream-content">
        {/* רשימת משחקים */}
        <div className="matches-panel">
          <h2>משחקים נוכחיים</h2>
          <ul className="match-list">
            {matches.length > 0 ? (
              matches.map(match => (
                <li 
                  key={match.gameId} 
                  className={`match-item ${selectedMatch?.gameId === match.gameId ? 'selected' : ''} ${match.result !== 'pending' ? 'finished' : ''}`}
                  onClick={() => handleSelectMatch(match)}
                >
                  <div className="players">
                    <span>{getPlayerName(match.player1)}</span> נגד <span>{getPlayerName(match.player2)}</span>
                  </div>
                  {match.result !== 'pending' && (
                    <div className="result">
                      {match.result === 'draw' ? 'תיקו' : `מנצח: ${match.winner ? getPlayerName(match.winner) : ''}`}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="no-matches">אין משחקים פעילים</li>
            )}
          </ul>
        </div>
        
        {/* הצגת המשחק */}
        <div className="game-panel">
          {selectedMatch ? (
            <>
              <div className="game-header">
                <h2>{getPlayerName(selectedMatch.player1)} נגד {getPlayerName(selectedMatch.player2)}</h2>
                <div className="game-controls">
                  <span className="viewers">{viewers} צופים</span>
                  <button onClick={openGameInNewTab} className="open-button">
                    פתח במשחק מלא
                  </button>
                  <button onClick={checkIframeStatus} className="debug-button">
                    בדוק iframe
                  </button>
                  <span className="live-indicator">🔴 שידור חי</span>
                </div>
              </div>
              <div className="game-iframe-container">
                {/* Lichess iframe - CORRECT URL FORMAT FOR LIVE EMBED */}
                <iframe
                  ref={iframeRef}
                  id="lichess-iframe"
                  title="Lichess Live Game"
                  src=""
                  width="100%"
                  height="500"
                  allowTransparency={true}
                  frameBorder="0"
                  allow="fullscreen"
                  onLoad={() => {
                    console.log(`🔄 Iframe loaded for game: ${selectedMatch.gameId}`);
                    console.log(`🌐 Current iframe src: ${iframeRef.current?.src}`);
                    addDebug(`Iframe loaded for game: ${selectedMatch.gameId}`);
                  }}
                ></iframe>
              </div>
              <div className="game-footer">
                <div>
                  <strong>Game ID: </strong>{selectedMatch.gameId}
                </div>
                <div>
                  <strong>Lichess URL: </strong>
                  <a href={selectedMatch.lichessUrl} target="_blank" rel="noopener noreferrer">
                    {selectedMatch.lichessUrl}
                  </a>
                </div>
                {selectedMatch.result !== 'pending' && (
                  <div className="game-result">
                    {selectedMatch.result === 'draw' 
                      ? 'המשחק הסתיים בתיקו' 
                      : `${selectedMatch.winner ? getPlayerName(selectedMatch.winner) : ''} ניצח ב${translateResult(selectedMatch.result)}`}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-game-selected">
              <p>בחר משחק לצפייה</p>
            </div>
          )}
        </div>
        
        {/* צ'אט */}
        <div className="chat-panel">
          <h2>צ'אט חי</h2>
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
              <div className="no-messages">אין הודעות עדיין</div>
            )}
          </div>
          
          <form className="chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="הקלד הודעה כאן..." 
              disabled={!connected}
              dir="auto"
              autoComplete="off"
              className="chat-input"
              style={{ 
                pointerEvents: 'auto', 
                userSelect: 'auto',
                direction: 'ltr', // Set text direction explicitly
                textAlign: 'left' // Align text explicitly
              }}
            />
            <button 
              type="submit" 
              disabled={!connected || !newMessage.trim()}
              className={!connected || !newMessage.trim() ? 'disabled' : ''}
            >
              שלח
            </button>
          </form>
          
          <div className="connection-status">
            {connected ? (
              <span className="status-connected">מחובר</span>
            ) : (
              <span className="status-disconnected">מנותק</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// פונקציית עזר לתרגום סטטוס התוצאה לעברית
function translateResult(result: string): string {
  switch (result) {
    case 'mate': return 'מט';
    case 'resign': return 'כניעה';
    case 'timeout': return 'הזמן נגמר';
    case 'draw': return 'תיקו';
    case 'completed': return 'הושלם';
    case 'finished': return 'הסתיים';
    default: return result;
  }
}

export default TournamentLiveStream;