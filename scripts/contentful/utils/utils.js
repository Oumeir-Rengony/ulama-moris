const fs = require('fs');

const log = (msg, fileName) => {
    const data = `${msg}\n`;

    fs.appendFile(fileName, data, (err) => {
        if (err) {
            console.log("An error occured while writing to File:");
            console.log(err);
        }
        console.log(data);
    });
    
};


const linkEntry = (id, type) => {
    return {
        "sys": {
            "type": "Link",
            "linkType": type,
            "id": id
        }
    }
}


const delay = async (time) => {
    return await new Promise(resolve => setTimeout(resolve, time));
}


module.exports = {
    log,
    linkEntry,
    delay
}