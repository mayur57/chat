// components/ChatBubble.tsx

import React from 'react'
import clsx from 'clsx'

type Props = {
  message: string
  isUser: boolean
}

export default function ChatBubble({ message, isUser }: Props) {
  return (
    <div className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl text-sm shadow',
          'whitespace-pre-wrap break-words',
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-sm'
        )}
      >
        {message}
      </div>
    </div>
  )
}
