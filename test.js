const csvtojson = require('csvtojson');
const fs = require('fs');

const csvfile = fs.readFileSync('./test copy.csv');
const CSVContent = csvfile.toString();

const fetchData = async () => {
    let jsonContent;
    let jsonContentClean = [];
    let csvHeaders;
    let csvHeadersClean;

    try {

        // Extract the headers from the CSV content
        const csvRows = CSVContent.split('\n');
        if (csvRows.length > 1) {
            csvHeaders = csvRows[0].split(',').map(header => header.trim());
            csvHeadersClean = csvRows[0].split(',').map(header => header.trim()).filter(header => header !== '');
        }

        // Convert the CSV content to JSON
        jsonContent = await csvtojson().fromString(CSVContent);

        if (jsonContent.length > 0) {

            const jsonContentFull = [csvHeaders, ...jsonContent]; // Combine headers with the jsonContent array

            for (let i = 1; i < jsonContentFull.length; i++) {
                let filteredItems = {};
                for (let j = 0; j < jsonContentFull[0].length; j++) {
                    if (!jsonContentFull[0][j]) {
                        continue;
                    } else if (!jsonContentFull[i][jsonContentFull[0][j]]) {
                        filteredItems[jsonContentFull[0][j]] = jsonContentFull[0][j];
                        continue;
                    }
                    filteredItems[jsonContentFull[0][j]] = jsonContentFull[i][jsonContentFull[0][j]];
                    // console.log(jsonContentFull[0][j], ':', jsonContentFull[i][jsonContentFull[0][j]]);
                }
                if (Object.keys(filteredItems).length === 0) {
                    continue;
                }
                jsonContentClean.push(filteredItems);
            }

        }

        const jsonContentFull = [csvHeaders, ...jsonContent];
        const jsonContentCleanFull = [csvHeadersClean, ...jsonContentClean];

        return { jsonContent, jsonContentFull, jsonContentClean, jsonContentCleanFull, csvHeaders, csvHeadersClean };

    } catch (error) {
        if (error.response) {
            console.error('Error reading remote file:', error);
        } else {
            console.error('Error fetching CSV:', error);
        }
        return null;
    }
};

(async () => {
    const { jsonContent, jsonContentFull, jsonContentClean, jsonContentCleanFull, csvHeaders, csvHeadersClean } = await fetchData();
    
    console.log(jsonContentCleanFull, jsonContentCleanFull.length);

    if (jsonContentClean.length > 0) {
        console.log("Valid File sent");
    } else {
        console.log("Please send a valid CSV file.");
    }


})();