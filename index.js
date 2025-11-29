// SillyTavern UI Extension: AI Long-Term Journal & Preferences
// This extension adds a UI panel to view and manage AI memory and preferences.

import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';
import { eventSource, event_types } from '../../../../script.js';

const MODULE = 'sillytavern-memory-extension';

let extensionSettings = {
    preferences: [],
    memories: []
};


function saveSettings() {
    extension_settings[MODULE] = extensionSettings;
    saveSettingsDebounced();
}


function loadSettings() {
    if (extension_settings[MODULE]) {
        extensionSettings = extension_settings[MODULE];
    }
}

function addEntry(type, entry) {
    const date = new Date().toISOString();
    if (type === 'preferences') {
        extensionSettings.preferences.push({ date, entry });
    } else if (type === 'memories') {
        extensionSettings.memories.push({ date, entry });
    }
    saveSettings();
    // Refresh the extension settings display
    updateSettingsDisplay();
}

function updateSettingsDisplay() {
    const preferencesList = document.querySelector('#memory-extension-preferences');
    const memoriesList = document.querySelector('#memory-extension-memories');

    if (preferencesList) {
        preferencesList.innerHTML = extensionSettings.preferences.map(e => `<li><span style='color:#888;'>${e.date}:</span> ${e.entry}</li>`).join('') || '<li><em>No preferences yet.</em></li>';
    }

    if (memoriesList) {
        memoriesList.innerHTML = extensionSettings.memories.map(e => `<li><span style='color:#888;'>${e.date}:</span> ${e.entry}</li>`).join('') || '<li><em>No memories yet.</em></li>';
    }
}

function addExtensionSettings() {
    const settingsContainer = document.getElementById('extensions_settings');
    if (!settingsContainer) {
        return;
    }

    const inlineDrawer = document.createElement('div');
    inlineDrawer.classList.add('inline-drawer');
    settingsContainer.append(inlineDrawer);

    const inlineDrawerToggle = document.createElement('div');
    inlineDrawerToggle.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const extensionName = document.createElement('b');
    extensionName.textContent = 'AI Journal & Preferences';

    const inlineDrawerIcon = document.createElement('div');
    inlineDrawerIcon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    inlineDrawerToggle.append(extensionName, inlineDrawerIcon);

    const inlineDrawerContent = document.createElement('div');
    inlineDrawerContent.classList.add('inline-drawer-content');

    inlineDrawer.append(inlineDrawerToggle, inlineDrawerContent);

    // Preferences section
    const preferencesDiv = document.createElement('div');
    preferencesDiv.style.marginBottom = '1em';
    const preferencesTitle = document.createElement('strong');
    preferencesTitle.textContent = 'Preferences';
    const preferencesList = document.createElement('ul');
    preferencesList.id = 'memory-extension-preferences';
    preferencesList.innerHTML = extensionSettings.preferences.map(e => `<li><span style='color:#888;'>${e.date}:</span> ${e.entry}</li>`).join('') || '<li><em>No preferences yet.</em></li>';
    preferencesDiv.append(preferencesTitle, preferencesList);

    // Memories section
    const memoriesDiv = document.createElement('div');
    const memoriesTitle = document.createElement('strong');
    memoriesTitle.textContent = 'Memories';
    const memoriesList = document.createElement('ul');
    memoriesList.id = 'memory-extension-memories';
    memoriesList.innerHTML = extensionSettings.memories.map(e => `<li><span style='color:#888;'>${e.date}:</span> ${e.entry}</li>`).join('') || '<li><em>No memories yet.</em></li>';
    memoriesDiv.append(memoriesTitle, memoriesList);

    inlineDrawerContent.append(preferencesDiv, memoriesDiv);

    // Add click handler for toggle
    inlineDrawerToggle.addEventListener('click', () => {
        inlineDrawerContent.classList.toggle('open');
        inlineDrawerIcon.classList.toggle('down');
        inlineDrawerIcon.classList.toggle('up');
    });
}

function hookAIResponses() {
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        const message = data?.mes || '';
        console.log('[Memory Extension] AI message received:', message.substring(0, 100) + '...');

        // Only let the AI add entries - handle multiple commands in one message

        // Handle preferences commands (with or without space after command)
        const prefRegex = /\/preferences\s*"([^"]*)"/gi;
        const prefMatches = [...message.matchAll(prefRegex)];
        console.log('[Memory Extension] Found', prefMatches.length, 'preferences commands');
        for (const match of prefMatches) {
            console.log('[Memory Extension] Adding preference:', match[1]);
            addEntry('preferences', match[1]);
        }

        // Handle memory commands (with or without space after command)
        const memRegex = /\/memory\s*"([^"]*)"/gi;
        const memMatches = [...message.matchAll(memRegex)];
        console.log('[Memory Extension] Found', memMatches.length, 'memory commands');
        for (const match of memMatches) {
            console.log('[Memory Extension] Adding memory:', match[1]);
            addEntry('memories', match[1]);
        }
    });
}

// This function is called when the extension is loaded
jQuery(async () => {
    loadSettings();
    hookAIResponses();
    addExtensionSettings();
});
