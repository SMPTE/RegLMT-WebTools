/** @module lib-files
 */
const mustache = require('mustache')
const file_template = `<div id="file-{{ name }}"><a href="{{ url }}"><i class="fa fa-{{ icon }}"></i> {{{ text }}}</a></div>\n`

module.exports.html = function () {
    files_html = `<div id="lmt-files">\n`;
    files_html += mustache.render(file_template, { name: "xml", text: "xml endpoint", url: "/xml", icon: "file-code-o" })
    files_html += mustache.render(file_template, { name: "xsd", text: "LMT schema endpoint", url: "/xsd", icon: "file-code-o" })
    files_html += mustache.render(file_template, { name: "view-ctrl", text: "control document", url: "/view-control-doc", icon: "file-pdf-o" })
    files_html += `</div>`
    return files_html
}
