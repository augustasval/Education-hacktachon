import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, MessageCircle, X, Send } from 'lucide-react'

interface Step {
  id: string
  step: number
  description: string
  explanation: string
}

interface Example {
  id: string
  title: string
  problem: string
  solution: Step[]
}

interface Section {
  id: string
  title: string
  theory: string
  example: Example
}

interface Topic {
  id: string
  sections: Section[]
}

interface LearnContentProps {
  content: Record<string, Topic>
  selectedTopic: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  message: string
}

export default function LearnContent({ content, selectedTopic }: LearnContentProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [showExample, setShowExample] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [showChat, setShowChat] = useState(false)
  const [chatContext, setChatContext] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const topic = content[selectedTopic]
  if (!topic || !topic.sections) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No Content Available</h2>
          <p className="text-gray-500">Please select a different topic or try again later.</p>
        </div>
      </div>
    )
  }

  const currentSection = topic.sections[currentSectionIndex]
  const totalSections = topic.sections.length

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(prev => prev + 1)
      setShowExample(false)
      setExpandedSteps(new Set())
    }
  }

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
      setShowExample(false)
      setExpandedSteps(new Set())
    }
  }

  const toggleStep = (stepId: string) => {
    const newExpandedSteps = new Set(expandedSteps)
    if (newExpandedSteps.has(stepId)) {
      newExpandedSteps.delete(stepId)
    } else {
      newExpandedSteps.add(stepId)
    }
    setExpandedSteps(newExpandedSteps)
  }

  const openChat = (context: string) => {
    setChatContext(context)
    setShowChat(true)
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      type: 'user',
      message: currentMessage
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'learn-question',
          context: chatContext,
          question: currentMessage,
          topic: selectedTopic,
          section: currentSection.title
        })
      })

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        type: 'assistant',
        message: data.response || data.answer || 'I apologize, but I could not process your question at this time.'
      }

      setChatMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        type: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.'
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const closeChat = () => {
    setShowChat(false)
    setChatMessages([])
    setChatContext('')
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className={`${showChat ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedTopic.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <div className="text-sm text-gray-500">
                Section {currentSectionIndex + 1} of {totalSections}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{currentSection.title}</h2>
              <button
                onClick={() => openChat(`Theory: ${currentSection.theory}`)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <MessageCircle size={16} />
                Ask Question
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {currentSection.theory}
              </div>
            </div>
          </div>

          {/* Example Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Example: {currentSection.example.title}
              </h3>
              <button
                onClick={() => setShowExample(!showExample)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                {showExample ? 'Hide Solution' : 'Show Solution'}
                <ChevronRight 
                  size={16} 
                  className={`transform transition-transform ${showExample ? 'rotate-90' : ''}`} 
                />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-800">{currentSection.example.problem}</p>
                <button
                  onClick={() => openChat(`Problem: ${currentSection.example.problem}`)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <MessageCircle size={14} />
                  Help
                </button>
              </div>
            </div>

            {showExample && (
              <div className="space-y-3">
                {currentSection.example.solution.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">
                        Step {step.step}: {step.description}
                      </span>
                      <ChevronRight 
                        size={16} 
                        className={`transform transition-transform ${expandedSteps.has(step.id) ? 'rotate-90' : ''}`} 
                      />
                    </button>
                    
                    {expandedSteps.has(step.id) && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-gray-700 leading-relaxed flex-1 pt-2">
                            {step.explanation}
                          </p>
                          <button
                            onClick={() => openChat(`Step ${step.step}: ${step.description}\nExplanation: ${step.explanation}`)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors mt-2"
                          >
                            <MessageCircle size={12} />
                            Ask
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentSectionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentSectionIndex === totalSections - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentSectionIndex === totalSections - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-1/3 border-l border-gray-200 bg-white flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Ask a Question</h3>
            <button
              onClick={closeChat}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Context */}
          <div className="p-3 bg-blue-50 border-b border-gray-200">
            <p className="text-xs text-blue-700 font-medium mb-1">Context:</p>
            <p className="text-xs text-blue-600 line-clamp-3">{chatContext}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                Ask a question about the current topic or step!
              </div>
            )}
            
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.message}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
