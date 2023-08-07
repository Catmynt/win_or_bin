const imageContainer = document.querySelector('#image-container');

let raceData, raceNames, currentCard;
let index = 0;

const buttonTimeoutDuration = 500;

const init = async () => {

    // Fetch Data
    raceData = await getRaceData();
    raceNames = Object.keys(raceData).sort();

    // Win Button
    const win_btn = document.querySelector("#win_btn")
    win_btn.addEventListener("click", swipeRight);

    // Bin Button
    const bin_btn = document.querySelector("#bin_btn")
    bin_btn.addEventListener("click", swipeLeft);

    // Swap Button
    const swap_btn = document.querySelector("#swap_btn");
    swap_btn.addEventListener("click", cycle);

    // Setup Cards
    await doCards();

    console.log("Setup should be complete");
}

const doCards = async () => {
    imageContainer.style.opacity = 0;
    // Populate the Image-Container with First Race's Cards
    if (index < raceNames.length) {
        await populateCards(raceNames[index++]);

        // Add Swipe Functionality to Cards
        await initCards();
    }
    else {
        console.log("All races seen");

        // Placeholder results screen; to be improved later
        imageContainer.parentNode.classList.remove("col-12", "col-md-6");
        imageContainer.parentNode.classList.add("col-1");

        const winList = document.querySelector("#win_list");
        const binList = document.querySelector("#bin_list");
        winList.classList.remove("d-none");
        binList.classList.remove("d-none");
        binList.classList.add("mb-3")
    }
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
        // Container for Card + Info
        const raceBlock = document.createElement("div");
        raceBlock.classList.add("race-block", "col-12", "justify-content-center");

        // Race Name Title
        const raceTitle = document.createElement("p");
        raceTitle.textContent = raceName;
        raceTitle.style.zIndex = 2;
        raceTitle.classList.add("race-title");

        // Image Itself
        const imgElement = document.createElement("img");
        // imgElement.style.display = "none";
        raceBlock.style.display = "none";
        const path = `races_pics/${raceName}/${img}`
        imgElement.classList.add("image-card");
        imgElement.src = path;

        // Fancy Background / Border Colouring
        imgElement.onload = function () {
            const rgb = getAverageColour(imgElement);
            const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            imgElement.style.backgroundColor = imgElement.style.borderColor = rgbString;
        }

        // Add Elements to Correct Places
        raceBlock.appendChild(imgElement);
        raceBlock.appendChild(raceTitle);
        container.appendChild(raceBlock);

        // Hide Cards until Fully Loaded & Styled
        imgElement.addEventListener("load", onLoad)
    })
}

const onLoad = function () {
    this.style.display = "inherit";
    this.parentNode.style.display = "inherit";
    this.removeEventListener("load", onLoad);
    imageContainer.style.opacity = 1;
}

const initCards = async () => {
    const raceBlocks = document.querySelectorAll('.race-block');
    for (let i = 0; i < raceBlocks.length; i++) {
        // Set up Card Z-index for overlapping (possibly not necessary in future implementation)
        raceBlocks[i].style.zIndex = raceBlocks.length - i;
        if (i != 0) { raceBlocks[i].style.opacity = 0; }
    }

    // Disable Swap Button if Only 1 Image Available for Race
    if (raceBlocks.length < 2) {
        document.querySelector("#swap_btn").classList.add("disabled")
    }
    else {
        document.querySelector("#swap_btn").classList.remove("disabled")
    }

    await addSwipeListeners(raceBlocks);
}

const addSwipeListeners = async (imageCards) => {
    let initialX = null;
    currentCard = null;

    for (let i = 0; i < imageCards.length; i++) {
        const card = imageCards[i];
        card.addEventListener('mousedown', startSwipe); // click start
        card.addEventListener('touchstart', startSwipe); // touchscreen touch start
    }

    function startSwipe(e) {
        e.preventDefault(); // Prevent default browser behavior (ghost image dragging / text highlighting)

        currentCard = this;
        initialX = e.clientX || e.touches[0].clientX;
        // console.log(`startSwipe initialX: ${initialX}`)
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
        let finalX = e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;
        finalX = finalX || initialX; // null protection

        const diffX = finalX - initialX;

        if (diffX > 75) {
            // Swipe right
            swipeRight();
        } else if (diffX < -75) {
            // Swipe left
            swipeLeft();
        } else {
            currentCard.style.transform = '';
            currentCard = null;
        }
        initialX = null;
    }
}

function disableButtons() {
    const buttons = document.querySelectorAll(".button_set .btn");

    // Disable Buttons
    buttons.forEach(btn => {
        btn.classList.add("disabled")
    })

    // Reenable Buttons
    setTimeout(() => {
        // Skip swap button, since it has more complicated logic for activation
        buttons[0].classList.remove("disabled");
        buttons[2].classList.remove("disabled");
    }, buttonTimeoutDuration)
}


// Button Stuff
function cycle() {
    this.classList.add("disabled")

    const children = imageContainer.childNodes;

    children.forEach(card => {
        // Swap Cards (add animation later)
        const zIndex = parseInt(card.style.zIndex);
        card.style.zIndex = zIndex < children.length ? zIndex + 1 : 1;
        card.style.opacity = card.style.zIndex < children.length ? 0 : 1;
    })

    // Reenable Buttons
    setTimeout(() => {
        this.classList.remove("disabled");
    }, buttonTimeoutDuration)
}

function swipeRight() {
    disableButtons();

    document.querySelectorAll('.race-block').forEach(block => {
        block.style.transform = 'translateX(150%) rotate(10deg)';
        imageContainer.style.opacity = 0;
    })

    // Add Race to 'Win' list
    const winList = document.querySelector("#win_list");
    const raceToAdd = document.createElement('p')
    raceToAdd.classList.add("race-names");
    raceToAdd.textContent = document.querySelector(".race-title").textContent;
    winList.appendChild(raceToAdd);


    setTimeout(() => {
        document.querySelector("#image-container").innerHTML = "";
        currentCard = null;
        raceToAdd.style.opacity = 1;
        doCards();
    }, 300);
}

function swipeLeft() {
    disableButtons();

    document.querySelectorAll('.race-block').forEach(block => {
        block.style.transform = 'translateX(-150%) rotate(-10deg)';
        imageContainer.style.opacity = 0;
    })

    // Add Race to 'Bin' list
    const binList = document.querySelector("#bin_list");
    const raceToAdd = document.createElement('p')
    raceToAdd.classList.add("race-names");
    raceToAdd.textContent = document.querySelector(".race-title").textContent;
    binList.appendChild(raceToAdd);

    setTimeout(() => {
        document.querySelector("#image-container").innerHTML = "";
        currentCard = null;
        raceToAdd.style.opacity = 1;
        doCards();
    }, 300);
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