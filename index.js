// SillyTavern UI Extension: AI Long-Term Journal & Preferences
// This extension adds a UI panel to view and manage AI memory and preferences.

import { extension_settings } from '../../../extensions.js';
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
        // Only let the AI add entries
        const prefMatch = message.match(/\/preferences\s+"([^"]+)"/i);
        if (prefMatch) addEntry('preferences', prefMatch[1]);
        const memMatch = message.match(/\/memory\s+"([^"]+)"/i);
        if (memMatch) addEntry('memories', memMatch[1]);
    });
}



export async function init() {
    loadSettings();
    hookAIResponses();
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addExtensionSettings();
        });
    } else {
        addExtensionSettings();
    }
}
