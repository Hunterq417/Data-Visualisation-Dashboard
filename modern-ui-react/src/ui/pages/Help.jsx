import React, { useState, useRef, useEffect } from 'react'
import { Sidebar, Topbar } from '../components/Shell'
import './Help.css'

const Help = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:3000/api/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: inputMessage,
          context: 'help'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage = {
          id: messages.length + 2,
          text: data.response || "I'm sorry, I couldn't process your request. Please try again.",
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm experiencing some issues. Please try again later or contact support.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { title: "Getting Started", description: "Learn the basics of using the dashboard" },
    { title: "Data Visualization", description: "Understand charts and graphs" },
    { title: "Export Reports", description: "How to export your data" },
    { title: "Account Settings", description: "Manage your profile and preferences" }
  ]

  const onLogout = () => {
    localStorage.removeItem('auth')
    location.href = '/login'
  }

  React.useEffect(() => {
    document.body.classList.toggle('mobile-open', mobileOpen)
    return () => document.body.classList.remove('mobile-open')
  }, [mobileOpen])

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Topbar onLogout={onLogout} onMenu={() => setMobileOpen(true)} />
        <main className="content">
          <div className="help-container">
          <div className="help-header">
            <h1>Help & Support</h1>
            <p>Get assistance from our AI-powered help system</p>
          </div>

          <div className="help-content">
            <div className="chat-section">
              <div className="chat-header">
                <div className="bot-info">
                  <div className="bot-avatar">🤖</div>
                  <div>
                    <h3>AI Assistant</h3>
                    <span className="status">
                      {isTyping ? 'typing...' : 'online'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-content">
                      {message.text}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="chat-input"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="send-button"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="quick-help-section">
              <h3>Quick Help Topics</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="quick-action-card"
                    onClick={() => setInputMessage(`Tell me about ${action.title}`)}
                  >
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                ))}
              </div>

              <div className="additional-help">
                <h3>Need More Help?</h3>
                <div className="help-options">
                  <div className="help-option">
                    <span className="icon">📧</span>
                    <div>
                      <h4>Email Support</h4>
                      <p>support@queen.com</p>
                    </div>
                  </div>
                  <div className="help-option">
                    <span className="icon">📚</span>
                    <div>
                      <h4>Documentation</h4>
                      <p>View our comprehensive guides</p>
                    </div>
                  </div>
                  <div className="help-option">
                    <span className="icon">💬</span>
                    <div>
                      <h4>Live Chat</h4>
                      <p>Available 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
    </div>
  )
}

export default Help