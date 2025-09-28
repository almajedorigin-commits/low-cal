'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChefHat, Zap, Globe, MessageSquare, ArrowRight, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SplitButton } from '@/components/ui/split-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Home() {
  const router = useRouter()
  const [recipe, setRecipe] = useState('')
  const [transformedRecipe, setTransformedRecipe] = useState('')
  const [isTransforming, setIsTransforming] = useState(false)

  const handleTransform = async () => {
    if (!recipe.trim()) return
    
    setIsTransforming(true)
    try {
      const response = await fetch('/api/transform-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe })
      })
      const data = await response.json()
      setTransformedRecipe(data.transformedRecipe)
      
      // Save recipe data to localStorage for chat page
      localStorage.setItem('currentRecipe', recipe)
      localStorage.setItem('currentTransformedRecipe', data.transformedRecipe)
    } catch (error) {
      console.error('Error transforming recipe:', error)
    } finally {
      setIsTransforming(false)
    }
  }

  const handleGoToChat = () => {
    router.push('/chat-chef')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Header with Split Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                AI Recipe Transformer
              </h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto sm:mx-0 px-4 sm:px-0">
              Transform any recipe into a low-calorie alternative with the exact same flavor. 
              Your personal AI chef with mastery of all cuisines.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3 sm:mt-4">
              <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                <Zap className="h-3 w-3" /> AI-Powered
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                <Globe className="h-3 w-3" /> Global Pricing
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3" /> Gemini 2.5 Chat
              </Badge>
            </div>
          </div>
          
          {/* Split Button */}
          <div className="flex-shrink-0">
            <SplitButton
              mainAction={handleGoToChat}
              mainLabel="Ask AI Chef"
              mainIcon={<MessageSquare className="h-4 w-4" />}
              variant="default"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              dropdownItems={[
                {
                  label: "Chat about ingredients",
                  action: handleGoToChat,
                  icon: <MessageSquare className="h-4 w-4" />
                },
                {
                  label: "Get cooking tips",
                  action: handleGoToChat,
                  icon: <ChefHat className="h-4 w-4" />
                },
                {
                  label: "Nutritional advice",
                  action: handleGoToChat,
                  icon: <Zap className="h-4 w-4" />
                }
              ]}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-1 gap-6 lg:gap-8">
          {/* Main Content - Recipe Input and Results */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Enter Your Recipe</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Paste any recipe and watch AI transform it into a low-calorie version
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your recipe here... Include ingredients, instructions, and any specific requirements."
                  value={recipe}
                  onChange={(e) => setRecipe(e.target.value)}
                  className="min-h-[180px] sm:min-h-[200px] text-sm sm:text-base"
                />
                <Button 
                  onClick={handleTransform} 
                  disabled={!recipe.trim() || isTransforming}
                  className="w-full text-sm sm:text-base"
                >
                  {isTransforming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Transforming...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Transform Recipe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Recipe Transformation</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Compare original and transformed recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transformed" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original" className="text-xs sm:text-sm">Original Recipe</TabsTrigger>
                    <TabsTrigger value="transformed" className="text-xs sm:text-sm">Low-Calorie Version</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="original" className="mt-3 sm:mt-4">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-xs sm:text-sm">{recipe || 'No recipe entered yet...'}</pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transformed" className="mt-3 sm:mt-4">
                    {transformedRecipe ? (
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-xs sm:text-sm">{transformedRecipe}</pre>
                        </div>
                        <div className="pt-4 border-t">
                          <Button 
                            onClick={handleGoToChat}
                            variant="outline"
                            className="w-full"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Discuss this recipe with AI Chef
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <Zap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Transform a recipe to see the low-calorie version here</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}