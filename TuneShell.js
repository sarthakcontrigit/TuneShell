const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

readline.emitKeypressEvents(process.stdin);
if(process.stdin.isTTY){
    process.stdin.setRawMode(true);
};
process.stdin.resume();

process.stdin.on('keypress', (str, key)=>{
    if((key.ctrl && key.name === "c") || key.name==="q"){
        process.exit();
    };
    if(key.name === "up"){
        if(selectedIndex > 0){
            selectedIndex--;
            showSongs(songs);
        };
    };
    if(key.name==="down"){
        if(selectedIndex < songs.length -1 ){
            selectedIndex++;
            showSongs(songs);
        };
    };
});
