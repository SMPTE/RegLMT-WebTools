/** @module lib-lmt-xml
 *
 * read and return the lmt xml file and schema
 */
const fs = require('fs')
const path = require('path')
const config = require('config')
const log = require('pino')(config.get('logging'))

module.exports.xml = () => {
    let xml_doc
    let xml_doc_file_path = path.join(config.get('static.root'), config.get('static.lmt'))
    try {
        xml_doc = fs.readFileSync(xml_doc_file_path, 'utf-8')
    } catch (err) {
        log.error(`route:/  cannot read lmt xml file ${xml_doc_file_path}`)
        xml_doc = false
    }
    return xml_doc
}

module.exports.xml_ref = () => {
    let xml_doc
    let xml_doc_file_path = path.join(config.get('static.root'), config.get('static.lmt_ref'))
    try {
        xml_doc = fs.readFileSync(xml_doc_file_path, 'utf-8')
    } catch (err) {
        log.error(`route:/  cannot read lmt reference xml file ${xml_doc_file_path}`)
        xml_doc = false
    }
    return xml_doc
}

module.exports.schema = () => {
    let xml_doc
    let xml_doc_file_path = path.join(config.get('static.root'), config.get('static.schema'))
    try {
        xml_doc = fs.readFileSync(xml_doc_file_path, 'utf-8')
    } catch (err) {
        log.error(`route:/  cannot read lmt schema ${xml_doc_file_path}`)
        xml_doc = false
    }
    return xml_doc
}

/** convert the lmt to an XML string
 *
 */
term_to_xml = (node) => {
    let s = "      "
    let xml_fragment = ["    <Term>\n"]
    xml_fragment.push(`${s}<Name>${node.Name}</Name>\n`)
    xml_fragment.push(`${s}<Code>${node.Code}</Code>\n`)
    xml_fragment.push(`${s}<LongDescription1>${node.LongDescription1}</LongDescription1>\n`)
    if (node.AudioLanguageTag) xml_fragment.push(`${s}<AudioLanguageTag>${node.AudioLanguageTag}</AudioLanguageTag>\n`)
    if (node.audio_language_display_name_1) xml_fragment.push(`${s}<audio_language_display_name_1>${node.audio_language_display_name_1}</audio_language_display_name_1>\n`)
    if (node.audio_language_display_name_2) xml_fragment.push(`${s}<audio_language_display_name_1>${node.audio_language_display_name_1}</audio_language_display_name_1>\n`)
    if (node.VisualLanguageTag1) xml_fragment.push(`${s}<VisualLanguageTag1>${node.VisualLanguageTag1}</VisualLanguageTag1>\n`)
    if (node.VisualLanguageTag2) xml_fragment.push(`${s}<VisualLanguageTag2>${node.VisualLanguageTag2}</VisualLanguageTag2>\n`)
    if (node.VisualLanguageDisplayName1) xml_fragment.push(`${s}<VisualLanguageDisplayName1>${node.VisualLanguageDisplayName1}</VisualLanguageDisplayName1>\n`)
    if (node.VisualLanguageDisplayName2) xml_fragment.push(`${s}<VisualLanguageDisplayName2>${node.VisualLanguageDisplayName2}</VisualLanguageDisplayName2>\n`)
    if (node.notes) xml_fragment.push(`${s}<notes>${node.notes}</notes>\n`)
    xml_fragment.push(`    </Term>\n`)
    return xml_fragment.join("")
}
module.exports.to_xml= (lmt) => {
    let xml=[ `<?xml version="1.0" encoding="UTF-8"?>\n`]
    xml.push('<LMTRegister>\n')
    xml.push('  <Terms>\n')
    lmt.terms.forEach(term =>{
        xml.push(term_to_xml(term))
    })
    xml.push('  </Terms>\n')
    xml.push('</LMTRegister>\n')
    return xml.join("")
}