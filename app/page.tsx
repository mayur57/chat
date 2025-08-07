'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...newMessages] })
    })

    if (!response.body) return

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    const aiMsg = { role: 'assistant', content: '' }
    setMessages([...newMessages, aiMsg])

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)

      for (const line of chunk.trim().split('\n')) {
        if (!line.trim()) continue
        try {
          const json = JSON.parse(line)
          const content = json.message?.content || ''
          aiMsg.content += content
          setMessages([...newMessages, { ...aiMsg }])
        } catch (_) {
          // ignore malformed chunks
        }
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 p-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 p-4 shadow rounded">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Ollama Chat</h1>
        <div
          ref={chatRef}
          className="h-[60vh] overflow-y-auto space-y-3 mb-4 pr-1 scroll-smooth text-xs"
        >
          {messages.map((m, i) => (
            <div key={i} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm shadow whitespace-pre-wrap break-words',
                  m.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-bl-sm'
                )}
              >
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm italic text-gray-500 dark:text-gray-400 px-2">Streaming response…</div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="w-10 h-10 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-white flex items-center justify-center -rotate-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m0 0l-6-6m6 6l-6 6"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
