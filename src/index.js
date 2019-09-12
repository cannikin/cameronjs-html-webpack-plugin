const path = require("path");
const fs = require("fs");
const utils = require("./utils");

class CameronJSHtmlWebpackPlugin {
  constructor(config) {
    this.source = config.source; // source from the context
    this.layouts = config.layouts; // source from the context
    this.partials = config.partials;
    this.context = null;
    this.destination = config.destination;

    // handlers
    this.process = this.process.bind(this);
  }

  processFile(compilation, file) {
    let content = fs.readFileSync(file, "utf-8");
    compilation.fileDependencies.add(file);

    return this.processPartials(this.processLayouts(content));
  }

  processLayouts(content) {
    const match = content.match(/@@layout\(['"](.*?)['"]\)/);

    if (match) {
      const layoutPath = path.join(this.context, this.layouts, `${match[1]}.html`);
      const layoutContent = this.processPartials(fs.readFileSync(layoutPath, "utf-8"));

      return layoutContent.replace(/@@content/, content.replace(/^\s*@@layout.*$/m, ""));
    } else {
      return content;
    }
  }

  processPartials(content) {
    const includeRegex = new RegExp(
      /@@include\(([^,)]*)(?:,\s*({[\W\w\s\d:,\[\]{}"]*}\s*))?\)/,
      "g"
    );

    content = content.replace(includeRegex, (reg, partial, args) => {
      const partialPath = path.join(this.context, this.partials, partial.replace(/['"]/g, ""));
      return utils.getFileContent(partialPath, args);
    });

    return content;
  }

  process(compilation, callback) {
    const { context } = this.compiler.options;
    this.context = path.join(context, this.source);
    const files = utils.getRequiredFiles(this.context, "");

    utils.logger.info(`Working on ${files.length} .html files`);

    files.forEach(file => {
      const sourcePath = path.join(this.context, file);
      const destinationPath = this.destination ? path.join(this.destination, file) : file;
      const layoutsPath = path.join(this.context, this.layouts);
      const partialsPath = path.join(this.context, this.partials);
      const content = this.processFile(compilation, sourcePath);

      if (!sourcePath.match(layoutsPath) && !sourcePath.match(partialsPath)) {
        compilation.assets[destinationPath] = {
          source: () => content,
          size: () => content.length
        };
      }
    });

    callback();
  }

  apply(compiler) {
    this.compiler = compiler;
    compiler.hooks.emit.tapAsync("CameronJSHtmlWebpackPlugin", this.process);
  }
}

module.exports = CameronJSHtmlWebpackPlugin;
