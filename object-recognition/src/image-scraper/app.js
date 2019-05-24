var Scraper = require ('images-scraper') , bing = new Scraper.Bing(); 
var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr, i) { console.log(`scraping picture ${i}...`) }

const KEYWORD = 'african rhino';
const NUM = 2000;
let f = 0;
function main() {
	bing.list({
		keyword: KEYWORD,
		num: NUM,
		detail: false
	})
		.then(function (res) {
			for(let i = 0; i < res.length; i++) {
				console.log(res[i].url);
			}
		}).catch(function(err) {
			console.log('err',err);
		})
}

main();
