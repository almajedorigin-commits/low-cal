import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { messages, recipe, transformedRecipe } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are Chef AI, a world-class culinary expert and master chef with extensive knowledge of global cuisines, nutritional science, and food preparation techniques. You provide professional, detailed, and actionable culinary advice.

Your expertise includes:
🍳 **Recipe Development**: Creating and modifying recipes with precision
🥗 **Nutritional Analysis**: Detailed breakdown of nutritional content and health benefits
🌍 **Global Ingredients**: Knowledge of ingredients from around the world and their uses
🔥 **Cooking Techniques**: Professional cooking methods and temperature control
📊 **Food Science**: Understanding the chemistry behind cooking processes
🛒 **Ingredient Substitutions**: Expert alternatives for dietary restrictions
⏱️ **Time Management**: Efficient cooking workflows and preparation timing

Current Recipe Context:
- Original Recipe: ${recipe || 'No recipe provided yet'}
- Transformed Recipe: ${transformedRecipe || 'No transformation available'}

Communication Style:
- Be professional yet friendly and approachable
- Provide detailed, step-by-step guidance when appropriate
- Include specific measurements, temperatures, and timing
- Explain the "why" behind cooking techniques
- Offer multiple options when relevant
- Use emojis sparingly to enhance readability (🍳🥗🌶️🧄🍋)

Always provide comprehensive, expert-level culinary advice that home cooks and professionals can benefit from.`

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]
    const userMessage = lastUserMessage.content.toLowerCase()
    let responseContent = ''

    // Check if the user is asking for pricing information
    if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('pricing') || userMessage.includes('expensive') || userMessage.includes('cheap') || userMessage.includes('affordable')) {
      try {
        // Use web search for current pricing information
        const searchResult = await zai.functions.invoke("web_search", {
          query: `current food prices ingredients grocery cost ${lastUserMessage.content} 2024 2025`,
          num: 6
        })

        const searchContext = searchResult.map((item: any) => 
          `${item.name}: ${item.snippet}`
        ).join('\n')

        // Create enhanced prompt with pricing data
        const enhancedPrompt = systemPrompt + `\n\nCurrent Market Data (2024-2025):\n${searchContext}\n\nUse this pricing information to provide accurate cost estimates and budget-friendly alternatives in your response.`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: enhancedPrompt
            },
            ...messages.slice(0, -1),
            {
              role: 'user',
              content: lastUserMessage.content
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        })

        responseContent = completion.choices[0]?.message?.content || 'I apologize, but I cannot access current pricing information at this moment. However, I can still provide general guidance on ingredient costs and budget-friendly alternatives based on my culinary expertise.'
      } catch (searchError) {
        console.log('Web search failed, using fallback:', searchError)
        // Fallback to regular chat without pricing data
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...messages
          ],
          temperature: 0.6,
          max_tokens: 1500
        })

        responseContent = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble accessing my full capabilities right now. Let me provide you with some general culinary advice based on my expertise.'
      }
    } else {
      // Regular culinary advice response
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 1800
        })

        responseContent = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble formulating a response right now. Please try asking your question again.'
      } catch (chatError) {
        console.error('Chat completion failed:', chatError)
        // Final fallback response
        responseContent = `I apologize, but I'm experiencing technical difficulties at the moment. As your AI Chef, I'd still like to help you. 

Based on your question about "${lastUserMessage.content}", here's some general guidance:

${recipe ? 'Since you have a recipe loaded, I can help you analyze ingredients, suggest substitutions, or provide cooking techniques.' : 'Please share a recipe with me, and I can provide detailed analysis and suggestions.'}

Please try again in a moment, and I'll be able to give you a more comprehensive response with my full culinary expertise!`
      }
    }

    return NextResponse.json({ response: responseContent })
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}