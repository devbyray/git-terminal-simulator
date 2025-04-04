<script setup>
import TerminalContainer from './components/TerminalContainer.vue';
import { ref } from 'vue';

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="h-screen flex flex-col bg-[#2B2D3A] overflow-hidden">
    <header class="bg-[#1E1E1E] text-white p-2 flex justify-between items-center border-b border-[#4A4A4A]">
      <h1 class="text-xl font-bold font-sans">Git Terminal Simulator</h1>
      <button
        @click="toggleSidebar"
        class="px-3 py-1 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded text-sm transition-colors duration-200"
      >
        {{ isSidebarOpen ? 'Hide Help' : 'Show Help' }}
      </button>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Main Terminal Area -->
      <main class="flex-1 overflow-hidden transition-all duration-300" :class="{ 'pr-0 md:pr-0': !isSidebarOpen, 'pr-0 md:pr-64': isSidebarOpen }">
        <div class="h-full p-4">
          <TerminalContainer />
        </div>
      </main>

      <!-- Help Sidebar -->
      <aside
        class="bg-[#1E1E1E] text-[#DCDCDC] overflow-y-auto transition-all duration-300 border-l border-[#4A4A4A] fixed top-[48px] bottom-0 right-0 transform md:translate-x-0"
        :class="{ 'w-0 translate-x-full': !isSidebarOpen, ' w-64 translate-x-0': isSidebarOpen }"
      >
        <div class="p-4">
          <h2 class="text-[#56B6C2] text-lg mb-4 font-sans border-b border-[#4A4A4A] pb-2">Git Command Reference</h2>

          <div class="space-y-6">
            <div>
              <h3 class="text-[#E5C07B] mb-2 font-medium">Basic Commands</h3>
              <ul class="space-y-2 text-sm">
                <li><span class="text-[#98C379] font-mono">git init</span> - Initialize a repository</li>
                <li><span class="text-[#98C379] font-mono">git status</span> - Check status</li>
                <li><span class="text-[#98C379] font-mono">git add .</span> - Stage all files</li>
                <li><span class="text-[#98C379] font-mono">git commit -m "message"</span> - Commit changes</li>
                <li><span class="text-[#98C379] font-mono">git log</span> - View commit history</li>
              </ul>
            </div>

            <div>
              <h3 class="text-[#E5C07B] mb-2 font-medium">Branch Commands</h3>
              <ul class="space-y-2 text-sm">
                <li><span class="text-[#98C379] font-mono">git branch</span> - List branches</li>
                <li><span class="text-[#98C379] font-mono">git branch name</span> - Create branch</li>
                <li><span class="text-[#98C379] font-mono">git checkout name</span> - Switch branch</li>
                <li><span class="text-[#98C379] font-mono">git checkout -b name</span> - Create & switch</li>
                <li><span class="text-[#98C379] font-mono">git switch name</span> - Switch branch</li>
                <li><span class="text-[#98C379] font-mono">git switch -c name</span> - Create & switch</li>
                <li><span class="text-[#98C379] font-mono">git merge name</span> - Merge branch</li>
              </ul>
            </div>

            <div>
              <h3 class="text-[#E5C07B] mb-2 font-medium">Merge Conflicts</h3>
              <ul class="space-y-2 text-sm">
                <li>When the same file is modified in two branches, merging will create a conflict</li>
                <li>To resolve conflicts:</li>
                <li class="pl-4">1. Use <span class="text-[#98C379] font-mono">cat filename</span> to see conflict markers</li>
                <li class="pl-4">2. Use <span class="text-[#98C379] font-mono">edit filename content</span> to fix conflicts</li>
                <li class="pl-4">3. Use <span class="text-[#98C379] font-mono">git add filename</span> to mark as resolved</li>
                <li class="pl-4">4. Use <span class="text-[#98C379] font-mono">git commit</span> to complete the merge</li>
              </ul>
            </div>

            <div>
              <h3 class="text-[#E5C07B] mb-2 font-medium">Other Commands</h3>
              <ul class="space-y-2 text-sm">
                <li><span class="text-[#98C379] font-mono">help</span> - Show all commands</li>
                <li><span class="text-[#98C379] font-mono">clear</span> - Clear terminal</li>
                <li><span class="text-[#98C379] font-mono">ls</span> - List files</li>
                <li><span class="text-[#98C379] font-mono">touch filename</span> - Create a file</li>
                <li><span class="text-[#98C379] font-mono">edit filename content</span> - Edit file content</li>
                <li><span class="text-[#98C379] font-mono">cat filename</span> - View file content</li>
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <footer class="bg-[#1E1E1E] text-gray-400 text-xs p-2 text-center border-t border-[#4A4A4A]">
      <p>Created with Vue 3, Vite, and Tailwind CSS v4</p>
    </footer>
  </div>
</template>

<style>
/* Global styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #2B2D3A;
  color: #DCDCDC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#app {
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
}

/* Add subtle animation for the terminal appearance */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

main > * {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Add a subtle glow to the terminal */
.terminal-container {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 0, 0, 0.1);
}
</style>
