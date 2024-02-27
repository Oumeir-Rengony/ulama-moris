const fs = require('fs');
const path = require('path');

class logger  {

    #fileName;
    #basePath

    constructor(baseSrc, fileName){
        if(!fileName){
            const date = new Date();
            const options = {  
                weekday: 'long', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric', 
                timeZoneName: "short",
                hour12: false
            };
            const formattedDate = date.toLocaleTimeString("en-US", options);
            this.#fileName = formattedDate;
            this.#basePath = baseSrc;
        }
        else{
            this.#fileName = fileName;
        }
    }

    log(msg) {

        const directoryPath = path.resolve(`${this.#basePath}/logs`);

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
       
        const data = `${msg}\n`;
        const filePath = `${directoryPath}/${this.#fileName}.log`;

        fs.appendFile(filePath, data, (err) => {
            if (err) {
                console.log("An error occured while writing to File:");
                console.log(err);
            }
            console.log(data);
        });
    }

    
}
    
module.exports = logger;