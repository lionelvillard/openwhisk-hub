const handlebarsRoot = '../../resources/handlebars';
const partialRoot = `${handlebarsRoot}/partials`;

const paths = {
  handlebars: handlebarsRoot,
  partials: [partialRoot, '../../build/js'],
  actions: '../../actions',
  nodejs: '../../resources/nodejs',
  hbsbuild: `${handlebarsRoot}/build`
}

const htmlActions = [`${paths.actions}/search-ui/search-ui-beta.html`, `${paths.actions}/show/show-beta.html` ];

const constants = {
  wskHtmlHandlebar: `${handlebarsRoot}/nodejs/openwhisk-html-action.hbs`,
  htmls: htmlActions,
  htmlActions: htmlActions.map(path => path.replace('.html', '.js'))
}

const options = {
  handlebars : {
    batch : paths.partials,
    ignorePartials: true
  },
  dev : true
}

module.exports.paths = paths;
module.exports.constants = constants;
module.exports.options = options;
