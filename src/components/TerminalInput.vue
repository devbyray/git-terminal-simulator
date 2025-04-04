<template>
  <div class="terminal-input-container flex items-center mt-2">
    <span class="prompt-user text-[#56B6C2] font-bold">i-am-awesome</span>
    <span class="text-white">@</span>
    <span class="prompt-host text-[#98C379] font-bold">my-computer</span>
    <span class="text-white mr-1">:</span>
    <span class="prompt-path text-[#61AFEF] mr-2">~/git-terminal-simulator$</span>
    <input
      type="text"
      class="terminal-input bg-transparent border-none outline-none text-[#DCDCDC] flex-grow font-mono"
      :value="command"
      @input="$emit('update:command', $event.target.value)"
      @keydown.enter="$emit('execute-command')"
      @keydown.up="navigateHistory('up')"
      @keydown.down="navigateHistory('down')"
      :disabled="isProcessing"
      placeholder="Type a git command..."
      ref="inputRef"
      spellcheck="false"
      autocomplete="off"
    />
    <div v-if="isProcessing" class="animate-pulse text-[#E5C07B] ml-2 font-mono">
      Processing...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue';

const props = defineProps({
  command: {
    type: String,
    required: true
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:command', 'execute-command']);

const inputRef = ref(null);

// Command history functionality
const commandHistory = ref([]);
const historyIndex = ref(-1);

// Function to navigate command history
const navigateHistory = (direction) => {
  if (commandHistory.value.length === 0) return;

  if (direction === 'up') {
    // Navigate up in history (older commands)
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++;
      emit('update:command', commandHistory.value[commandHistory.value.length - 1 - historyIndex.value]);
    }
  } else if (direction === 'down') {
    // Navigate down in history (newer commands)
    if (historyIndex.value > 0) {
      historyIndex.value--;
      emit('update:command', commandHistory.value[commandHistory.value.length - 1 - historyIndex.value]);
    } else if (historyIndex.value === 0) {
      // Clear command when reaching the bottom of history
      historyIndex.value = -1;
      emit('update:command', '');
    }
  }
};

// Add command to history when executed
watch(() => props.command, (newVal, oldVal) => {
  if (oldVal && !newVal && !props.isProcessing) {
    // Command was executed (cleared after processing)
    if (oldVal.trim() && !commandHistory.value.includes(oldVal)) {
      commandHistory.value.push(oldVal);
      // Reset history index
      historyIndex.value = -1;
    }
  }
});

onMounted(() => {
  inputRef.value.focus();
});

watch(() => props.isProcessing, (newVal) => {
  if (!newVal) {
    // Focus input after processing is complete
    setTimeout(() => {
      inputRef.value.focus();
    }, 0);
  }
});
</script>

<style scoped>
.terminal-input {
  caret-color: #DCDCDC;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.terminal-input-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* Style for the prompt components */
.prompt-user, .prompt-host, .prompt-path {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
}

/* Add a blinking cursor effect */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.terminal-input:focus::after {
  content: '|';
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}
</style>
