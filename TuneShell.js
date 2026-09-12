const fs = require('fs');
const path = require('path');

const songDirectory = path.join(__dirname, "Songs");
const songs = fs.readdirSync(songDirectory).filter(song => song.toLowerCase().endsWith(".mp3"));
// console.log(songs)
if(songs.length === 0){
    console.log("No songs in the Songs Directory!");
}else{
    console.log(songs);
};
