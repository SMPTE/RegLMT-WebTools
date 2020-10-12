/** @module mesa-2-smpte.js
 *
 * This plugin provides 2 functions
 *    - to_lmt( xml2js_obj )  - takes a mesa xml string converted with xml2js and returns a smpte LMT object
 *    - to_xml( lmt, sample ) - takes a smpte LMT object and sample Mesa XML and returns a mesa xml string
 */

//define some constants so that different plugins have less conde to modify
const ref = {
    root: "Synaptica-ZThes",
    term: "term"
}
//the requires properties of a term
const term_required_props = ["Name", "Code", "LongDescription1"]

let name = () => {
    return "Mesa XML exported from Synaptica"
}

/* ************************* Term from xmljs *********************************************** */

/** create a term from a term node or a relation node
 * @param {Object} node - a node in the hierarchy for the object
 * @returns {Object} a term object
 */
let create_term = (node) => {
    let term = {}
    let is_a_group = false
    let has_audio_tag = false
    let has_video_tag = false

    /* ************************* Pre-flight *********************************************** */
    if (undefined == node.termID) { throw new Error(`MESA XML required element termID not found. Giving up`) }
    let id = node.termID

    if (undefined == node.termName) { throw new Error(`MESA XML required element termName not found in termID ${id}. Giving up`) }
    term.Name = node.termName[0]

    if (undefined == node.termNote) { throw new Error(`MESA XML required element termNote element not found in termID ${id}. Giving up`) }
    node.termNote.forEach(note => {
        switch (note.$.label) {
            case "Audio Language Tag":
                term.AudioLanguageTag = note._
                has_audio_tag = true
                break
            case "Audio Language Display Name 1":
                term.audio_language_display_name_1 = note._
                break
            case "Audio Language Display Name 2":
                term.audio_language_display_name_2 = note._
                break
            case "Code":
                term.Code = note._
                break
            case "Long Description 1":
                term.LongDescription1 = note._
                break
            case "Long Description 2":
                term.long_description_2 = note._
                break
            case "Notes":
                term.notes = note._
                break
            case "Visual Language Display Name 1":
                term.VisualLanguageDisplayName1 = note._
                break
            case "Visual Language Display Name 2":
                term.VisualLanguageDisplayName2 = note._
                break
            case "Visual Language Tag 1":
                term.VisualLanguageTag1 = note._
                has_video_tag = true
                break
            case "Visual Language Tag 2":
                term.VisualLanguageTag2 = note._
                has_video_tag = true
                break
            case "Language Group Code":
            case "Language Group Tag":
            case "Language Group Name":
                //ignore group codes for now...
                is_a_group = true
                break
            default:
                throw new Error(`MESA XML unknown termNote with label=${note.$.label} in termID ${id}. Giving up`)
        }
    })

    let maybe_a_term = true
    term_required_props.forEach(property => maybe_a_term - maybe_a_term && term.hasOwnProperty(property))

    /* All terms have audio tags or video tags - if it has neither then it's only a group */
    maybe_a_term = maybe_a_term && (has_audio_tag || has_video_tag)

    /* The MESA XML reuses some term labels as groups. We therefore decode any valid
       term here and leave the group decoding for the create_group function
     */
    if (maybe_a_term) {
        let mapping = {}
        if (has_audio_tag) {
            mapping[term.AudioLanguageTag] = id
        } else {
            mapping[term.VisualLanguageTag1] = id
        }
        return { term: term, mapping: mapping }
    }

    /* return undefined if it seems like a valid group
     */
    if (is_a_group) {
        return undefined
    }

    /* If it wasn't a valid group or a team then one of these errors should fire
     */
    term_required_props.forEach(property => {
        if (undefined == term[property]) { throw new Error(`MESA XML did not set term property ${property} in termID ${id}. Giving up`) }
    })
    throw new Error(`MESA XML has something weird going on in termID ${id}. Neither group not term. Giving up`)
}

/* ************************* Term Conversion *********************************************** */
let to_lmt = (xml2js_obj) => {
    let lmt = {
        Metadata: {},
        terms: [],
        groups: [],
        mapping: {
            term: {},
            group: {}
        }
    }

    //gather all the terms from the input XML
    //throw annoying errors one by one as you go....
    let root = xml2js_obj[ref.root]
    if (undefined == root) throw new Error(`XML root element ${ref.root} not found. Giving up`)

    //iterate across every term in the source array push a new term to lmt
    /* ************************* Term Conversion *********************************************** */
    root[ref.term].forEach(node => {
        //create a term - errors are caught at a higher level
        let res = create_term(node)

        if (res) {
            for (tag in res.mapping) {
                //check for duplicate terms - the mapping should not exist for this term
                if (!(undefined == lmt.mapping.term[tag])) { throw new Error(`MESA XML has a duplicate unique term tag ${tag} in termID ${res.mapping[tag]}. Giving up`) }

                //remember the mapping of this term to the underlying synaptica ids
                lmt.mapping.term[tag] = res.mapping[tag]
            }
            //append the term to the list
            lmt.terms.push(res.term)
        } else {
            /* when the function returns undefined it is because we found a group
             * We need to iterate over the relations elements and add each of them as a term
             */
            node.relation.forEach(relation => {
                //create a term - errors are caught at a higher level
                let res = create_term(relation)
                if (res) {
                    for (tag in res.mapping) {
                        //check for duplicate terms - the mapping should not exist for this term
                        if (!(undefined == lmt.mapping.term[tag])) { throw new Error(`MESA XML has a duplicate unique term tag ${tag} in termID ${res.mapping[tag]}. Giving up`) }

                        //remember the mapping of this term to the underlying synaptica ids
                        lmt.mapping.term[tag] = res.mapping[tag]
                    }
                    //append the term to the list
                    lmt.terms.push(res.term)
                }
            })
        }
    })

    /* ************************* Group Conversion *********************************************** */
    root[ref.term].forEach(grp => {
        let group = {}
        let is_group = false

        /* ************************* Pre-flight *********************************************** */
        if (undefined == grp.termID) { throw new Error(`MESA XML required element termID not found. Giving up`) }
        let id = grp.termID

        if (undefined == grp.termName) { throw new Error(`MESA XML required element termName not found in termID ${id}. Giving up`) }
        group.Name = grp.termName[0]

        if (undefined == grp.termNote) { throw new Error(`MESA XML required element termNote element not found in termID ${id}. Giving up`) }
        grp.termNote.forEach(note => {
            switch (note.$.label) {
                case "Language Group Code":
                    group.Code = note._
                    is_group = true
                    break
                case "Language Group Tag":
                    group.GroupTag = note._
                    is_group = true
                    break
                case "Language Group Name":
                    group.Name = note._
                    is_group = true
                    break
                default:
                // ignore plain terms
            }
        })
        //Look at all the relations for this group to populate the group members
        if (is_group) {
            group.members = []
            if (grp.relation) {
                grp.relation.forEach(relation => {
                    let member = {}
                    member.relationType = relation.relationType[0]
                    member.relationWeight = relation.relationWeight[0]
                    relation.termNote.forEach(note => {
                        if (note.$.label == "Audio Language Tag") member.AudioLanguageTag = note._
                    })
                    group.members.push(member)
                })
            }

            //remember the mapping of this group to the underlying synaptica ids
            lmt.mapping.term[group.GroupTag] = id

            //append the term to the list
            lmt.groups.push(group)
        }
    })

    return lmt
}

module.exports.name = name
module.exports.to_lmt = to_lmt