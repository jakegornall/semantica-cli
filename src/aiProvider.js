const OpenAI = require('openai');
const { ChunkResponseSchema } = require('./schemas');
const path = require('path');
const fs = require('fs-extra');

class AIProvider {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async generateChunks(files) {
    const systemPrompt = `You are a technical documentation expert who creates user-focused documentation for software packages and libraries.

Your task is to analyze the codebase and create two types of documentation chunks:

1. OVERVIEW CHUNK (exactly one):
   Create a comprehensive overview that explains:
   - What the package does and its main purpose
   - How to install and set up the package
   - Basic configuration requirements
   - Common use cases and patterns
   - Getting started guide

2. API CHUNKS (one per public interface):
   Create individual chunks for each public/exported:
   - Functions
   - Components
   - Classes
   - Configuration options
   Only document interfaces that are meant to be used by the end user/consumer of the package.

IGNORE:
- Internal implementation details
- Private functions/methods
- Utility functions not exported
- Internal classes/components

REQUIRED OUTPUT FORMAT:
{
  "reasoningAndPlanning": [
    "string (reasoning and planning for the chunks)",
    "Make sure to reason over what should and should not be documented",
    "be thorough and consider which files are most relevant to the user",
    "README files are the most relevant to the user",
    "source code that is not exposed as an api to the user is not relevant to the user at all",
    "however, it is important to provide chunks that explain highlevel what the the package is doing under the hood"
  ],
  "chunks": [
    {
      "title": "string (user-focused topic)",
      "description": "string (explanation from user perspective)",
      "examples": [
        {
          "code": "string (example showing how to USE the package)",
          "explanation": "string (explanation of the example)"
        }
      ],
      "tags": ["string"]
    }
  ]
}

Example of a GOOD overview chunk:
{
  "title": "Getting Started with MyPackage",
  "description": "MyPackage is a React component library designed for building accessible, performant data visualization components. It provides a comprehensive suite of charts, graphs, and interactive data displays that automatically handle accessibility concerns, responsive design, and complex data updates.

The library is built with performance in mind, using React's virtual DOM efficiently and implementing smart re-rendering strategies for smooth updates even with large datasets. It supports both TypeScript and JavaScript projects, with full type definitions included.

Key features include:
- Accessible by default (WCAG 2.1 AA compliant)
- Responsive and mobile-friendly
- Support for real-time data updates
- Comprehensive theming system
- Built-in animation support
- Tree-shakeable exports
- Zero dependencies

The package is designed to work seamlessly with modern React applications and supports both client-side and server-side rendering (including Next.js and Remix).",
  "examples": [
    {
      "code": "npm install my-package\\n\\nimport { LineChart } from 'my-package';\\n\\nfunction App() {\\n  return (\\n    <LineChart\\n      data={salesData}\\n      xAxis={{ key: 'date', label: 'Sales Period' }}\\n      yAxis={{ key: 'amount', label: 'Revenue' }}\\n      accessibility={{\\n        description: 'Monthly sales data from 2023'\\n      }}\\n    />\\n  );\\n}",
      "explanation": "This example shows how to install the package and create a basic line chart with proper accessibility labels and axis configuration"
    }
  ],
  "tags": ["getting-started", "overview", "installation", "react", "data-visualization"]
}

Example of a GOOD API chunk:
{
  "title": "LineChart Component",
  "description": "The LineChart component is a powerful and flexible visualization tool for displaying trend data over time or sequential values. It automatically handles data formatting, scaling, and accessibility requirements while providing extensive customization options.

Key Features:
1. Automatic Data Scaling:
   - Smart Y-axis range calculation
   - Support for different data scales (linear, logarithmic, time)
   - Custom domain ranges

2. Accessibility:
   - Automatic ARIA labels and descriptions
   - Keyboard navigation support
   - Screen reader optimized data points
   - High contrast mode support

3. Interactivity:
   - Hover tooltips with customizable content
   - Click handlers for data points
   - Zoom and pan capabilities
   - Touch device support

4. Responsive Design:
   - Automatic resizing
   - Mobile-friendly touch targets
   - Configurable breakpoints
   - Optional data point reduction for small screens

5. Performance Optimizations:
   - Smart data point sampling for large datasets
   - Efficient re-rendering
   - Canvas rendering option for heavy workloads
   - Web Worker support for calculations

The component accepts both simple arrays and complex nested data structures, with powerful data accessor options for flexible data binding.",
  "examples": [
    {
      "code": "import { LineChart } from 'my-package';\\n\\n<LineChart\\n  data={salesData}\\n  xAxis={{\\n    key: 'date',\\n    label: 'Sales Period',\\n    scale: 'time',\\n    format: (d) => format(d, 'MMM yyyy')\\n  }}\\n  yAxis={{\\n    key: 'amount',\\n    label: 'Revenue',\\n    scale: 'linear',\\n    format: (d) => formatCurrency(d)\\n  }}\\n  tooltip={{\\n    content: (d) => \`\${d.label}: \${formatCurrency(d.value)}\`,\\n    position: 'right'\\n  }}\\n  accessibility={{\\n    description: 'Monthly sales data visualization',\\n    announceDataPoints: true\\n  }}\\n  responsive={{\\n    breakpoints: {\\n      sm: { samplingRate: 0.5 },\\n      lg: { samplingRate: 1 }\\n    }\\n  }}\\n/>",
      "explanation": "This example demonstrates a fully configured LineChart with custom formatting, tooltips, accessibility options, and responsive behavior"
    }
  ],
  "tags": ["components", "visualization", "charts", "line-chart", "time-series"]
}

Remember: Each chunk should provide comprehensive, user-focused documentation that helps developers understand both basic usage and advanced features.

Example of GOOD reasoningAndPlanning:
[
  "First, I'll analyze the README.md as it's the primary source of user-facing documentation",
  "The package.json reveals this is a React component library for data visualization, so I'll focus on component usage and configuration",
  "I notice there's a /examples directory with working code samples - these will be valuable for creating practical examples",
  "The src/components directory contains exported components, but I'll ignore internal utility functions",
  "The types.ts file defines the public TypeScript interfaces that users need to know about",
  "I'll create an overview chunk first to help users get started quickly",
  "Then I'll create individual API chunks for each exported component",
  "The configuration options in config.ts need their own chunk as they're critical for setup",
  "I'll ignore the internal helper functions in utils/ as they're not part of the public API",
  "The testing files don't need documentation as they're not relevant to package users",
  "I see some advanced usage patterns in the examples that should be documented separately",
  "The migration guide in MIGRATING.md needs its own chunk to help users upgrade versions"
]

Remember: Each reasoning step should explain WHY you're including or excluding content based on its relevance to the end user.`;

    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Please analyze these files and create semantic documentation chunks following the exact format specified:\n\n${
            files.map(f => `File: ${f.path}\n\n${f.content}\n---\n`).join('\n')
          }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    try {
      const response = JSON.parse(completion.choices[0].message.content);
      
      // Save the raw response
      await this.saveRawResponse(systemPrompt, completion);
      
      // Continue with normal processing
      if (!response.chunks) {
        response.chunks = [];
      }
      
      const validated = ChunkResponseSchema.parse(response);
      return validated;
    } catch (error) {
      console.error('Validation Error Details:', error);
      throw new Error(`Failed to generate chunks: ${error.message}`);
    }
  }

  async saveRawResponse(systemPrompt, completion) {
    const cwd = process.cwd();
    const semanticDir = path.join(cwd, '.semantic');
    const trainingDir = path.join(semanticDir, '.training');
    
    await fs.ensureDir(trainingDir);
    
    // Get package version
    const packageJson = await fs.readJson(path.join(cwd, 'package.json'));
    const version = packageJson.version;
    
    const threadPath = path.join(trainingDir, `v${version}-thread.json`);
    
    // Save just the message thread
    await fs.writeJson(threadPath, {
      timestamp: new Date().toISOString(),
      version,
      messages: [
        { 
          role: "system", 
          content: systemPrompt 
        },
        { 
          role: "user", 
          content: completion.choices[0].message.content
        }
      ]
    }, { spaces: 2 });
  }
}

module.exports = AIProvider; 