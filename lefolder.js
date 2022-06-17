#!/usr/bin/env node

const chalk = require('chalk')
const argv = require('minimist')(process.argv.slice(2))
const IniParser = require("config-ini-parser").ConfigIniParser;
const fs  = require('fs')
const path  = require('path')
const certinfo = require('cert-info')


function getINIParser(fn) {
    return new Promise(async function (resolve,reject) {
        let parser = new IniParser("\n")
        let content = fs.readFileSync(fn,'ascii')  
        // hack, to make le ini files compatible with regular ini files
        content = content.replace(/\[\[/g,'[')
        content = content.replace(/\]\]/g,']')
        parser.parse(content)
        return resolve(parser)
    })
}

function getFiles(theFolder,searchRegex=new RegExp('')) {
    return new Promise(async function (resolve,reject) {
        try {
            fs.readdir(theFolder, function(err, items) {
                if (err) return reject(err)
                let selected_files = []
                for (var i=0; i<items.length; i++) {
                    let fn = items[i]
                    if (fn.search(searchRegex)>=0) {
                        selected_files.push(path.join(theFolder,fn))
                    }
                }
                resolve(selected_files)
            })
        }catch(_err) {
            reject(_err)
        }
    })
}

function certInfo(fn) {
    try {
        return certinfo.info(fs.readFileSync(fn,'ascii'))
    }catch(err) {
        return err
    }
}


class LEFolder {
    #baseFolder = '/etc/letsencrypt'
    constructor(baseFolder='/etc/letsencrypt') {
        this.baseFolder = baseFolder
        // console.log(`BaseFolder`,this.baseFolder,baseFolder)
    }


    async getRenewals(ofDomains) {
        let files = await getFiles(path.join(this.baseFolder,'renewal'),new RegExp('.*\.conf$'))
        let data = []
        for(let file of files) {
            
            // console.log(`file=${file}`)
            let parser  = await getINIParser(file)
            let inner = {
                source:file,
                domains:[],
                version:parser.get(null,'version'),
                archive_dir:parser.get(null,'archive_dir'),
                files: {
                    cert:parser.get(null,'cert'),
                    privkey:parser.get(null,'privkey'),
                    chain:parser.get(null,'chain'),
                    fullchain:parser.get(null,'fullchain'),
                },
                expired:null,
                cert:null,
                errors:[]
            }

            
            if (!fs.existsSync(inner.files.cert)) inner.errors.push(`CERT file ${inner.files.cert} does not exist`)
            if (!fs.existsSync(inner.files.privkey)) inner.errors.push(`PRIVKEY file ${inner.files.privkey} does not exist`)
            if (!fs.existsSync(inner.files.chain)) inner.errors.push(`CHAIN file ${inner.files.chain} does not exist`)
            if (!fs.existsSync(inner.files.fullchain)) inner.errors.push(`FULLCHAIN file ${inner.files.fullchain} does not exist`)

            inner.cert=certInfo(inner.files.cert)

            if (inner.cert.hasOwnProperty('subject')) {
                if (Date.now()>inner.cert.expiresAt) {
                    // inner.errors.push(`CERT HAS EXPIRED`)
                    inner.expired = inner.cert.expiresAt
                } else inner.expired = false
            }

            // determine domains 
            for(let option of parser.options('webroot_map'))
            {
                inner.domains.push(option.toLowerCase())
            }


            if (ofDomains && ofDomains.length>0) {
                let match = false
                for(let d of ofDomains)
                    if (inner.domains.includes(d.toLowerCase())) match=true
                if (!match) continue
            }


            data.push(inner)
            
        }
        return data
        
    }

}



async function start() {
    try {
        let ofDomains =false
        if (argv._.length>0) ofDomains=argv._
        let le = new LEFolder()
        let renewals = await le.getRenewals(ofDomains)
        
        for(let row of renewals) {
            if ((argv.errors || argv.error) && row.errors.length===0) continue
            if ((argv.valids || argv.valid) && row.errors.length>0) continue
            // --json option
            if (argv.json) {
                console.log(row)
                continue
            }

            console.log(`Domains: ${chalk.yellow(row.domains.join(', '))} ${!row.expired?chalk.green('VALID'):chalk.red(`EXPIRED`)} File: ${chalk.gray(row.source)}`)
            if (row.errors.length>0) 
                for(let error of row.errors) 
                    console.log(`\tERROR: ${chalk.red(error)}`)

        }
        // console.log(renewals)
    } catch(err) {
        console.log(err)
    }
}

if (require.main===module) start()