const fs = require('fs'); //file system

//reading files
/*
fs.readFile('./testFiles/test.txt', (err, data) => {
    if (err) {
        console.log(err);
    }
    console.log(data.toString());
});
*/

//writings files
fs.writeFile('./testFiles/test.txt', "text to write", () => {
    console.log("file was written");
})

// directories


///deleting files