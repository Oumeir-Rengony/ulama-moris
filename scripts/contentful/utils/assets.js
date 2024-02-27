const path = require('path');
const util = require('./utils');
const fs = require("fs");


//Upload and return reference to the uploaded image
const uploadAsset = async ({
    environment,
    locale
}, {
    title,
    description,
    fileName, 
    imagePath 
}) => {

    const filExtension = path.extname(imagePath);
    const contentType = filExtension.replace(".", '');
    
    let asset = await environment.createAssetFromFiles({
        fields: {
            title: {
                [locale]: title
            },
            description: {
                [locale]: description
            },
            file: {
                [locale]: {
                    contentType: contentType,
                    fileName: fileName,
                    file: fs.createReadStream(imagePath)
                }
            }
        }
    });

    asset = await asset.processForAllLocales();
    asset = await asset.publish();
    
    //prevent api rate limit exceeded
    await util.delay(600);

    return asset;
}


module.exports = {
    uploadAsset
};