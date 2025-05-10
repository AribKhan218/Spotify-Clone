console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  try {
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        // Just get the filename without any extra path parts
        let fileName = element.href.split("/").pop();
        songs.push(fileName);
      }
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
  }

  // Show all the songs in playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `<li>
            <img class="invert" src="image/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ").replace("/", "")}</div>
                <div>Kaloo</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="image/play.svg" alt="">
            </div>
        </li>`;
  }

  // Attach event listeners to songs
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
    // Make sure we're using just the filename
    let songPath = `/${currFolder}/${track}`;
    currentSong.src = songPath;
    if (!pause) {
        currentSong.play();
        play.src = "/image/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums(params) {
  let a = await fetch("/songs");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      // Get the meta data of the folder

      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);

      cardContainer.innerHTML += `<div data-folder= ${folder} class="card">
                        <div class="play">
                            <img class="play-icon" src="/image/play.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  }

  // Load the Playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      // Remove the extra 'songs/' from the path
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get the list of all the songs
  await getSongs("songs/ncs");
  if (songs && songs.length > 0) {
    playMusic(songs[0], true);
  }

  // Display all the albums on the page

  displayAlbums();

  // Attach an event listener to play, next and previous

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/image/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/image/play.svg";
    }
  });

  // Listen for time update event

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Adding an event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  // Add an event listener for hamburger

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // Add an event listener to previous and next
  const previous = document.querySelector("#previous");

  previous.addEventListener("click", () => {
    console.log("Previous clicked");
    // Get just the filename from the current song path
    let currentSongName = currentSong.src.split("/").pop();
    let index = songs.indexOf(currentSongName);
    console.log("Current song index:", index); // Debug log
    if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
    }
  });


  const next = document.querySelector("#next");

  next.addEventListener("click", () => {
    console.log("Next clicked");
    // Get just the filename from the current song path
    let currentSongName = currentSong.src.split("/").pop();
    let index = songs.indexOf(currentSongName);
    console.log("Current song index:", index); // Debug log
    if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
    }
  });




  // Add an event to volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value + "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume > img").src = document
          .querySelector(".volume > img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add event listener to mute the track

  document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
