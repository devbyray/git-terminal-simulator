<template>
  <div class="terminal-output">
    <div v-for="(output, index) in outputs" :key="index" class="mb-2">
      <div v-if="output.type === 'command'" class="command-line">
        <span class="prompt-user text-[#56B6C2] font-bold">i-am-awesome</span>
        <span class="text-white">@</span>
        <span class="prompt-host text-[#98C379] font-bold">my-computer</span>
        <span class="text-[#DCDCDC] mr-1">:</span>
        <span class="prompt-path text-[#61AFEF] mr-2">~/git-terminal-simulator$</span>
        <span class="text-[#DCDCDC]">{{ output.content }}</span>
      </div>
      <div v-else-if="output.type === 'error'" class="text-[#E06C75] font-mono">
        Error: {{ output.content }}
      </div>
      <div v-else-if="output.type === 'system'">
        <!-- Special handling for help command -->
        <FormattedHelpOutput v-if="output.isHelp || isHelpCommand(output.content)" />
        <div v-else class="text-[#56B6C2] font-mono">
          {{ output.content }}
        </div>
      </div>
      <div v-else-if="output.type === 'success'" class="text-[#98C379] font-mono">
        {{ output.content }}
      </div>
      <div v-else-if="output.type === 'clear'" class="clear-terminal">
        <!-- Clear terminal output -->
      </div>
      <div v-else class="text-[#DCDCDC] whitespace-pre-wrap font-mono">
        {{ output.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import FormattedHelpOutput from './FormattedHelpOutput.vue';

const props = defineProps({
  outputs: {
    type: Array,
    required: true
  }
});

// Function to check if the output is a help command
const isHelpCommand = (content) => {
  return content && content.includes('GIT TERMINAL SIMULATOR') &&
    content.includes('GIT COMMANDS');
};

// Watch for clear command
watch(() => props.outputs, (newOutputs) => {
  if (newOutputs.length > 0 && newOutputs[newOutputs.length - 1].type === 'clear') {
    // Clear all outputs except the last one (which is the clear command)
    props.outputs.splice(0, props.outputs.length - 1);
    // Remove the clear command itself
    props.outputs.pop();
  }
}, { deep: true });
</script>

<style scoped>
.terminal-output {
  line-height: 1.6;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
}

.command-line {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

/* Style for the prompt components */
.prompt-user,
.prompt-host,
.prompt-path {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
}

/* Add a subtle text shadow for terminal text */
.terminal-output span {
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
}
</style>
