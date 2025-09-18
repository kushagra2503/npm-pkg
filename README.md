# fastaf 🚀

A CLI tool that performs `git add .`, `git commit` with AI-generated commit messages, and `git push` in one single command using OpenAI API.

## Features

- **One Command**: Execute `git add .`, `git commit`, and `git push` with a single command
- **AI-Generated Commit Messages**: Uses OpenAI GPT-3.5-turbo to generate professional, conventional commit messages
- **Smart Git Analysis**: Analyzes changed files and git diff to create contextual commit messages
- **Beautiful CLI**: Colorful output with loading spinners and clear status messages
- **Error Handling**: Comprehensive error checking and helpful error messages

## Installation

### Global Installation (Recommended)

```bash
npm install -g fastaf-cli
```

### Local Installation

```bash
npm install fastaf-cli
npx fastaf --all
```

## Setup

1. **Get an OpenAI API Key**: Sign up at [OpenAI](https://platform.openai.com/) and create an API key

**That's it!** 🎉 Fastaf will prompt you to enter your API key securely in the CLI when you run it.

## Usage

### Basic Usage

```bash
# Run all git operations (recommended)
fastaf

# Or specify the all command explicitly
fastaf all

# Or use the short alias
fastaf a
```

**Note:** `--all` is not supported directly. Use the commands above instead.

This will:
1. ✅ Check if you're in a git repository
2. 📝 Analyze your changed files
3. ➕ Run `git add .`
4. 🤖 Generate an AI commit message based on your changes
5. 💾 Run `git commit -m "AI-generated message"`
6. 🚀 Run `git push`

### Example Output

Fastaf will always prompt you to enter your OpenAI API key securely:

```bash
🚀 Starting fastaf...
🤖 Please enter your OpenAI API key to generate AI commit messages:
(Get your key from https://platform.openai.com/account/api-keys)
? OpenAI API Key: ***************
✅ API key received (temporarily stored for this session)
📝 Found 3 changed file(s):
  - src/components/Button.tsx
  - src/styles/globals.css
  - package.json
✅ Files added to git
✅ AI commit message generated
💬 Generated message: "feat: add new button component with improved styling"
✅ Committed: feat: add new button component with improved styling
✅ Pushed to remote repository
✅ All done! Your changes have been added, committed, and pushed.
```

## How It Works

1. **Repository Check**: Verifies you're in a git repository
2. **API Key Check**: Ensures OpenAI API key is configured
3. **Status Analysis**: Checks for uncommitted changes
4. **File Addition**: Stages all changes with `git add .`
5. **AI Message Generation**: Sends file changes and git diff to OpenAI to generate a professional commit message following conventional commit standards
6. **Commit**: Creates a commit with the AI-generated message
7. **Push**: Pushes changes to the remote repository

## Commit Message Standards

The AI generates commit messages following [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Requirements

- Node.js 16.0.0 or higher
- Git repository
- OpenAI API key
- Internet connection

## Error Handling

The tool provides clear error messages for common issues:

- ❌ Not in a git repository
- ❌ Missing OpenAI API key
- ❌ No changes to commit
- ❌ Git operation failures
- ❌ OpenAI API errors

## Development

### Building from Source

```bash
git clone <repository-url>
cd fastaf
npm install
npm run build
npm link
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with ts-node

## Configuration

### Changing the AI Model

By default, **fastaf** uses `gpt-4o-mini` for cost-effective commit message generation. You can change this by editing the model in `src/index.ts`:

```typescript
model: 'gpt-4o-mini',  // Change this to any OpenAI model
```

**Recommended Models:**
- `gpt-4o-mini` - Fast, cost-effective, great for commit messages (default)
- `gpt-3.5-turbo` - Good balance of speed and quality
- `gpt-4` - Highest quality but more expensive
- `gpt-4o` - Latest GPT-4 optimized model

## Dependencies

- **commander**: CLI framework
- **openai**: OpenAI API client
- **simple-git**: Git operations
- **chalk**: Terminal colors
- **ora**: Loading spinners
- **dotenv**: Environment variable loading

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ for developers who want to git things done faster!**
