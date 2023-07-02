const imageContainer = document.querySelector('#image-container');

let raceData, raceNames;
let index = 0;

const init = async () => {

    // Fetch Data
    raceData = await getRaceData();
    raceNames = Object.keys(raceData).sort();

    // Win Button

    // Bin Button

    // Swap Button
    const swap_btn = document.querySelector("#swap_btn");
    swap_btn.addEventListener("click", cycle);

    await doCards();

    console.log("Setup should be complete");
}

const doCards = async () => {
    imageContainer.style.opacity = 0;
    // Populate the Image-Container with First Race's Cards
    await populateCards(raceNames[index++]);

    // Add Swipe Functionality to Cards
    await initCards();
}

const getRaceData = async () => {
    // Asynchronously Loads all Race Data
    const response = await fetch("data.json")
    const data = await response.json()
    return data;
}

const populateCards = async (raceName) => {
    // Adds Cards from Next Race in List to image-container
    const container = document.querySelector("#image-container")
    const imgs = raceData[raceName]

    imgs.forEach(img => {
        const imgElement = document.createElement("img");
        imgElement.style.display = "none";

        const path = `races_pics/${raceName}/${img}`
        imgElement.classList.add("image-card");
        imgElement.src = path;

        imgElement.onload = function () {
            const rgb = getAverageColour(imgElement);
            const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            imgElement.style.backgroundColor = imgElement.style.borderColor = rgbString;
        }

        container.appendChild(imgElement);

        // Hide Cards until Fully Loaded & Styled
        imgElement.addEventListener("load", onLoad)
    })
}

const onLoad = function () {
    this.style.display = "inherit";
    this.removeEventListener("load", onLoad);
    imageContainer.style.opacity = 1;
}

const initCards = async () => {
    const imageCards = document.querySelectorAll('.image-card');
    for (let i = 0; i < imageCards.length; i++) {
        // Set up Card Z-index for overlapping (possibly not necessary in future implementation)
        imageCards[i].style.zIndex = imageCards.length - i;
        // imageCards[i].style.opacity = imageCards[i].style.zIndex - i;
    }
    await addSwipeListeners(imageCards);
}

const addSwipeListeners = async (imageCards) => {
    let initialX = null;
    let currentCard = null;

    for (let i = 0; i < imageCards.length; i++) {
        const card = imageCards[i];
        card.addEventListener('mousedown', startSwipe); // click start
        card.addEventListener('touchstart', startSwipe); // touchscreen touch start
    }

    function startSwipe(e) {
        e.preventDefault(); // Prevent default browser behavior (ghost image dragging / text highlighting)
        currentCard = this;
        initialX = e.clientX || e.touches[0].clientX;
        document.addEventListener('mousemove', swipe);
        document.addEventListener('touchmove', swipe);
        document.addEventListener('mouseup', endSwipe);
        document.addEventListener('touchend', endSwipe);
    }

    function swipe(e) {
        if (!initialX) return;
        const currentX = e.clientX || e.touches[0].clientX;
        const diffX = currentX - initialX;
        const translateX = Math.max(-100, Math.min(100, diffX));
        currentCard.style.transform = `translateX(${translateX}px) rotate(${translateX * 0.1}deg)`;
    }

    function endSwipe(e) {
        if (!initialX) return;
        const finalX = e.clientX || initialX;
        const diffX = finalX - initialX;
        console.log("Ending swipe...")

        if (diffX > 75) {
            // Swipe right
            imageCards.forEach(card => {
                card.style.transform = 'translateX(150%) rotate(10deg)';
                imageContainer.style.opacity = 0;
            })

            setTimeout(() => {
                currentCard.parentNode.setHTML("");
                currentCard = null;
                doCards();
            }, 300);
        } else if (diffX < -75) {
            // Swipe left
            imageCards.forEach(card => {
                card.style.transform = 'translateX(-150%) rotate(-10deg)';
                imageContainer.style.opacity = 0;
            })

            setTimeout(() => {
                currentCard.parentNode.setHTML("");
                currentCard = null;
                doCards();
            }, 300);
        } else {
            currentCard.style.transform = '';
            currentCard = null;
        }
        initialX = null;
    }
}

// Button Stuff
function cycle() {
    this.classList.add("disabled"); // disable button during swap

    console.log(imageContainer.childNodes)

    imageContainer.childNodes.forEach(card => {
        // Swap Cards (add animation later)
        const zIndex = card.style.zIndex;
        card.style.zIndex = zIndex > 1 ? zIndex - 1 : imageContainer.childNodes.length;
        card.style.opacity = 100 / card.style.zIndex;
    })

    // Reenable Button After Swap
    setTimeout(() => {
        this.classList.remove("disabled");

    }, 1000)
}

function getAverageColour(img) {
    // Returns an RGB value of the average colour of the img
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    let r = 0;
    let g = 0;
    let b = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    r = ~~(r / (data.length / 4));
    g = ~~(g / (data.length / 4));
    b = ~~(b / (data.length / 4));

    return { r: r, g: g, b: b };
}



// End of Functions

init();