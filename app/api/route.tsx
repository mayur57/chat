import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
  const body = await request.json()
  
  const ollamaRes = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma2:2b',
      messages: body.messages,
      stream: true
    })
  })

  const stream = new ReadableStream({
    async start(controller) {
      if (!ollamaRes.body) {
        controller.close()
        return
      }
      
      const reader = ollamaRes.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
        }
      } finally {
        reader.releaseLock()
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}