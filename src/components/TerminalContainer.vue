<template>
  <div class="terminal-container overflow-hidden w-full h-full rounded-lg shadow-2xl flex flex-col">
    <!-- macOS Terminal-like header -->
    <div class="terminal-header flex items-center p-2 bg-[#3A3A3A] border-b border-[#4A4A4A]">
      <div class="flex space-x-2 ml-2">
        <button class="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80"></button>
        <button class="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80"></button>
        <button class="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80"></button>
      </div>
      <div class="text-[#DCDCDC] text-sm mx-auto font-sans">i-am-awesome@my-computer ~ /git-terminal-simulator</div>
    </div>

    <!-- Terminal body with macOS-like styling -->
    <div class="terminal-body p-4 flex-1 overflow-y-auto font-mono text-sm bg-[#1E1E1E]">
      <TerminalOutput :outputs="outputs" />
      <TerminalInput
        :command="command"
        @update:command="command = $event"
        @execute-command="executeCommand"
        :isProcessing="isProcessing"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TerminalInput from './TerminalInput.vue';
import TerminalOutput from './TerminalOutput.vue';
import { useGitCommands } from '../composables/useGitCommands';

const command = ref('');
const outputs = ref([
  {
    type: 'system',
    content: 'Welcome to Git Terminal Simulator! Type "help" to see available commands.'
  }
]);
const isProcessing = ref(false);

const { processGitCommand } = useGitCommands();

const executeCommand = async () => {
  if (!command.value.trim()) return;

  // Add user command to output
  outputs.value.push({
    type: 'command',
    content: command.value
  });

  isProcessing.value = true;

  try {
    // Process the command
    const result = await processGitCommand(command.value);

    // Add command result to output
    outputs.value.push({
      type: result.type || 'output',
      content: result.content
    });
  } catch (error) {
    // Add error to output
    outputs.value.push({
      type: 'error',
      content: error.message || 'An error occurred'
    });
  } finally {
    isProcessing.value = false;
    command.value = '';
  }
};
</script>

<style scoped>
.terminal-container {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

.terminal-body {
  background-color: #1E1E1E;
  color: #DCDCDC;
}

/* Add a subtle terminal glow effect */
.terminal-container {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3), 0 0 5px rgba(0, 0, 0, 0.1);
}

/* Add a subtle scanline effect */
.terminal-body::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.2;
}

/* Make sure content appears above the scanline effect */
.terminal-body > * {
  position: relative;
  z-index: 2;
}
</style>
