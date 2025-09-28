import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { recipe, transformedRecipe } = await request.json()

    if (!recipe || !transformedRecipe) {
      return NextResponse.json({ error: 'Both original and transformed recipes are required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    // Extract key ingredients from the recipes for more specific animation
    const extractIngredients = (text: string) => {
      const ingredientMatch = text.match(/(?:INGREDIENTS|Ingredients):\s*\n([\s\S]*?)(?:\n\n|\n===|$)/)
      if (ingredientMatch) {
        return ingredientMatch[1].split('\n').filter(line => line.trim()).slice(0, 5)
      }
      return []
    }

    const originalIngredients = extractIngredients(recipe)
    const transformedIngredients = extractIngredients(transformedRecipe)

    // Extract recipe name for better context
    const extractRecipeName = (text: string) => {
      const nameMatch = text.match(/(?:=== TRANSFORMED RECIPE ===|=== RECIPE ===)\s*\n(.*)/)
      if (nameMatch) {
        return nameMatch[1].trim()
      }
      // Fallback: look for title patterns
      const titleMatch = text.match(/^([A-Z][A-Za-z\s]+)$/m)
      return titleMatch ? titleMatch[1].trim() : 'Delicious Recipe'
    }

    const recipeName = extractRecipeName(transformedRecipe) || extractRecipeName(recipe)

    // Create VEO 3 video generation prompt
    const videoPrompt = `Create a professional cooking video showing the step-by-step transformation of ${recipeName}.

ORIGINAL INGREDIENTS: ${originalIngredients.join(', ')}
TRANSFORMED INGREDIENTS: ${transformedIngredients.join(', ')}

VIDEO REQUIREMENTS:
- Show the complete cooking process from start to finish
- Display both original and healthy ingredients side by side
- Demonstrate proper cooking techniques and preparation methods
- Include close-ups of ingredient preparation and cooking actions
- Show the final beautifully plated dish
- Professional food videography style with cinematic lighting
- Smooth camera movements and transitions
- Upbeat, appetizing presentation
- Duration: 10-15 seconds
- Style: High-end cooking show, Food Network quality
- Resolution: 4K ultra HD
- Frame rate: 30fps for smooth motion`

    try {
      // Generate video using VEO 3
      const videoResponse = await zai.functions.invoke("video_generation", {
        prompt: videoPrompt,
        model: "veo-3",
        duration: 12, // 12 seconds
        quality: "4k",
        style: "cinematic"
      })

      if (videoResponse && videoResponse.video_url) {
        return NextResponse.json({ 
          videoUrl: videoResponse.video_url,
          videoData: videoResponse.video_data || null,
          sceneDescription: videoPrompt,
          duration: videoResponse.duration || 12,
          message: 'Video animation generated successfully with VEO 3'
        })
      } else {
        // Fallback to image sequence if video generation fails
        console.log('VEO 3 video generation failed, falling back to image sequence')
        
        const imagePrompt = `Professional cooking scene showing the transformation of ${recipeName}. 
        Original ingredients: ${originalIngredients.join(', ')}
        Transformed ingredients: ${transformedIngredients.join(', ')}
        Style: Professional food photography, cooking show, vibrant colors, 4K quality`

        const imageResponse = await zai.images.generations.create({
          prompt: imagePrompt,
          size: '1024x1024'
        })

        return NextResponse.json({ 
          videoUrl: null,
          videoData: imageResponse.data[0].base64,
          sceneDescription: videoPrompt,
          duration: 0,
          message: 'Video generation unavailable, showing static image instead'
        })
      }
    } catch (videoError) {
      console.error('Error with VEO 3 video generation:', videoError)
      
      // Fallback to image generation
      try {
        const fallbackPrompt = `Professional cooking transformation of ${recipeName}, showing ${originalIngredients.join(', ')} becoming ${transformedIngredients.join(', ')}, food photography style, cooking process`

        const imageResponse = await zai.images.generations.create({
          prompt: fallbackPrompt,
          size: '1024x1024'
        })

        return NextResponse.json({ 
          videoUrl: null,
          videoData: imageResponse.data[0].base64,
          sceneDescription: videoPrompt,
          duration: 0,
          message: 'VEO 3 temporarily unavailable, showing preview image'
        })
      } catch (fallbackError) {
        return NextResponse.json({ 
          videoUrl: null,
          videoData: null,
          sceneDescription: null,
          duration: 0,
          message: 'Animation generation temporarily unavailable. Please try again later.'
        })
      }
    }
  } catch (error) {
    console.error('Error in animation generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate animation' },
      { status: 500 }
    )
  }
}