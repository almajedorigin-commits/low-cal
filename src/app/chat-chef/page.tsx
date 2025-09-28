'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowLeft, ChefHat, Zap, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChatChefPage() {
  const router = useRouter()
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [recipe, setRecipe] = useState('')
  const [transformedRecipe, setTransformedRecipe] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, isChatLoading])

  // Load recipe data from localStorage if available
  useEffect(() => {
    const savedRecipe = localStorage.getItem('currentRecipe')
    const savedTransformedRecipe = localStorage.getItem('currentTransformedRecipe')
    if (savedRecipe) setRecipe(savedRecipe)
    if (savedTransformedRecipe) setTransformedRecipe(savedTransformedRecipe)
  }, [])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    
    const newMessage = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, newMessage])
    setChatInput('')
    setIsChatLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages, newMessage],
          recipe,
          transformedRecipe 
        })
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.' 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-2 sm:py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Recipe
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Chef Chat
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Powered by Advanced AI</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Zap className="h-3 w-3" /> AI-Powered
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Globe className="h-3 w-3" /> Global Pricing
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <MessageSquare className="h-3 w-3" /> Expert Chef
            </Badge>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-6xl mx-auto">
          <Card className="h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] flex flex-col">
            <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Chat with your AI Chef
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ask about ingredients, cooking techniques, nutritional information, or request recipe modifications
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 p-3 sm:p-4 space-y-3">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-3 border rounded-lg p-3 sm:p-4 bg-background" ref={chatContainerRef}>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Welcome to your AI Chef!</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 max-w-md mx-auto">
                      I'm your professional culinary assistant, ready to help with recipes, cooking techniques, nutritional advice, and ingredient substitutions.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-lg mx-auto">
                      <div className="p-2 sm:p-3 bg-muted rounded-lg text-xs sm:text-sm">
                        💡 Ingredient alternatives
                      </div>
                      <div className="p-2 sm:p-3 bg-muted rounded-lg text-xs sm:text-sm">
                        🌍 Global pricing info
                      </div>
                      <div className="p-2 sm:p-3 bg-muted rounded-lg text-xs sm:text-sm">
                        🥗 Dietary modifications
                      </div>
                      <div className="p-2 sm:p-3 bg-muted rounded-lg text-xs sm:text-sm">
                        👨‍🍳 Cooking techniques
                      </div>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-muted text-muted-foreground rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-muted-foreground'}`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs sm:text-sm font-bold">U</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {/* Loading indicator */}
                {isChatLoading && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user' && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-none px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs sm:text-sm">AI Chef is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="flex-shrink-0 space-y-2 sm:space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about ingredients, modifications, or cooking tips..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border rounded-2xl text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isChatLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!chatInput.trim() || isChatLoading}
                    size="sm"
                    className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl"
                  >
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput("Can you suggest healthier alternatives for the ingredients?")}
                    className="text-xs px-2 sm:px-3 py-1"
                  >
                    💚 Healthier alternatives
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput("What's the estimated cost of these ingredients?")}
                    className="text-xs px-2 sm:px-3 py-1"
                  >
                    💰 Ingredient costs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput("Can you modify this for a vegetarian diet?")}
                    className="text-xs px-2 sm:px-3 py-1"
                  >
                    🥬 Vegetarian version
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput("What cooking techniques work best here?")}
                    className="text-xs px-2 sm:px-3 py-1"
                  >
                    👨‍🍳 Cooking tips
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput("How can I make this gluten-free?")}
                    className="text-xs px-2 sm:px-3 py-1"
                  >
                    🌾 Gluten-free option
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput("What are the nutritional benefits?")}
                    className="text-xs px-2 sm:px-3 py-1"
                  >
                    📊 Nutrition info
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}