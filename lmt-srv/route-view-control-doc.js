/** @module route-xml
 *
 * return raw xml for the client
 */
const Router = require('koa-router')
const router = new Router();
const config = require('config')
const log = require('pino')(config.get('logging'))
const fs = require('fs')
const path = require('path')
const lmt = require('./lib-lmt-xml')

router.get(`/view-control-doc`, (ctx, next) => {
    let doc_filepath= path.join(config.get('static.root'),config.get('static.control-doc'))
    let doc= fs.readFileSync(doc_filepath)
    let filename= config.get("static.control-doc-download")
    if (doc) {
        ctx.status = 200
        ctx.set("Content-Disposition", `attachment; filename="${filename}"`)
        ctx.set('Content-Type', 'application/pdf')
        ctx.body = doc
        log.info(`${ctx.status} route:/control-doc`)
    }else{
        ctx.status = 500
        log.error(`${ctx.status} route:/control-doc`)
    }
})

module.exports = router