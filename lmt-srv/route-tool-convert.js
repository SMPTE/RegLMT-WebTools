/** @module route-tool-diff
 *  return index page
 *
 * load index.template and use mustache to update
 * with the xml view
 *
*/
const fs = require('fs')
const Router = require('koa-router')
const router = new Router();
const config = require('config')
const log = require('pino')(config.get('logging'))
const esc = require('escape-html')
const xmlh = require('./lib-lmt-helper')
const lmt_xml = require('./lib-lmt-xml')
const Prism = require('prismjs')

const lmt_body = require('./lib-body')

//load the conversion engines
const engine = []
engine.push(require('./plugins/mesa-2-smpte'))

const upload_control_name = "lmt_xml_upload"
const convert_control_name = "conversion_engine"

/** sort 2 terms of the LMT term array
 * return -ve number if out of order
 * @param {term} t1 term nearest beginning or array
 * @param {term} t2 term nearest end of array
 */
function sort_terms(t1, t2) {
    let a = parseInt(t1.termID[0])
    let b = parseInt(t2.termID[0])
    if (a < b) return 1
    if (a > b) return -1
    return 0
}

const route_uri = `/tool-convert`
router.get(`${route_uri}`, async (ctx, next) => {

    //get the basic data for the page
    let view_data = lmt_body.view_data

    upload_form =
        `<h3>Convert to SMPTE LMT Register format</h3>\n` +
        `<form action="/tool-convert" method="POST" enctype="multipart/form-data">\n` +
        `  <div class = "form-group">\n` +
        `    <input class="form-control" type="file" name="${upload_control_name}" id="xml-upload" />\n` +
        `<div class="card">` +
        `<div class="card-body">` +
        `<h4>Select XML Conversion</h4>\n`

    //add in a radio button for each conversion engine
    for (let e in engine) {
        upload_form += `    <div class="form-check">\n`
        upload_form += `      <input class="form-check-input" type="radio" name="${convert_control_name}" id="radio${e}" value="${e}">\n`
        upload_form += `      <label class="form-check-label" for="radio${e}">${engine[e].name()}</label>\n`
        upload_form += `    </div>\n`
    }
    upload_form += `</div>\n` +
        `</div>\n` +
        `    <input class="form-control" type="submit" value="Upload XML" />` +
        `  </div>\n` +
        `</form>`

    //format the HTML with left and right gutters
    view_data.rendered_output =
        config.get('static.html.centered_start') + "\n" +
        config.get('static.html.left_gutter') + "\n" +
        config.get('static.html.center_div') +
        upload_form +
        config.get('static.html.centered_end') + "\n" +
        config.get('static.html.right_gutter') + "\n"

    //now we have the data, do the rendering
    let rendering = lmt_body.body(view_data)
    ctx.body = rendering.body
    ctx.status = rendering.status

    if (ctx.status < 300) {
        log.info(`${ctx.status} route:${route_uri}`)
    } else {
        log.error(`${ctx.status} route:${route_uri}`)
    }
})

//handle the upload
router.post(`${route_uri}`, async (ctx, next) => {

    //get the basic data for the page
    let view_data = lmt_body.view_data

    //console.log("Files: ", ctx.request.files);
    //console.log("Fields: ", ctx.request.body);

    // only process the first file (named in the control)
    upload = ctx.request.files[upload_control_name]

    let alert =
        `<div class="alert alert-success" role="alert">` +
        `   file ${upload.name} uploaded OK` +
        `</div>\n`

    let xml
    try {
        xml = fs.readFileSync(upload.path, 'utf-8')
    } catch (err) {
        alert +=
            `<div class="alert alert-danger" role="alert">` +
            `   file ${err} uploaded` +
            `</div>\n`
        log.error(`route:/  cannot read uploaded xml file ${upload.name}`)
        xml = false
        ctx.status = 500
    }

    //figure out which engine to use
    let xml_convert = engine[0]
    if ((ctx.request.body) && (ctx.request.body[convert_control_name])) {
        let index = parseInt(ctx.request.body[convert_control_name])
        xml_convert = engine[index]
    }

    //convert the XML to JSON for easier and consistent parsing
    let lmtjs = await xmlh.get_xml_as_JSON(xml)
    //run the convertor and beautify the output
    let lmt, result
    try {
        lmt = xml_convert.to_lmt(lmtjs)
        let formatted = JSON.stringify(lmt, undefined, 2)
        result = '<pre>' + Prism.highlight(formatted, Prism.languages.javascript, 'javascript') + '</pre>\n'
    } catch (err) {
        result = ''
        alert += `<div class="alert alert-danger" role="alert">` +
            `   conversion error ${err} in ${upload.name}` +
            `</div>\n`
    }
    // result = '<pre>' + Prism.highlight(xml, Prism.languages.xml, 'xml') + '</pre>\n'
    let new_xml=lmt_xml.to_xml(lmt)
    result= '<pre>' + Prism.highlight(new_xml, Prism.languages.xml, 'xml') + '</pre>\n'
    //format the HTML with left and right gutters
    view_data.rendered_output =
        config.get('static.html.centered_start') + "\n" +
        config.get('static.html.left_gutter') + "\n" +
        config.get('static.html.center_div') +
        alert +
        result +
        config.get('static.html.centered_end') + "\n" +
        config.get('static.html.right_gutter') + "\n"

    //now we have the data, do the rendering
    let rendering = lmt_body.body(view_data)
    ctx.body = rendering.body
    ctx.status = rendering.status

    if (ctx.status < 300) {
        log.info(`${ctx.status} route:${route_uri}`)
    } else {
        log.error(`${ctx.status} route:${route_uri}`)
    }
})
module.exports = router