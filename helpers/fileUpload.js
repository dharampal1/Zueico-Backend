import multer from 'multer';



export const storage =  multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname.replace(/\s+/g, ''));
    }
  });


export const imageFileFilter = (req, file, cb) => {
  // reject a file
  if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {

    cb(new Error('Please send the valid File Type'));
  } else {

    cb(null, true);
  }
};



 