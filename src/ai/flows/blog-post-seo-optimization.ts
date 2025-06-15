'use server';

/**
 * @fileOverview An AI agent that analyzes blog post content and suggests improvements for SEO.
 *
 * - analyzeBlogPostSeo - A function that handles the blog post SEO analysis process.
 * - BlogPostSeoInput - The input type for the analyzeBlogPostSeo function.
 * - BlogPostSeoOutput - The return type for the analyzeBlogPostSeo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BlogPostSeoInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  content: z.string().describe('The content of the blog post.'),
  keywords: z.string().describe('The keywords for the blog post.'),
});
export type BlogPostSeoInput = z.infer<typeof BlogPostSeoInputSchema>;

const BlogPostSeoOutputSchema = z.object({
  seoSuggestions: z.string().describe('Suggestions for improving the SEO of the blog post.'),
  keywordDensityScore: z.number().describe('A score indicating the keyword density of the blog post.'),
  metaDescriptionSuggestions: z.string().describe('Suggestions for improving the meta description of the blog post.'),
  readabilitySuggestions: z.string().describe('Suggestions for improving the readability of the blog post.'),
  toolSuggestion: z.boolean().describe('A suggestion to add more information to make the blog post a tool.'),
});
export type BlogPostSeoOutput = z.infer<typeof BlogPostSeoOutputSchema>;

export async function analyzeBlogPostSeo(input: BlogPostSeoInput): Promise<BlogPostSeoOutput> {
  return analyzeBlogPostSeoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'blogPostSeoPrompt',
  input: {schema: BlogPostSeoInputSchema},
  output: {schema: BlogPostSeoOutputSchema},
  prompt: `You are an SEO expert. Analyze the following blog post content and provide suggestions for improvement.

Title: {{{title}}}
Content: {{{content}}}
Keywords: {{{keywords}}}

Provide suggestions for:
- Improving the SEO of the blog post.
- Improving the keyword density of the blog post. Provide a score between 0 and 1, with 1 being the best.
- Improving the meta description of the blog post.
- Improving the readability of the blog post.
- Whether the blog post needs more information to become a tool.

Output in JSON format:
{{{output hints=BlogPostSeoOutputSchema}}}`,
});

const analyzeBlogPostSeoFlow = ai.defineFlow(
  {
    name: 'analyzeBlogPostSeoFlow',
    inputSchema: BlogPostSeoInputSchema,
    outputSchema: BlogPostSeoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
