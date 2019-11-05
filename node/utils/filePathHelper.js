var fs = require('fs');
var path = require('path');

function pathIsDirectory (path) {
    var stat = fs.lstatSync(path);
    return stat && stat.isDirectory();
}

// 递归获取文件夹下的所有文件列表
export function GetDirNestedFileList (localFilePathDir, fileFilter, dirFilter) {
    return new Promise((resolve, reject) => {
        fs.readdir(localFilePathDir, function (err, data) {
            if (err) {
                reject(err)
            }
            data = data || [];
            data = data.filter(filePath => ( 
                filePath.indexOf('__MACOSX') == -1 && 
                !filePath.startsWith('.')
            ));

            // data = data.filter(filePath => filePath.endsWith('.html'));

            data.length > 0 && (data = data.map(filePath => path.join(localFilePathDir, filePath)));
            var fileList = [], subDirFilesPromise = [];
            for (var i = 0; i < data.length; i++) {
                var filePath = data[i];

                if (pathIsDirectory(filePath) && ( !(dirFilter && typeof dirFilter == 'function' && (dirFilter(filePath) === false)) )) {
                    subDirFilesPromise.push(GetDirNestedFileList(filePath, fileFilter, dirFilter).then(result => (fileList = fileList.concat(result || []))));
                } else {
                    // if (filePath.endsWith('.html')) {
                        
                    // }

                    var checked = ( !(fileFilter && typeof fileFilter == 'function' && (fileFilter(filePath) === false)) )
                    if (checked) {
                        fileList.push(filePath)
                    }

                    // fileList.push(filePath)
                }
            }
            return Promise.all(subDirFilesPromise).then(() => resolve(fileList));
        });
    });
}