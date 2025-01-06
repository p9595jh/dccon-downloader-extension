import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from '../package.json';

const { version, name, description } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: name,
  description: description,
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  icons: {
    '16': 'src/assets/icons/icon-16.png',
    '32': 'src/assets/icons/icon-32.png',
    '48': 'src/assets/icons/icon-48.png',
    '128': 'src/assets/icons/icon-128.png',
  },
  content_scripts: [
    {
      matches: ['https://*/*'],
      js: ['src/content/index.ts'],
    },
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  options_ui: {
    page: 'src/options/options.html',
    open_in_tab: false,
  },
  side_panel: {
    default_path: 'src/sidepanel/sidepanel.html',
  },
  action: {
    default_popup: 'src/popup/popup.html',
    default_icon: {
      '16': 'src/assets/icons/icon-16.png',
      '32': 'src/assets/icons/icon-32.png',
      '48': 'src/assets/icons/icon-48.png',
      '128': 'src/assets/icons/icon-128.png',
    },
  },
  web_accessible_resources: [
    {
      resources: ['wasm_exec.js', 'proxy.wasm'],
      matches: ['<all_urls>'],
    },
  ],
  // host_permissions: ['https://*/*'],
  host_permissions: ['http://127.0.0.1:*/*', 'http://localhost:*/*'],
  permissions: [
    'storage',
    'activeTab',
    'scripting',
    'downloads',
  ] as chrome.runtime.ManifestPermissions[],
}));
