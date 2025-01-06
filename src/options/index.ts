import { mount } from 'svelte';
import Options from '../components/Options.svelte';
import '../tailwind.css';

async function initWasm() {
  // @ts-ignore
  const go = new Go();
  const result = await WebAssembly.instantiateStreaming(
    fetch(chrome.runtime.getURL('proxy.wasm')),
    go.importObject,
  );
  go.run(result.instance);
}

async function render() {
  const target = document.getElementById('app');
  await initWasm();

  if (target) {
    mount(Options, { target, props: {} });
  }
}

document.addEventListener('DOMContentLoaded', render);
