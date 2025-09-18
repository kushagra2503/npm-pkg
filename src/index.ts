#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import simpleGit, { SimpleGit } from 'simple-git';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { SYSTEM_PROMPT } from './systemPrompt';

// Load environment variables
dotenv.config();

const program = new Command();
const git: SimpleGit = simpleGit();

// OpenAI client - will be initialized after getting API key
let openai: OpenAI;

interface GitStatus {
  files: string[];
  isClean: boolean;
}

/**
 * Initialize OpenAI client with API key
 */
function initializeOpenAI(apiKey: string): void {
  openai = new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * Get git status and changed files
 */
async function getGitStatus(): Promise<GitStatus> {
  try {
    const status = await git.status();
    const files = [
      ...status.modified,
      ...status.not_added,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map(r => r.to),
    ];
    
    return {
      files,
      isClean: files.length === 0,
    };
  } catch (error) {
    throw new Error(`Failed to get git status: ${error}`);
  }
}

/**
 * Generate commit message using OpenAI
 */
async function generateCommitMessage(changedFiles: string[]): Promise<string> {
  const spinner = ora('Generating AI commit message...').start();
  
  try {
    // Get git diff for context
    const diff = await git.diff(['--cached']);
    
    const prompt = `Generate a concise, professional git commit message for the following changes:

Changed files: ${changedFiles.join(', ')}

Git diff:
${diff}

Please provide a commit message that:
1. Starts with a conventional commit type (feat, fix, docs, style, refactor, test, chore)
2. Is concise but descriptive
3. Uses imperative mood
4. Is under 72 characters

Return only the commit message, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    spinner.succeed('AI commit message generated');
    
    const commitMessage = response.choices[0]?.message?.content?.trim();
    if (!commitMessage) {
      throw new Error('Failed to generate commit message');
    }
    
    return commitMessage;
  } catch (error) {
    spinner.fail('Failed to generate commit message');
    throw error;
  }
}

/**
 * Execute git add .
 */
async function gitAdd(): Promise<void> {
  const spinner = ora('Adding files to git...').start();
  
  try {
    await git.add('.');
    spinner.succeed('Files added to git');
  } catch (error) {
    spinner.fail('Failed to add files');
    throw new Error(`Git add failed: ${error}`);
  }
}

/**
 * Execute git commit with message
 */
async function gitCommit(message: string): Promise<void> {
  const spinner = ora('Committing changes...').start();
  
  try {
    await git.commit(message);
    spinner.succeed(`Committed: ${chalk.green(message)}`);
  } catch (error) {
    spinner.fail('Failed to commit');
    throw new Error(`Git commit failed: ${error}`);
  }
}

/**
 * Execute git push
 */
async function gitPush(): Promise<void> {
  const spinner = ora('Pushing to remote...').start();
  
  try {
    await git.push();
    spinner.succeed('Pushed to remote repository');
  } catch (error) {
    spinner.fail('Failed to push');
    throw new Error(`Git push failed: ${error}`);
  }
}

/**
 * Check if we're in a git repository
 */
async function checkGitRepo(): Promise<void> {
  try {
    await git.checkIsRepo();
  } catch (error) {
    console.error(chalk.red('❌ Not a git repository. Please run this command in a git repository.'));
    process.exit(1);
  }
}

/**
 * Prompt user to enter OpenAI API key interactively
 */
async function promptForAPIKey(): Promise<void> {
  console.log(chalk.blue('🤖 Please enter your OpenAI API key to generate AI commit messages:'));
  console.log(chalk.gray('(Get your key from https://platform.openai.com/account/api-keys)'));

  try {
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'OpenAI API Key:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'API key is required';
          }
          if (!input.startsWith('sk-')) {
            return 'API key should start with "sk-"';
          }
          if (input.length < 20) {
            return 'API key appears to be too short';
          }
          return true;
        }
      }
    ]);

    console.log(chalk.green('✅ API key received (temporarily stored for this session)'));

    // Initialize OpenAI with the API key
    initializeOpenAI(answers.apiKey);
  } catch (error) {
    console.error(chalk.red('❌ Failed to get API key from user input'));
    process.exit(1);
  }
}

/**
 * Check if OpenAI API key is configured - always prompt for it
 */
async function checkOpenAIKey(): Promise<void> {
  await promptForAPIKey();
}

/**
 * Main function to execute all git operations
 */
async function fastaf(): Promise<void> {
  try {
    console.log(chalk.blue('🚀 Starting fastaf...'));
    
    // Pre-flight checks
    await checkGitRepo();
    await checkOpenAIKey();
    
    // Check git status
    const status = await getGitStatus();
    
    if (status.isClean) {
      console.log(chalk.yellow('✨ Working directory is clean. Nothing to commit.'));
      return;
    }
    
    console.log(chalk.cyan(`📝 Found ${status.files.length} changed file(s):`));
    status.files.forEach(file => console.log(chalk.gray(`  - ${file}`)));
    
    // Execute git operations
    await gitAdd();
    
    const commitMessage = await generateCommitMessage(status.files);
    console.log(chalk.cyan(`💬 Generated message: "${commitMessage}"`));
    
    await gitCommit(commitMessage);
    await gitPush();
    
    console.log(chalk.green('✅ All done! Your changes have been added, committed, and pushed.'));
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}

// CLI setup
program
  .name('fastaf')
  .description('Fast git operations: add, commit with AI message, and push')
  .version('1.0.0');

program
  .command('all')
  .alias('a')
  .description('Execute git add, commit (with AI-generated message), and push')
  .action(fastaf);

// Default action when no command is specified
program.action(fastaf);

program.parse(process.argv);
