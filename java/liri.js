require('dotenv').config();
const API_Keys = require('./keys.js');
const spotify = require('node-spotify-api');
const request = require('request');
const inquirer = require('inquirer');
const colors = require('colors');
const fs = require('fs');



programStart();


function programStart() {
	logStuffThatHappens('to start the program', 'node liri.js');

	inquirer.prompt([{
			type: 'list',
			name: 'program',
			message: 'What program do you want to run?',
			choices: [
				'concert-this',
				'spotify-this-song',
				'movie-this',
				'do-what-it-says'
			]
		}])
		.then((answers) => {

			switch (answers.program) {
				case 'concert-this':
					inquirer.promt([{
						type: 'input',
						name: 'song',
						message: 'What band do you want to look up?'
					}]).then((answers) => {
						const band = answers.band;
						getBand(band)
					})

				case 'spotify-this-song':
					inquirer.prompt([{
							type: 'input',
							name: 'song',
							message: 'What song would you like to look up?',
						}])
						.then((answers) => {
							const song = answers.song;
							getMusic(song);
						});
					break;

				case 'movie-this':
					inquirer.prompt([{
							type: 'input',
							name: 'movie',
							message: 'What movie would you like info for?',
						}])
						.then((answers) => {
							const movie = answers.movie;
							getMovie(movie);
						});
					break;

				case 'do-what-it-says':
					console.log('\nFatal Err. Restart needed\n'.red);
					logStuffThatHappens('do-what-it-says ', 'not supported');
					reRunProgram();
					break;

				default:
					logStuffThatHappens('programStart() ', 'default Switch/Case');
					console.log("You've done something wrong, try again...\n".red)
			}
		})
}

function reRunProgram() {
	inquirer.prompt([{
			type: 'confirm',
			name: 'confirm',
			message: 'Would you like to re-start the program?',
		}])
		.then((answers) => {
			if (answers.confirm) {
				logStuffThatHappens('to reRun the program', 'Yes');
				programStart();
			} else {
				logStuffThatHappens('to abort the program', 'No');
				console.log("\nGood Bye!\n".cyan);
			}
		})
}
// function getBand(band){
// 	const apiKey = ""
// 	var bandsintown = require('bandsintown')(APP_ID);
 
// bandsintown
//   .getArtistEventList('Skrillex')
//   .then(function(events) {
//     // return array of events
//   });
// }
// wont work gonna kms

function getMusic(song) {

	spotify = new spotify(API_Keys.spotifyKeys);
	spotify.search({
		type: 'track',
		query: song,
		limit: 1
	}, (err, data) => {
		if (err) {
			logErrors('getMusic()', song);
			return console.log(`\n${err}\n`.red);
		}
		// console.log(JSON.stringify(data.tracks.items[0], null, 2));
		let artistName = data.tracks.items[0].album.artists[0].name;
		let songName = data.tracks.items[0].name;
		let songURL = data.tracks.items[0].album.artists[0].external_urls.spotify;
		let albumName = data.tracks.items[0].album.name;

		console.log("\nGreat choice!\n".cyan);
		console.log(`I love '${songName}' by ${artistName}. Wasn't that on the album '${albumName}'?`.cyan);
		console.log(`Have a listen over at ${songURL.grey}\n`.cyan);

		logStuffThatHappens('spotify-this-song ', song);

		setTimeout(reRunProgram, 1000);
	});
}

// .env wont read...unable to search for song
function getMovie(movie) {
	const apiKey = "40e9cece";
	const movieQueryUrl = `http://www.omdbapi.com/?t=${movie}&apikey=${apiKey}`;

	request(movieQueryUrl, (error, response, body) => {

		if (JSON.parse(body).Response === 'False') {
			console.log("\nThat movie title doesn't exist, try again?\n".red);
			logErrors('getMovie()', movie);
			reRunProgram();

		} else if (!error && response.statusCode === 200) {

			const title = JSON.parse(body).Title;
			const movieYear = JSON.parse(body).Year;
			const country = JSON.parse(body).Country;
			const plot = JSON.parse(body).Plot;
			const actors = JSON.parse(body).Actors;
			let IMDB_Rating;
			let rotten_Rating;

			if (JSON.parse(body).Ratings[0]) {
				IMDB_Rating = JSON.parse(body).Ratings[0].Value;
			} else {
				IMDB_Rating = 'undefined';
			}

			if (JSON.parse(body).Ratings[1]) {
				rotten_Rating = JSON.parse(body).Ratings[1].Value;
			} else {
				rotten_Rating = 'undefined';
			}

			console.log("\nGreat choice!\n".cyan);
			console.log(`The movie '${title}', starring ${actors} \nwas released in ${country} in ${movieYear}, with a IMDB rating of ${IMDB_Rating}, and a Rotten Tomatoes rating of ${rotten_Rating}.\n`.cyan);
			console.log(`Here's the movie's plot:\n`.cyan);
			console.log(`${plot.grey}\n`)

			logStuffThatHappens('movie-this ', movie);

			setTimeout(reRunProgram, 1000);

		} else {
			logErrors('getMovie()', movie);
			return console.log(error);
		}
	});
}


function logStuffThatHappens(func, query) {
	let stuffD = new Date();
	fs.appendFile("log.txt", `\n ${stuffD.getTime()}: User requested: '${func}' with a query of '${query}',`, (err) => {

		if (err) {
			logErrors('logStuffThatHappens()', query);
			return console.log(err);
		}
	});
}


function logErrors(func, query) {
	let errorD = new Date();
	fs.appendFile("log.txt", `\n ${errorD.getTime()}:  Error Occured: 'running: '${func}' with a query of '${query}',`, (err) => {

		if (err) {
			logErrors('logErrors()', query);
			return console.log(err);
		}
	});
}