// ==UserScript==
// @name         Spaste Auto Filler
// @namespace    spaste_auto_filler
// @description  Auto completes tehe captchas and follows the link on spast pages
// @homepageURL  https://github.com/daraeman/spaste_auto_filler
// @author       daraeman
// @version      1.0
// @date         2018-09-22
// @include      /https?:(\/\/www\.)?spaste\.com\/(s|go)\/.*/
// @require      https://code.jquery.com/jquery-3.3.1.slim.min.js#sha256=3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E=
// @downloadURL  https://github.com/daraeman/spaste_auto_filler/raw/master/spaste_auto_filler.user.js
// @updateURL    https://github.com/daraeman/spaste_auto_filler/raw/master/spaste_auto_filler.meta.js
// ==/UserScript==

init();

function init() {
	console.log( "Spaste Auto Filler Enabled" );

	// page switcher
	let url_matches = location.pathname.match( /^\/(s|go)\// );

	if ( url_matches && url_matches[1] ) {
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
	$( "h3" ).each( function(){
		let el = $(this);
		let text = el.text();
		if ( /Your link is/.test( text ) )
			el.find( "a" ).trigger( "click" );
	});
}

