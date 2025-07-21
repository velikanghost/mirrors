import { useStateTogether, useConnectedUsers } from 'react-together'
import { useEffect } from 'react'

export default function SyncTest() {
  const connectedUsers = useConnectedUsers()

  const [count, setCount] = useStateTogether('test-counter', 0, {
    resetOnDisconnect: true,
    throttleDelay: 100,
  })

  const [text, setText] = useStateTogether('test-text', '', {
    resetOnDisconnect: true,
    throttleDelay: 100,
  })

  // Debug effect
  useEffect(() => {
    console.log('Connected users:', connectedUsers)
  }, [connectedUsers])

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {/* Debug Info */}
      <div className="text-sm text-gray-400 mb-4">
        Connected Users: {connectedUsers?.length || 0}
      </div>

      {/* Counter Test */}
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">Counter Test</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCount((prev) => prev - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            -
          </button>
          <span className="text-2xl font-mono min-w-[3ch] text-center">
            {count}
          </span>
          <button
            onClick={() => setCount((prev) => prev + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            +
          </button>
        </div>
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Reset
        </button>
      </div>

      {/* Text Input Test */}
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">Text Input Test</h2>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setText('')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Clear
        </button>
      </div>

      {/* Debug Values */}
      <div className="text-sm text-gray-400 mt-8">
        <div>Current Count: {count}</div>
        <div>Current Text: {text || '(empty)'}</div>
      </div>
    </div>
  )
}
