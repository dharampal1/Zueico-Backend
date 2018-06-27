import { Router } from 'express'
import user from './user'
import auth from './auth'
import passwordReset from './password-reset'
import { getAllBuckets,createBucket,deleteBucket,getNumBuckets } from '../services/aws/s3'
import { loadCredentialsAndRegion } from '../services/aws'
const router = new Router()
var AWS = require('aws-sdk');


function loadCredentialsMiddleware(req, res, next){
   const credentials=loadCredentialsAndRegion().then(data =>{
     if(data.credentials){
     	  AWS.config.update({
		    accessKeyId: data.credentials.accessKeyId,
		    secretAccessKey: data.credentials.secretAccessKey,
		    region: data.region || "us-east-1",
		    apiVersion: '2006-03-01'
		  });
		  next();

     }else{
     	   	res.status(403).send({ 
                success: false, 
                message: 'Credentials not found.'
            })
     }
   }).catch(err => {
   	res.status(403).send({
                success: false, 
                message: 'Credentials not found.'
            })
   })
}
/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */
const s3 = new AWS.S3();
router.use('/users', user)
router.use('/auth', auth)
router.use('/password-resets', passwordReset)

router.get('/getAllBuckets',loadCredentialsMiddleware, function(req, res){
   const credentials=getAllBuckets(s3).then(data =>{
      res.send({
      	success:true,
      	data:data
      });
   })
 });

router.post('/createBucket',loadCredentialsMiddleware, function(req, res){
   const credentials=createBucket(req.body.bucket,s3).then(data =>{
      res.send({
      	success:true,
      	data:data
      });
   }).catch(err=>{
     res.send(err);
   })
});

router.put('/deleteBucket',loadCredentialsMiddleware, function(req, res){
   const credentials=deleteBucket(req.body.bucket,s3).then(data =>{
      res.send({
      	success:true,
      	data:data
      });
   }).catch(err=>{
     res.send(err);
   })
});

router.get('/getNumBuckets',loadCredentialsMiddleware, function(req, res){
   const credentials=getNumBuckets(s3).then(data =>{
   	console.log(data.Buckets.length);
      res.send({
      	success:true,
      	data:{
      		totalbuckets:data.Buckets.length
      	}
      });
   }).catch(err=>{
     res.send(err);
   })
});



export default router
