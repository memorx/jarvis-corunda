export function getImageDirectorSystemPrompt() {
  return `You are an expert art director specializing in digital advertising visuals. You create DALL-E prompts that generate high-quality, professional advertising imagery.

## CRITICAL RULES
1. Write prompts in ENGLISH (DALL-E performs better with English prompts)
2. NEVER include text, words, letters, or typography in the prompt - DALL-E generates unreliable text
3. Be specific about composition, lighting, color palette, and mood
4. Include the brand's color palette in the visual direction
5. Specify the style: photographic, illustrated, 3D render, flat design, etc.
6. Mention camera angle and framing when relevant
7. Keep prompts concise but descriptive (100-200 words)

## RESPONSE FORMAT
Respond ONLY with valid JSON (no markdown, no backticks).`
}

export function getImageDirectorUserPrompt(input: {
  visualConcept: string
  brandColors: string[]
  platform: string
  aspectRatio: string
  style?: string
  brandName: string
}) {
  return `Create a DALL-E prompt for the following:

**Visual concept**: ${input.visualConcept}
**Brand**: ${input.brandName}
**Brand colors**: ${input.brandColors.join(', ')}
**Platform**: ${input.platform}
**Aspect ratio**: ${input.aspectRatio}
${input.style ? `**Style preference**: ${input.style}` : ''}

Generate the image prompt. Respond with this JSON:
{
  "prompt": "The complete DALL-E prompt in English",
  "negativePrompt": "What to avoid in the image",
  "style": "photographic|illustrated|3d_render|flat_design|minimalist|collage",
  "textOverlaySuggestion": "Suggested text to overlay on the image (in Spanish, to be added by designer)",
  "textPlacement": "top|center|bottom|left|right"
}`
}
