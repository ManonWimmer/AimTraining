// Manon WIMMER - A1 GR5 IIM
// Bonjour, et bienvenue sur ce site, du troisième module des cours de dev web !
// J'ai essayé de faire un site d'aim training avec 2 jeux différents :
// - un avec toujours un nombre défini de cibles à l'écran : ici 4, et il faut en toucher le plus possible en un temps imparti
// - un non chronométré, mais qui s'arrète lorsque le joueur n'a plus de vie (il perd une vie lorsqu'une cible disparait avant qu'il ait pu la toucher)

// J'ai pensé à une super astuce (d'après moi) pour les cibles :
// Etant donné que j'utilise une grille en flex wrap, si je mets une cible en display : "none", tout se décale
// Du coup j'ai crée une classe desactived ou la cible a la même couleur que le background de la grille pour pas qu'on les voit !
// Et du coup je sais que le joueur a touché une cible si elle est dans la classe cible et activated (donc visible) ! :)

// ----- VARIABLES ----- //
const cursor = document.getElementById("cursor")

// Jeu :
let nbrVies = 3 // MODE AVANCÉ
let nbrClicksReussis = 0
let nbrClicksFails = 0
let nbrCirclesMax = 4 
let nbrCirclesActivated = 0
let gameModeSelected = ""
let timeoutReflexes
let inputTimeBetweenApparition = 450

// Timer :
let startTime = 0
let start = 0
let end = 0
let diff = 0
let timerID = 0

const failSound = new Audio("./sounds/damage.mp3")
failSound.load()

const hitSound = new Audio("./sounds/coin.mp3")
hitSound.load()

const disparitionSound = new Audio ("./sounds/disparition.mp3")
disparitionSound.load()
// ----- VARIABLES ----- //


// ----- CURSOR ----- //
// Event Listener qui écoute les mouvements de souris de la souris pour y mettre le curseur
document.addEventListener("mousemove", (e) => {
    const mousePosX = e.clientX
    const mousePosY = e.clientY
    cursor.style.left = `${mousePosX}px`
    cursor.style.top = `${mousePosY}px`
})
// ----- CURSOR ----- //


// ----- PLAY ----- //
// ----- SPEED / REFLEXES
// Sélection du game mode qui affiche les paramètres modifiables en fonction de celui-ci 
const gameModeSelection = () => {
    gameModeSelected = document.getElementById('gameMode').value;
    if (gameModeSelected === "speed") {
        hideId("gameParametersReflexes")
        showFlex("gameParametersSpeed")
    } else if (gameModeSelected === "reflexes") {
        hideId("gameParametersSpeed")
        showFlex("gameParametersReflexes")
    }
}

// Fonction pour recommencer une partie avec les mêmes paramètres
const restartGameMode = () => {
    gameModeSelected = document.getElementById('gameMode').value;
    if (gameModeSelected === "speed") {
        restart()
    } else if (gameModeSelected === "reflexes") {
        restartReflexes()
    }
}

// Affichage du menu de départ
const menu = () => {
    reinitialisationGrille()
    hideAll()
    showFlex("gameParameters")
    showFlex("titreMenu")
    gameModeSelection()
    showCirclesButton()
}

// Remise des stats du jouer à 0 après une partie
const statsToZero = () => {
    nbrClicksReussis = 0
    nbrClicksFails = 0
    updateTextFails()
    updateTextReussis()
    const textRatio = document.getElementById('ratio')
    textRatio.innerHTML = "Taux de réussite : 100%"
}

// Récupération du nombre de lignes et de colonnes écrits pas l'user
const getGameParameters = () => {
    // changer nbr colonnes, lignes etc 
    nbrLignes = document.getElementById("inputNbrLignes").value
    nbrColonnes = document.getElementById("inputNbrColonnes").value
}

// Récupération du nombre de vie, aussi écrit par l'user
const getNbrVies = () => {
    nbrVies = document.getElementById("inputVies").value
}
// ----- SPEED / REFLEXES

