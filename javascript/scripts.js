const heart = document.getElementById('heart');
heart.addEventListener('click', () => {
  // Add 'scatter-animation' class to all colored pixels
  heart.querySelectorAll('[style]').forEach(pixel => {
    pixel.classList.add('scatter-animation');
  });
  
  // Optionally, remove the animation classes after animation ends to allow repeated clicks
  setTimeout(() => {
    heart.querySelectorAll('[style]').forEach(pixel => {
      pixel.classList.remove('scatter-animation');
    });
  }, 1600); // Slightly more than animation duration (1.5s)
});

//--------------------------------------------------------------------
//---------------------------------------Spiral bind code---------------------------------------
const OG_spiral = document.querySelector(".spiral");//main spiral container
const OG_dot = document.querySelector(".dot");//spiral single element

for (let i = 0; i <= 20; i++){
    const OG_clone = OG_dot.cloneNode(true);
    OG_spiral.appendChild(OG_clone);
};
//--------------------------------------------------------------------------------------------------------------

// Music files mapping - connect specific CDs to specific songs
const musicLibrary = {
    'creator.png': './asset/creator.mp3',
    'october.png': './asset/october.mp3', 
    'falling_in_love.png': './asset/falling_in_love.mp3',
    'october.png': './asset/october.mp3' // Initial CD plays october song
};

// Default song for when no CD is loaded
const defaultSong = './asset/october.mp3';

// Music Player Elements
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressBar = document.querySelector('.progress-bar');
const progressFill = document.querySelector('.progress-fill');
const progressHandle = document.querySelector('.progress-handle');
const dropZone = document.querySelector('.cd-drop-zone');

// Audio Elements
const audio = new Audio();
let isPlaying = false;
let currentProgress = 0;
let updateInterval;

function initializePlayer() {
    // Load the initial song (the one showing in the gramophone)
    audio.src = defaultSong;
    
    // Set the initial CD image in the drop zone
    dropZone.style.backgroundImage = `url('./asset/october.png')`;
    dropZone.style.backgroundSize = 'contain';
    dropZone.style.backgroundRepeat = 'no-repeat';
    dropZone.classList.add('animate-spin');
    
    // Auto-play the song
    playMusic();
    
    updateProgress(0);
}

// Play specific song based on CD
function playSongForCD(cdFileName) {
    const songPath = musicLibrary[cdFileName];
    
    if (songPath) {
        // Change audio source and play
        audio.src = songPath;
        playMusic();
        
        // Update drop zone to show the CD
        dropZone.style.backgroundImage = `url('./asset/${cdFileName}')`;
        dropZone.style.backgroundSize = 'contain';
        dropZone.style.backgroundRepeat = 'no-repeat';
        dropZone.classList.add('animate-spin');
    } else {
        console.log('No song found for this CD:', cdFileName);
    }
}

// Make ALL CDs draggable (not just one)
const cds = document.querySelectorAll('.draggable-cd');

cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
        // Get filename from data attribute
        const cdFileName = cd.getAttribute('data-cd-filename');
        
        e.dataTransfer.setData('text/plain', cdFileName);
        cd.classList.add('opacity-50');
    });

    cd.addEventListener('dragend', () => {
        cd.classList.remove('opacity-50');
    });
});

// Gramophone drop zone
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('bg-green-600');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('bg-green-600');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('bg-green-600');
    
    // Get which CD was dropped
    const cdFileName = e.dataTransfer.getData('text/plain');
    
    // Play the corresponding song
    playSongForCD(cdFileName);
});

// Play/Pause Toggle
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
});

// Play Music Function
function playMusic() {
    // Only play if we have a song loaded
    if (audio.src) {
        audio.play().then(() => {
            isPlaying = true;
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            
            // Start updating progress bar
            startProgressUpdate();
        }).catch(error => {
            console.log('Audio play failed:', error);
            // If auto-play is blocked, show play button instead
            isPlaying = false;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        });
    }
}

// Pause Music Function
function pauseMusic() {
    audio.pause();
    isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    
    // Stop updating progress bar
    stopProgressUpdate();
}

