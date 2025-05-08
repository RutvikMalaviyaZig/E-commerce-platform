const { FILE_CONSTANTS, MULTER, FS, UUID, PATH } = require('./constant');

const dirName = process.env.STATIC_FOLDER + process.env.STATIC_TEMP_PATH;

// Make directory if it does not exist
if (!FS.existsSync(dirName)) {
  console.log('firname', dirName);

  FS.mkdirSync(dirName, { recursive: true });
}

const storage = MULTER.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirName);
  },
  filename: (req, file, cb) => {
    cb(null, `${UUID()}${PATH.extname(file.originalname)}`);
  },
});

const upload = MULTER({
  storage: storage,
  limits: {
    fileSize: FILE_CONSTANTS.MAX_SIZE,
  },
});

module.exports = upload;
