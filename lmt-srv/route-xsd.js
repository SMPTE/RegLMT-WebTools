/** @module route-xsd
 *
 * return raw xml for the client
 */
const Router = require('koa-router')
const router = new Router();
const config = require('config')
const log = require('pino')(config.get('logging'))

const lmt = require('./lib-lmt-xml')

router.get(`/xsd`, (ctx, next) => {
    let xsd = lmt.schema()

    if (xsd) {
        ctx.status = 200
        ctx.set('Content-Type', 'application/xml')
        ctx.body = xsd
        log.info(`${ctx.status} route:/xsd`)
    }else{
        ctx.status = 500
        log.error(`${ctx.status} route:/xsd`)
    }
})

module.exports = router