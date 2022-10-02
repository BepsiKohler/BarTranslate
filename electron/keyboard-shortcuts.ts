// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Event, Input, BrowserWindow, globalShortcut,
} from 'electron';
import { Menubar } from 'menubar';
import { fetchAppSettingsFromFile } from './settings';
import { changeLanguage1, swapLanguages, changeLanguage2 } from './translate-window';
import { AppSettings } from './types';
import { isDev, toggleAppVisibility, validateMenubarWindow } from './utils';

function menubarWindowInputHandler(event: Event, input: Input, menubarWindow: BrowserWindow) {
  // open settings
  if ((input.control || input.meta) && input.code === 'Comma') {
    menubarWindow.webContents.send('showSettings');
  }
}

function translateWindowInputHandler(
  event: Event,
  input: Input,
  menubarWindow: BrowserWindow,
  translateWindow: BrowserWindow,
  keyBindings: AppSettings['keyBindings'],
) {
  // open settings
  if ((input.control || input.meta) && input.code === 'Comma') {
    menubarWindow.webContents.send('showSettings');
  }

  // switch languages
  if (
    keyBindings.switchLanguages.modifier
    && keyBindings.switchLanguages.key
    && input.modifiers.includes(keyBindings.switchLanguages.modifier)
    && input.code === keyBindings.switchLanguages.key
  ) {
    event.preventDefault();
    swapLanguages(translateWindow);
  }

  // change language 1
  if (
    keyBindings.changeLanguage1.modifier
    && keyBindings.changeLanguage1.key
    && input.modifiers.includes(keyBindings.changeLanguage1.modifier)
    && input.code === keyBindings.changeLanguage1.key
  ) {
    event.preventDefault();
    changeLanguage1(translateWindow);
  }

  // change language 2
  if (
    keyBindings.changeLanguage2.modifier
    && keyBindings.changeLanguage2.key
    && input.modifiers.includes(keyBindings.changeLanguage2.modifier)
    && input.code === keyBindings.changeLanguage2.key
  ) {
    event.preventDefault();
    changeLanguage2(translateWindow);
  }
}

async function registerLocalKeyboardShortcuts(menubar: Menubar, translateWindow: BrowserWindow, settings: AppSettings) {
  if (isDev()) {
    console.info('Registering local key listeners');
  }

  const menubarWindow = validateMenubarWindow(menubar);

  function translateWindowInputListener(event: Event, input: Input) {
    translateWindowInputHandler(event, input, menubarWindow, translateWindow, settings.keyBindings);
  }

  function menubarWindowInputListener(event: Event, input: Input) {
    menubarWindowInputHandler(event, input, menubarWindow);
  }

  translateWindow.webContents.removeAllListeners('before-input-event');
  translateWindow.webContents.on('before-input-event', translateWindowInputListener);

  menubarWindow.webContents.removeAllListeners('before-input-event');
  menubarWindow.webContents.on('before-input-event', menubarWindowInputListener);
}

async function registerGlobalKeyboardShortcuts(menuBar: Menubar, settings: AppSettings) {
  console.info('Registering local key listeners');

  function convertToAccelerator(code: string) {
    return code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('Numpad', 'num')
      .replace('Semicolon', ';')
      .replace('Equal', '=')
      .replace('Comma', ',')
      .replace('Minus', '-')
      .replace('Period', '.')
      .replace('Slash', '/')
      .replace('Backquote', '`')
      .replace('BracketLeft', '[')
      .replace('Backslash', '\\')
      .replace('BracketRight', ']')
      .replace('Quote', '\'');
  }

  const { modifier, key } = settings.keyBindings.toggleApp;

  if (!modifier || !key) {
    return;
  }

  const accelerator = convertToAccelerator(`${modifier}+${key}`);

  globalShortcut.unregisterAll();
  await globalShortcut.register(accelerator, () => { toggleAppVisibility(menuBar); });
}

export async function registerKeyboardShortcuts(menuBar: Menubar, translateWindow: BrowserWindow) {
  const settings = await fetchAppSettingsFromFile();

  await registerGlobalKeyboardShortcuts(menuBar, settings);
  await registerLocalKeyboardShortcuts(menuBar, translateWindow, settings);
}