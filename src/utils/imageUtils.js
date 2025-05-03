import multer from "multer";
import { writeFile } from "fs";

export const imageUpload = {
  uploadImage: (req, res) => {
    return multer({
      fileFilter: (req, file, cb) => {
        const allowFileType = ["image/jpeg", "image/png"];
        if (allowFileType.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    });
  },

  createImage: (dirName, buffer) => {
    const write = writeFile();
  },
};
