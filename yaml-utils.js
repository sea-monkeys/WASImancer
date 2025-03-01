import fs from 'fs';
import jsyaml from 'js-yaml';

/**
 * Loads a YAML file
 *
 * @param {string} filePath - Path to the YAML file
 * @returns {Object} Object containing YAML content or error
 */
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


/**
 * Loads plugins from a YAML file
 * 
 * @param {string} pluginsPath - Path to the directory containing plugins definitions
 * @param {string} pluginsPath - name of the file containing plugins definitions
 * @returns {Object} Object containing plugins data or error
 */
export function loadPluginsYamlFile(pluginsPath, pluginsDefinitionFile) {
  var { yamlContent, error } = loadYamlFile(`${pluginsPath}/${pluginsDefinitionFile}`);
  return { pluginsData: yamlContent, errorPlugins: error };
}

/**
 * Loads resources from a YAML file
 * 
 * @param {string} resourcesPath - Path to the directory containing resources definitions
 * @param {string} resourcesDefinitionFile - name of the file containing resources definitions
 * @returns {Object} Object containing resources data or error
 */
export function loadResourcesYamlFile(resourcesPath, resourcesDefinitionFile) {
  var { yamlContent, error} = loadYamlFile(`${resourcesPath}/${resourcesDefinitionFile}`);
  return { resourcesData: yamlContent, errorResources: error };
}

/**
 * Loads prompts from a YAML file
 * 
 * @param {string} promptsPath - Path to the directory containing prompt definitions
 * @param {string} promptsDefinitionFile - name of the file containing prompt definitions
 * @returns {Object} Object containing prompts data or error
 */
export function loadPromptsYamlFile(promptsPath, promptsDefinitionFile) {
  var { yamlContent, error} = loadYamlFile(`${promptsPath}/${promptsDefinitionFile}`);
  return { promptsData: yamlContent, errorPrompts: error };
}