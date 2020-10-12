# RegLMT-WebTools

Simple app to serve the SMPTE Language Metadata Table to Machines and Humans

* v0.9 updated - refactored XML to meet object model
* v0.8 styled to SMPTE website

## Installation

### Prerequisites

You will need

* [NodeJS](https://nodejs.org/en/) (Mac, Win, Linux)
* [Yarn](https://classic.yarnpkg.com/en/docs/install) if you want a slightly slicker sustaining experience
* [pm2](https://pm2.keymetrics.io/) or some other process manager for production (heroko, azure, amazon etc.)

### Installation

Clone the repo

```sh
git clone https://github.com/smpte/RegLMT-WebTools.git
cd RegLMT-WebTools
```

and then install dependencies with yarn or npm

`yarn install --production` or `npm install --production`

then start the server

`yarn install --production` or `npm install --production` or `pm2 start lmt-srv/server-lmt.js`

### Test it works

To test the page locally, you need to start the server and connect a browser to the
correct port. The default would be to connect to `http://localhost:3000`

### File Structure

The server root folder is `/dist/`

* `/dist/client-side/`
  * `/dist/client-side/index.html` this is the client side demo html file for
     demonstrating the functionality - load it in a browser.
    * `<link rel="stylesheet" href="css/prism-twilight.css" />` in the header loads the styles for syntax highlighting
    * `<script src="proto-lmt.js"></script>` in the header loads the javascript to run the page
    * `<div id="lmt-narrative"></div>` is where `abstract.md` will be rendered ass HTML with the current styles
    * `<div id="lmt-buttons"></div>`  is where the buttons will be rendered (one per transform type)
    * `<div id="lmt-rendering"></div>`  is where the output of a rendering is written
  * `lmt-narrative.md` is the markrdown file with the introduction to a version of LMT
  * `lmt.xml` is the full XML of the LMT to be published
  * `lmt-schema.xsd` is the schema that is used for validation (defined in the RDD)
  * `css/` folder with various style sheets
    * `site.css` should contain any custom css to make this page display correctly
    * `prism-xxx.css` is the highglight style for doing the xml pretty printing

If you update the app in the `src/` folder then you need to `npm run build` to package all the javascript before
running `npm start` to do testing.

## Configuration

The file `/config/default.json` contains the following configuration settings:

* `app_title` A short string used in the window `<title>` attribute and the main header
* `app_description` An HTML string inserted below the tile on the page,
* `version` version number of the app
* `port` The port that the app will respond to (default=3000)
* `static` controls the static files served to the client
  * `root` name of the folder from which all static assets will be served (`css` files, `index.html`, javascript files etc.
  * `template` name of the template file for serving the content
* `url_prefix` a prefix beginning with `/` indicating a mount point that the app should respond to (default = empty, typical = `/vocabularies/lmt`)
* `cache` temp folder where server can store rendered copies of its assets
* `logging` control the logging ofd the outputs
  * `level` minimum error level for the app to log (`info`, `warning`, `error`)
  * `log_requests` set to `true` or `false`

## Logging

The app uses the [pino](https://github.com/pinojs/pino) logger.