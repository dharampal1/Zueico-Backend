import multer from 'multer';


export const storage =  multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now());
    }
  });


export const imageFileFilter = (req, file, cb) => {
  // reject a file
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {

    cb(new Error("Send valid Image Type"));
  } else {

    cb(null, true);
  }
};
