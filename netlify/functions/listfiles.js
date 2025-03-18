const fs = require("fs");
const path = require("path");

exports.handler = async () => {
    const directoryPath = path.join(__dirname, "../../templates");

    function getFiles(dir) {
        return fs.readdirSync(dir, { withFileTypes: true }).map((file) => {
            const fullPath = path.join(dir, file.name);
            return file.isDirectory()
                ? { name: file.name, type: "folder", children: getFiles(fullPath) }
                : { name: file.name, type: "file" };
        });
    }

    try {
        const files = getFiles(directoryPath);
        return {
            statusCode: 200,
            body: JSON.stringify(files, null, 2),
            headers: { "Content-Type": "application/json" },
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
