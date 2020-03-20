var fs = require('fs');

const Base64Encode = function (str) {
    return Buffer.from(str).toString('base64');
}

const Base64Decode = function (str) {
    return Buffer.from(str, 'base64').toString('utf8');
}

// var dayDreamingFile = './test.txt';
var dayDreamingFile = './../dist/EveryDay.sh';

var everyDayDreaming = fs.readFileSync(dayDreamingFile).toString();
console.log(everyDayDreaming)

var Append = function (content) {
    var decodedDayDreaming = Base64Decode(everyDayDreaming);

    decodedDayDreaming += '\n';
    decodedDayDreaming += content;

    var encodeDayDreaming = Base64Encode(decodedDayDreaming);
    fs.writeFileSync(dayDreamingFile, encodeDayDreaming);

    return encodeDayDreaming;
}

var Main = function () {
    // Append(``);
}

Main();