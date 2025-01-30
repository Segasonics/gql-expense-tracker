import cron from "cron";
import https from "https";

const URL = "https://gql-expense-tracker-b3s9.onrender.com";

const job = new cron.CronJob("*/14 * * * *", function () {//on every 14 minutes we send a request to the url that is running on render
	https
		.get(URL, (res) => {
			if (res.statusCode === 200) {
				console.log("GET request sent successfully");
			} else {
				console.log("GET request failed", res.statusCode);
			}
		})
		.on("error", (e) => {
			console.error("Error while sending request", e);
		});
});

export default job;




//CRON JOB EXPLANATION:
//Cron jobs are scheduled tasks that run periodically at fixed intervals or specific times
//Send 1 GET request for every 14 minutes immediately


//Schedule:
//You define a schedule using a cron expression, which consists of five fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Every 14 minutes   ---this will send GET request every 14 minutes so that our website would auto refresh and run smoothly(keeps our server up and running in the active state)
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour