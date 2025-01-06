<script lang="ts">
  import { MessageType } from '../types';
  import { writable } from 'svelte/store';

  const progress = writable(0);
  const total = writable(0);
  const postprocess = writable(false);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MessageType.PROGRESS) {
      progress.set(message.progress);
      total.set(message.total);
      postprocess.set(message.postprocess);
    }
  });

  function download() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const { url } = tabs[0];
      chrome.runtime.sendMessage({
        url,
        type: MessageType.DOWNLOAD,
      });
    });
  }
</script>

<div class="container">
  <div>
    <button
      class="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
      onclick={() => download()}>Download</button
    >
  </div>
  {#if $total}
    {#if !$postprocess}
      <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
        <div
          class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
          style="width: {Math.ceil(($progress / $total) * 100)}%"
        >
          {$progress}/{$total}
        </div>
      </div>
    {:else}
      <div
        class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 animate-pulse"
      >
        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 100%"></div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .container {
    font-size: medium;
    min-width: 250px;
    padding: 3rem;
  }
</style>
