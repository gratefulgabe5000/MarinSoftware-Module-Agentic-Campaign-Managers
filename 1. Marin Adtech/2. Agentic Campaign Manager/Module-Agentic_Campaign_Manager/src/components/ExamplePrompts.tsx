import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';

/**
 * ExamplePrompts Component Props
 */
interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

/**
 * Example prompt templates
 */
const EXAMPLE_PROMPTS = [
  {
    title: 'Launch a New Product',
    prompt: 'I want to launch a new software product targeting tech-savvy professionals. My budget is $5,000 per month for 3 months. Help me create a campaign to drive sign-ups.',
  },
  {
    title: 'Increase Brand Awareness',
    prompt: 'I need to increase brand awareness for my e-commerce store. Target audience is women aged 25-45 interested in sustainable fashion. Budget is $3,000/month.',
  },
  {
    title: 'Drive Sales for Existing Product',
    prompt: 'I want to drive more sales for my existing online course. Target audience is entrepreneurs and small business owners. Budget is $2,000/month for 2 months.',
  },
  {
    title: 'Event Promotion',
    prompt: 'I need to promote a virtual conference happening in 6 weeks. Target audience is marketing professionals. Budget is $4,000 for the campaign duration.',
  },
];

/**
 * ExamplePrompts Component
 * Displays example prompts that users can click to start a conversation
 */
const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Get Started</h3>
        <p className="text-sm text-muted-foreground">Choose an example or describe your campaign goals:</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {EXAMPLE_PROMPTS.map((example, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => onSelectPrompt(example.prompt)}
          >
            <CardHeader>
              <CardTitle className="text-base">{example.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {example.prompt}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;

