const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (_event, route) => callback(route));
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  get platform() {
    return process.platform;
  },
});
