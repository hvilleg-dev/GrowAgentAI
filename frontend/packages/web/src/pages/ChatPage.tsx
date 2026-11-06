export default function ChatPage() {
  return (
    <div className="flex h-full">
      {/* Sidebar - Sessions List */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
        <h2 className="text-lg font-semibold mb-4">Sessions</h2>
        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg mb-4">
          + New Session
        </button>
        <div className="space-y-2">
          {/* Sessions will be listed here */}
          <div className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <p className="text-sm font-medium">Session 1</p>
            <p className="text-xs text-gray-500">Today</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-white">
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* Messages will be displayed here */}
          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white rounded-lg px-4 py-2 max-w-xs">
              <p className="text-sm">Hello! How can I help you today?</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
