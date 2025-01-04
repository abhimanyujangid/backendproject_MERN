import multer from "multer";

const storage = multer.diskStorage({
    destination: "./public/videos",
    filename: (_, file, cb) => cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`)
});

export const upload = multer({ storage });

