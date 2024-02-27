const path = require('path');
const fs = require('fs');

class fileReader  {
    #files;

    constructor(){
        this.#files = [];
    }

    readfiles(directory) {
        try {
            fs.readdirSync(directory).forEach(file => {
                const absolutePath = path.join(directory, file);
                //if directory recusively get files
                if (fs.statSync(absolutePath).isDirectory()) {
                    return this.readfiles(absolutePath);
                }
                else {
                    return this.#files.push(absolutePath);
                }
            });
            return this.#files;
        }
        catch (err) {
            console.error(err)
        }
    }

    getFiles() {
        return this.#files;
    }
    
}
    
module.exports = fileReader;