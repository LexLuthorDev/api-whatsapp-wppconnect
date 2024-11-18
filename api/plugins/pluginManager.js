const fs = require('fs');
const path = require('path');

const loadPlugins = () => {
    const plugins = {};
    const pluginsPath = path.join(__dirname, 'payments');

    console.log(pluginsPath);

    return

    fs.readdirSync(pluginsPath).forEach(folder => {
        const pluginPath = path.join(pluginsPath, folder, 'index.js');
        if (fs.existsSync(pluginPath)) {
            const plugin = require(pluginPath);
            plugins[folder] = plugin;
        }
    });

    return plugins;
};

module.exports = {
    loadPlugins,
};
