import multer from "multer";
import { createWriteStream } from "fs";
import path from "path";
import fs from "fs";

export const imageUtils = {
  uploadImage: (req, res) => {
    return multer({
      fileFilter: (req, file, cb) => {
        const allowFileType = ["image/jpeg", "image/png", "video/mp4"];
        if (allowFileType.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    });
  },

  createImage: (dirName, buffer, imageName) => {
    console.log({dirName,imageName})
    const dirPath = path.resolve(`./public/${dirName}`);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const write = createWriteStream(path.resolve(dirPath, imageName));
    write.write(buffer);
    write.end();
  },
};

console.log(path.resolve("./public"));
