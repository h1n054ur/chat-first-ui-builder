import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import type { CloudflareBindings } from './lib/types'
import { 
  validateBody,
  CreateProjectSchema,
  UpdateVibeSchema,
  GenerateComponentSchema,
  GenerateStreamSchema,
  NudgeRequestSchema,
} from './lib/validation'
import { getAllVibes, getVibe, DEFAULT_VIBE_ID, applyNudgeToAST, validateDelta } from './features/nudge-engine'
import { generateVibeCss } from './features/nudge-engine/vibe-css'
import { VibeGallery } from './components/ui'
import { VibePreview } from './components/templates'
import { 
  getStateManager, 
  initSession, 
  getSessionState, 
  setSessionVibe,
  generateProjectId,
  updateSessionAst,
  undoSession,
  redoSession,
  getSessionHistory
} from './features/state-manager'
import { 
  createAIClient, 
  generateComponent,
  generateNudge,
  streamComponentGeneration,
  createSSEStream
} from './features/chat'
import { sanitizeJsx, validateJsx, addTrackingId } from './features/chat/sanitize'
import { 
  createProjectBundle, 
  createZipFile, 
  generateExportFilename 
} from './features/export-serializer'
import { generateVibeCss as generateVibeCssForExport } from './features/nudge-engine/vibe-css'

// Re-export Durable Object for Cloudflare
export { StateManager } from './infrastructure/durable-objects/StateManager'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// ============================================
// Middleware
// ============================================

// CORS middleware for API endpoints
app.use('/api/*', cors({
  origin: '*', // Configure appropriately for production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
}))

// Simple rate limiting state (per-worker, not distributed)
// For production, use Cloudflare Rate Limiting or KV-based solution
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30 // 30 requests per minute for generation

function checkRateLimit(key: string, maxRequests: number = RATE_LIMIT_MAX_REQUESTS): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  
  if (entry.count >= maxRequests) {
    return false
  }
  
  entry.count++
  return true
}

// Rate limiting middleware for generation endpoints
app.use('/api/generate/*', async (c, next) => {
  // Use IP or a header for rate limiting key
  const clientId = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
  
  if (!checkRateLimit(`generate:${clientId}`)) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'Rate limit exceeded. Please wait before making more requests.' 
    }, 429)
  }
  
  await next()
})

app.use('/api/nudge', async (c, next) => {
  const clientId = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
  
  if (!checkRateLimit(`nudge:${clientId}`)) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'Rate limit exceeded. Please wait before making more requests.' 
    }, 429)
  }
  
  await next()
})

app.use(renderer)

// ============================================
// Helper Functions
// ============================================

/** Get AI model from environment or use default */
function getAIModel(env: CloudflareBindings): string {
  return env.AI_MODEL || 'claude-sonnet-4-20250514'
}

// ============================================
// Pages
// ============================================

// Home page with vibe gallery
app.get('/', (c) => {
  const vibes = getAllVibes()
  const selectedVibeId = c.req.query('vibe') || DEFAULT_VIBE_ID
  const selectedVibe = getVibe(selectedVibeId) || getVibe(DEFAULT_VIBE_ID)!

  return c.render(
    <div class="min-h-screen bg-slate-50">
      <header class="border-b border-slate-200 bg-white px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-slate-900">02</h1>
          <span class="text-sm text-slate-500">Chat-first Frontend UX/UI Builder</span>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-6 py-8">
        <div class="grid gap-8 lg:grid-cols-2">
          <div>
            <VibeGallery
              vibes={vibes}
              selectedVibeId={selectedVibeId}
            />
          </div>
          <div>
            <h2 class="mb-4 text-xl font-semibold text-slate-900">Live Preview</h2>
            <VibePreview vibe={selectedVibe} />
          </div>
        </div>
      </main>
    </div>
  )
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ success: true, data: { status: 'ok' } })
})

// ============================================
// Vibe API
// ============================================

// API: Get all vibes
app.get('/api/vibes', (c) => {
  const vibes = getAllVibes()
  return c.json({ success: true, data: vibes })
})

// API: Get specific vibe
app.get('/api/vibes/:id', (c) => {
  const id = c.req.param('id')
  const vibe = getVibe(id)
  if (!vibe) {
    return c.json({ success: false, data: null, error: 'Vibe not found' }, 404)
  }
  return c.json({ success: true, data: vibe })
})

// API: Get vibe CSS
app.get('/api/vibes/:id/css', (c) => {
  const id = c.req.param('id')
  const vibe = getVibe(id)
  if (!vibe) {
    return c.json({ success: false, data: null, error: 'Vibe not found' }, 404)
  }
  const css = generateVibeCss(vibe)
  return c.text(css, 200, { 'Content-Type': 'text/css' })
})

// ============================================
// Session State Management API
// ============================================

// API: Create new project session
app.post('/api/projects', async (c) => {
  const validation = await validateBody(c.req.raw, CreateProjectSchema)
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error }, 400)
  }
  
  const projectId = generateProjectId()
  const response = await initSession(c.env, projectId, validation.data.vibeId)
  const data = await response.json()
  
  return c.json(data, response.status as 200 | 201 | 400 | 404 | 500)
})

