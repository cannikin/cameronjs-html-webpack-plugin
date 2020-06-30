## CameronJS HTML Webpack Plugin

Adds support for simple HTML layouts and partials

## Install

    yarn add cameronjs-html-webpack-plugin

Add to your webpack.config.js:

```javascript
const CameronJSHtmlWebpackPlugin = require("cameronjs-html-webpack-plugin");

module.exports = {
  // ...
  output: {
    //...
    path: path.resolve(__dirname, "public")
  },
  plugins: [
    new CameronJSHtmlWebpackPlugin({
      source: "./src/html",
      layouts: "layouts"
    })
  ],
  // ...
};
```

## Options

`source` is relative to `webpack.config.js` and is where your HTML templates live.

`layouts` is relative to `source` and is where your layout files live.

Generated HTML pages will be emitted to the `output.path` set in the config file.

## Usage

### Layouts

**Layouts** surround your HTML content and provide a "frame". The standard <html> declarations for your pages probably don't change much between pages so they're perfect for a layout:

```html
<!-- src/html/layouts/application.html -->

<!DOCTYPE html>
<html>
<head>
  <title>@@title</title>
</head>
<body>
  @@content
</body>
</html>
```

You use `@@content` to denote where the real content of your page will be inserted into the layout and any other variables you want to be replaced by prefixing them with `@@`.

To denote that a page should use a layout add a `@@layout` declaration at the top of the page to say which one to use, with an optional list of those variables you want to substitute:

```html
<!-- src/html/index.html -->

@@layout("application", { "title": "My Site" })
<h1>Hello, world</h1>
```

The final rendered HTML will be emitted to wherever output.path is set in `webpack.config.js`:

```html
<!-- public/index.html -->

<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  <h1>Hello, world</h1>
</body>
</html>
```

Layouts are great for parts of your site that don't change between pages. This way you write them once and share them everywhere.

#### Named Content

You may find the need to insert content into more than one place in your layout. For example, if you have a banner that should be displayed on the page, but it needs to be outside of the container for your normal content:

```html
<!-- src/html/layouts/application.html -->

<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  <header>
    <h1>Logo</h1>
    <!-- Banner needs to go here -->
  </header>
  <main>
    <!-- Main content goes here -->
  </main>
</body>
</html>
```

You can mark the spot where the named content will go by passing a parameter to `@@content`:

```html
<!-- src/html/layouts/application.html -->

<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  <header>
    <h1>Logo</h1>
    @@content("banner")
  </header>
  <main>
    @@content
  </main>
</body>
</html>
```

And then in the main content HTML include a `@@content` declaration with the same name:

```html
<!-- src/html/index.html -->

@@content("banner",
  <div id="banner">This is important info</div>
)

<p>This is the main body text.</p>
```

The resulting HTML will be:

```html
<!-- public/index.html -->

<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  <header>
    <h1>Logo</h1>
    <div id="banner">This is important info</div>
  </header>
  <main>
    <p>This is the main body text.</p>
  </main>
</body>
</html>
```

### Partials

**Partials** are smaller snippets of HTML that you want to share between pages. A navigation bar is a good example:

```html
<!-- src/html/_nav.html -->

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/account">Account</a></li>
  </ul>
</nav>
```

Note that the filename must begin with a _underscore. This helps you distinguish between full pages and partials when you're looking at a list of files in your editor. In the page where you want to use the partial you'll provide a `@@partial` declaration (this time *without* the leading underscore, or `.html` extension):

```html
<!-- src/html/index.html -->

@@partial("nav")
<h1>Hello, world</h1>
```

And the final built HTML page would look like:

```html
<!-- public/index.html -->

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/account">Account</a></li>
  </ul>
</nav>

<h1>Hello, world</h1>
```

(Note the `@@layout` declaration was not present so this page won't be wrapped in a layout.)

You can pass variable substitutions to partials if you want the parent page to make some data available to the child partial.

```html
<!-- src/html/parts/_title.html -->

<header>
  <h1>@@pageTitle</h1>
  <h2>Welcome @@user.name</h2>
</nav>

<!-- src/html/index.html -->

@@partial("parts/title", { "pageTitle": "Welcome!", "user": { "name": "Rob" } })

<main>
  <p>Lorem ipsum dolar sit amet...</p>
</main>
```

Note that in the above example the partial lived in a different directory than the main file.

### Notes

You can combine partials and layouts and reference one from the other. Perhaps you have multiple layouts but they should all share the same `<head>` tag content. Include the `@@partial` in both layouts and you're good to go:

```html
<!-- src/html/layouts/site.html -->

<!DOCTYPE html>
<html>
@@partial("head.html")
<body>
  <h1>My Site</h1>
  @@content
</body>
</html>

<!-- src/html/layouts/admin.html -->

<!DOCTYPE html>
<html>
@@partial("admin.html")
<body>
  <h1>Admins Only</h1>
  @@content
</body>
</html>
```

## Thanks

This package was made possible by digging through the source on [file-include-webpack-plugin](https://www.npmjs.com/package/) and this plugin borrowed some code from it!
