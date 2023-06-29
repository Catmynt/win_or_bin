const imageContainer = document.querySelector('#image-container');

let raceData, raceNames;

const init = async () => {
    // Fetch Data
    raceData = await getRaceData();
    raceNames = Object.keys(raceData).sort();

    // Populate the Image-Container with First Race's Cards
    await populateCards(raceNames[0]);

    // Add Swipe Functionality to Cards
    await initCards();

    // Win Button

    // Bin Button

    // Swap Button
    const switch_btn = document.querySelector("#swap_btn");
    switch_btn.addEventListener("click", cycle);

    console.log("Setup should be complete");
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

    let content = ""
    imgs.forEach(img => content += `<img src="races_pics/${raceName}/${img}" class="image-card">`)

    container.setHTML(content);
}

const initCards = async () => {
    const imageCards = document.querySelectorAll('.image-card');
    for (let i = 0; i < imageCards.length; i++) {
        // Set up Card Z-index for overlapping (possibly not necessary in future implementation)
        imageCards[i].style.zIndex = imageCards.length - i;
        imageCards[i].style.opacity = 100 / imageCards[i].style.zIndex;
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
                card.style.opacity = '0';
            })

            setTimeout(() => {
                currentCard.parentNode.setHTML("");
                currentCard = null;
            }, 300);
        } else if (diffX < -75) {
            // Swipe left
            imageCards.forEach(card => {
                card.style.transform = 'translateX(-150%) rotate(-10deg)';
                card.style.opacity = '0';
            })

            setTimeout(() => {
                currentCard.parentNode.setHTML("");
                currentCard = null;
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

    const container = document.querySelector("#image-container")

    container.childNodes.forEach(card => {
        // Swap Cards (add animation later)
        const zIndex = card.style.zIndex;
        card.style.zIndex = zIndex > 1 ? zIndex - 1 : container.childNodes.length;
        card.style.opacity = 100 / card.style.zIndex;
    })

    // Reenable Button After Swap
    setTimeout(() => {
        this.classList.remove("disabled");

    }, 1000)
}




// End of Functions

init();