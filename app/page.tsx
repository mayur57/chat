'use client'
import { useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user' as const, content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const res = await fetch('http://192.168.1.69:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: newMessages,
        stream: false
      })
    })

    const data = await res.json()
    const reply = data.message?.content || 'No response'
    setMessages([...newMessages, { role: 'assistant' as const, content: reply }])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ollama Chat</h1>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}>
              <p>{m.content}</p>
            </div>
          ))}
          {loading && <div className="text-gray-500 italic">Thinking…</div>}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Ask something..."
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
        </form>
      </div>
    </div>
  )
}
