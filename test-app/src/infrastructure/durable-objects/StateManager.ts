/**
 * StateManager Durable Object
 * 
 * The "Source of Truth" for active session state.
 * Handles real-time synchronization with <200ms target latency.
 * 
 * Uses WebSocket Hibernation for cost-efficient persistent connections.
 */

import { DEFAULT_VIBE_ID, getVibe } from '../../features/nudge-engine/vibes';
import { 
  createHistoryState, 
  pushHistory, 
  undo as historyUndo, 
  redo as historyRedo,
  getHistorySummary,
  type HistoryState 
} from '../../features/state-manager/history';
import type { ASTComponent } from '../../features/nudge-engine/patcher';

/** Session state structure */
interface SessionState {
  projectId: string;
  vibeId: string;
  ast: Record<string, ASTComponent>;
  createdAt: string;
  updatedAt: string;
}

/** WebSocket message types */
interface WSMessage {
  type: 'state_update' | 'vibe_change' | 'ast_patch' | 'sync_request' | 'history_update';
  payload: unknown;
}

/** Maximum retry attempts for transactions */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 50;

/** Sleep helper for retry delays */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class StateManager implements DurableObject {
  private state: DurableObjectState;
  private env: unknown;

  constructor(state: DurableObjectState, env: unknown) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // REST API routes
    switch (url.pathname) {
      case '/state':
        return this.handleGetState();
      case '/state/vibe':
        if (request.method === 'PUT') {
          return this.handleSetVibe(request);
        }
        break;
      case '/state/ast':
        if (request.method === 'PUT') {
          return this.handleUpdateAst(request);
        }
        break;
      case '/state/init':
        if (request.method === 'POST') {
          return this.handleInitSession(request);
        }
        break;
      case '/state/undo':
        if (request.method === 'POST') {
          return this.handleUndo();
        }
        break;
      case '/state/redo':
        if (request.method === 'POST') {
          return this.handleRedo();
        }
        break;
      case '/state/history':
        return this.handleGetHistory();
    }

    return new Response('Not Found', { status: 404 });
  }

  /** Handle WebSocket connections with Hibernation API */
  private async handleWebSocket(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket using Hibernation API
    this.state.acceptWebSocket(server);

    // Send current state immediately
    const currentState = await this.getSessionState();
    if (currentState) {
      server.send(JSON.stringify({
        type: 'state_update',
        payload: currentState
      }));
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  /** WebSocket message handler (Hibernation API) */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const data: WSMessage = JSON.parse(message as string);
      
      switch (data.type) {
        case 'sync_request':
          const state = await this.getSessionState();
          ws.send(JSON.stringify({ type: 'state_update', payload: state }));
          break;
        case 'vibe_change':
          const vibeId = data.payload as string;
          // Validate vibe exists before updating
          if (!getVibe(vibeId)) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              payload: `Invalid vibe ID: ${vibeId}` 
            }));
            return;
          }
          await this.updateVibe(vibeId);
          this.broadcast({ type: 'vibe_change', payload: data.payload });
          break;
        case 'ast_patch':
          await this.patchAst(data.payload as Record<string, unknown>);
          this.broadcast({ type: 'ast_patch', payload: data.payload });
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      try {
        ws.send(JSON.stringify({ 
          type: 'error', 
          payload: 'Failed to process message' 
        }));
      } catch {
        // Client may have disconnected
      }
    }
  }

  /** WebSocket close handler (Hibernation API) */
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    // Hibernation API manages WebSocket cleanup automatically
    console.log(`WebSocket closed: code=${code}, reason=${reason}, wasClean=${wasClean}`);
  }

  /** WebSocket error handler (Hibernation API) */
  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.error('WebSocket error:', error);
    // Hibernation API manages WebSocket cleanup automatically
  }

  /** Broadcast message to all connected clients using Hibernation API */
  private broadcast(message: WSMessage): void {
    const payload = JSON.stringify(message);
    // Use getWebSockets() from Hibernation API - it's the source of truth
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // Client disconnected, Hibernation API will handle cleanup
      }
    }
  }

  /** Get current session state */
  private async getSessionState(): Promise<SessionState | null> {
    return await this.state.storage.get<SessionState>('session');
  }

  /** Initialize a new session */
  private async handleInitSession(request: Request): Promise<Response> {
    const body = await request.json() as { projectId: string; vibeId?: string };
    
    // Validate vibeId if provided
    const vibeId = body.vibeId || DEFAULT_VIBE_ID;
    if (!getVibe(vibeId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        data: null, 
        error: `Invalid vibe ID: ${vibeId}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const now = new Date().toISOString();
    
    const session: SessionState = {
      projectId: body.projectId,
      vibeId,
      ast: {},
      createdAt: now,
      updatedAt: now,
    };

    await this.state.storage.put('session', session);
    
    return new Response(JSON.stringify({ success: true, data: session }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Get state handler */
  private async handleGetState(): Promise<Response> {
    const session = await this.getSessionState();
    
    if (!session) {
      return new Response(JSON.stringify({ 
        success: false, 
        data: null, 
        error: 'Session not initialized' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: session }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Set vibe handler */
  private async handleSetVibe(request: Request): Promise<Response> {
    const { vibeId } = await request.json() as { vibeId: string };
    
    // Validate vibe exists
    if (!getVibe(vibeId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        data: null, 
        error: `Invalid vibe ID: ${vibeId}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await this.updateVibe(vibeId);
    
    // Broadcast to all clients
    this.broadcast({ type: 'vibe_change', payload: vibeId });

    const session = await this.getSessionState();
    return new Response(JSON.stringify({ success: true, data: session }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Update AST handler */
  private async handleUpdateAst(request: Request): Promise<Response> {
    const { ast } = await request.json() as { ast: Record<string, unknown> };
    await this.patchAst(ast);
    
    // Broadcast to all clients
    this.broadcast({ type: 'ast_patch', payload: ast });

    const session = await this.getSessionState();
    return new Response(JSON.stringify({ success: true, data: session }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** 
   * Update vibe in storage with retry logic
   * Per Project Context: "Durable Object transactions may fail - implement retry logic"
   */
  private async updateVibe(vibeId: string): Promise<void> {
    await this.retryTransaction(async (txn) => {
      const session = await txn.get<SessionState>('session');
      if (session) {
        session.vibeId = vibeId;
        session.updatedAt = new Date().toISOString();
        await txn.put('session', session);
      }
    });
  }

  /** 
   * Patch AST in storage with retry logic
   * Per Project Context: "Durable Object transactions may fail - implement retry logic"
   */
  private async patchAst(astPatch: Record<string, unknown>, description: string = 'AST update'): Promise<void> {
    await this.retryTransaction(async (txn) => {
      const session = await txn.get<SessionState>('session');
      if (session) {
        session.ast = { ...session.ast, ...astPatch };
        session.updatedAt = new Date().toISOString();
        await txn.put('session', session);
      }
    });
    
    // Push to history for undo/redo
    const session = await this.getSessionState();
    if (session) {
      const history = await this.getHistoryState();
      const updatedHistory = pushHistory(history, session.ast as Record<string, ASTComponent>, description);
      await this.saveHistoryState(updatedHistory);
    }
  }

  /** Execute a storage transaction with retry logic */
  private async retryTransaction(
    fn: (txn: DurableObjectTransaction) => Promise<void>
  ): Promise<void> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.state.storage.transaction(fn);
        return; // Success
      } catch (error) {
        lastError = error;
        console.error(`Transaction attempt ${attempt}/${MAX_RETRIES} failed:`, error);
        
        if (attempt < MAX_RETRIES) {
          // Exponential backoff
          await sleep(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
        }
      }
    }
    
    throw lastError;
  }

  /** Get or create history state */
  private async getHistoryState(): Promise<HistoryState> {
    const history = await this.state.storage.get<HistoryState>('history');
    if (history) return history;
    
    const session = await this.getSessionState();
    const ast = (session?.ast || {}) as Record<string, ASTComponent>;
    return createHistoryState(ast);
  }

  /** Save history state */
  private async saveHistoryState(history: HistoryState): Promise<void> {
    await this.state.storage.put('history', history);
  }

  /** Handle undo request */
  private async handleUndo(): Promise<Response> {
    const history = await this.getHistoryState();
    const result = historyUndo(history);
    
    if (!result.ast) {
      return new Response(JSON.stringify({ 
        success: false, 
        data: null, 
        error: 'Nothing to undo' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update history state
    await this.saveHistoryState(result.state);
    
    // Update session AST to the undone state
    await this.retryTransaction(async (txn) => {
      const session = await txn.get<SessionState>('session');
      if (session) {
        session.ast = result.ast as Record<string, ASTComponent>;
        session.updatedAt = new Date().toISOString();
        await txn.put('session', session);
      }
    });

    // Broadcast update to all clients
    this.broadcast({ type: 'ast_patch', payload: result.ast });
    this.broadcast({ type: 'history_update', payload: getHistorySummary(result.state) });

    const session = await this.getSessionState();
    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        session, 
        history: getHistorySummary(result.state) 
      } 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Handle redo request */
  private async handleRedo(): Promise<Response> {
    const history = await this.getHistoryState();
    const result = historyRedo(history);
    
    if (!result.ast) {
      return new Response(JSON.stringify({ 
        success: false, 
        data: null, 
        error: 'Nothing to redo' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update history state
    await this.saveHistoryState(result.state);
    
    // Update session AST
    await this.retryTransaction(async (txn) => {
      const session = await txn.get<SessionState>('session');
      if (session) {
        session.ast = result.ast as Record<string, ASTComponent>;
        session.updatedAt = new Date().toISOString();
        await txn.put('session', session);
      }
    });

    // Broadcast update to all clients
    this.broadcast({ type: 'ast_patch', payload: result.ast });
    this.broadcast({ type: 'history_update', payload: getHistorySummary(result.state) });

    const session = await this.getSessionState();
    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        session, 
        history: getHistorySummary(result.state) 
      } 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Handle get history summary */
  private async handleGetHistory(): Promise<Response> {
    const history = await this.getHistoryState();
    return new Response(JSON.stringify({ 
      success: true, 
      data: getHistorySummary(history) 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
