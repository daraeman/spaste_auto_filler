// ==UserScript==
// @name         Spaste Auto Filler
// @namespace    spaste_auto_filler
// @description  Auto completes the captchas and follows the link on spaste pages
// @homepageURL  https://github.com/daraeman/spaste_auto_filler
// @author       daraeman
// @version      1.0
// @date         2018-09-22
// @include      /https?:(\/\/www\.)?spaste\.com\/(s|go)\/.*/
// @require      https://code.jquery.com/jquery-3.3.1.slim.min.js#sha256=3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E=
// @downloadURL  https://github.com/daraeman/spaste_auto_filler/raw/master/spaste_auto_filler.user.js
// @updateURL    https://github.com/daraeman/spaste_auto_filler/raw/master/spaste_auto_filler.meta.js
// ==/UserScript==

const link_timeout = 2 * 60 * 1000; // stop trying to get the link after 2 minutes
const check_interval = 200; // check for the link every 0.2 seconds

init();

function init() {
	console.log( "Spaste Auto Filler Enabled" );

	// page switcher
	let url_matches = location.pathname.match( /^\/(s|go)\// );

	if ( url_matches && url_matches[1] ) {
		let page = url_matches[1];
		if ( page === "s" )
			return doCaptchaPage();
		else if ( page === "go" )
			return doLinkPage();
	}

	return false;
}

function doCaptchaPage() {
	console.log( "Spaste Auto Filler: Captcha Page" );

	let captcha_start_button = $( "#globalCaptchaConfirm" );
	if ( captcha_start_button.length === 0 )
		return console.error( "Can't find captcha start button" );

	// show captcha
	captcha_start_button.trigger( "click" );

	// loop through each captch and solve it
	// click the submit button if all are solved
	doQuestion();
}

function doLinkPage() {
	console.log( "Spaste Auto Filler: Link Page" );

	followLink();
}


function wait( callback ) {
	setTimeout( () => {
		callback();
	}, 1 );
}

function doQuestion() {
	wait( () => {
		let question = $( "#currentCapQue" ).text().trim();
		let current_turn = parseInt( $( "#currentCapTurn" ).text() );
		let max_turn = parseInt( $( "#currentCapTurn" ).parent().text().match( /\d+ \- (\d+)/ )[1] );
		$( ".markAnswer" ).each( function(){
			let el = $(this);
			if ( new RegExp( question, "i" ).test( el.attr( "data-id" ) ) ) {
				el.click();
				if ( current_turn < max_turn )
					doQuestion();
				else
					$( "#template-contactform-submit" ).trigger( "click" );
			}
		});
	});
}

function followLink() {

	let start_time = +new Date();

	waitForLink( start_time )
		.then( ( el ) => {
			location.href = el.find( "a" ).attr( "href" );
		})
		.catch( ( error ) => {
			console.error( error );
		});
}

function waitForLink( start_time ) {

	return new Promise( ( resolve, reject ) => {

		let interval = setInterval( function(){

			$( "h3" ).each( function(){
				let el = $(this);
				let text = el.text();
				let link = el.find( "a" );
				if ( /Your link is :/.test( text ) && link.length === 1 && link.attr( "href" ).length ) {
					clearInterval( interval );
					return resolve( el );
				}
				else {
					let current_time = +new Date();
					if ( ( current_time - start_time ) > link_timeout ) {
						clearInterval( interval );
						return reject( "Link Find timeout reached" );
					}
				}
			});

		}, check_interval );
	});
}