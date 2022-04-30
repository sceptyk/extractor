const { contextBridge } = require('electron');
const { XMLParser } = require('fast-xml-parser');

contextBridge.exposeInMainWorld('exporter', {
  parseXml: (file) => {
    const parser = new XMLParser();
    return parser.parse(file);
  },
});
