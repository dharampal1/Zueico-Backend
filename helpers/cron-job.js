import cron from 'node-cron';
import request from 'request';
import { User, btc_transaction } from '../models';

const url = 'http://zuenchain.io/user/transaction?Address=15GUHDtq1NhnJQaaKXMt9uehZ8CRnvgBpc';

module.exports = {
	BTC_Tranctions(){
	 // cron.schedule('*/1 * * * *', function(){
	 //     console.log("running...")
      request.get({url},function(err,httpResponse,body ){
        if(err){
          console.log(err);
        } else {

         var result = JSON.parse(body);

         if(result.status === 1) {

         	User.findAll({})
         	  .then(data => {

     	  	  data.map(user => {

 	  	  	   result.data.map(trans => {

 	  	  	 	 if(user.btcWalletAddress === trans.sent_from){

 	  	  	 	 	var newBTrans = new btc_transaction({
		         		hash: trans.hase_of_tx,
						from_address: trans.sent_from,
						to_address: trans.sent_to,
						amount: trans.amount,
						block_hight: trans.block_height,
						user_id: user.id,
						email: user.email
					});

 	  	  	 	 	newBTrans.save()
 	  	  	 	 	 .then(data1 => {
 	  	  	 	 	 	return true;
 	  	  	 	 	 })
 	  	  	 	 	 .catch(err => {
 	  	  	 	 	 	console.log(err);
 	  	  	 	 	 })

 	  	  	 	  }
 	  	  	   })
         	 })
           })
         } else {

         }
        }
     });
 // });
	}
}