import { reactive } from 'vue';

export function useGitCommands() {
  // Virtual file system state
  const fileSystem = reactive({
    isInitialized: false,
    files: {},
    staged: {},
    commits: [],
    branches: {
      main: null
    },
    currentBranch: 'main',
    HEAD: null,
    mergeConflicts: [],
    mergeInProgress: false
  });

  // Help information with explicit newlines and spaces
  const helpInfo =
`===============================================================
                  GIT TERMINAL SIMULATOR
===============================================================

GIT COMMANDS:
---------------------------------------------------------------

Repository Operations:
  git init                      Initialize a new Git repository
  git status                    Show the working tree status
  git log                       Show commit logs
  git help                      Show this help information

Staging & Committing:
  git add <file>                Add file contents to the index
  git add .                     Add all files to the index
  git commit -m "message"       Record changes to the repository

Branch Management:
  git branch                    List all branches
  git branch <name>             Create a new branch
  git checkout <branch>         Switch to existing branch
  git checkout -b <name>        Create and switch to a new branch
  git switch <branch>           Switch to existing branch
  git switch -c <name>          Create and switch to a new branch
  git merge <branch>            Merge a branch into your current branch

OTHER COMMANDS:
---------------------------------------------------------------

Terminal Operations:
  help                          Show this help information
  clear                         Clear the terminal

File Operations:
  ls                            List files in the current directory
  touch <file>                  Create a new file
  edit <file> <content>         Edit file content
  cat <file>                    View file content`;

  // Process git commands
  const processGitCommand = async (commandStr) => {
    const args = commandStr.trim().split(/\s+/);
    const command = args[0].toLowerCase();

    // Handle non-git commands
    if (command === 'help') {
      return { type: 'system', content: helpInfo, isHelp: true };
    }

    if (command === 'clear') {
      return { type: 'clear', content: '' };
    }

    if (command === 'ls') {
      return {
        type: 'output',
        content: Object.keys(fileSystem.files).length
          ? Object.keys(fileSystem.files).join('  ')
          : 'No files found'
      };
    }

    if (command === 'touch') {
      if (!args[1]) {
        return { type: 'error', content: 'File name is required' };
      }
      fileSystem.files[args[1]] = { content: '', modified: true };
      return { type: 'success', content: `Created file: ${args[1]}` };
    }

    // Add a command to edit file content
    if (command === 'edit') {
      if (!args[1]) {
        return { type: 'error', content: 'File name is required' };
      }

      if (!fileSystem.files[args[1]]) {
        return { type: 'error', content: `File ${args[1]} does not exist` };
      }

      const content = args.slice(2).join(' ');
      if (!content) {
        return { type: 'error', content: 'Content is required' };
      }

      fileSystem.files[args[1]].content = content;
      fileSystem.files[args[1]].modified = true;

      return { type: 'success', content: `Updated file: ${args[1]}` };
    }

    // Add a command to view file content
    if (command === 'cat') {
      if (!args[1]) {
        return { type: 'error', content: 'File name is required' };
      }

      if (!fileSystem.files[args[1]]) {
        return { type: 'error', content: `File ${args[1]} does not exist` };
      }

      return { type: 'output', content: fileSystem.files[args[1]].content || '(empty file)' };
    }

    // Handle git commands
    if (command === 'git') {
      const gitCommand = args[1]?.toLowerCase();

      if (!gitCommand) {
        return {
          type: 'output',
          content: 'usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n' +
                   '           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n' +
                   '           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n' +
                   '           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n' +
                   '           <command> [<args>]'
        };
      }

      switch (gitCommand) {
        case 'init':
          return handleGitInit();

        case 'status':
          return handleGitStatus();

        case 'add':
          return handleGitAdd(args.slice(2));

        case 'commit':
          return handleGitCommit(args.slice(2));

        case 'log':
          return handleGitLog();

        case 'branch':
          return handleGitBranch(args.slice(2));

        case 'checkout':
          return handleGitCheckout(args.slice(2));

        case 'switch':
          return handleGitSwitch(args.slice(2));

        case 'merge':
          return handleGitMerge(args.slice(2));

        case 'help':
          return { type: 'system', content: helpInfo, isHelp: true };

        default:
          return {
            type: 'error',
            content: `git: '${gitCommand}' is not a git command. See 'git help'.`
          };
      }
    }

    return {
      type: 'error',
      content: `Command not found: ${command}. Type 'help' for available commands.`
    };
  };

  // Git command handlers
  const handleGitInit = () => {
    if (fileSystem.isInitialized) {
      return {
        type: 'output',
        content: 'Reinitialized existing Git repository in /project/.git/'
      };
    }

    fileSystem.isInitialized = true;
    fileSystem.branches.main = null;
    fileSystem.currentBranch = 'main';
    fileSystem.HEAD = null;

    return {
      type: 'success',
      content: 'Initialized empty Git repository in /project/.git/'
    };
  };

  const handleGitStatus = () => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    const stagedFiles = Object.keys(fileSystem.staged);
    const modifiedFiles = Object.entries(fileSystem.files)
      .filter(([name, file]) => file.modified && !fileSystem.staged[name])
      .map(([name]) => name);

    let output = `On branch ${fileSystem.currentBranch}\n`;

    if (fileSystem.commits.length === 0) {
      output += 'No commits yet\n';
    }

    if (stagedFiles.length === 0 && modifiedFiles.length === 0) {
      output += 'nothing to commit, working tree clean';
    } else {
      if (stagedFiles.length > 0) {
        output += '\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n';
        stagedFiles.forEach(file => {
          output += `\t new file:   ${file}\n`;
        });
      }

      if (modifiedFiles.length > 0) {
        output += '\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
        modifiedFiles.forEach(file => {
          output += `\t${file}\n`;
        });
      }
    }

    return { type: 'output', content: output };
  };

  const handleGitAdd = (args) => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    if (args.length === 0) {
      return { type: 'error', content: 'Nothing specified, nothing added.' };
    }

    if (args[0] === '.') {
      // Add all files
      Object.entries(fileSystem.files).forEach(([name, file]) => {
        if (file.modified) {
          fileSystem.staged[name] = { ...file };

          // Check if this resolves a merge conflict
          if (fileSystem.mergeInProgress) {
            const conflictIndex = fileSystem.mergeConflicts.findIndex(c => c.filename === name);
            if (conflictIndex !== -1) {
              // Check if conflict markers are still present
              if (file.content.includes('<<<<<<< HEAD') &&
                  file.content.includes('=======') &&
                  file.content.includes('>>>>>>>')) {
                return {
                  type: 'error',
                  content: `error: Conflict markers still present in '${name}'`
                };
              }

              // Remove this file from the conflicts list
              fileSystem.mergeConflicts.splice(conflictIndex, 1);
            }
          }
        }
      });

      // Check if all conflicts are resolved
      if (fileSystem.mergeInProgress && fileSystem.mergeConflicts.length === 0) {
        fileSystem.mergeInProgress = false;
        return {
          type: 'success',
          content: 'Added all files to staging area\nAll merge conflicts resolved. You can now commit the changes.'
        };
      }

      return { type: 'success', content: 'Added all files to staging area' };
    } else {
      // Add specific files
      const notFound = [];
      const addedFiles = [];

      args.forEach(filename => {
        if (fileSystem.files[filename]) {
          fileSystem.staged[filename] = { ...fileSystem.files[filename] };
          addedFiles.push(filename);

          // Check if this resolves a merge conflict
          if (fileSystem.mergeInProgress) {
            const conflictIndex = fileSystem.mergeConflicts.findIndex(c => c.filename === filename);
            if (conflictIndex !== -1) {
              // Check if conflict markers are still present
              if (fileSystem.files[filename].content.includes('<<<<<<< HEAD') &&
                  fileSystem.files[filename].content.includes('=======') &&
                  fileSystem.files[filename].content.includes('>>>>>>>')) {
                return {
                  type: 'error',
                  content: `error: Conflict markers still present in '${filename}'`
                };
              }

              // Remove this file from the conflicts list
              fileSystem.mergeConflicts.splice(conflictIndex, 1);
            }
          }
        } else {
          notFound.push(filename);
        }
      });

      if (notFound.length > 0) {
        return {
          type: 'error',
          content: `pathspec '${notFound.join(', ')}' did not match any files`
        };
      }

      // Check if all conflicts are resolved
      if (fileSystem.mergeInProgress && fileSystem.mergeConflicts.length === 0) {
        fileSystem.mergeInProgress = false;
        return {
          type: 'success',
          content: `Added ${addedFiles.length} file(s) to staging area\nAll merge conflicts resolved. You can now commit the changes.`
        };
      }

      return {
        type: 'success',
        content: `Added ${addedFiles.length} file(s) to staging area`
      };
    }
  };

  const handleGitCommit = (args) => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    // Check if there are unresolved merge conflicts
    if (fileSystem.mergeInProgress && fileSystem.mergeConflicts.length > 0) {
      return {
        type: 'error',
        content: 'error: Committing is not possible because you have unmerged files.\n' +
                 `hint: Fix them up in the work tree, and then use "git add <file>"\n` +
                 `hint: as appropriate to mark resolution and make a commit.\n\n` +
                 `Unmerged paths:\n` +
                 fileSystem.mergeConflicts.map(c => `\t${c.filename}`).join('\n')
      };
    }

    const stagedFiles = Object.keys(fileSystem.staged);

    if (stagedFiles.length === 0) {
      return {
        type: 'error',
        content: 'nothing to commit, working tree clean'
      };
    }

    let message = '';
    let isMergeCommit = fileSystem.mergeInProgress && fileSystem.mergeConflicts.length === 0;

    // Parse commit message
    if (args.includes('-m')) {
      const messageIndex = args.indexOf('-m') + 1;
      if (messageIndex < args.length) {
        // Get the full message without removing quotes
        message = args.slice(messageIndex).join(' ').replace(/^["']|["']$/g, '');
      }
    } else if (isMergeCommit) {
      // Default merge commit message
      message = 'Merge branch conflict resolution';
    }

    if (!message) {
      return {
        type: 'error',
        content: 'Aborting commit due to empty commit message'
      };
    }

    // Create commit
    const commit = {
      id: generateCommitId(),
      message,
      files: { ...fileSystem.staged },
      parent: fileSystem.HEAD,
      timestamp: new Date().toISOString(),
      isMergeCommit
    };

    fileSystem.commits.push(commit);
    fileSystem.HEAD = commit.id;
    fileSystem.branches[fileSystem.currentBranch] = commit.id;

    // Clear staging area and mark files as not modified
    Object.keys(fileSystem.staged).forEach(filename => {
      if (fileSystem.files[filename]) {
        fileSystem.files[filename].modified = false;
      }
    });
    fileSystem.staged = {};

    // Reset merge state if this was a merge commit
    if (isMergeCommit) {
      fileSystem.mergeInProgress = false;
      fileSystem.mergeConflicts = [];
    }

    return {
      type: 'success',
      content: `[${fileSystem.currentBranch} ${commit.id.substring(0, 7)}] ${message}`
    };
  };

  const handleGitLog = () => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    if (fileSystem.commits.length === 0) {
      return { type: 'output', content: 'No commits yet' };
    }

    let output = '';
    let currentId = fileSystem.HEAD;

    while (currentId) {
      const commit = fileSystem.commits.find(c => c.id === currentId);
      if (!commit) break;

      output += `commit ${commit.id}\n`;
      output += `Date: ${new Date(commit.timestamp).toLocaleString()}\n\n`;
      output += `    ${commit.message}\n\n`;

      currentId = commit.parent;
    }

    return { type: 'output', content: output };
  };

  const handleGitBranch = (args) => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    // List branches
    if (args.length === 0) {
      let output = '';
      Object.keys(fileSystem.branches).forEach(branch => {
        if (branch === fileSystem.currentBranch) {
          output += `* ${branch}\n`;
        } else {
          output += `  ${branch}\n`;
        }
      });

      return { type: 'output', content: output || 'No branches' };
    }

    // Create branch
    const branchName = args[0];

    if (fileSystem.branches[branchName]) {
      return {
        type: 'error',
        content: `fatal: A branch named '${branchName}' already exists`
      };
    }

    if (fileSystem.HEAD === null) {
      return {
        type: 'error',
        content: `fatal: Not a valid object name: '${fileSystem.currentBranch}'\n\nHint: Before creating branches, you need at least one commit.\nTry these commands first:\n  1. git init\n  2. touch README.md\n  3. git add README.md\n  4. git commit -m "Initial commit"`
      };
    }

    fileSystem.branches[branchName] = fileSystem.HEAD;

    return {
      type: 'success',
      content: `Created branch '${branchName}'`
    };
  };

  const handleGitCheckout = (args) => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    if (args.length === 0) {
      return {
        type: 'error',
        content: 'You must specify a branch name'
      };
    }

    // Handle checkout -b (create and switch to a new branch)
    if (args[0] === '-b' && args.length > 1) {
      const branchName = args[1];

      // Check if branch already exists
      if (fileSystem.branches[branchName]) {
        return {
          type: 'error',
          content: `fatal: A branch named '${branchName}' already exists`
        };
      }

      // Check if we have any commits
      if (fileSystem.HEAD === null) {
        return {
          type: 'error',
          content: `fatal: Not a valid object name: '${fileSystem.currentBranch}'\n\nHint: Before creating branches, you need at least one commit.\nTry these commands first:\n  1. git init\n  2. touch README.md\n  3. git add README.md\n  4. git commit -m "Initial commit"`
        };
      }

      // Create the new branch
      fileSystem.branches[branchName] = fileSystem.HEAD;

      // Switch to the new branch
      fileSystem.currentBranch = branchName;

      return {
        type: 'success',
        content: `Switched to a new branch '${branchName}'`
      };
    }

    const branchName = args[0];

    // Check if branch exists
    if (!fileSystem.branches[branchName]) {
      return {
        type: 'error',
        content: `error: pathspec '${branchName}' did not match any file(s) known to git`
      };
    }

    // Check for uncommitted changes
    const hasUncommittedChanges = Object.keys(fileSystem.staged).length > 0 ||
      Object.values(fileSystem.files).some(file => file.modified);

    if (hasUncommittedChanges) {
      return {
        type: 'error',
        content: 'error: Your local changes would be overwritten by checkout.\nPlease commit your changes or stash them before you switch branches.'
      };
    }

    // Update branch and HEAD
    fileSystem.currentBranch = branchName;
    fileSystem.HEAD = fileSystem.branches[branchName];

    // Restore files from the commit associated with this branch
    const branchCommitId = fileSystem.branches[branchName];
    const branchCommit = fileSystem.commits.find(c => c.id === branchCommitId);

    if (branchCommit && branchCommit.files) {
      // Reset the working directory to match the commit
      fileSystem.files = {};

      // Copy files from the commit to the working directory
      Object.entries(branchCommit.files).forEach(([filename, fileData]) => {
        fileSystem.files[filename] = { ...fileData, modified: false };
      });
    }

    return {
      type: 'success',
      content: `Switched to branch '${branchName}'`
    };
  };

  // New handler for git switch command
  const handleGitSwitch = (args) => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    if (args.length === 0) {
      return {
        type: 'error',
        content: 'You must specify a branch name'
      };
    }

    // Handle switch -c (create and switch to a new branch)
    if (args[0] === '-c' && args.length > 1) {
      const branchName = args[1];

      // Check if branch already exists
      if (fileSystem.branches[branchName]) {
        return {
          type: 'error',
          content: `fatal: A branch named '${branchName}' already exists`
        };
      }

      // Check if we have any commits
      if (fileSystem.HEAD === null) {
        return {
          type: 'error',
          content: `fatal: Not a valid object name: '${fileSystem.currentBranch}'\n\nHint: Before creating branches, you need at least one commit.\nTry these commands first:\n  1. git init\n  2. touch README.md\n  3. git add README.md\n  4. git commit -m "Initial commit"`
        };
      }

      // Create the new branch
      fileSystem.branches[branchName] = fileSystem.HEAD;

      // Switch to the new branch
      fileSystem.currentBranch = branchName;

      return {
        type: 'success',
        content: `Switched to a new branch '${branchName}'`
      };
    }

    const branchName = args[0];

    // Check if branch exists
    if (!fileSystem.branches[branchName]) {
      return {
        type: 'error',
        content: `error: pathspec '${branchName}' did not match any file(s) known to git`
      };
    }

    // Check for uncommitted changes
    const hasUncommittedChanges = Object.keys(fileSystem.staged).length > 0 ||
      Object.values(fileSystem.files).some(file => file.modified);

    if (hasUncommittedChanges) {
      return {
        type: 'error',
        content: 'error: Your local changes would be overwritten by switch.\nPlease commit your changes or stash them before you switch branches.'
      };
    }

    // Update branch and HEAD
    fileSystem.currentBranch = branchName;
    fileSystem.HEAD = fileSystem.branches[branchName];

    // Restore files from the commit associated with this branch
    const branchCommitId = fileSystem.branches[branchName];
    const branchCommit = fileSystem.commits.find(c => c.id === branchCommitId);

    if (branchCommit && branchCommit.files) {
      // Reset the working directory to match the commit
      fileSystem.files = {};

      // Copy files from the commit to the working directory
      Object.entries(branchCommit.files).forEach(([filename, fileData]) => {
        fileSystem.files[filename] = { ...fileData, modified: false };
      });
    }

    return {
      type: 'success',
      content: `Switched to branch '${branchName}'`
    };
  };

  const handleGitMerge = (args) => {
    if (!fileSystem.isInitialized) {
      return {
        type: 'error',
        content: 'fatal: not a git repository (or any of the parent directories): .git'
      };
    }

    // Check if there's a merge in progress
    if (fileSystem.mergeInProgress) {
      return {
        type: 'error',
        content: 'error: Merging is not possible because you have unmerged files.\n' +
                 'hint: Fix them up in the work tree, and then use "git add <file>"\n' +
                 'hint: as appropriate to mark resolution and make a commit.'
      };
    }

    if (args.length === 0) {
      return {
        type: 'error',
        content: 'You must specify a branch name to merge'
      };
    }

    const branchName = args[0];

    // Check if branch exists
    if (!fileSystem.branches[branchName]) {
      return {
        type: 'error',
        content: `error: pathspec '${branchName}' did not match any file(s) known to git`
      };
    }

    // Check if it's the current branch
    if (branchName === fileSystem.currentBranch) {
      return {
        type: 'output',
        content: `Already up to date. '${branchName}' is the current branch.`
      };
    }

    // Get the commit objects for both branches
    const currentBranchCommitId = fileSystem.branches[fileSystem.currentBranch];
    const mergeBranchCommitId = fileSystem.branches[branchName];

    if (!currentBranchCommitId || !mergeBranchCommitId) {
      return {
        type: 'error',
        content: 'Cannot merge branches without commits'
      };
    }

    const currentBranchCommit = fileSystem.commits.find(c => c.id === currentBranchCommitId);
    const mergeBranchCommit = fileSystem.commits.find(c => c.id === mergeBranchCommitId);

    if (!currentBranchCommit || !mergeBranchCommit) {
      return {
        type: 'error',
        content: 'Cannot find commit objects for branches'
      };
    }

    // Check for conflicts
    const conflicts = [];

    // Get all files from both branches
    const currentBranchFiles = currentBranchCommit.files || {};
    const mergeBranchFiles = mergeBranchCommit.files || {};

    // Find files that exist in both branches
    const allFiles = new Set([...Object.keys(currentBranchFiles), ...Object.keys(mergeBranchFiles)]);

    allFiles.forEach(filename => {
      const currentFile = currentBranchFiles[filename];
      const mergeFile = mergeBranchFiles[filename];

      // If the file exists in both branches and has different content, it's a conflict
      if (currentFile && mergeFile &&
          currentFile.content !== mergeFile.content) {
        conflicts.push({
          filename,
          currentContent: currentFile.content,
          mergeContent: mergeFile.content
        });

        // Update the file with conflict markers
        fileSystem.files[filename] = {
          content: `<<<<<<< HEAD\n${currentFile.content}\n=======\n${mergeFile.content}\n>>>>>>> ${branchName}\n`,
          modified: true
        };
      } else if (mergeFile && !currentFile) {
        // File only exists in the branch being merged, add it
        fileSystem.files[filename] = { ...mergeFile, modified: false };
      }
      // If file only exists in current branch or is identical, keep it as is
    });

    if (conflicts.length > 0) {
      // Set merge in progress and store conflicts
      fileSystem.mergeInProgress = true;
      fileSystem.mergeConflicts = conflicts;

      return {
        type: 'error',
        content: `Auto-merging failed, fix conflicts and then commit the result.\n` +
                 `Merge conflict in ${conflicts.map(c => c.filename).join(', ')}\n\n` +
                 `Automatic merge failed; fix conflicts and then commit the result.\n` +
                 `To resolve conflicts:\n` +
                 `1. Edit the files to fix the conflicts (look for the conflict markers)\n` +
                 `2. Use 'git add <file>' to mark them as resolved\n` +
                 `3. Then commit the result with 'git commit'`
      };
    }

    // No conflicts, perform the merge
    fileSystem.HEAD = mergeBranchCommitId;
    fileSystem.branches[fileSystem.currentBranch] = mergeBranchCommitId;

    return {
      type: 'success',
      content: `Merged branch '${branchName}' into ${fileSystem.currentBranch}`
    };
  };

  // Helper function to generate commit IDs
  const generateCommitId = () => {
    return Math.random().toString(16).substring(2, 10) +
           Math.random().toString(16).substring(2, 10);
  };

  return {
    fileSystem,
    processGitCommand
  };
}
