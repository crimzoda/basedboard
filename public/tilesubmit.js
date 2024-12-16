const firebaseConfig = {
    apiKey: "key",
    authDomain: "domain",
    databaseURL: "url",
    projectId: "id",
    storageBucket: "bucket",
    messagingSenderId: "senderid",
    appId: "appid",
    measurementId: "measurement id"
  };

const app = firebase.initializeApp(firebaseConfig);

const tilesRef = firebase.database().ref('tiles');

const tileForm = document.getElementById('tileForm');
const canvas = document.getElementById('canvas');

const imageType = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
const videoType = ['mp4', 'webm'];


tileForm.addEventListener('submit', async function (e)
{
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const mediaURL = document.getElementById('mediaURL').value;
    const linkURL = document.getElementById('linkURL').value;
    const username = document.getElementById('username').value;
    const color = document.getElementById('color').value;
    const xCoord = parseInt(document.getElementById('xCoord').innerText);
    const yCoord = parseInt(document.getElementById('yCoord').innerText);

    const recaptchaResponse = grecaptcha.getResponse();

    if (imageType.includes(mediaURL.split('.').pop().toLowerCase()) || videoType.includes(mediaURL.split('.').pop().toLowerCase()))
    {
        //CAPTCHA check
        try {
            const response = await fetch('https://europe-west1-basedboard-2b634.cloudfunctions.net/verifyRecaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recaptchaResponse })
            });

            const verificationData = await response.json();

            //proceed with tile creation if CAPTCHA succeeds
            if (verificationData.success) {
                

                const nodeKey = String(xCoord + ',' + yCoord);

        const newTileData = {
            title: title,
            mediaURL: mediaURL,
            linkURL: linkURL,
            username: username,
            likes: 0,
            color: color
        };

        //check if tile in position already exists in db
        tilesRef.child(nodeKey).once('value', snapshot => {
            if (snapshot.exists()) {
                return;
            }
            else {
                tilesRef.child(nodeKey).set(newTileData);
                grecaptcha.reset();
                tileForm.reset();
            }
        });

        document.getElementById('errorText').innerHTML = "";
        //if CAPTCHA fails
            } else {
                document.getElementById('errorText').innerHTML = "CAPTCHA not done";
                console.log('reCAPTCHA verification failed');
            }
        } catch (error) {
            console.error('Error verifying reCAPTCHA: ', error);
        }
    } else {
        document.getElementById('errorText').innerHTML = "media url invalid";
    }
    

});

//real-time check if tile is added to database
//then reflect that on the client-side
tilesRef.on("child_added", snapshot => {
    const tileData = snapshot.val();
    
    const tile = createTile(tileData, snapshot.key);
    canvas.appendChild(tile);
});

//checking media types -----------
function isVideoUrl(url) {
    const fileExtension = url.split('.').pop().toLowerCase();
    console.log(fileExtension);
    return videoType.includes(fileExtension);
}

function isImageURL(url) {
    const fileExtension = url.split('.').pop().toLowerCase();
    return imageType.includes(fileExtension);
}
//--------------------------------


//client-side tile creation
function createTile(tileData, key)
{
    const [tileX, tileY] = key.split(',').map(Number);

    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.style.position = "absolute";
    tile.style.left = tileX + 'px';
    tile.style.top = tileY + 'px';

    const tilebg = document.createElement('div');
    tilebg.classList.add('tilebg');
    tilebg.style.width = 288;
    tilebg.style.height = 250;
    tilebg.style.marginLeft = 5;
    tilebg.style.marginTop = -9;
    tilebg.style.backgroundColor = tileData.color;

    const tileMedia = document.createElement('div');
    tileMedia.classList.add('tile-content');

    const tileHeader = document.createElement('div');
    tileHeader.classList.add('tile-header');

    const tileTitle = document.createElement('h4');
    tileTitle.textContent = tileData.username;

    const tileFooter = document.createElement('div');
    tileFooter.classList.add('tile-footer');

    const tileImage = document.createElement('img');
    tileImage.classList.add('tile-image');
    tileImage.alt = tileData.title;
    tileImage.width = 200;
    tileImage.height = 200;
    tileImage.style.paddingTop = 10;

    const tileVideo = document.createElement('video');
    tileVideo.classList.add('tile-video');
    tileVideo.width = 260;
    tileVideo.height = 146;
    tileVideo.controls = true;
    tileVideo.style.paddingTop = 10;

    const tileLink = document.createElement('a');
    tileLink.classList.add('tile-link')
    tileLink.href = tileData.linkURL;
    tileLink.target = '_blank';
    tileLink.textContent = tileData.title;
    tileLink.maxLength = 35;

    const likeButtom = document.createElement('button');
    likeButtom.textContent = 'like';
    likeButtom.classList.add('tile-like-button');

    const likeCountDisplay = document.createElement('span');
    likeCountDisplay.style.filter = 'invert(1)';
    likeCountDisplay.style.mixBlendMode = 'difference';
    likeCountDisplay.classList.add('tile-like-count');
    
    likeButtom.addEventListener('click', () => {
        Like(key);
    });

    tilesRef.child(key).child('likes').on('value', snapshot => {
        const likeCount = snapshot.val();
        likeCountDisplay.textContent = `${likeCount}`;
    });

    if (isImageURL(tileData.mediaURL) == true) {
        tileImage.src = `https://europe-west1-basedboard-2b634.cloudfunctions.net/getMedia?url=${encodeURIComponent(tileData.mediaURL)}`;
        tileMedia.appendChild(tileImage);
    } else if (isVideoUrl(tileData.mediaURL) == true) {
        tileVideo.src = `https://europe-west1-basedboard-2b634.cloudfunctions.net/getMedia?url=${encodeURIComponent(tileData.mediaURL)}`;
        tileMedia.appendChild(tileVideo);
        console.log('adding video');
    }
    
    tileHeader.appendChild(tileTitle);
    tileFooter.appendChild(tileLink);
    tileFooter.appendChild(likeButtom);
    tileFooter.appendChild(likeCountDisplay);

    tile.appendChild(tileHeader);
    tilebg.appendChild(tileMedia);
    tilebg.appendChild(tileFooter);

    tile.appendChild(tilebg);

    return tile;
}

function Like(tile_key)
{
    tilesRef.child(`${tile_key}/likes`).set(firebase.database.ServerValue.increment(1));
}
