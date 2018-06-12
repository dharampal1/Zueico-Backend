import cron from 'node-cron';
import request from 'request';
import { User } from '../models';

const url = 'http://zuenchain.io/user/transaction?Address=15GUHDtq1NhnJQaaKXMt9uehZ8CRnvgBpc'
module.exports = {
	BTC_Tranctions(){
		 cron.schedule('*/1 * * * *', function(){
		     console.log("running...")

		      request.get({url},function(err,httpResponse,body ){
		        if(err){
		          console.log(err);
		        } else {
		        	

		          console.log("gg");
		        }
		    });
		 });
	}
}