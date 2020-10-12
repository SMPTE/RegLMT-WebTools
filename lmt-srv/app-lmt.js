/**
 *  @module  app-lmt
 *  @author  Mr MXF
 *  @version 0.4
 *
 * A very simple Koa Server to do the following:
 *  - Render the LMT into a number of different views
 *  - Create a simple index page (view-0)
 *  - Validate am XML document against the LMT schema
 *  - create a diff between two versions of LMT
 *
 * Implements
 *  - <root>/          index page to show lmt-narrative.md + color coded xml
 *  - <root>/current   return raw xml of the current version
 *  - <root>/previous  return raw xml of the previous version
 *  - <root>/diff      run the gui diff tool - defaults to diff(current, previous)
 *  - <root>/validate  run the LMT validation tool
 *  - <root>/view-00   display view-00
 *  - <root>/view-NN   display view NN where NN is a number
 *
 * Requires
 *  - Node v12.x or higher
 *  - Linux host (so that LibXML compiles properly)
 *  - production destination for pino logging otherwise it will be trashed
 *  - pm2 or similar to control execution - see README.md
 */
/* jshint node: true */
'use strict'

//pull in any credentials from the .env file into process.env
require('dotenv').config()
const config = require('config')
const pino = require('pino')
//log to stderr by default
const log = pino(config.get('logging'), pino.destination(2))

//required libraries for koa server, router and url mount
const Koa = require('koa')
const bodyParser = require('koa-body')
const mount = require('koa-mount')
const request_logger = require('koa-pino-logger')

/** the unique app object that will listen on a given port */
const app = new Koa();

if (process.env.hasOwnProperty('HTTP_USER') && process.env.hasOwnProperty('HTTP_PASSWORD')) {
  const auth = require('koa-basic-auth');
  app.use(auth({
    name: process.env.HTTP_USER,
    pass: process.env.HTTP_PASSWORD
  }));
}

//assume production unless specified in .env
process.env.NODE_ENV = (undefined == process.env.NODE_ENV) ? 'production' : process.env.NODE_ENV

//mount the app with the desired prefix (and force a leading slash)
const raw_prefix = config.get('url_prefix')
const prefix = `${(raw_prefix[0] == "/") ? "" : "/"}${raw_prefix}`

/* =========  define the app behaviour, routes and map the functions  ================================  */

//enable logging
if (config.get('logging.log_requests'))
  app.use(request_logger())

//enable file uploads for the XML conversion tool using koa-body
app.use(bodyParser({
  formidable: { uploadDir: config.get("upload_folder")},    //This is where the files would come
  multipart: true,
  urlencoded: true
}));

//>>> serve static pages as defined in config
const serve = require('koa-static')
app.use(mount(prefix, serve(config.get('static.root'), { index: "index.html", })))

//>>> serve metadata for the ui
app.use(mount(prefix, require('./route-metadata').routes()))

//>>> serve index page
app.use(mount(prefix, require('./route-index').routes()))

//>>> serve the views from the buttons
app.use(mount(prefix, require('./route-xml').routes()))
app.use(mount(prefix, require('./route-xsd').routes()))

app.use(mount(prefix, require('./route-view-control-doc').routes()))
app.use(mount(prefix, require('./route-view-xml').routes()))
app.use(mount(prefix, require('./route-view-schema').routes()))

app.use(mount(prefix, require('./route-table-lang').routes()))
app.use(mount(prefix, require('./route-table-group').routes()))

app.use(mount(prefix, require('./route-tool-diff').routes()))
app.use(mount(prefix, require('./route-tool-validate').routes()))

app.use(mount(prefix, require('./route-tool-convert').routes()))

module.exports = app