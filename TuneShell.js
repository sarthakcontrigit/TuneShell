const fs = require('fs');
const path = require('path');

const songDirectory = path.join(__dirname, "Songs");
const songs = fs.readdirSync(songDirectory).filter(song => song.toLowerCase().endsWith(".mp3"));
// console.log(songs)

function showSongs(songs){
    console.log("\n");
    console.log("-------------------- SONGS TO PLAY --------------------");
    console.log("\n");
    songs.forEach((song, index)=>{
        console.log(`${index+1}. ${song}`);
    });
    console.log("\n");
    console.log("-------------------------------------------------------");
};


if(songs.length === 0){
    console.log("No songs in the Songs Directory!");
}else{
    showSongs(songs);
};