// ----- SPEED
// Fonction qui démarre une partie "Speed" : affichage des stats en direct, génération de la grille et des cibles...
const startGame = () => {
    hideAll()
    statsToZero()
    getGameParameters()
    showFlex("titreMenu")
    showFlex("text")
    hideId("vies")
    showFlex("timer")
    hideId("textTimeout")
    showFlex("grille")
    generateGrille()
    initialisationGrille()
    timerStart()
    updateClicks()
}

// Fonction qui finit une partie "Speed" et affiche les résultats finaux
const endGame = () => {
    stopUpdateClicks()
    hideAll()
    showFlex("titreMenu")
    showFlex("text")
    showFlex("textTimeout")
    hideId("timer")
    showFlex("buttonsEnd")
    showCirclesButton()
}

// Fonction qui recommence une partie "Speed" avec les mêmes paramètres
const restart = () => {
    stopSound()
    statsToZero()
    hideAll()
    getGameParameters()
    hideId("textTimeout")
    showFlex("timer")
    showFlex("text")
    showFlex("grille")
    desactivationGrille()
    showCircles()
    initialisationGrille()
    updateClicks()
    timerStart()
}
// ----- SPEED

// ----- REFLEXES
// Fonction qui démarre une partie "Reflexes" : affichage des stats en direct, génération de la grille et des cibles...
const startGameReflexes = () => {
    hideAll()
    getGameParameters()
    showFlex("titreMenu")
    showFlex("text")
    hideId("timer")
    showFlex("grille")
    generateGrilleReflexes()
    generateCircle()
    getTimeParameters()
    getNbrVies()
    updateClicksReflexes()
    updateTextVies()
}

// Fonction qui finit une partie "Reflexes" et affiche les résultats finaux
const endGameReflexes = () => {
    stopGenerateCircle()
    stopCheckCirclesDisparition()
    stopUpdateClicksReflexes()
    hideAll()
    showFlex("titreMenu")
    showFlex("text")
    showFlex("textTimeout")
    hideId("timer")
    hideId("vies")
    showFlex("buttonsEnd")
    showCirclesButton()
}

// Fonction qui recommence une partie "Reflexes" avec les mêmes paramètres
const restartReflexes = () => {
    stopSound()
    statsToZero()
    hideAll()
    getGameParameters()
    hideId("textTimeout")
    showFlex("text")
    showFlex("grille")
    desactivationGrille()
    showCircles()
    initialisationGrille()
    timerStart()
    updateClicksReflexes()
}

// Fonction qui vérifie, en partie "Reflexes" si le joueur a toujours des vies
const CheckHealth = () => {
    if (nbrVies <= 0) {
        endGameReflexes()
    }
}

// Récupération du temps d'apparition entre chaque cible pour une partie "Reflexes"
const getTimeParameters = () => {
    inputTimeBetweenApparition = document.getElementById("inputTimeBetweenApparition").value
}
// ----- REFLEXES
// ----- PLAY ----- //


// ----- HIDE / SHOW ----- //
// Cacher, donc mettre en display : "none" un objet à partir de son id
const hideId = (objectId) => {
    document.getElementById(objectId).style.display = 'none'       
}

// Cacher toutes les divs de la page
const hideAll = () => {
    const divs = document.getElementsByTagName("div")
    for (let i = 0; i < divs.length; i++) { // forEach ?
        if (divs[i].id != "cursor") {
            divs[i].style.display = 'none' 
        }       
    }
}

// Montrer un objet à partir de son id en changeant sont display en flex
const showFlex = (objectId) => {
    document.getElementById(objectId).style.display = "flex"
}

// Affichage des cibles en "Speed"
const showCircles = () => { 
    const listCirclesDesactivated = getListCirclesDesactivated()
    listCirclesDesactivated.forEach((circleDesactivated) => {
        circleDesactivated.style.display = "block"
    })
}

// Affichage des boutons
const showCirclesButton = () => {
    const listCirclesButton = Array.from(document.getElementsByClassName("circleButton"))
    listCirclesButton.forEach((circleButton) => {
        circleButton.style.display = "block"
    })
}
// ----- HIDE / SHOW ----- //


