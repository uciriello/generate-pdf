const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const hbs = require('handlebars')
const path = require('path')
const moment = require ('moment')
const data = require ('./database.json') // use a json stringfy

const compile = async function(templateName, data){
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs` )
    const html = await fs.readFile(filePath, 'utf-8')
    return hbs.compile(html)(data)
}

hbs.registerHelper('dateFormat', function(value, format){
    return moment(value).format(format)
})

async function generatePDF() {

    try{
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        
        const content = await compile('shot-list', data)

        await page.setContent(content)
        await page.emulateMediaType('screen')

        // take the buffer and save on s3
        await page.pdf({
            path: 'mypdf.pdf', // not necessary in real application
            format: 'A4',
            printBackground: true
        })
    
        console.log('done')
        await browser.close()
        process.exit()
    
    } catch(e){
        console.log('error ', e)
    }

}

generatePDF()