// Progress Bar Updates
function startProgressUpdate() {
    updateInterval = setInterval(() => {
        if (audio.duration) {
            currentProgress = (audio.currentTime / audio.duration) * 100;
            updateProgress(currentProgress);
        }
    }, 100);
}

function stopProgressUpdate() {
    clearInterval(updateInterval);
}

// Update Progress Function
function updateProgress(progress) {
    currentProgress = Math.max(0, Math.min(progress, 100));
    progressFill.style.width = `${currentProgress}%`;
    progressHandle.style.left = `${currentProgress}%`;
}

// Progress Bar Click - Seek to position
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    
    if (audio.duration) {
        audio.currentTime = (newProgress / 100) * audio.duration;
    }
    updateProgress(newProgress);
});

// Progress Bar Drag - Seek to position
progressHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    
    const onMouseMove = (e) => {
        const rect = progressBar.getBoundingClientRect();
        let newX = e.clientX - rect.left;
        newX = Math.max(0, Math.min(newX, rect.width));
        const newProgress = (newX / rect.width) * 100;
        
        updateProgress(newProgress);
    };
    
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        progressHandle.classList.replace('cursor-grabbing', 'cursor-grab');
        
        // Update audio position when drag ends
        if (audio.duration) {
            audio.currentTime = (currentProgress / 100) * audio.duration;
        }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    progressHandle.classList.replace('cursor-grab', 'cursor-grabbing');
});

// Audio Event Listeners
audio.addEventListener('loadedmetadata', () => {
    console.log('Audio loaded, duration:', audio.duration);
});

audio.addEventListener('ended', () => {
    // When song ends, reset
    pauseMusic();
    updateProgress(0);
    audio.currentTime = 0;
    
    // Stop CD spinning
    dropZone.classList.remove('animate-spin');
});

audio.addEventListener('timeupdate', () => {
    // Backup progress update
    if (audio.duration) {
        currentProgress = (audio.currentTime / audio.duration) * 100;
        updateProgress(currentProgress);
    }
});

// ---------------------------------------Spiral Animation code ---------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelectorAll(".page");
    const journal = document.getElementById("journal");
    const bottom = document.getElementById("bottom");
    const spiral = document.querySelector(".spiral");

    // Initialize the music player with auto-play
    initializePlayer();
    
    let reverse_index = 0;
    
    function flipping(element){
        let flipped = false;
        element.addEventListener("click", () => {
            flipped = !flipped;

            // Flip journal
            element.style.transform = flipped 
                ? "rotateY(-180deg)" 
                : "rotateY(0deg)";
            
            const allpages = document.querySelectorAll(".page, #journal, #bottom");
            let highestIdex = 0;
            
            allpages.forEach((x) => {
                const zIndex = parseInt(window.getComputedStyle(x).zIndex) || 0;
                if (zIndex > highestIdex) {
                    highestIdex = zIndex;
                }
            });
            console.log("highest Index is: ", highestIdex);//debug
            
            // Index adjustment for proper layering
            if (flipped == true){
                element.style.zIndex = highestIdex + 10;
                console.log("new zIndex is: ", element.style.zIndex);//debug
            }
            else{
                reverse_index +=  10;
                element.style.zIndex = reverse_index;
                console.log("new zIndex is: ", element.style.zIndex);//debug
            }
            

            // Trigger spiral hide animation
            spiral.classList.remove("hidden-during-flip");
            void spiral.offsetWidth; // restart animation
            spiral.classList.add("hidden-during-flip");
        });
    };

    //--------------------------Reset Button----------------------------------------
    document.getElementById("reset").addEventListener("click", () => {
        document.querySelectorAll(".page, #journal, #bottom").forEach((x) => {
            x.style.transform = "rotateY(0deg)";
            if (x.id != "journal"){
                x.style.zIndex = "20";
            }
            else if(x.id = "bottom"){
                x.style.zIndex = "-1";
            }
            else{
                x.style.zIndex = "40";
            }
            flipped = false;
        });
    });
    //--------------------------------------------------------------------------------

    flipping(journal);
    flipping(bottom);
    page.forEach(page => flipping(page));
});