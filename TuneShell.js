const fs = require('fs');
const path = require('path');

const songDirectory = path.join(__dirname, "Songs");
const songs = fs.readdirSync(songDirectory).filter(song => song.toLowerCase().endsWith(".mp3"));
// console.log(songs)

let selectedIndex= 0;
const LIST_SIZE = 10;

function showSongs(songs){
        console.clear();
    let startIndex = 0;
    if(startIndex >= LIST_SIZE){
        startIndex = startIndex - LIST_SIZE + 1;

    };
    const songsToShow = songs.slice(startIndex, startIndex + LIST_SIZE);
    console.log("\n");
    console.log("-------------------- SONGS TO PLAY --------------------");
    console.log("\n");
 
        songsToShow.forEach((song, index)=>{
        const actualIndex = startIndex + index;
        const isSelected = actualIndex === selectedIndex;
        const pointer = isSelected ? "--> " : "    ";
        console.log(`${pointer}${actualIndex+1}. ${song}`);
    });
    console.log("\n");
    console.log("Use ↑ / ↓ to navigate, Ctrl+C or 'q' to exit");
    console.log("-------------------------------------------------------");
};


if(songs.length === 0){
    console.log("No songs in the Songs Directory!");
}else{
    showSongs(songs);
};
