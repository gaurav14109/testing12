const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/temp')
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname)
    }
})

const upload = multer({ storage: storage }).single('file')

module.exports = upload