// ----- GRILLE / CIRCLES ----- //
// ----- SPEED
// Génération de la grille en insérant dans le HTML de la grille une div d'une cible désactivée (background noir pour pas qu'on les voit) en "Speed" suivant le nombre de lignes / colonnes
const generateGrille = () => {
    const grille = document.getElementById("grille")
    const nbrTotalCircles = nbrLignes * nbrColonnes
    
    for (let i = 0; i < nbrTotalCircles; i++) { 
        grille.insertAdjacentHTML("beforeend", 
            `<div class="circle desactivated" id="circle_${i}" ></div>`)
    }

    const flexBasisCircle = (100 / nbrColonnes).toString() // Pour avoir le bon nombre de circle par colonne avec le flex wrap
    const circles = Array.from(document.getElementsByClassName("circle")) 

    circles.forEach((circle) => {
        circle.style.flexBasis = `calc(${flexBasisCircle}% - 15px)` 
    })
}

// On crée les cibles de départ pour le jeu "Speed", à une position aléatoire
const initialisationGrille = () => {
    const nbrCirclesToCreate = nbrCirclesMax
    if (nbrCirclesToCreate > 0) {
        for (let i = 0; i < nbrCirclesToCreate; i++) { 
            const listCirclesDesactivated = getListCirclesDesactivated()
            nbrCirclesDesactivated = listCirclesDesactivated.length
            const randomIndex = Math.floor(Math.random() * nbrCirclesDesactivated)
            const circleToReactivate = listCirclesDesactivated[randomIndex]
            circleToReactivate.className = "circle activated"
        }
    }
}

// On vide complètement la div de la grille
const reinitialisationGrille = () => {
    grille.innerHTML = ''
}

// On désactive toutes les cibles de la grille et on les affiche
const desactivationGrille = () => {
    const listCirclesActivated = getListCirclesActivated()
    listCirclesActivated.forEach((circleActivated) => {
        circleDesactivate(circleActivated.id)
    })

    const listCirclesDesactivated = getListCirclesDesactivated()
    listCirclesDesactivated.forEach((circleDesactivated) => {
        circleDesactivated.style.display = 'block'
    })
}
// ----- SPEED 

// ----- REFLEXES
// On génère la même grille que "Speed" mais avec comme des divs ayant comme class circleReflexes plutot que circle
const generateGrilleReflexes = () => {
    const grille = document.getElementById("grille")
    const nbrTotalCircles = nbrLignes * nbrColonnes
    
    for (let i = 0; i < nbrTotalCircles; i++) { 
        grille.insertAdjacentHTML("beforeend", 
            `<div class="circleReflexes desactivated" id="circle_${i}" ></div>`)
    }

    const flexBasisCircle = (100 / nbrColonnes).toString() 
    const circles = Array.from(document.getElementsByClassName("circleReflexes")) 

    circles.forEach((circle) => {
        circle.style.flexBasis = `calc(${flexBasisCircle}% - 15px)` 
    })
}
// ----- REFLEXES
// ----- GRILLE ----- //

// ----- CIRCLES ----- //
// ----- SPEED 
// Return la liste des circles désactivés (non visibles) en "Speed"
const getListCirclesDesactivated = () => {
    const listCirclesDesactivated = Array.from(document.getElementsByClassName("circle desactivated"))
    return listCirclesDesactivated
}
// Return la liste des circles activés (visibles) en "Speed"
const getListCirclesActivated = () => {
    const listCirclesActivated = Array.from(document.getElementsByClassName("circle activated"))
    return listCirclesActivated
}

// Return le nombre de circles activés (visibles) en "Speed"
const getNumberCirclesActivated = () => {
    const circlesActivated = document.getElementsByClassName("circle activated")
    return circlesActivated.length
}   

// Apparition d'une cible à une position aléatoire dans la liste des cibles désactivés (donc change sa class pour activated) pour le jeu "Speed"
const circleApparition = () => { 
    nbrCirclesActivated = getNumberCirclesActivated()
    const nbrCirclesToCreate = nbrCirclesMax - nbrCirclesActivated + 1 // +1 car on l'appelle avant de faire disparaitre le circle touché

    if (nbrCirclesToCreate > 0) {
        // On crée les cibles manquantes pour qu'il y ait toujours le nombre défini sur la grille
        for (let i = 0; i < nbrCirclesToCreate; i++) {  
            const listCirclesDesactivated = getListCirclesDesactivated()
            nbrCirclesDesactivated = listCirclesDesactivated.length
            const randomIndex = Math.floor(Math.random() * nbrCirclesDesactivated)
            const circleToReactivate = listCirclesDesactivated[randomIndex]
            circleToReactivate.className = "circle activated"
        }
    }
}

