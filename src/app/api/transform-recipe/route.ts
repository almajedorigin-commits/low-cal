import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { recipe } = await request.json()

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are a world-class AI chef with mastery of all cuisines and nutritional science. Your specialty is transforming any recipe into a low-calorie alternative while maintaining the exact same flavor profile and culinary experience.

For any recipe given to you:
1. Analyze the original recipe's ingredients, cooking methods, and flavor profile
2. Identify high-calorie ingredients and suggest healthier alternatives
3. Calculate approximate calorie reduction
4. Provide detailed substitutions with explanations
5. Maintain the same cooking techniques and timing
6. Ensure the transformed recipe is just as delicious and satisfying

Format your response as:
=== TRANSFORMED RECIPE ===
[Recipe Name - Low-Calorie Version]

=== INGREDIENTS ===
[List all ingredients with substitutions clearly marked]

=== INSTRUCTIONS ===
[Step-by-step cooking instructions]

=== NUTRITIONAL COMPARISON ===
Original: [estimated calories]
Transformed: [estimated calories]
Reduction: [percentage and amount]

=== CHEF'S NOTES ===
[Professional tips and explanations for substitutions]`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Please transform this recipe into a low-calorie version:\n\n${recipe}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const transformedRecipe = completion.choices[0]?.message?.content || 'Unable to transform recipe at this time.'

    return NextResponse.json({ transformedRecipe })
  } catch (error) {
    console.error('Error transforming recipe:', error)
    return NextResponse.json(
      { error: 'Failed to transform recipe' },
      { status: 500 }
    )
  }
}