// API: Get project state
app.get('/api/projects/:projectId', async (c) => {
  const projectId = c.req.param('projectId')
  
  const response = await getSessionState(c.env, projectId)
  const data = await response.json()
  
  return c.json(data, response.status as 200 | 404 | 500)
})

// API: Update project vibe
app.put('/api/projects/:projectId/vibe', async (c) => {
  const projectId = c.req.param('projectId')
  
  const validation = await validateBody(c.req.raw, UpdateVibeSchema)
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error }, 400)
  }
  
  const response = await setSessionVibe(c.env, projectId, validation.data.vibeId)
  const data = await response.json()
  
  return c.json(data, response.status as 200 | 400 | 404 | 500)
})

// API: WebSocket connection for real-time sync
app.get('/api/projects/:projectId/ws', async (c) => {
  const projectId = c.req.param('projectId')
  
  // Check if this is a WebSocket upgrade request
  const upgradeHeader = c.req.header('Upgrade')
  if (upgradeHeader !== 'websocket') {
    return c.json({ success: false, error: 'Expected WebSocket upgrade' }, 426)
  }
  
  // Forward to the Durable Object
  const stub = getStateManager(c.env, projectId)
  return stub.fetch(c.req.raw)
})

// API: Undo last change
app.post('/api/projects/:projectId/undo', async (c) => {
  const projectId = c.req.param('projectId')
  
  const response = await undoSession(c.env, projectId)
  const data = await response.json()
  
  return c.json(data, response.status as 200 | 400 | 404 | 500)
})

// API: Redo last undone change
app.post('/api/projects/:projectId/redo', async (c) => {
  const projectId = c.req.param('projectId')
  
  const response = await redoSession(c.env, projectId)
  const data = await response.json()
  
  return c.json(data, response.status as 200 | 400 | 404 | 500)
})

// API: Get history summary
app.get('/api/projects/:projectId/history', async (c) => {
  const projectId = c.req.param('projectId')
  
  const response = await getSessionHistory(c.env, projectId)
  const data = await response.json()
  
  return c.json(data, response.status as 200 | 404 | 500)
})

// ============================================
// AI Component Generation API
// ============================================

// API: Generate component from natural language
app.post('/api/generate', async (c) => {
  // Validate request body with Zod
  const validation = await validateBody(c.req.raw, GenerateComponentSchema)
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error }, 400)
  }

  const { prompt, vibeId, projectId, context } = validation.data

  // Check for API key
  const apiKey = c.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'ANTHROPIC_API_KEY not configured' 
    }, 500)
  }

  // Get vibe
  const resolvedVibeId = vibeId || DEFAULT_VIBE_ID
  const vibe = getVibe(resolvedVibeId)
  if (!vibe) {
    return c.json({ success: false, data: null, error: 'Invalid vibe ID' }, 400)
  }

  // Generate component
  const client = createAIClient({ apiKey })
  const model = getAIModel(c.env)
  const result = await generateComponent(client, {
    prompt,
    vibe,
    context,
  }, model)

  if (!result.success || !result.jsx) {
    return c.json({ 
      success: false, 
      data: null, 
      error: result.error || 'Generation failed' 
    }, 500)
  }

  // Validate and sanitize
  const validationResult = validateJsx(result.jsx)
  if (!validationResult.valid) {
    return c.json({ 
      success: false, 
      data: null, 
      error: `Invalid JSX: ${validationResult.issues.join(', ')}` 
    }, 400)
  }

  const sanitizedJsx = sanitizeJsx(result.jsx)
  const componentId = `comp_${Date.now()}`
  const trackedJsx = addTrackingId(sanitizedJsx, componentId)

  // If projectId provided, update the session AST
  if (projectId) {
    await updateSessionAst(c.env, projectId, {
      [componentId]: {
        jsx: trackedJsx,
        createdAt: new Date().toISOString(),
      }
    })
  }

  return c.json({ 
    success: true, 
    data: { 
      jsx: trackedJsx,
      componentId,
    } 
  })
})

// API: Generate component with streaming (SSE)
app.post('/api/generate/stream', async (c) => {
  // Validate request body with Zod
  const validation = await validateBody(c.req.raw, GenerateStreamSchema)
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error }, 400)
  }

  const { prompt, vibeId, context } = validation.data

  // Check for API key
  const apiKey = c.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'ANTHROPIC_API_KEY not configured' 
    }, 500)
  }

  // Get vibe
  const resolvedVibeId = vibeId || DEFAULT_VIBE_ID
  const vibe = getVibe(resolvedVibeId)
  if (!vibe) {
    return c.json({ success: false, data: null, error: 'Invalid vibe ID' }, 400)
  }

  // Create streaming response
  const client = createAIClient({ apiKey })
  const model = getAIModel(c.env)
  const generator = streamComponentGeneration(client, prompt, vibe, context, model)
  const stream = createSSEStream(generator)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})

