let currentSong = new Audio();
let songs;
let lastVolume = 0.5;
let currentFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getSongs(folder) {
  let a = await fetch(`/Songs/${folder}`);
  currentFolder = folder;
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(
        element.href.split(`/Songs/${folder}/`)[1].replace(/%20/g, " ")
      );
    }
  }
  return songs;
}

async function album() {
  let a = await fetch(`/Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let href = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(href);
  for (let index = 0; index < array.length; index++) {
    let e = array[index];
    if (e.href.includes("/Songs/")) {
      let parts = e.href.split("/");
      let alb = parts[parts.length - 2]; // ✅ this gets 'mySongs'
      console.log(e.href);
      console.log(alb);
      let a = await fetch(`/Songs/${alb}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `
      <div data-folder="${alb}" class="card">
              <div class="play">
                <img src="svgs/play.svg" alt="play" />
              </div>
              <img
                src="../Songs/${alb}/cover.jpeg"
                alt="songImg"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      const folder = item.currentTarget.dataset.folder;
      songs = await getSongs(folder);
      render();
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
}

playMusic = (track, pause = false) => {
  // let audio = new Audio(`/Songs/${track}`)
  currentSong.src = `/Songs/${currentFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    play.src = "svgs/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML = `${formatTime(
    currentSong.currentTime
  )} / ${formatTime(currentSong.duration)}`;
};

async function render() {
  let SongUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  SongUL.innerHTML = "";
  for (let song of songs) {
    SongUL.innerHTML =
      SongUL.innerHTML +
      `<li>
              <div class="songTitle">
                <img src="svgs/music.svg" alt="music" />
                <div class="info">
                  <div>${song}</div>
                  <div>Naveed</div>
                </div>
              </div>
              <div class="playNow flex align-center justify-center">
                <span>Play now</span>
                <img class="invert" src="svgs/play.svg" alt="play" />
              </div>
            </li>`;
  }

  await Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

async function main() {
  songs = await getSongs("mySongs");
  render();
  playMusic(songs[0], true);
  album();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svgs/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = `${
      (currentSong.currentTime / currentSong.duration) * 100
    }%`;
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left = `${
      (e.offsetX / e.target.getBoundingClientRect().width) * 100
    }%`;
    currentSong.currentTime =
      currentSong.duration *
      (e.offsetX / e.target.getBoundingClientRect().width);
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  document.querySelector(".R").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let currentFile = decodeURIComponent(
      currentSong.src.split("/Songs/").slice(-1)[0]
    );
    let index = songs.indexOf(currentFile);

    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  next.addEventListener("click", () => {
    let currentFile = decodeURIComponent(
      currentSong.src.split("/Songs/").slice(-1)[0]
    );
    let index = songs.indexOf(currentFile);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  document.querySelector(".volume-div input").addEventListener("input", (e) => {
    let value = e.target.value / 100;
    currentSong.volume = value;
    if (e.target.value / 100 <= 0) {
      vol.src = "svgs/mute.svg";
    } else {
      vol.src = "svgs/volume.svg";
      lastVolume = value;
    }
  });

  vol.addEventListener("click", () => {
    if (currentSong.volume > 0) {
      lastVolume = currentSong.volume;
      vol.src = "svgs/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".volume-div input").value = 0;
    } else {
      const restoreVolume = lastVolume > 0 ? lastVolume : 0.5;
      currentSong.volume = restoreVolume;
      document.querySelector(".volume-div input").value = restoreVolume * 100;
      vol.src = "svgs/volume.svg";
    }
  });
}

main();