// Faire disparaitre le circle touché (changer sa class)
const circleDesactivate = (idCircle) => {
    const circleToDesactivate = document.getElementById(idCircle)
    
    if (circleToDesactivate.className === "circle activated") {
        circleToDesactivate.className = "circle desactivated"
    } 
}
// ----- SPEED 

// ----- REFLEXES
// On écoute si la cible a fini son animation et a donc disparu sans que le joueur la touche -> il perd une vie et elle est désactivée
const checkCirclesDisparition = (circleId) => {
    const circle = document.getElementById(circleId)
    circle.addEventListener("animationend", () => {
        stopSound()
        disparitionSound.play()
        nbrVies -= 1
        updateTextVies()
        CheckHealth()
        circle.className = "circleReflexes desactivated"
    })
}

// Fonction listener de la précédente
const checkCirclesDisparitionListener = (circle) => {
    nbrVies -= 1
    updateTextVies()
    CheckHealth()
    circle.className = "circleReflexes desactivated"
}

// Stop le listener qui check si les animations des cibles à l'écran sont terminées
const stopCheckCirclesDisparition = () => {
    const circles = Array.from(document.getElementsByClassName("circlesReflexes"))
    circles.forEach((circle) => {removeEventListener("animationend", checkCirclesDisparitionListener(circle))})
}

// Génération d'une cible à une position aléatoire pour le jeu "Reflexes"
const generateCircle = () => {
    const listCirclesDesactivated = Array.from(document.getElementsByClassName("circleReflexes desactivated"))
    const nbrCirclesDesactivated = listCirclesDesactivated.length
    const randomIndex = Math.floor(Math.random() * nbrCirclesDesactivated)
    const circleToReactivate = listCirclesDesactivated[randomIndex]
    circleToReactivate.className = "circleReflexes activatedReflexes"
    checkCirclesDisparition(circleToReactivate.id)
    timeoutReflexes = setTimeout(generateCircle, inputTimeBetweenApparition)
}

// Désactivation d'une cible pour le jeu "Reflexes"
const circleDesactivateReflexes = (idCircle) => {
    const circleToDesactivate = document.getElementById(idCircle)
    
    if (circleToDesactivate.className === "circleReflexes activatedReflexes") {
        circleToDesactivate.className = "circleReflexes desactivated"
    } 
}

// Clear Timeout de la fonction qui gènère des cibles pour le jeu "Reflexes"
const stopGenerateCircle = () => {
    clearTimeout(timeoutReflexes)
}
// ----- REFLEXES
// ----- CIRCLES ----- //


// ----- TIMER ----- //
// Fonction qui chronomètre
const timer = () => {
	end = new Date()
	diff = end - start
	diff = new Date(diff)

	let msec = diff.getMilliseconds()
	let sec = diff.getSeconds()
	let min = diff.getMinutes()
    const timerEnd = nbrLignes = document.getElementById("inputTimer").value;

    // On rajoute des 0 si besoin pour que ce soit bien sous la forme XX:XX:XXX
	if (min < 10){
		min = "0" + min
	}
	if (sec < 10){
		sec = "0" + sec
	}
	if (msec < 10){
		msec = "00" +msec
	}
	else if (msec < 100){
		msec = "0" + msec
	}

	document.getElementById("timer").innerHTML = `Timer : ${min}:${sec}:${msec}`
    timerID = setTimeout("timer()", 1) 
    checkTimer(timerEnd, timerID)
}

// Fonction qui démarre de chronomètre
const timerStart = () => {
	start = new Date()
	timer()
}

