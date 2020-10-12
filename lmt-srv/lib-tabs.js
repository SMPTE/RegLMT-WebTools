/** @module lib-tabs
 */
const mustache = require('mustache')
const tab_template = `<li id="tab-{{ name }}" role="tab" data-toggle="tab"><a href="{{ url }}">{{{ text }}}</a></li>\n`

module.exports.html = function () {
    tabs_html = `<ul id="lmt-tabs" class="nav nav-tabs">\n`
    tabs_html += mustache.render(tab_template, { name: "view-xml", text: "view xml", url: "/view-xml" })
    tabs_html += mustache.render(tab_template, { name: "view-schema", text: "view schema", url: "/view-schema" })
    tabs_html += mustache.render(tab_template, { name: "lang-table", text: "table lang", url: "/table-lang" })
    tabs_html += mustache.render(tab_template, { name: "group-table", text: "table group", url: "/table-group" })
    tabs_html += mustache.render(tab_template, { name: "tool-validate", text: "validate tool", url: "/tool-validate" })
    tabs_html += mustache.render(tab_template, { name: "tool-diff", text: "diff tool", url: "/tool-diff" })
    tabs_html += mustache.render(tab_template, { name: "tool-convert", text: "conversion tool", url: "/tool-convert" })
    tabs_html += `</ul>`
    return tabs_html
}
