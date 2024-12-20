# Semantica

Semantica is a CLI tool that generates semantic documentation chunks from your codebase using AI. It analyzes your source code, documentation, and README files to create user-focused documentation that's optimized for vector database storage and semantic search.

## Why Semantica?

Traditional documentation often focuses on implementation details rather than how to actually use a package. Semantica uses GPT-4o to analyze your codebase and generate documentation chunks that:

- Focus on the user's perspective
- Include practical examples
- Explain common use cases
- Provide clear installation and setup instructions
- Are optimized for semantic search

## Installation 
Install globally
`npm install -g semantica`
Or install as a dev dependency
`npm install --save-dev semantica`

## Quick Start

1. Add the script to your `package.json`:
json```
{
    "scripts": {
        "chunk": "semantica chunk"
    }
}
```

## How It Works

Under the hood, Semantica:

1. Scans your project for relevant files:
   - Documentation (*.md)
   - Source code (*.js, *.ts, *.jsx, *.tsx)
   - Package configuration (package.json)

2. Filters out:
   - Large files (>1MB)
   - Node modules
   - Build directories
   - Git files
   - Previous semantic chunks

3. Processes files in batches through GPT-4o to generate documentation chunks that:
   - Explain functionality from a user's perspective
   - Include practical code examples
   - Provide clear explanations
   - Add relevant search tags

4. Saves the chunks in your project's `.semantic` directory

## The .semantic Directory

Semantica creates a `.semantic` directory in your project root that contains versioned YAML files:

your-project/
├── .semantic/
│ ├── v1.0.0-chunks.yaml
│ ├── v1.0.1-chunks.yaml
│ └── v2.0.0-chunks.yaml

Each YAML file is named using your package's version (from package.json) and contains:

yaml```
metadata:
    generated_at: "2024-03-20T12:00:00.000Z"
    chunk_count: 42
    version: "1.0.0"
chunks:
    - title: "Feature Name"
      description: "User-focused explanation of the feature"
      examples:
        - code: "Example code showing usage"
          explanation: "Explanation of the example"
      tags: ["relevant", "search", "terms"]
```

You should:
- Commit this directory to version control
- Review generated chunks for accuracy
- Regenerate chunks when you update your package version

## Configuration

Semantica uses these default configurations:

- **File Types**: .md, .js, .ts, .jsx, .tsx, package.json
- **Ignored Paths**: node_modules, .git, .semantic, dist, build
- **Batch Size**: 30 files per API request
- **File Size Limit**: 1MB per file

## Best Practices

1. **Run Before Releases**
   Generate new chunks before publishing new versions to ensure documentation stays current.

2. **Review Generated Chunks**
   While the AI is good, it's not perfect. Review chunks for accuracy, especially examples.

3. **Include Good Source Documentation**
   Better source documentation and comments help generate better chunks.

4. **Version Control**
   Commit the `.semantic` directory to track documentation changes over time.

5. **Update Regularly**
   Regenerate chunks when you make significant changes to your codebase.

## Common Use Cases

1. **Documentation Sites**
   Feed chunks into your documentation site's search system.

2. **AI Assistants**
   Use chunks to train AI assistants about your package.

3. **Search Systems**
   Import chunks into vector databases for semantic code search.

## Limitations

- Requires OpenAI API key
- Large codebases may take time to process
- Generated content should be reviewed for accuracy
- API costs vary based on codebase size
