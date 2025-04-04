<template>
  <div class="formatted-help">
    <div class="help-header">
      <div class="help-title">GIT TERMINAL SIMULATOR</div>
    </div>

    <div class="help-section">
      <div class="section-title">GIT COMMANDS</div>
      
      <div class="command-group">
        <div class="group-title">Repository Operations:</div>
        <div class="command-item">
          <span class="command">git init</span>
          <span class="description">Initialize a new Git repository</span>
        </div>
        <div class="command-item">
          <span class="command">git status</span>
          <span class="description">Show the working tree status</span>
        </div>
        <div class="command-item">
          <span class="command">git log</span>
          <span class="description">Show commit logs</span>
        </div>
        <div class="command-item">
          <span class="command">git help</span>
          <span class="description">Show this help information</span>
        </div>
      </div>
      
      <div class="command-group">
        <div class="group-title">Staging & Committing:</div>
        <div class="command-item">
          <span class="command">git add &lt;file&gt;</span>
          <span class="description">Add file contents to the index</span>
        </div>
        <div class="command-item">
          <span class="command">git add .</span>
          <span class="description">Add all files to the index</span>
        </div>
        <div class="command-item">
          <span class="command">git commit -m "message"</span>
          <span class="description">Record changes to the repository</span>
        </div>
      </div>
      
      <div class="command-group">
        <div class="group-title">Branch Management:</div>
        <div class="command-item">
          <span class="command">git branch</span>
          <span class="description">List all branches</span>
        </div>
        <div class="command-item">
          <span class="command">git branch &lt;name&gt;</span>
          <span class="description">Create a new branch</span>
        </div>
        <div class="command-item">
          <span class="command">git checkout &lt;branch&gt;</span>
          <span class="description">Switch to existing branch</span>
        </div>
        <div class="command-item">
          <span class="command">git checkout -b &lt;name&gt;</span>
          <span class="description">Create and switch to a new branch</span>
        </div>
        <div class="command-item">
          <span class="command">git switch &lt;branch&gt;</span>
          <span class="description">Switch to existing branch</span>
        </div>
        <div class="command-item">
          <span class="command">git switch -c &lt;name&gt;</span>
          <span class="description">Create and switch to a new branch</span>
        </div>
        <div class="command-item">
          <span class="command">git merge &lt;branch&gt;</span>
          <span class="description">Merge a branch into your current branch</span>
        </div>
      </div>
    </div>

    <div class="help-section">
      <div class="section-title">OTHER COMMANDS</div>
      
      <div class="command-group">
        <div class="group-title">Terminal Operations:</div>
        <div class="command-item">
          <span class="command">help</span>
          <span class="description">Show this help information</span>
        </div>
        <div class="command-item">
          <span class="command">clear</span>
          <span class="description">Clear the terminal</span>
        </div>
      </div>
      
      <div class="command-group">
        <div class="group-title">File Operations:</div>
        <div class="command-item">
          <span class="command">ls</span>
          <span class="description">List files in the current directory</span>
        </div>
        <div class="command-item">
          <span class="command">touch &lt;file&gt;</span>
          <span class="description">Create a new file</span>
        </div>
        <div class="command-item">
          <span class="command">edit &lt;file&gt; &lt;content&gt;</span>
          <span class="description">Edit file content</span>
        </div>
        <div class="command-item">
          <span class="command">cat &lt;file&gt;</span>
          <span class="description">View file content</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or emits needed for this component
</script>

<style scoped>
.formatted-help {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  color: #DCDCDC;
  line-height: 1.5;
  width: 100%;
}

.help-header {
  margin-bottom: 1rem;
  text-align: center;
  border-bottom: 1px solid #4A4A4A;
  padding-bottom: 0.5rem;
}

.help-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #56B6C2;
}

.help-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-weight: bold;
  color: #E5C07B;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #4A4A4A;
  padding-bottom: 0.25rem;
}

.command-group {
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.group-title {
  color: #98C379;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.command-item {
  display: flex;
  margin-bottom: 0.25rem;
  padding-left: 1rem;
}

.command {
  color: #61AFEF;
  width: 220px;
  flex-shrink: 0;
}

.description {
  color: #DCDCDC;
}
</style>
