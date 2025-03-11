//I dont remember why this is here but removing it breaks stuff
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    createHearts()

    document.getElementById('extraLink02').addEventListener('click', () => {
        window.open('spin.html')
    })

    document.getElementById("extraLink03").addEventListener("click", () => {
      window.open("patches.html");
    });

    document.querySelectorAll('button').forEach((z) => {
        z.addEventListener('focus', () => {
            audioClone = new Audio(buttonClicked.src);
            audioClone.volume = 0.4
            audioClone.play();
        })

        z.addEventListener("mouseover", () => {
            selecor = Math.floor(Math.random() * 6)

            switch (selecor) {
              case 0:
              case 3:
              case 4:
                audioClone = new Audio(buttonHover01.src);
                break;
              case 1:
              case 5:
                audioClone = new Audio(buttonHover02.src);
                break;
              case 2:
                audioClone = new Audio(buttonHover03.src);
                break;
            }

            audioClone.volume = 0.5
            audioClone.play()
        });
    })
});

const buttonHover01 = new Audio('aud/waves.mp3')
const buttonHover02 = new Audio("aud/waves2.mp3");
const buttonHover03 = new Audio("aud/waves3.mp3");
const buttonClicked = new Audio("aud/buttonClicked.mp3");

const bgm01 = new Audio("aud/bgm1.mp3");

let heartBuilder;
function createHearts() {
    spawnHeart()
    let heartLimit = 0
    heartBuilder = setInterval(() => {
        heartLimit++
        spawnHeart()
        if (heartLimit > 5) {
            clearInterval(heartBuilder)
        }
    }, 5000);
}

function spawnHeart() {
    let heart = document.createElement('div')
    heart.classList.add('heartEffect')
    heart.innerHTML = '❤️'
    heart.style.fontSize = Math.floor(Math.random() * 60) + 20 + 'px'
    heart.style.left = Math.floor(Math.random() * 680) + 'px'
    document.getElementById('Home').appendChild(heart)
}

//Change pages
function changePage(element) {
    let pageElement;
    document.querySelectorAll('.page').forEach((page) => {
        if (page.id != element.innerHTML) {
           page.classList.add('hidden')
       } else {
           page.classList.remove('hidden')
       };
       pageElement = element.innerHTML
    });

    if (pageElement == 'Home') {
        createHearts()
    } else {
        clearInterval(heartBuilder)
        document.querySelectorAll('.heartEffect').forEach((heart) => {
            heart.remove()
        })
    }

    if (expanded == true) {
        xExpand = 1260
        expandedInterval = setInterval(() => {
            xExpand = xExpand - 20
            window.resizeTo(xExpand, 800)
            if (xExpand <= 800) { clearInterval(expandedInterval) }
        }, 1)
        expanded = false;
    }
};

function changeSubpage(element) {
    document.querySelectorAll('.subPage').forEach((page) => {
        if (page.id != element.innerHTML) {
            page.classList.add('hidden')
        } else {
            page.classList.remove('hidden')
        };
    });
};

let expanded = false;
let expandedInterval;
function changeWindowSize() {
    xExpand = 700

    expandedInterval = setInterval(() => {
        xExpand = xExpand + 20
        window.resizeTo(xExpand, 800)
        if (xExpand >= 1250) { clearInterval(expandedInterval)}
    }, 1)

    //window.resizeTo(1250, 800)
    expanded = true;
}