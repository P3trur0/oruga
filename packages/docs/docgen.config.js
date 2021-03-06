const path = require('path');
const fs = require('fs');
const os = require('os');

const src = '../oruga/src';

const IGNORE = [
  'DropdownItem.vue', 'FieldBody.vue', 'SliderThumb.vue', 'SliderTick.vue',
  'TableColumn.vue', 'TableMobileSort.vue', 'TablePagination.vue', 'PaginationButton.vue'
];

module.exports = {
    componentsRoot: `${src}/components`,
    components: '**/[A-Z]*.vue',
    outDir: './components',
    defaultExamples: false,
    getDestFile: (file, config) => {
        const component = path.basename(file);
        if (!component || IGNORE.indexOf(component) >= 0) return;
        return path.join(config.outDir, component).replace(/\.vue$/, '.md');
    },
    templates: {
        component: (renderedUsage, doc, config, fileName, requiresMd, subComponent = false) => {
          const { displayName, description, docsBlocks, tags, functional } = doc;
          const { deprecated, author, since, version, see, link, style } = tags || {};
          return `
---
title: ${displayName}
---
# ${deprecated ? `~~${displayName}~~` : displayName}
${deprecated ? `> **Deprecated** ${deprecated[0].description}\n` : ''}
${description ? '> ' + description : ''}
${functional ? renderedUsage.functionalTag : ''}
${author ? author.map(a => `Author: ${a.description}\n`) : ''}
${since ? `Since: ${since[0].description}\n` : ''}
${version ? `Version: ${version[0].description}\n` : ''}
${see ? see.map(s => `[See](${s.description})\n`) : ''}
${link ? link.map(l => `[See](${l.description})\n`) : ''}
${docsBlocks ? '---\n' + docsBlocks.join('\n---\n') : ''}
${renderedUsage.props}
${renderedUsage.methods}
${renderedUsage.events}
${renderedUsage.slots}
${requiresMd.length ? '---\n' + requiresMd.map(component => component.content).join('\n---\n') : ''}
${style ? renderStyleDocs(config, style[0].description) : ''}
`;
        }
    }
};

function renderStyleDocs(config, name) {
    const cssFile = path.resolve(config.cwd, `${src}/scss/components/${name}`)
    const content = fs.readFileSync(cssFile, 'utf8');
    const docsRegex = '/* @docs */';
    const docs = content.substring(content.indexOf(docsRegex) + docsRegex.length, content.lastIndexOf(docsRegex));
    const variables = docs.split(os.EOL).filter(d => !!d);
    return `
## Style

  | CSS Variable          | SASS Variable  | Default |
  | --------------------- | -------------- | ------- |
${variables
    .map(variable => {
      const keyValue = variable.split(':');
      const varName = keyValue[0].trim();
      const varValue = keyValue[1].replace('!default', '').replace(';', '').trim();
      const varNameCSS = varName.replace('$', '');
      return (
        `| ${'--oruga-' + varNameCSS} | ${varName} | ${varValue} |`
      )
    })
    .join('\n')}
`
}