// API: Generate nudge (style delta)
app.post('/api/nudge', async (c) => {
  // Validate request body with Zod
  const validation = await validateBody(c.req.raw, NudgeRequestSchema)
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error }, 400)
  }

  const { prompt, vibeId, targetElement, currentClasses, projectId, componentId } = validation.data

  // Check for API key
  const apiKey = c.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'ANTHROPIC_API_KEY not configured' 
    }, 500)
  }

  // Get vibe
  const resolvedVibeId = vibeId || DEFAULT_VIBE_ID
  const vibe = getVibe(resolvedVibeId)
  if (!vibe) {
    return c.json({ success: false, data: null, error: 'Invalid vibe ID' }, 400)
  }

  // Generate nudge delta from AI
  const client = createAIClient({ apiKey })
  const model = getAIModel(c.env)
  const result = await generateNudge(client, {
    prompt,
    vibe,
    targetElement,
    currentClasses,
  }, model)

  if (!result.success) {
    return c.json({ 
      success: false, 
      data: null, 
      error: result.error || 'Nudge generation failed' 
    }, 500)
  }

  const delta = { add: result.add || [], remove: result.remove || [] }

  // Validate the delta before applying
  const deltaValidation = validateDelta(delta)
  if (!deltaValidation.valid) {
    return c.json({
      success: false,
      data: null,
      error: `Invalid delta: ${deltaValidation.issues.join(', ')}`
    }, 400)
  }

  // If projectId and componentId provided, apply to AST
  if (projectId && componentId) {
    // Get current project state
    const stateResponse = await getSessionState(c.env, projectId)
    if (!stateResponse.ok) {
      return c.json({ 
        success: false, 
        data: null, 
        error: 'Project not found' 
      }, 404)
    }

    const stateData = await stateResponse.json() as { 
      success: boolean
      data: { ast: Record<string, { jsx: string; createdAt: string }> }
    }

    if (!stateData.success || !stateData.data?.ast) {
      return c.json({
        success: false,
        data: null,
        error: 'Failed to retrieve project state'
      }, 500)
    }

    // Apply nudge to AST using the patcher
    const patchResult = applyNudgeToAST(stateData.data.ast, componentId, delta)

    if (!patchResult.success) {
      return c.json({
        success: false,
        data: null,
        error: patchResult.error || 'Failed to apply nudge to AST'
      }, 400)
    }

    // Update the session with patched AST
    await updateSessionAst(c.env, projectId, patchResult.ast)
  }

  return c.json({ 
    success: true, 
    data: {
      add: delta.add,
      remove: delta.remove,
      applied: !!(projectId && componentId),
    }
  })
})

// ============================================
// Export API
// ============================================

// API: Export project as ZIP bundle
app.get('/api/projects/:projectId/export', async (c) => {
  const projectId = c.req.param('projectId')
  
  // Get project state from Durable Object
  const response = await getSessionState(c.env, projectId)
  if (!response.ok) {
    const errorData = await response.json() as { error?: string }
    return c.json({ 
      success: false, 
      data: null, 
      error: errorData.error || 'Project not found' 
    }, response.status as 404 | 500)
  }
  
  const stateData = await response.json() as { 
    success: boolean
    data: { 
      vibeId: string
      ast: Record<string, { jsx: string; createdAt: string }>
    }
  }
  
  if (!stateData.success || !stateData.data) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'Failed to retrieve project state' 
    }, 500)
  }
  
  const { vibeId, ast } = stateData.data
  
  // Check if there are any components to export
  if (!ast || Object.keys(ast).length === 0) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'No components to export. Generate some components first.' 
    }, 400)
  }
  
  // Get vibe for CSS generation
  const vibe = getVibe(vibeId)
  if (!vibe) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'Invalid vibe ID in project' 
    }, 400)
  }
  
  // Generate vibe CSS
  const vibeCss = generateVibeCssForExport(vibe)
  
  // Create project bundle and ZIP
  const bundle = createProjectBundle(ast, vibeId, vibeCss)
  const zip = createZipFile(bundle)
  const filename = generateExportFilename(vibeId)
  
  // Return ZIP file as download
  return new Response(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': zip.length.toString(),
    },
  })
})

// API: Get export bundle info (without downloading)
app.get('/api/projects/:projectId/export/info', async (c) => {
  const projectId = c.req.param('projectId')
  
  // Get project state
  const response = await getSessionState(c.env, projectId)
  if (!response.ok) {
    const errorData = await response.json() as { error?: string }
    return c.json({ 
      success: false, 
      data: null, 
      error: errorData.error || 'Project not found' 
    }, response.status as 404 | 500)
  }
  
  const stateData = await response.json() as { 
    success: boolean
    data: { 
      vibeId: string
      ast: Record<string, { jsx: string; createdAt: string }>
    }
  }
  
  if (!stateData.success || !stateData.data) {
    return c.json({ 
      success: false, 
      data: null, 
      error: 'Failed to retrieve project state' 
    }, 500)
  }
  
  const { vibeId, ast } = stateData.data
  const componentCount = ast ? Object.keys(ast).length : 0
  const filename = generateExportFilename(vibeId)
  
  return c.json({
    success: true,
    data: {
      projectId,
      vibeId,
      componentCount,
      suggestedFilename: filename,
      exportUrl: `/api/projects/${projectId}/export`,
    }
  })
})

export default app
