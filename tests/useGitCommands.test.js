import { describe, it, expect, beforeEach } from 'vitest';
import { useGitCommands } from '../src/composables/useGitCommands';

describe('useGitCommands', () => {
  let gitCommands;
  let fileSystem;

  beforeEach(() => {
    // Reset the git commands for each test
    gitCommands = useGitCommands();
    fileSystem = gitCommands.fileSystem;
  });

  describe('Basic Git Workflow', () => {
    it('should initialize a git repository', async () => {
      const result = await gitCommands.processGitCommand('git init');

      expect(result.type).toBe('success');
      expect(result.content).toContain('Initialized empty Git repository');
      expect(fileSystem.isInitialized).toBe(true);
    });

    it('should create a file and add it to staging', async () => {
      await gitCommands.processGitCommand('git init');
      await gitCommands.processGitCommand('touch README.md');
      await gitCommands.processGitCommand('edit README.md This is a test file');

      const result = await gitCommands.processGitCommand('git add README.md');

      expect(result.type).toBe('success');
      expect(result.content).toContain('Added 1 file');
      expect(Object.keys(fileSystem.staged)).toContain('README.md');
    });

    it('should commit staged changes', async () => {
      await gitCommands.processGitCommand('git init');
      await gitCommands.processGitCommand('touch README.md');
      await gitCommands.processGitCommand('edit README.md This is a test file');
      await gitCommands.processGitCommand('git add README.md');

      const result = await gitCommands.processGitCommand('git commit -m "Initial commit"');

      expect(result.type).toBe('success');
      expect(result.content).toContain('Initial');
      expect(fileSystem.commits.length).toBe(1);
      // Check that the message is stored correctly in the commit object
      const commitMessage = fileSystem.commits[0].message;
      expect(commitMessage).toBe('Initial commit');
    });
  });

  describe('Branch Management', () => {
    it('should create and switch to a new branch', async () => {
      // Setup: init repo and make initial commit
      await gitCommands.processGitCommand('git init');
      await gitCommands.processGitCommand('touch README.md');
      await gitCommands.processGitCommand('edit README.md This is a test file');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Initial commit"');

      const result = await gitCommands.processGitCommand('git switch -c feature-branch');

      expect(result.type).toBe('success');
      expect(result.content).toContain('Switched to a new branch');
      expect(fileSystem.currentBranch).toBe('feature-branch');
      expect(Object.keys(fileSystem.branches)).toContain('feature-branch');
    });

    it('should maintain separate file content in different branches', async () => {
      // Setup: init repo and make initial commit
      await gitCommands.processGitCommand('git init');
      await gitCommands.processGitCommand('touch README.md');
      await gitCommands.processGitCommand('edit README.md This is the main branch content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Initial commit"');

      // Create feature branch and modify file
      await gitCommands.processGitCommand('git switch -c feature-branch');
      await gitCommands.processGitCommand('edit README.md This is the feature branch content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Update in feature branch"');

      // Switch back to main and check content
      await gitCommands.processGitCommand('git switch main');

      // Get file content
      const catResult = await gitCommands.processGitCommand('cat README.md');

      expect(catResult.content).toBe('This is the main branch content');

      // Switch to feature branch and check content
      await gitCommands.processGitCommand('git switch feature-branch');
      const featureCatResult = await gitCommands.processGitCommand('cat README.md');

      expect(featureCatResult.content).toBe('This is the feature branch content');
    });
  });

  describe('Merge Conflicts', () => {
    it('should detect merge conflicts when the same file is modified in both branches', async () => {
      // Setup: init repo and make initial commit
      await gitCommands.processGitCommand('git init');
      await gitCommands.processGitCommand('touch README.md');
      await gitCommands.processGitCommand('edit README.md Initial content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Initial commit"');

      // Create feature branch and modify file
      await gitCommands.processGitCommand('git switch -c feature-branch');
      await gitCommands.processGitCommand('edit README.md Feature branch content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Update in feature branch"');

      // Switch back to main and modify the same file
      await gitCommands.processGitCommand('git switch main');
      await gitCommands.processGitCommand('edit README.md Main branch content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Update in main branch"');

      // Try to merge feature branch into main
      const mergeResult = await gitCommands.processGitCommand('git merge feature-branch');

      expect(mergeResult.type).toBe('error');
      expect(mergeResult.content).toContain('Auto-merging failed');
      expect(mergeResult.content).toContain('fix conflicts');
      expect(fileSystem.mergeInProgress).toBe(true);
      expect(fileSystem.mergeConflicts.length).toBe(1);

      // Check that the file has conflict markers
      const catResult = await gitCommands.processGitCommand('cat README.md');
      expect(catResult.content).toContain('<<<<<<< HEAD');
      expect(catResult.content).toContain('=======');
      expect(catResult.content).toContain('>>>>>>> feature-branch');
    });

    it('should resolve merge conflicts and complete the merge', async () => {
      // Setup: Create a merge conflict
      await gitCommands.processGitCommand('git init');
      await gitCommands.processGitCommand('touch README.md');
      await gitCommands.processGitCommand('edit README.md Initial content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Initial commit"');

      await gitCommands.processGitCommand('git switch -c feature-branch');
      await gitCommands.processGitCommand('edit README.md Feature branch content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Update in feature branch"');

      await gitCommands.processGitCommand('git switch main');
      await gitCommands.processGitCommand('edit README.md Main branch content');
      await gitCommands.processGitCommand('git add README.md');
      await gitCommands.processGitCommand('git commit -m "Update in main branch"');

      await gitCommands.processGitCommand('git merge feature-branch');

      // Resolve the conflict
      await gitCommands.processGitCommand('edit README.md Resolved content');
      const addResult = await gitCommands.processGitCommand('git add README.md');

      expect(addResult.content).toContain('All merge conflicts resolved');

      // Complete the merge with a commit
      const commitResult = await gitCommands.processGitCommand('git commit -m "Merge resolved"');

      expect(commitResult.type).toBe('success');
      expect(fileSystem.mergeInProgress).toBe(false);
      expect(fileSystem.mergeConflicts.length).toBe(0);

      // Check the final content
      const catResult = await gitCommands.processGitCommand('cat README.md');
      expect(catResult.content).toBe('Resolved content');
    });
  });
});
