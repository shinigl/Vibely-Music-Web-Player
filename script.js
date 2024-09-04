let songs;
let currFolder;
let currentSong = new Audio();

//seconds to minute 
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


// Get all the songs from local area
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let aTag = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < aTag.length; index++) {
        const element = aTag[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    // Show all songs in the library 
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                 <div class="info">
                     <div>${song.replaceAll("%20", " ")} </div>
                   
                 </div>
                 <div class="playnow">
                     <span> Play Now</span>
                 <img class="invert" src="img/play.svg" alt=""></div></li>`
    }
    // Click and play song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
}






//Play current song

const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

// Function to filter and display songs based on search query
function searchSongs(query) {
    // Filter songs based on the search query
    const filteredSongs = songs.filter(song => song.toLowerCase().includes(query.toLowerCase()));
    
    // Update the song list display
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of filteredSongs) {
        songUL.innerHTML += `
            <li> <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")} </div>
                    <div>Song Artist</div>
                </div>
                <div class="playnow">
                    <span> Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    // Re-attach event listeners to the updated song list
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        });
    });
}

async function main() {

    await getSongs("Songs")
    playMusic(songs[0], true)



    // Attach Event Listener to Prev , Next and Play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    //Update Time Duration of song
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Dynamic seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = currentSong.duration * percent / 100;
    })

    // Add event Listener to prev button
    prev.addEventListener("click", () => {
        console.log("Prev clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add event Listener to next button
    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    //Add event listener to volume
    document.querySelector(".volrange").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;

    })

    // Add event listener to mute the track
    document.querySelector(".vol>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volrange").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".volrange").getElementsByTagName("input")[0].value = 10;
        }
    })

    //Load Playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)

        })
    })

    //Add event listener to Hamburger

    document.querySelector(".ham").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";

    })

    //Add event listener to close btn

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";

    })
    

}

main();





