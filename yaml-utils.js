import fs from 'fs';
import jsyaml from 'js-yaml';

function loadYamlFile(filePath) {
  try {
    const yamlFile = fs.readFileSync(filePath, 'utf8');
    const yamlContent = jsyaml.load(yamlFile);
    return { yamlContent: yamlContent, error: null };
  }
  catch (e) {
    return { yamlContent: null, error: e };
  }
}

export function loadPluginsYamlFile(pluginsPath, pluginsDefinitionFile) {
  var { yamlContent, error } = loadYamlFile(`${pluginsPath}/${pluginsDefinitionFile}`);
  return { plugins: yamlContent, errorPlugin: error };
}

export function loadResourcesYamlFile(resourcesPath, resourcesDefinitionFile) {
  var { yamlContent, error} = loadYamlFile(`${resourcesPath}/${resourcesDefinitionFile}`);
  return { resources: yamlContent, errorResource: error };
}