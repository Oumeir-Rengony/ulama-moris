require('dotenv').config()
const fileLogger = require('../utils/logger');
const config = require('./config/config.json');
const fileReader = require('../utils/fileReader');
const contentfulManagement = require("contentful-management");
const util = require('../utils/utils');
const asset = require('../utils/assets');
const data = require("./data/data.json");


const clientMgmt = contentfulManagement.createClient({
    accessToken: process.env.ACCESS_TOKEN,
});

const logger = new fileLogger(config.basePath);



const readAssets = () => {
    const file = new fileReader();
    const assetsPath = file.readfiles(config.assetPath);
    return assetsPath;    
}


const publishBayaan = async (environment, assetPath) => {
    const locale = config.locale;

    try {

        const uploadedAsset = await asset.uploadAsset({environment, locale},{
            title: `${bayaan.title} by ${bayaan.author}`,
            description: "ulama bayaan",
            fileName: `${bayaan.title} by ${bayaan.author}`,
            imagePath: assetPath
        });

        if(uploadedAsset){
            logger.log(`${uploadedAsset.sys.id} Asset uploaded`)
        }else{
            logger.log(`${uploadedAsset.sys.id} Asset upload failed`)
        }



        const entry = await environment.createEntry(config.contentTypeId, {
            fields: {
                title: {
                    [locale]: bayaan.title
                },
                description: {
                    [locale]: bayaan.description
                },
                author: {
                    [locale]: bayaan.author
                },
                date: {
                    [locale]: bayaan.date
                },
                audio: {
                    [locale]: util.linkEntry(uploadedAsset.sys.id, "Asset")
                }
            }
        });

        logger.log(`${entry.sys.id} \t | \t${entry.fields["title"][locale]}  created as draft`);

        await entry.publish();
        logger.log(`${entry.fields.title[locale]} \t | \t ${entry.fields.title[locale]} published`);

    }
    catch(err){
        logger.log(err);
    }
}


const main = async () => {
    const space = await clientMgmt.getSpace(process.env.SPACE_ID);
    const environment = await space.getEnvironment(process.env.ENV_ID);
    logger.log(`SPACE: ${space.name}  BRANCH: ${environment.name}\n`);

    const assetsPath = readAssets(environment);

    let index = 0;

    try {
        for(bayaan of data){
            const publishedEntry = await publishBayaan(environment, assetsPath[index]);
            index++;
        }
    }
    catch(err){
        logger.log(err);
    }

}


main();