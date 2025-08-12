import React from 'react';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MarkdownTest: React.FC = () => {
  const sampleMarkdown = `## Your Personalized Learning Path

### Current Assessment
- You have basic skills in programming
- You are interested in web development and AI
- Your current level is intermediate

### Recommended Learning Areas
- **Frontend Development**: Learn React and modern JavaScript
- **Backend Development**: Master Node.js and databases
- **AI Integration**: Understand how to integrate AI APIs
- **Project Management**: Learn to organize and plan projects

### Step-by-Step Plan
1. **Week 1-2**: Review JavaScript fundamentals
2. **Week 3-4**: Learn React basics and components
3. **Week 5-6**: Build your first full-stack project
4. **Week 7-8**: Integrate AI features into your project

### Resources & Next Steps
- Start with *free online tutorials*
- Join coding communities for support
- Build projects to practice your skills
- Consider taking a structured course

## Key Tips for Success
- Practice coding every day
- Don't be afraid to make mistakes
- Ask questions when you're stuck
- Celebrate small wins along the way`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Markdown Rendering Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Raw Markdown:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {sampleMarkdown}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Rendered Output:</h3>
              <div className="border p-4 rounded bg-blue-50">
                <MarkdownRenderer 
                  content={sampleMarkdown} 
                  className="text-blue-800"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkdownTest;