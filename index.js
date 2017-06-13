'use strict';
require('./include/config.inc.js');
require('./include/global.function.js');
var db = require('./include/db');
var sqlString 	 = require('sqlstring');
var jwt = require('jsonwebtoken');

var guest_detail = function(sql, callback){
	var db_obj = db();
  	db_obj.data.query = sql;
  	db_obj.runQuery(function(results) {
    	callback(results);
  	})
}

exports.handler = function(event, context, callback){
	if((event.headers.staffToken!==undefined) && (event.hotel_id!==undefined) && (event.ref_number!==undefined)){
		try{
			var params = jwt.verify(event.headers.staffToken, _jwt_key);
		}catch(err){
		    callback(null, genOutput('error', 1, err));
		}

		if((params.staff_id!==undefined) && (params.role_name=="admin" || params.role_name=="staff")){
			var sql = "SELECT *,  `reservation_room_guest`.user_id as `guest_user_id`, `payment`.user_id as `payment_user_id` "
					+ "FROM `reservation` "
					+ "LEFT JOIN `reservation_room` ON `reservation`.reservation_id = `reservation_room`.reservation_id "
					+ "LEFT JOIN `reservation_room_guest` on `reservation_room`.reservation_room_id = `reservation_room_guest`.reservation_room_id "
					+ "LEFT JOIN `payment` on `payment`.payment_id = `reservation`.payment_id "
					+ "WHERE `reservation`.ref_number = " + sqlString.escape(event.ref_number) + ' '
					+ "AND `reservation`.hotel_id = " + sqlString.escape(event.hotel_id);
			guest_detail(sql, function(results){
				if(results.length > 0){
					var payload = '{"reservation_id" :' + sqlString.escape(results[0].reservation_id)
								+ ', "reservation_date" : "'+ results[0].reservation_date + '"'
								+ ', "ref_number" : "' + results[0].ref_number + '"'
								// + ', "reservation_room_id" : ' + results[0].reservation_room_id
								+ ', "remarks" : "' + results[0].remarks + '"'
								+ ', "payment_detail" : [{' 
									+ '"payment_id" : ' + results[0].payment_id
									+ ', "payment_user_id" : ' + results[0].payment_user_id
									+ ', "payment_time" : "' + results[0].payment_time + '"'
									+ ', "transaction_id" : "' + results[0].transaction_id + '"'
									+ ', "payment_method" : "' + results[0].payment_method + '"'
									+ ', "payment_type" : "' + results[0].payment_type + '"'
									+ ', "payment_from" : "' + results[0].payment_from + '"'
									+ ', "card_number" : "' + results[0].card_number + '"'
									+ ', "is_online_booking" : ' + results[0].is_online_booking
									+ ', "amount" : "' + results[0].amount + '"'
									+ ', "currency" : "' + results[0].currency + '"'
									+ '}]'
								+ ', "guest_detail" : [';
					for(var i=0;i<results.length;i++){
						payload+=	'{"reservation_room_guest_id" :' + sqlString.escape(results[i].reservation_room_guest_id)
								+	', "guest_first_name" :"' + sqlString.escape(results[i].guest_first_name) + '"'
								+	', "guest_last_name" :"' + sqlString.escape(results[i].guest_last_name) + '"'
								+	', "hotel_room_id" :' + sqlString.escape(results[i].hotel_room_id)
								+	', "user_id" :' + sqlString.escape(results[i].guest_user_id)
								+	', "is_adult" :' + sqlString.escape(results[i].is_adult)
								+	', "is_child" :' + sqlString.escape(results[i].is_child)
								+	', "guest_phone_number" :"' + sqlString.escape(results[i].guest_phone_number) + '"'
								+	', "guest_passport_number" :"' + sqlString.escape(results[i].guest_passport_number) + '"'
								+	', "guest_age" :' + sqlString.escape(results[i].guest_age)
								+	', "is_checked_in" :' + sqlString.escape(results[i].is_checked_in)
								+	', "mobile_key" :' + sqlString.escape(results[i].mobile_key)
								+	'}';
						if(i!=(results.length-1))
							payload+=', ';
					}
					payload+=	 ']';
					payload+= '}'; 
					// console.log(payload);
					var reservation_room_detail = JSON.parse(payload)
					console.log(reservation_room_detail);
					callback(null, genOutput('success', 1, reservation_room_detail));
				}else{
					callback(null, genOutput('error', 1, "No Guest"));
				}
			});
		}else{
			callback(null, genOutput('error', 400, "You are not admin or staff"));
		}
	}else{
		callback(null, genOutput('error', 1, "Format error"));
	}
}