// Fonction qui check si le temps de la partie est finie ou pas en jeu "Speed"
const checkTimer = (timerEnd) => {
    const timerNow = document.getElementById("timer").innerHTML

    // ON SLICE "TIMER : XX:XX:XX" POUR AVOIR MIN / SEC / MILLISEC AVEC TIMER NOW
    // ON SLICE "XX:XX:XX" POUR AVOIR MIN / SEC / MILLISEC AVEC TIMER END

    const timerNowMinutes = parseInt(timerNow.slice(8, 10))
    const timerEndMinutes = parseInt(timerEnd.slice(0, 2))
    
    const timerNowSeconds = parseInt(timerNow.slice(11, 13))
    const timerEndSeconds = parseInt(timerEnd.slice(3, 5))

    const timerNowMilliseconds = parseInt(timerNow.slice(14, 16))
    const timerEndMilliseconds = parseInt(timerEnd.slice(6, 9))

    if (timerNowMinutes >= timerEndMinutes && timerNowSeconds >= timerEndSeconds && timerNowMilliseconds >= timerEndMilliseconds) {
        clearTimeout(timerID)
        endGame()
    }
}
// ----- TIMER ----- //


// ----- CLICKS ----- //
// ----- SPEED
// Update Clicks en "Speed"
const updateClicks = (event) => {
    grille.addEventListener("click", updateClicksListener)
}

// Update Clicks Listener qui agit différent si une cible a été touchée ou non
const updateClicksListener = (event) => {
    if (event.target.className === "circle activated") {
        stopSound()
        hitSound.play()
        nbrClicksReussis += 1
        circleApparition() // On en fait apparaitre une autre avant de la faire disparaitre pour pas qu'elle puissent réappparaitre au même endroit
        circleDesactivate(event.target.id)
        updateTextReussis()
        updateRatio()
    } else {
        stopSound()
        failSound.play()
        nbrClicksFails += 1
        updateTextFails()
        updateRatio()
    }
}

// On arrete de check si le joueur a cliqué sur une cible
const stopUpdateClicks = () => {
    grille.removeEventListener("click", updateClicksListener)
}
// ----- SPEED

// ----- REFLEXES
// Update Clicks en "Reflexes"
const updateClicksReflexes = (event) => {
    grille.addEventListener("click", updateClicksListenerReflexes)
}

// Update Clicks Listener qui agit différent si une cible a été touchée ou non
const updateClicksListenerReflexes = (event) => {
    if (event.target.className === "circleReflexes activatedReflexes") {
        stopSound()
        hitSound.play()
        nbrClicksReussis += 1
        circleDesactivateReflexes(event.target.id)
        updateTextReussis()
        updateRatio()
    } else {
        stopSound()
        failSound.play()
        nbrClicksFails += 1
        updateTextFails()
        updateRatio()
    }
}

// On arrete de check si le joueur a cliqué sur une cible
const stopUpdateClicksReflexes = () => {
    grille.removeEventListener("click", updateClicksListenerReflexes)
}
// ----- REFLEXES
// ----- CLICKS ----- //


// ----- SOUNDS ----- //
// On arrete tous les sons en cours
const stopSound = () => {
    hitSound.pause()
    failSound.pause()
    disparitionSound.pause()

    failSound.load()
    hitSound.load()
    disparitionSound.load()
}
// ----- SOUNDS ----- //


// ----- UPDATE TEXTS ----- //
const updateTextReussis = () => {
    let textReussis = document.getElementById('clickReussis')
    textReussis.innerHTML = `Nombres de clics réussis : ${nbrClicksReussis}`
}

const updateTextFails = () => {
    let textFails = document.getElementById('clickFails')
    textFails.innerHTML = `Nombres de clics fails : ${nbrClicksFails}`
}

const updateRatio = () => {
    let textRatio = document.getElementById('ratio')
    const totalClicks = nbrClicksReussis + nbrClicksFails
    const ratio = ((nbrClicksReussis / totalClicks) * 100).toFixed(2)
    textRatio.innerHTML = `Taux de réussite : ${ratio}%`
}

const updateTextVies = () => {
    let textVies = document.getElementById('vies')
    textVies.innerHTML = `Vies restantes : ${nbrVies}`
}
// ----- UPDATE TEXTS ----- //


