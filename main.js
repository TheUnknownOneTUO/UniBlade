// Function to make the browser go into full screen
function goFullScreen() {
  var element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) { // For Firefox
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) { // For Chrome, Safari and Opera
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // For IE/Edge
    element.msRequestFullscreen();
  }

  requestLandscapeOrientation()
}

// Function to request landscape orientation
function requestLandscapeOrientation() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape');
  } else if (screen.lockOrientation) {
    screen.lockOrientation('landscape');
  } else if (screen.mozLockOrientation) { // For Firefox
    screen.mozLockOrientation('landscape');
  } else if (screen.msLockOrientation) { // For IE/Edge
    screen.msLockOrientation('landscape');
  }
  
}

let innerWidth = 0
let innerHeight = 0

const CANVAS = document.getElementById('mainCanvas')
const CTX = CANVAS.getContext('2d')

let CANVAS_WIDTH;
let CANVAS_HEIGHT;

//temp/////////

const mainMenu = document.getElementById('mainMenu')
const gameOverScreen = document.getElementById('gameOverScreen')
const gameModeScreen = document.getElementById('gameModeScreen')

const scorePrompt = document.getElementById('scorePrompt')
const playAgainBtn = document.getElementById('playAgainBtn')

const fullscreenBtn = document.getElementById('fullscreenBtn')
const playBtn = document.getElementById('playBtn')
const survivalModeBtn = document.getElementById('survivalModeBtn')
const fatalModeBtn = document.getElementById('fatalModeBtn')

fullscreenBtn.addEventListener('click', () => {
  
  goFullScreen()
  playBtn.style.display = 'block'
  fullscreenBtn.style.display = 'none'
  
})

playBtn.addEventListener('click', () => {
  
  mainMenu.style.display = 'none'
  gameModeScreen.style.display = 'flex'
  
})

survivalModeBtn.addEventListener('click', () => {
  
  GAME_MODE = 'SURVIVAL'
  gameModeScreen.style.display = 'none'
  setUpCanvas()
  
})

fatalModeBtn.addEventListener('click', () => {
  
  GAME_MODE = 'FATAL'
  gameModeScreen.style.display = 'none'
  setUpCanvas()
  
})

playAgainBtn.addEventListener('click', () => {
  
  gameOverScreen.style.display = 'none'
  player.health = 3000
  player.x = CANVAS_WIDTH / 2
  player.y = CANVAS_HEIGHT / 2
  player.centerX = (CANVAS_WIDTH / 2) + 16
  player.centerY = (CANVAS_HEIGHT / 2) + 16
  
  displayedHealthUi = 3000
  player.score = 0
  Object.keys(player.kills).forEach(enemy => {
    
    player.kills[enemy] = 0
    
  })
  
  enemiesArray = []
  rangedAttackArray = []
  projectileArray = []
  oneShotParticlesArray = []
  
  GAME_STATE = 'default'
  
  mainMenu.style.display = 'flex'
  
})

function setUpCanvas() {
  
  innerWidth = window.innerWidth
  innerHeight = window.innerHeight
  
  CANVAS_WIDTH = CANVAS.width = Math.floor(innerWidth / 32) * 32
  CANVAS_HEIGHT = CANVAS.height = Math.floor(innerHeight / 32) * 32
  
  //so the pixel art don't look blurry
  CTX.imageSmoothingEnabled = false
  
  //initialize player position
  
  player.x = CANVAS_WIDTH / 2,
  player.y = CANVAS_HEIGHT / 2,
  player.centerX = (CANVAS_WIDTH / 2) + 16,
  player.centerY = (CANVAS_HEIGHT / 2) + 16,
  
  //start game loop
  loopGame()
  
}

///////////////////////

CANVAS.addEventListener('touchstart', (event) => {

  event.preventDefault()

})

//for animation variables

let lastTime = 0
const maxFPS = 60

//supposedly 1000/maxFPS, however, I rounded it down to 16 to avoid frame skipping
let frameTime = 16

//START OF LOGIC

//initiate player stats and info
let player = {

  health: 3000,
  stamina: 500,
  level: 1,
  experience: 0,
  score: 0,
  kills: {
    
    neophyte : 0,
    spellCaster : 0,
    derangedSacrifice : 0
    
  },

  mode: 'melee',
  invulnerable: false,

  //time between fires
  rangedCd: 10,
  //capacity before reloading
  rangedCap: 1,
  //hoelw many ranged attacks are deployed
  rangedCount: 0,
  //time between reload
  rangedReloaded: true,

  width: 16,
  height: 16,
  x: 0,
  y: 0, 
  centerX: 16,
  centerY: 16,
  xVel: 0,
  yVel: 0,
  velMult: 1,
  maxSpeed: 0.80,

  ////////
  sprite: {

    walk: new Image(),

    width: 16,
    height: 16,
    frameX: 0,
    frameY: 4,
    currFrame: 0,
    maxFrame: 4,
    frameCount: 0
  }

}

player.sprite.walk.src = 'assets/characterSprites/mainChar_walk.png'

//stats display
let displayedHealthUi = player.health


function updPlayerStatsUi() {

  if (player.health < displayedHealthUi) {

    //decrement by 10
    displayedHealthUi -= 5

    //check if it is lower than actual health
    if (displayedHealthUi < player.health) {

      displayedHealthUi = player.health

    }

  }
  
  //if healing 
  
  else if (player.health > displayedHealthUi) {

    //decrement by 10
    displayedHealthUi += 5

    //check if it is lower than actual health
    if (displayedHealthUi > player.health) {

      displayedHealthUi = player.health

    }

  }
  
  //check if health goes negative
  
  if (player.health < 0) {
    
    player.health = 0
    
  }
  
  if (displayedHealthUi < 0) {
    
    displayedHealthUi = 0
    
  }
  
  if (GAME_MODE === 'FATAL' && player.health < 3000) {
    
    displayedHealthUi = 0
    player.health = 0
    
  }
  
  //initiate game over
  
  if (displayedHealthUi === 0 && player.health === 0) {
    
    GAME_STATE = 'Game Over'
    scorePrompt.innerHTML = 
    `
    <strong>${GAME_MODE}</strong> <br>
    Score: ${player.score} <br>
    Kills: <br>
    Neophyte: ${player.kills.neophyte} <br>
    Spell Caster: ${player.kills.spellCaster} <br>
    Deranged Sacrifice: ${player.kills.derangedSacrifice}`
    gameOverScreen.style.display = 'flex'
    
  }

}

function drawPlayerStats() {

  const healthBarWidth = CANVAS_WIDTH * 0.3
  const healthBarHeight = 30

  CTX.fillStyle = 'rgba(255, 255, 255, 0.4)'
  CTX.fillRect(10, 10, healthBarWidth, healthBarHeight)

  //temp: 3000 is player max health
  const healthPercent = displayedHealthUi / 3000

  const actualBarWidth = healthBarWidth * healthPercent
  CTX.fillStyle = 'rgba(255, 0, 0, 0.4)'
  CTX.fillRect(10, 10, actualBarWidth, healthBarHeight)

}

const debug = document.getElementById('debug')

let GAME_STATE = 'Default'
let GAME_MODE = null

function loopGame(timestamp) {
  
  if (GAME_STATE === 'Game Over') {
    
    return
    
  }
  
  let elapsed = timestamp - lastTime;

  if (elapsed >= frameTime) {

    lastTime = timestamp

    //update game logic

    updateMainChar();
    updPlayerStatsUi();
    mainCharOrientation();
    enemyStateHandler();
    moveProjectile();
    moveRanged();
    oneShotParticlesAnim()

    //update game graphics

    CTX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    CTX.fillStyle = 'dimgray'
    CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    drawJoystick()

    if ((knobAngle2 >= 0 && knobAngle2 < 90) || knobAngle2 > 270) {

      drawSemiCircle()
      drawMainChar()

    }

    else {

      drawMainChar();
      drawSemiCircle();

    }

    drawEnemies()
    drawProjectiles()
    drawRangedAttacks()

    drawOneShotParticles()

    drawPlayerStats()

    spawnEnemies()


    /*
    //temp
    CTX.fillStyle = 'rgba(255, 0, 0, 0.3)'
    CTX.fillRect(enemiesArray[0].trueX, enemiesArray[0].trueY, 5, 5)*/

    damagedVisual()
    
    debug.innerHTML = `${player.score}`


  };

  requestAnimationFrame(loopGame)

}

//loopGame()

//////////////////////////////////
//FOR CHARACTER SPRITE  vvvvv
/////////////////////////////////

const meleeAttackSpriteSheet = new Image()
meleeAttackSpriteSheet.src = 'assets/bladeSprites/meleeSwing_Base.png'

function updateMainChar() {

  if (isJoystickBeingUsed) {
    //for player movement
    player.x = player.x + 1 * player.xVel * player.velMult * player.maxSpeed
    player.y = player.y + 1 * player.yVel * player.velMult * player.maxSpeed

    //to upd player center x and y
    player.centerX = player.x + 16 //half of rendered sprite
    player.centerY = player.y + 16

  }

  else if (!isJoystickBeingUsed) {

    return

  }

  const sprite = player.sprite;

  if (sprite.frameCount < 10) {

    sprite.frameCount++

  }

  if (sprite.frameCount === 10) {

    if (sprite.currFrame < 3) {

      sprite.currFrame++;

      sprite.frameX = sprite.currFrame;

    }

    else if (sprite.currFrame === 3) {

      sprite.currFrame = 0;

      sprite.frameX = sprite.currFrame;

    }

    sprite.frameCount = 0

  }

}

function mainCharOrientation() {

  const sprite = player.sprite

  if (isJoystickBeingUsed && !isJoystick2BeingUsed) {

    if (knobAngle >= 0 && knobAngle <= 22.5) {

      //north
      sprite.frameY = 0

    }

    else if (knobAngle > 22.5 && knobAngle < 67.5) {

      //north east
      sprite.frameY = 1

    }

    else if (knobAngle > 67.5 && knobAngle < 112.5) {

      //east
      sprite.frameY = 2

    }

    else if (knobAngle > 112.5 && knobAngle < 157.5) {

      //southeast
      sprite.frameY = 3

    }

    else if (knobAngle > 157.5 && knobAngle < 202.5) {

      //south
      sprite.frameY = 4

    }

    else if (knobAngle > 202.5 && knobAngle < 247.5) {

      //southwest
      sprite.frameY = 5

    }

    else if (knobAngle > 247.5 && knobAngle < 292.5) {

      //west
      sprite.frameY = 6

    }

    else if (knobAngle > 292.5 && knobAngle < 337.5) {

      //northwest
      sprite.frameY = 7

    }

    else if (knobAngle > 337.5 && knobAngle < 360) {

      //north
      sprite.frameY = 0

    }

  }

  //////////////////

  else {

    if (knobAngle2 >= 0 && knobAngle2 <= 22.5) {

      //north
      sprite.frameY = 0

    }

    else if (knobAngle2 > 22.5 && knobAngle2 < 67.5) {

      //north east
      sprite.frameY = 1

    }

    else if (knobAngle2 > 67.5 && knobAngle2 < 112.5) {

      //east
      sprite.frameY = 2

    }

    else if (knobAngle2 > 112.5 && knobAngle2 < 157.5) {

      //southeast
      sprite.frameY = 3

    }

    else if (knobAngle2 > 157.5 && knobAngle2 < 202.5) {

      //south
      sprite.frameY = 4

    }

    else if (knobAngle2 > 202.5 && knobAngle2 < 247.5) {

      //southwest
      sprite.frameY = 5

    }

    else if (knobAngle2 > 247.5 && knobAngle2 < 292.5) {

      //west
      sprite.frameY = 6

    }

    else if (knobAngle2 > 292.5 && knobAngle2 < 337.5) {

      //northwest
      sprite.frameY = 7

    }

    else if (knobAngle2 > 337.5 && knobAngle2 < 360) {

      //north
      sprite.frameY = 0

    }

  }

}


function drawMainChar() {

  if (player.mode === 'ranged') {
    //to get the reciprocal of knobAngle2
    let angle;

    angle = calculateAngle(knobX2, knobY2)
    angle = angle * -1
    angle += 360

    //temp: it's so confusing why it needs negative 64
    const vector = calculateVectorPos(angle, player.centerX, player.centerY, -64)

    //draw vector line

    CTX.beginPath()
    CTX.moveTo(player.centerX, player.centerY)
    CTX.lineTo(vector.vX, vector.vY)
    CTX.strokeStyle = 'lightblue'
    CTX.stroke()
    CTX.strokeStyle = 'black'

  }

  //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

  CTX.drawImage(
    //image src
    player.sprite.walk,
    //X frame pos + padding offset
    (player.sprite.frameX * 16) + player.sprite.frameX, //Y frame pos + padding offset
    (player.sprite.frameY * 16) + player.sprite.frameY, //X frame width
    player.sprite.width,
    //Y frame height
    player.sprite.height,
    //X canvas pos
    player.x,
    //Y canvas pos
    player.y,
    //X scale factor
    32,
    //Y scale factor
    32
  )

}

//////////////////////////////////
//FOR CHARACTER SPRITE   ^^^^^
/////////////////////////////////

//temp: unused
function drawSquare() {

  CTX.fillStyle = 'rgba(255, 0, 0, 0.5)'
  CTX.fillRect(player.x, player.y, 32, 32)

}

const dashBtn = document.getElementById('dashBtn')
const attackModeSwitchBtn = document.getElementById('attackModeSwitchBtn')

dashBtn.addEventListener('touchstart', () => {

  player.velMult = 5;
  setTimeout(() => {

    player.velMult = 1

  }, 70)

})

attackModeSwitchBtn.addEventListener('touchstart', () => {

  if (player.mode === 'melee') {

    player.mode = 'ranged'

  }

  else if (player.mode === 'ranged') {

    player.mode = 'melee'

  }

})

function move(x, y) {
  //to test speed
  const n = 2

  //divide by joystickBaseRadius (100) so that when knob value is 100(max) as well, it will equal to 1

  if (x > 0) {
    //limit joystick value
    if (x > joystickBaseRadius) {
      x = joystickBaseRadius
    }

    player.xVel = (x / joystickBaseRadius) * n
    //+
  }

  else if (x < 0) {
    //limit joystick value
    if (x < joystickBaseRadius * -1) {
      x = joystickBaseRadius * -1
    }

    player.xVel = (x / joystickBaseRadius) * n
    //-
  }

  if (y > 0) {
    //limit joystick value
    if (y > joystickBaseRadius) {
      y = joystickBaseRadius
    }

    player.yVel = (y / joystickBaseRadius) * -n
    //-
  }

  else if (y < 0) {
    //limit joystick value
    if (y < joystickBaseRadius * -1) {
      y = joystickBaseRadius * -1
    }

    player.yVel = (y / joystickBaseRadius) * -n
    //+
  }

}

let isJoystickBeingUsed = false
let isJoystick2BeingUsed = false
//150, 150
const joystickCanvasWidth = 100
const joystickCanvasHeight = 100
//75, 75, 30
const jsUiCenter = 100 / 2
const joystickBaseRadius = 100 / 2
const joystickKnobRadius = 25

//for joystick 1
const UI_CANVAS = document.getElementById('uiCanvas')
const UI_CTX = UI_CANVAS.getContext('2d')
UI_CANVAS.width = joystickCanvasWidth
UI_CANVAS.height = joystickCanvasHeight

//for joystick 2
const UI_CANVAS2 = document.getElementById('uiCanvas2')
const UI_CTX2 = UI_CANVAS2.getContext('2d')
UI_CANVAS2.width = joystickCanvasWidth
UI_CANVAS2.height = joystickCanvasHeight

//coordinates for touch location taken into account the position of UI CANVAS
let jsXTouch = jsUiCenter
let jsYTouch = jsUiCenter

let jsXTouch2 = jsUiCenter
let jsYTouch2 = jsUiCenter

//for knob position relative to js base center as 0
let jsBaseCenterX;
let jsBaseCenterY;
let knobX;
let knobY;
let knobAngle;
let knobDistance;

let jsBaseCenterX2;
let jsBaseCenterY2;
let knobX2;
let knobY2;
let knobAngle2;
let knobDistance2;

function knobPosition(canvas) {

  if (canvas === UI_CANVAS) {

    const touch = event.targetTouches[0];
    const rect = canvas.getBoundingClientRect()

    //subtract because clientXY is viewport coords
    jsXTouch = touch.clientX - rect.left;
    jsYTouch = touch.clientY - rect.top;

    jsBaseCenterX = rect.left + jsUiCenter;
    jsBaseCenterY = rect.top + jsUiCenter;
    knobX = touch.clientX - jsBaseCenterX;
    knobY = jsBaseCenterY - touch.clientY;

  }

  else if (canvas === UI_CANVAS2) {

    const touch = event.targetTouches[0];
    const rect = canvas.getBoundingClientRect()

    //subtract because clientXY is viewport coords
    jsXTouch2 = touch.clientX - rect.left;
    jsYTouch2 = touch.clientY - rect.top;

    jsBaseCenterX2 = rect.left + jsUiCenter;
    jsBaseCenterY2 = rect.top + jsUiCenter;
    knobX2 = touch.clientX - jsBaseCenterX2;
    knobY2 = jsBaseCenterY2 - touch.clientY;

  }

}

//function to calculate angle based on quadrants and coords

function calculateAngle(givenX, givenY) {

  let angle;

  if (givenX > 0 && givenY > 0) {

    angle = Math.atan(givenX / givenY) * (180 / Math.PI)

  }

  else if (givenX > 0 && givenY < 0) {

    angle = (Math.atan(Math.abs(givenY) / Math.abs(givenX)) * (180 / Math.PI)) + 90

  }

  else if (givenX < 0 && givenY < 0) {

    angle = (Math.atan(Math.abs(givenX) / Math.abs(givenY)) * (180 / Math.PI)) + 180

  }

  else if (givenX < 0 && givenY > 0) {

    angle = (Math.atan(Math.abs(givenY) / Math.abs(givenX)) * (180 / Math.PI)) + 270

  }

  //FOR CARDINAL DIRECTIONS


  else if (givenX === 0 && givenY > 0) {

    angle = 0

  }

  else if (givenY === 0 && givenX > 0) {

    angle = 90

  }

  else if (givenX === 0 && givenY < 0) {

    angle = 180

  }

  else if (givenY === 0 && givenX < 0) {

    angle = 270

  }

  return angle

}

//function to calculate absolute distance

function calculateDistance(x1, y1, x2, y2) {

  const xDist = Math.abs(x1 - x2);
  const yDist = Math.abs(y1 - y2);

  const totalDistance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))

  return totalDistance

}



function calculateKnobDistance(x, y) {

  //Formula: d² = x² + y²

  const dSquared = Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2);

  const distance = Math.sqrt(dSquared);

  return distance

}

/////////

function drawJoystick() {

  UI_CTX.clearRect(0, 0, joystickCanvasWidth, joystickCanvasHeight)

  //for joystick Base
  UI_CTX.fillStyle = 'rgba(200, 200, 200, 0.2)'

  UI_CTX.beginPath()
  UI_CTX.arc(jsUiCenter, jsUiCenter, joystickBaseRadius, 0, 2 * Math.PI)
  UI_CTX.fill()

  //for joystick knob
  UI_CTX.fillStyle = 'rgba(150, 150, 150, 0.2)'

  UI_CTX.beginPath()
  UI_CTX.arc(jsXTouch, jsYTouch, joystickKnobRadius, 0, 2 * Math.PI)
  UI_CTX.fill()

  /////////////////////
  //FOR SECOND JOYSTICK
  /////////////////////

  UI_CTX2.clearRect(0, 0, joystickCanvasWidth, joystickCanvasHeight)

  //for joystick Base
  UI_CTX2.fillStyle = 'rgba(200, 200, 200, 0.2)'

  UI_CTX2.beginPath()
  UI_CTX2.arc(jsUiCenter, jsUiCenter, joystickBaseRadius, 0, 2 * Math.PI)
  UI_CTX2.fill()

  //for joystick knob
  UI_CTX2.fillStyle = 'rgba(150, 150, 150, 0.2)'

  UI_CTX2.beginPath()
  UI_CTX2.arc(jsXTouch2, jsYTouch2, joystickKnobRadius, 0, 2 * Math.PI)
  UI_CTX2.fill()

}

///////////////////////////////////////
//EVENT LISTENERS FOR JOYSTICK   vvvvv
//////////////////////////////////////

UI_CANVAS.addEventListener('touchstart', (event) => {

  event.preventDefault()
  isJoystickBeingUsed = true;

  knobPosition(UI_CANVAS)
  knobAngle = calculateAngle(knobX, knobY)
  knobDistance = calculateKnobDistance(knobX, knobY)

  //for movement
  move(knobX, knobY)

})

UI_CANVAS.addEventListener('touchmove', (event) => {

  knobPosition(UI_CANVAS)
  knobAngle = calculateAngle(knobX, knobY)
  knobDistance = calculateKnobDistance(knobX, knobY)


  //for movement
  move(knobX, knobY)

})

UI_CANVAS.addEventListener('touchend', (event) => {

  jsXTouch = jsUiCenter
  jsYTouch = jsUiCenter

  knobX = 0;
  knobY = 0;
  knobDistance = 0;

  isJoystickBeingUsed = false

})

/////////////////////
//FOR SECOND JOYSTICK
/////////////////////

UI_CANVAS2.addEventListener('touchstart', (event) => {

  event.preventDefault()
  isJoystick2BeingUsed = true;

  knobPosition(UI_CANVAS2)
  knobAngle2 = calculateAngle(knobX2, knobY2)
  knobDistance2 = calculateKnobDistance(knobX2, knobY2)

})

UI_CANVAS2.addEventListener('touchmove', (event) => {

  knobPosition(UI_CANVAS2)
  knobAngle2 = calculateAngle(knobX2, knobY2)
  knobDistance2 = calculateKnobDistance(knobX2, knobY2)

  if (player.mode === 'ranged') {

    rangedAttack()

  }

})

UI_CANVAS2.addEventListener('touchend', (event) => {

  jsXTouch2 = jsUiCenter
  jsYTouch2 = jsUiCenter

  if (player.mode === 'melee') {

    meleeAttack()

  }

  else if (player.mode === 'ranged') {

    rangedAttack()

  }

  //to reset knob calcs

  knobX2 = 0;
  knobY2 = 0;
  knobDistance2 = 0;



  isJoystick2BeingUsed = false

})

///////////////////////////////////////
//EVENT LISTENERS FOR JOYSTICK   ^^^^^
//////////////////////////////////////

//////////////////////////
//Particles
/////////////////////////



let oneShotParticlesArray = []
let loopedParticlesArray = []

class Particles {
  constructor(name, type, width, height, id, sprite) {

    this.name = name
    //one-shot or looping
    this.type = type
    this.width = width
    this.height = height
    this.id = id
    this.sprite = sprite
    this.isStatic = null

    this.xPos = null
    this.yPos = null
    this.xFrame = 0
    this.yFrame = 0
    this.maxFrame = 0
    this.frameCount = 0

  }

}

let currentUniqueId = 0

class Blood extends Particles {
  constructor() {

    super('Blood Fx', 'one-shot', 32, 32, currentUniqueId, bloodFxSprite)
    this.animationDone = false
    this.maxFrame = 8
    this.isStatic = false

  }

}

class DeathPoofFx extends Particles {
  constructor() {
    
    super('Death Poof Fx', 'one-shot', 32, 32, null, deathPoofFxSprite)
    this.animationDone = false
    this.maxFrame = 14
    this.isStatic = true
    
  }
  
  
}

const bloodFxSprite = new Image()
bloodFxSprite.src = 'assets/particlesSprites/blood vfx.png'

const deathPoofFxSprite = new Image()
deathPoofFxSprite.src = 'assets/particlesSprites/deathPoof.png'

function spawnParticles(name, i, xPos, yPos) {

  if (name === 'Blood Fx') {
    //increment the unique id variable
    currentUniqueId++

    //assign id 
    const newParticles = new Blood()
    newParticles.id = currentUniqueId
    //assign same id
    enemiesArray[i].particleId = newParticles.id

    oneShotParticlesArray.push(newParticles)

  }
  
  else if (name === 'Death Poof Fx') {
    
    const newParticles = new DeathPoofFx()
    newParticles.xPos = xPos
    newParticles.yPos = yPos
    
    oneShotParticlesArray.push(newParticles)
    
  }

}

let didMelee = false;

let meleeCenterAttackX;
let meleeCenterAttackY;
let meleeCenterAngle;
let meleeStartAngle;
let meleeEndAngle;

let radCenter;
let radStart;
let radEnd;

//temp
let meleeFrame = 0


function meleeAttack() {

  if (!didMelee) {

    if (knobDistance2 >= joystickBaseRadius) {

      meleeCenterAngle = knobAngle2;

      //convert center angle to radians

      let shiftedAngle = meleeCenterAngle - 90
      if (shiftedAngle < 0) {
        shiftedAngle = 360 + shiftedAngle
      }

      radCenter = (shiftedAngle * Math.PI) / 180;

      //get the start angle and end angle in rad

      radStart = radCenter - (Math.PI / 2);
      radEnd = radCenter + (Math.PI / 2);

      //convert radStart and radEnd to degrees

      meleeStartAngle = ((radStart * 180) / Math.PI) + 90;
      if (meleeStartAngle >= 360) {
        meleeStartAngle = meleeStartAngle - 360
      }

      meleeEndAngle = ((radEnd * 180) / Math.PI) + 90;
      if (meleeEndAngle >= 360) {
        meleeEndAngle = meleeEndAngle - 360
      }

      //set 200ms sec time for arc to appear
      didMelee = true;

      setTimeout(() => {

        didMelee = false;

      }, 200);

      /////////////////// TEMP

      setTimeout(() => {
        meleeFrame = 1
      }, 25)
      setTimeout(() => {
        meleeFrame = 2
      }, 50)
      setTimeout(() => {
        meleeFrame = 3
      }, 75)
      setTimeout(() => {
        meleeFrame = 4
      }, 100)
      setTimeout(() => {
        meleeFrame = 5
      }, 125)
      setTimeout(() => {
        meleeFrame = 6
      }, 150)
      setTimeout(() => {
        meleeFrame = 7
      }, 175)
      setTimeout(() => {
        meleeFrame = 0
      }, 200)



    }

  }

}

function drawSemiCircle() {

  if (didMelee) {

    let offsetX = 0;
    let offsetY = 0;
    let offsetRadius = 10;

    if (knobAngle2 > 90 && knobAngle2 < 180) {

      //convert to rad
      let angle = (knobAngle2 * Math.PI) / 180

      //calculate
      offsetX = Math.abs(Math.sin(angle) * offsetRadius);
      offsetY = Math.abs(Math.cos(angle) * offsetRadius);

    }

    else if (knobAngle2 > 180 && knobAngle2 < 270) {

      //convert to rad
      let angle = (knobAngle2 * Math.PI) / 180

      //calculate
      offsetX = Math.sin(angle) * offsetRadius;
      offsetY = (Math.cos(angle) * offsetRadius) * -1;

    }

    else if (knobAngle2 === 90) {

      offsetX = offsetRadius

    }

    else if (knobAngle2 === 180) {

      offsetY = offsetRadius

    }

    else if (knobAngle2 === 270) {

      offsetX = offsetRadius * -1

    }

    meleeCenterAttackX = player.x + 16 + offsetX;
    meleeCenterAttackY = player.y + 16 + offsetY;

    checkMeleeHit()

    CTX.beginPath()
    CTX.arc(meleeCenterAttackX, meleeCenterAttackY, 32, radStart, radEnd)
    CTX.fillStyle = 'rgba(150, 150, 150, 0)'
    CTX.fill()

    drawMeleeAnim()

  }

}

function drawMeleeAnim() {

  CTX.save()

  CTX.translate(meleeCenterAttackX, meleeCenterAttackY)

  CTX.rotate(radCenter + (Math.PI / 2))

  CTX.drawImage(
    //sprite
    meleeAttackSpriteSheet,
    //frame pos x
    (meleeFrame * 32) + meleeFrame,
    //frame pos y
    0,
    //frame width
    32,
    //frame height
    16,
    //canvas pos x (offset) (drawn outside canvas, half of width, but 2x because of scaling)
    -32,
    //canvas pos y (offset) (drawn outside canvas, full height and 2x because of scaling)
    -32,
    //scale x
    64,
    //scale y
    32)

  CTX.restore()

}

function checkMeleeHit() {

  enemiesArray.forEach((enemy, i) => {

    //get the center xy of enemy
    enemy.trueX = enemy.xPos + ((enemy.width * 2) / 2)
    enemy.trueY = enemy.yPos + ((enemy.height * 2) / 2)

    const dist = calculateDistance(meleeCenterAttackX, meleeCenterAttackY, enemy.trueX, enemy.trueY)

    //make player the origin
    //y needs to be inverted
    const relX = enemy.trueX - player.centerX;
    const relY = (enemy.trueY - player.centerY) * -1;

    const angle = calculateAngle(relX, relY);

    //temp 32 is blade radius and 16 is enemy radius
    //can't use meleeStartAngle and MeleeEndAngle because it can go over 360° which messes up comparation
    if (dist - 32 - 16 <= 0 && angle >= meleeCenterAngle - 90 && angle <= meleeCenterAngle + 90) {

      //decrement damage points
      if (enemy.invulnerable === false) {

        enemy.currentActionId.forEach(action => {

          clearTimeout(action)

        })

        enemy.state = 'knockedBack'

        enemy.health -= 300

        spawnParticles('Blood Fx', i)

        //check if there are properties that needs to be reset first
        checkDefaultProperties(i)
        enemy.invulnerable = true

        //200ms determines how far the knockback is
        setTimeout(() => {

          enemy.state = enemy.default;
          enemy.invulnerable = false

        }, 200)

        /*setTimeout(() => {
          enemy.state = enemy.default
        }, 500)*/
      }

    }

  })

  removeDeadEnemies()

}

let rangedAttackArray = []

class Ranged {
  constructor(type, maxSpeed, width, height, damage, sprite) {

    this.type = type;
    this.maxSpeed = maxSpeed;
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.sprite = sprite;
    this.targetX = 0;
    this.targetY = 0;
    this.cornerX = 0;
    this.cornerY = 0;

    this.launchedAngle = 0;
    this.trueX = 0;
    this.trueY = 0;
    this.velX = 0;
    this.velY = 0;
    this.xFrame = 0;
    this.yFrame = 0
  }

}

const rangedAttackSpriteSheet = new Image()
rangedAttackSpriteSheet.src = 'assets/bladeSprites/rangedAttack.png'


class RangedMain extends Ranged {
  constructor() {

    super('Ranged Main', 8, 8, 8, 100, rangedAttackSpriteSheet)

  }

}

function rangedAttack() {

  if (knobDistance2 >= joystickBaseRadius) {

    if (player.rangedReloaded === false) {

      return

    }

    if (player.rangedCd > 0) {

      player.rangedCd--

    }

    if (player.rangedCd === 0) {

      player.rangedCount++
      if (player.rangedCount <= player.rangedCap) {

        const rangedVel = calculateRatio(0, 0, knobX2, knobY2)

        spawnRangedAttack('Ranged Main', rangedVel.calcX, rangedVel.calcY * -1, player.centerX, player.centerY, knobAngle2)

      }

      if (player.rangedCount > player.rangedCap) {

        player.rangedReloaded = false

        setTimeout(() => {

          player.rangedReloaded = true
          player.rangedCount = 0
          player.rangedCd = 0

        }, 1000)

      }

      player.rangedCd = 10

    }

  }

}

function spawnRangedAttack(type, velX, velY, trueX, trueY, launchedAngle) {

  const newRangedAttack = new RangedMain();
  newRangedAttack.velX = velX;
  newRangedAttack.velY = velY;
  newRangedAttack.trueX = trueX;
  newRangedAttack.trueY = trueY;
  newRangedAttack.launchedAngle = launchedAngle

  rangedAttackArray.push(newRangedAttack)

}

let forRangedDeletion = 0

function moveRanged() {
  // to check if there even is a ranged attack
  if (rangedAttackArray.length === 0) {

    return

  }

  //for deletion of ranged attack that is  out of bounds
  forRangedDeletion++

  if (forRangedDeletion === 30) {

    for (let i = rangedAttackArray.length - 1; i >= 0; i--) {

      let ranged = rangedAttackArray[i]

      if (ranged.trueX < 0 || ranged.trueX > CANVAS_WIDTH || ranged.trueY < 0 || ranged.trueY > CANVAS_HEIGHT) {

        rangedAttackArray.splice(i, 1)

      }

    }

    //reset counter
    forRangedDeletion = 0
  }

  //to check again if there are projectiles left

  if (rangedAttackArray.length === 0) {

    return

  }

  rangedAttackArray.forEach((ranged, i) => {

    if (ranged.type === 'Ranged Main') {

      ranged.trueX = ranged.trueX + ranged.maxSpeed * ranged.velX;
      ranged.trueY = ranged.trueY + ranged.maxSpeed * ranged.velY;

      checkRangedHit(i)

    }

  })

}

function drawRangedAttacks() {

  if (rangedAttackArray.length === 0) {

    return

  }

  rangedAttackArray.forEach((ranged, i) => {

    //convert knob2angle to radians

    let shiftedAngle = ranged.launchedAngle - 90
    if (shiftedAngle < 0) {
      shiftedAngle = 360 + shiftedAngle
    }

    let radAngle = (shiftedAngle * Math.PI) / 180;

    CTX.save()

    CTX.translate(ranged.trueX, ranged.trueY)

    CTX.rotate(radAngle + (Math.PI / 2))

    CTX.drawImage(
      //spritesheet
      ranged.sprite,
      //sx
      0,
      //sy
      0,
      //sWidth
      ranged.width,
      //sHeight
      ranged.height,
      //canvas x
      -8,
      //canvas y
      -8,
      //scale x
      16,
      //scale y
      16
    )

    CTX.restore()

    /*CTX.beginPath()
    CTX.arc(ranged.trueX, ranged.trueY, ranged.width, 0, Math.PI * 2)
    CTX.stroke()*/

  })

}

function checkRangedHit(i) {

  const ranged = rangedAttackArray[i]

  enemiesArray.forEach((enemy, i) => {

    const dist = calculateDistance(ranged.trueX, ranged.trueY, enemy.trueX, enemy.trueY)

    if (dist <= ranged.width + enemy.width) {

      //decrement damage points
      if (enemy.invulnerable === false) {

        enemy.currentActionId.forEach(action => {

          clearTimeout(action)

        })

        //before setting state to knockback, it is needed to save the position of the projectile to the enemy itself

        enemy.hitByRanged = { x: ranged.trueX, y: ranged.trueY }

        enemy.state = 'knockedBack'

        enemy.health -= 200
        
        spawnParticles('Blood Fx', i)

        //check if there are properties that needs to be reset first
        checkDefaultProperties(i)
        enemy.invulnerable = true

        //200ms determines how far the knockback is
        setTimeout(() => {

          enemy.state = enemy.default;
          enemy.invulnerable = false
          enemy.hitByRanged = null

        }, 200)

        /*setTimeout(() => {
          enemy.state = enemy.default
        }, 500)*/
      }

    }

  })

  removeDeadEnemies()

}

function removeDeadEnemies() {

  for (let i = enemiesArray.length - 1; i >= 0; i--) {

    const enemy = enemiesArray[i];

    if (enemy.health <= 0) {
      
      spawnParticles('Death Poof Fx', null, enemy.xPos, enemy.yPos)
      
      const killedEnemy = enemiesArray.splice(i, 1)
      
      if (killedEnemy[0].name === 'Neophyte') {
        
        player.kills.neophyte++
        player.score += 1
        
      } else if (killedEnemy[0].name === 'Spell Caster') {
        
        player.kills.spellCaster++
        player.score += 3
        
      } else if (killedEnemy[0].name === 'Deranged Sacrifice') {
        
        player.kills.derangedSacrifice++
        player.score += 5
        
      }

    }

  }

}

function checkDefaultProperties(i) {

  const enemy = enemiesArray[i]

  if (enemy.name === 'Spell Caster') {

    enemy.aimedPosition.x = null
    enemy.aimedPosition.y = null

  }

}

///////////////////////////////////////
//Enemy Constructor       vvvvv
//////////////////////////////////////


class Enemy {
  constructor(name, health, maxSpeed, width, height, knockbackResist, state, sprite) {

    this.name = name;
    this.health = health;
    this.maxSpeed = maxSpeed;
    this.width = width;
    this.height = height;
    this.knockbackResist = knockbackResist;
    this.xPos = 0;
    this.yPos = 0;
    this.xVel = 0;
    this.yVel = 0;
    this.trueX = 0;
    this.trueY = 0;
    this.vectorX = null;
    this.vectorY = null;
    this.vectorAngle = null;
    this.invulnerable = false;
    this.default = state;

    this.hitByRanged = null;
    this.particleId = null;

    this.sprite = sprite;
    this.state = state;
    this.currentActionId = [];
    this.xFrame = 0;
    this.yFrame = 0;
    this.frameCount = 0;

  }
}

const neophyteSprite = new Image()
neophyteSprite.src = 'assets/characterSprites/neophyte.png'

const spellCasterSprite = new Image()
spellCasterSprite.src = 'assets/characterSprites/spellCaster.png'

const derangedSacrificeSprite = new Image()
derangedSacrificeSprite.src = 'assets/characterSprites/derangedSacrifice.png'

class Neophyte extends Enemy {
  constructor() {

    super('Neophyte', 1000, Math.random() + 0.3, 16, 16, 0, 'inPursue', neophyteSprite)

  }
}

class SpellCaster extends Enemy {
  constructor() {

    super('Spell Caster', 1500, 1, 16, 16, 0, 'keepingDistance', spellCasterSprite)

    this.desiredPosition = { x: null, y: null }
    this.aimedPosition = { x: null, y: null }

  }
}

class DerangedSacrifice extends Enemy {
  constructor() {

    super('Deranged Sacrifice', 1800, Math.random() + 0.8, 16, 16, 0, 'inPursue', derangedSacrificeSprite)

    this.dashAttackDamage = 250
    this.dashAttackStartingRange = 100
    this.aimedPosition = { x: null, y: null }

  }


}

let enemiesArray = []

function spawnEnemies() {

  if (enemiesArray.length !== 0) {

    return

  }

  for (let i = 1; i <= 10; i++) {

    const array = [Neophyte, SpellCaster, DerangedSacrifice]
    const rng = Math.round(Math.random() * 100)


    if (rng <= 60) {
      chosenEnemy = array[0]
    }

    else if (rng > 60 && rng < 90) {
      chosenEnemy = array[1]
    }

    else {
      chosenEnemy = array[2]
    }

    const newEnemy = new chosenEnemy();
    newEnemy.xPos = -32;
    newEnemy.yPos = Math.random() * CANVAS_HEIGHT;
    //newEnemy.maxSpeed = newEnemy.maxSpeed = 0.5
    //Math.random() + 0.3;
    //newEnemy.maxSpeed = 0.5;
    enemiesArray.push(newEnemy);

  }

}
//spawnEnemies()

///////////////////////////////////////
//Projectile Constructor       vvvvv
//////////////////////////////////////

let projectileArray = []

class Projectile {
  constructor(type, maxSpeed, width, height, damage, sprite) {

    this.type = type;
    this.maxSpeed = maxSpeed;
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.sprite = sprite;
    this.targetX = 0;
    this.targetY = 0;
    this.cornerX = 0;
    this.cornerY = 0;

    this.launchedAngle = null;
    this.trueX = 0;
    this.trueY = 0;
    this.velX = 0;
    this.velY = 0;
    this.xFrame = 0;
    this.yFrame = 0;
    this.frameCount = 0
  }

}

const orbProjectileSprite = new Image()
orbProjectileSprite.src = 'assets/projectileSprites/spellCasterProjectile.png'

class Orb extends Projectile {
  constructor() {

    super('Orb', 2, 8, 8, 50, orbProjectileSprite)

  }

}

function spawnProjectile(type, velX, velY, trueX, trueY) {

  const newProjectile = new Orb();
  newProjectile.velX = velX;
  newProjectile.velY = velY;
  newProjectile.trueX = trueX;
  newProjectile.trueY = trueY

  projectileArray.push(newProjectile)

}

let forProjDeletion = 0

function moveProjectile() {
  // to check if there even is a projectile
  if (projectileArray.length === 0) {

    return

  }

  //for deletion of projectiles out of bounds
  forProjDeletion++

  if (forProjDeletion === 30) {

    for (let i = projectileArray.length - 1; i >= 0; i--) {

      let proj = projectileArray[i]

      if (proj.trueX < 0 || proj.trueX > CANVAS_WIDTH || proj.trueY < 0 || proj.trueY > CANVAS_HEIGHT) {

        projectileArray.splice(i, 1)

      }

    }

    //reset counter
    forProjDeletion = 0
  }

  //to check again if there are projectiles left

  if (projectileArray.length === 0) {

    return

  }

  projectileArray.forEach((proj, i) => {

    if (proj.type === 'Orb') {

      proj.trueX = proj.trueX + proj.maxSpeed * proj.velX;
      proj.trueY = proj.trueY + proj.maxSpeed * proj.velY;

      didEnemyProjectileHit(i)
      orbProjectileAnim(i)

    }

  })

}

//temp: needs to be more flexible for other projectiles
function drawProjectiles() {

  if (projectileArray.length === 0) {

    return

  }

  projectileArray.forEach((proj, i) => {

    CTX.drawImage(
      //spritesheet
      proj.sprite,
      //sx
      (proj.xFrame * 8) + proj.xFrame,
      //sy
      (proj.yFrame * 8) + proj.yFrame,
      //sWidth
      proj.width,
      //sHeight
      proj.height,
      //canvas x
      proj.trueX - 8,
      //canvas y
      proj.trueY - 8,
      //scale x
      16,
      //scale y
      16
    )

    /*CTX.beginPath()
    CTX.arc(proj.trueX, proj.trueY, proj.width, 0, Math.PI * 2)
    CTX.stroke()*/

  })

}

function didEnemyProjectileHit(i) {

  const proj = projectileArray[i]

  const dist = calculateDistance(proj.trueX, proj.trueY, player.centerX, player.centerY)

  if (dist < proj.width + player.width && !player.invulnerable) {

    player.invulnerable = true;
    player.health -= proj.damage

    //temp
    damaged = true
    setTimeout(() => {
      damaged = false
    }, 200)


    setTimeout(() => {

      player.invulnerable = false

    }, 500)

  }
}



function checkIfVecCol(vX, vY) {

  let collided = false

  enemiesArray.forEach(obj => {

    const distBetween = calculateDistance(vX, vY, obj.trueX, obj.trueY);

    if (distBetween <= obj.width) {
      collided = true
    }

  });

  return collided

}

function enemyStateHandler() {

  enemiesArray.forEach((enemy, i) => {

    if (enemy.state === 'inPursue') {

      pursue(i)

    }

    else if (enemy.state === 'knockedBack') {

      knockback(i)

    }

    else if (enemy.state === 'keepingDistance') {

      if (enemy.desiredPosition.x === null && enemy.desiredPosition.y === null) {

        keepingDistance(i)

        return

      } else if (enemy.desiredPosition.x !== null && enemy.desiredPosition.y !== null) {

        //move to desiredPos

        enemy.xPos = enemy.xPos + enemy.maxSpeed * enemy.xVel;
        enemy.yPos = enemy.yPos + enemy.maxSpeed * enemy.yVel;

        //upd centerXY

        enemy.trueX = enemy.xPos + enemy.width
        enemy.trueY = enemy.yPos + enemy.height

        //calculate distance

        const distToDesired = calculateDistance(enemy.xPos, enemy.yPos, enemy.desiredPosition.x, enemy.desiredPosition.y)

        //check if destination reached
        if (distToDesired <= 1) {

          enemy.state = 'casting'
          enemy.desiredPosition.x = null
          enemy.desiredPosition.y = null

        }

      }

    }

    else if (enemy.state === 'casting') {

      if (enemy.name === 'Spell Caster') {

        if (enemy.aimedPosition.x === null && enemy.aimedPosition.y === null) {

          orbProjectileCasting(i)

        }

      }

    }

    else if (enemy.state === 'dashing') {

      enemy.xPos = enemy.xPos + 1 * enemy.xVel;
      enemy.yPos = enemy.yPos + 1 * enemy.yVel;

      //upd trueXY

      enemy.trueX = enemy.xPos + enemy.width
      enemy.trueY = enemy.yPos + enemy.height

      //check if dash hits the player

      const dist = calculateDistance(enemy.trueX, enemy.trueY, player.centerX, player.centerY)

      if (dist <= enemy.width + player.width && !player.invulnerable) {

        //damage player
        player.invulnerable = true;
        player.health -= enemy.dashAttackDamage

        //temp
        damaged = true
        setTimeout(() => {
          damaged = false
        }, 200)


        setTimeout(() => {

          player.invulnerable = false

        }, 500)

      }

    }

    //TO DETERMINE THEIR ATTACKS
    enemyAttackHandler(i)

  })

}

//temp
let damaged = false

function damagedVisual() {
  if (damaged) {
    CTX.fillStyle = 'rgba(255, 0, 0, 0.3)'
    CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }
}


function enemyAttackHandler(i) {

  const enemy = enemiesArray[i]

  if (enemy.name === 'Neophyte') {

    let distanceToPlayer_1 = calculateDistance(enemy.trueX, enemy.trueY, player.centerX, player.centerY);

    if (distanceToPlayer_1 <= enemy.width + player.width && enemy.state === 'inPursue') {

      enemy.state = 'stabbing'
      enemy.xFrame = 0
      enemy.frameCount = 0

      enemy.currentActionId.push(setTimeout(() => {

        let distanceToPlayer_2 = calculateDistance(enemy.trueX, enemy.trueY, player.centerX, player.centerY);

        if (distanceToPlayer_2 <= enemy.width + player.width && !player.invulnerable) {

          player.invulnerable = true;
          player.health -= 100

          //temp
          damaged = true
          setTimeout(() => {
            damaged = false
          }, 200)


          setTimeout(() => {

            player.invulnerable = false

          }, 500)

        }

        //temp: needs to be last state
        enemy.state = 'inPursue'

      }, 300))

    }

  }

}

function orbProjectileCasting(i) {

  const enemy = enemiesArray[i]

  let launchCount = 0

  function launchProjectile() {

    if (launchCount < 3) {

      //code to launch projectile
      enemy.aimedPosition.x = player.centerX
      enemy.aimedPosition.y = player.centerY

      //calculate ratio
      //enemy center for now (temp: needs offset)
      enemy.trueX = enemy.xPos + ((enemy.width * 2) / 2)
      enemy.trueY = enemy.yPos + ((enemy.height * 2) / 2)

      const projVel = calculateRatio(enemy.trueX, enemy.trueY, enemy.aimedPosition.x, enemy.aimedPosition.y)

      spawnProjectile('Orb', projVel.calcX, projVel.calcY, enemy.trueX, enemy.trueY)

      //after some delay, call the function again
      enemy.currentActionId.push(setTimeout(() => {

        launchCount++
        launchProjectile()

      }, 1000))

    }

    //after 3 casts, reposition
    else if (launchCount === 3) {

      setTimeout(() => {

        enemy.aimedPosition.x = null;
        enemy.aimedPosition.y = null;
        enemy.state = enemy.default

      }, 1000)

    }

  }

  launchProjectile()

}

function knockback(i) {

  const enemy = enemiesArray[i]

  //add force then reverse velocity
  const force = 3

  //edge case because of pursue function
  if (enemy.name === 'Neophyte') {

    enemy.xPos = enemy.xPos + force * (-1 * enemy.xVel);
    enemy.yPos = enemy.yPos + force * (-1 * enemy.yVel);

    return

  }
  //just to remove desiredPosition
  else if (enemy.name === 'Spell Caster') {

    enemy.desiredPosition.x = null
    enemy.desiredPosition.y = null

  }

  //TO HANDLE OTHER ENEMIES

  //get the centerXY of enemies

  enemy.trueX = enemy.xPos + ((enemy.width * 2) / 2)
  enemy.trueY = enemy.yPos + ((enemy.height * 2) / 2)

  //calculate the ratio of velocities from enemy pos to origin of attack

  let ratio;

  if (player.mode === 'melee') {

    ratio = calculateRatio(enemy.trueX, enemy.trueY, meleeCenterAttackX, meleeCenterAttackY)


  }

  else if (player.mode === 'ranged') {

    ratio = calculateRatio(enemy.trueX, enemy.trueY, enemy.hitByRanged.x, enemy.hitByRanged.y)

  }

  enemy.xVel = ratio.calcX
  enemy.yVel = ratio.calcY

  enemy.xPos = enemy.xPos + force * (-1 * enemy.xVel);
  enemy.yPos = enemy.yPos + force * (-1 * enemy.yVel);


}

function pursue(i) {

  const enemy = enemiesArray[i]

  //get the center xy of enemy
  enemy.trueX = enemy.xPos + ((enemy.width * 2) / 2)
  enemy.trueY = enemy.yPos + ((enemy.height * 2) / 2)

  //get the relative position of player from enemy
  const playerRelX = player.centerX - enemy.trueX;
  const playerRelY = player.centerY - enemy.trueY;

  //calculate the angle
  const angleToPlayer = calculateAngle(playerRelX, playerRelY);

  //determine hor and ver absolute distance
  const xLength = Math.abs(enemy.trueX - player.centerX);
  const yLength = Math.abs(enemy.trueY - player.centerY);

  //determine the percentage ratio between lengths
  let percent;

  if (xLength > yLength) {
    percent = yLength / xLength

    enemy.xVel = enemy.maxSpeed;
    enemy.yVel = enemy.maxSpeed * percent
  }

  else if (yLength > xLength) {
    percent = xLength / yLength

    enemy.yVel = enemy.maxSpeed;
    enemy.xVel = enemy.maxSpeed * percent
  }

  else if (xLength === yLength) {
    percent = 1

    enemy.xVel = enemy.maxSpeed;
    enemy.yVel = enemy.maxSpeed
  }

  //distribute velocity

  if (angleToPlayer > 0 && angleToPlayer < 90) {
    //as is
  }

  else if (angleToPlayer > 90 && angleToPlayer < 180) {
    enemy.yVel = enemy.yVel * -1
  }

  else if (angleToPlayer > 180 && angleToPlayer < 270) {
    enemy.xVel = enemy.xVel * -1
    enemy.yVel = enemy.yVel * -1
  }

  else if (angleToPlayer > 270 && angleToPlayer < 360) {
    enemy.xVel = enemy.xVel * -1
  }

  else if (angleToPlayer === 0 || angleToPlayer === 180) {
    enemy.xVel = 0
  }

  else if (angleToPlayer === 90 || angleToPlayer === 270) {
    enemy.yVel = 0
  };

  //FOR VECTOR CALCULATION
  enemy.vectorAngle = angleToPlayer;
  const vectorPos = calculateVectorPos(enemy.vectorAngle, enemy.trueX, enemy.trueY, enemy.width);

  enemy.vectorX = vectorPos.vX;
  enemy.vectorY = vectorPos.vY;

  const doesVectorCol = checkIfVecCol(enemy.vectorX, enemy.vectorY)

  //CHANGE BEHAVIOR BASED ON ENEMY

  if (enemy.name === 'Neophyte') {

    shouldMoveTowardsPlayer(i, doesVectorCol)

  }

  else if (enemy.name === 'Deranged Sacrifice') {

    shouldDashAttack(i, doesVectorCol)

  }

}

function shouldMoveTowardsPlayer(i, doesVectorCol) {

  const enemy = enemiesArray[i]

  if (!doesVectorCol) {

    enemy.xPos = enemy.xPos + 1 * enemy.xVel;
    enemy.yPos = enemy.yPos + 1 * enemy.yVel;

  }

}

function shouldDashAttack(i, doesVectorCol) {

  const enemy = enemiesArray[i]

  const dist = calculateDistance(enemy.trueX, enemy.trueY, player.centerX, player.centerY)

  if (dist <= enemy.dashAttackStartingRange) {

    enemy.state = 'dashing'
    enemy.xVel = 0
    enemy.yVel = 0
    enemy.aimedPosition.x = player.centerX
    enemy.aimedPosition.y = player.centerY

    //set frameX to indicate upcoming dash
    enemy.xFrame = 0
    enemy.yFrame = 2
    enemy.frameCount = 0

    enemy.currentActionId.push(setTimeout(() => {

        const vel = calculateRatio(enemy.trueX, enemy.trueY, enemy.aimedPosition.x, enemy.aimedPosition.y)

        enemy.xVel = vel.calcX * 6
        enemy.yVel = vel.calcY * 6

        //300ms is the time duration of dash attack, then idle
        enemy.currentActionId.push(setTimeout(() => {
          //temp: idle state has no commands
          enemy.state = 'idle'

        }, 300))
        //after 3 sec of idling, back to pursue
        enemy.currentActionId.push(setTimeout(() => {

          enemy.state = 'inPursue'

        }, 3000))

      }, 500)

    )

    return

  }

  if (!doesVectorCol) {

    enemy.xPos = enemy.xPos + 1 * enemy.xVel;
    enemy.yPos = enemy.yPos + 1 * enemy.yVel;

  }

}

//temp
let testX
let testY

function keepingDistance(i) {

  const enemy = enemiesArray[i]

  const firstQuad = { x1: 0, y1: 0, x2: CANVAS_WIDTH / 2, y2: CANVAS_HEIGHT / 2 }

  const secondQuad = { x1: (CANVAS_WIDTH / 2) + 1, y1: 0, x2: CANVAS_WIDTH, y2: CANVAS_HEIGHT / 2 }

  const thirdQuad = { x1: (CANVAS_WIDTH / 2) + 1, y1: (CANVAS_HEIGHT / 2) + 1, x2: CANVAS_WIDTH, y2: CANVAS_HEIGHT }

  const fourthQuad = { x1: 0, y1: (CANVAS_HEIGHT / 2) + 1, x2: CANVAS_WIDTH, y2: CANVAS_HEIGHT }

  //check enemy quadrant

  let quadrant;

  if (player.centerX >= firstQuad.x1 && player.centerX <= firstQuad.x2 && player.centerY >= firstQuad.y1 && player.centerY <= firstQuad.y2) {

    quadrant = 'first'

  }

  else if (player.centerX >= secondQuad.x1 && player.centerX <= secondQuad.x2 && player.centerY >= secondQuad.y1 && player.centerY <= secondQuad.y2) {

    quadrant = 'second'

  }

  else if (player.centerX >= thirdQuad.x1 && player.centerX <= thirdQuad.x2 && player.centerY >= thirdQuad.y1 && player.centerY <= thirdQuad.y2) {

    quadrant = 'third'

  }

  else if (player.centerX >= fourthQuad.x1 && player.centerX <= fourthQuad.x2 && player.centerY >= fourthQuad.y1 && player.centerY <= fourthQuad.y2) {

    quadrant = 'fourth'

  }

  //choose quadrant without player

  let chosenQuad;
  const rng = Math.floor(Math.random() * 3)

  if (quadrant === 'first') {

    const quadArray = ['second', 'third', 'fourth']

    chosenQuad = quadArray[rng]

  }

  else if (quadrant === 'second') {

    const quadArray = ['first', 'third', 'fourth']

    chosenQuad = quadArray[rng]

  }

  else if (quadrant === 'third') {

    const quadArray = ['first', 'second', 'fourth']

    chosenQuad = quadArray[rng]

  }

  else if (quadrant === 'fourth') {

    const quadArray = ['first', 'second', 'third']

    chosenQuad = quadArray[rng]

  }

  //choose random loc from chosenQuad

  //175
  const halfWidth = CANVAS_WIDTH / 2

  //125
  const halfHeight = CANVAS_HEIGHT / 2

  if (chosenQuad === 'first') {
    //0 to 175
    enemy.desiredPosition.x = Math.round(Math.random() * halfWidth)
    //0 to 175
    enemy.desiredPosition.y = Math.round(Math.random() * halfHeight)

  }

  else if (chosenQuad === 'second') {
    //176 to 350
    enemy.desiredPosition.x = (Math.ceil(Math.random() * halfWidth) + halfWidth)
    //0 to 175
    enemy.desiredPosition.y = Math.round(Math.random() * halfHeight)

  }

  else if (chosenQuad === 'third') {
    //176 to 350
    enemy.desiredPosition.x = (Math.ceil(Math.random() * halfWidth) + halfWidth)
    //126 to 250
    enemy.desiredPosition.y = (Math.ceil(Math.random() * halfHeight) + halfHeight)

  }

  else if (chosenQuad === 'fourth') {
    //0 to 175
    enemy.desiredPosition.x = Math.round(Math.random() * halfWidth)
    //126 to 250
    enemy.desiredPosition.y = (Math.ceil(Math.random() * halfHeight) + halfHeight)

  }

  //temp
  testX = enemy.desiredPosition.x
  testY = enemy.desiredPosition.y

  //////////////////////////////
  //For XY VEL
  /////////////////////////////

  const calcRatio = calculateRatio(enemy.xPos, enemy.yPos, enemy.desiredPosition.x, enemy.desiredPosition.y)

  enemy.xVel = calcRatio.calcX
  enemy.yVel = calcRatio.calcY

}

function calculateRatio(x1, y1, x2, y2) {

  //x1 y1 is the origin

  //get the difference to obtain distances

  const distX = Math.abs(x1 - x2)
  const distY = Math.abs(y1 - y2)

  //get the ratio percentage

  let xVel;
  let yVel;

  if (distX > distY) {
    xVel = 1
    yVel = distY / distX
  }

  else if (distY > distX) {
    xVel = distX / distY
    yVel = 1
  }

  //correct vel for negatives

  if (x2 < x1) {
    xVel = xVel * -1
  }

  if (y2 < y1) {
    yVel = yVel * -1
  }

  //return calculated data
  return { calcX: xVel, calcY: yVel }

}

function calculateVectorPos(angle, x, y, r) {
  //convert deg to rad, and -90 to correct origin of angle

  let vecX;
  let vecY;

  if (angle > 0 && angle < 90) {
    const correctedAngle = ((angle) * Math.PI) / 180;
    //x = o, y = a
    calcX = Math.sin(correctedAngle) * (r + 5)
    calcY = Math.cos(correctedAngle) * (r + 5)

    vecX = x + calcX
    vecY = y + calcY

  }

  else if (angle > 90 && angle < 180) {
    const correctedAngle = ((angle - 90) * Math.PI) / 180;
    //x = a, y = o

    calcX = Math.cos(correctedAngle) * (r + 5)
    calcY = Math.sin(correctedAngle) * (r + 5)

    vecX = x + calcX
    vecY = y - calcY

  }

  else if (angle > 180 && angle < 270) {
    const correctedAngle = ((angle - 180) * Math.PI) / 180;
    //x = o, y = a
    calcX = Math.sin(correctedAngle) * (r + 5)
    calcY = Math.cos(correctedAngle) * (r + 5)

    vecX = x - calcX
    vecY = y - calcY
  }

  else if (angle > 270 && angle < 360) {
    const correctedAngle = ((angle - 270) * Math.PI) / 180;
    //x = a, y = o
    calcX = Math.cos(correctedAngle) * (r + 5)
    calcY = Math.sin(correctedAngle) * (r + 5)

    vecX = x - calcX
    vecY = y + calcY

  }

  else if (angle === 0) {
    vecX = x
    vecY = y + r + 5
  }
  else if (angle === 90) {
    vecX = x + r + 5
    vecY = y
  }
  else if (angle === 180) {
    vecX = x
    vecY = y - r - 5
  }
  else if (angle === 270) {
    vecX = x - r - 5
    vecY = y
  }

  return { vX: vecX, vY: vecY }

}

function drawEnemies() {

  enemiesArray.forEach((enemy, i) => {

    if (enemy.state === 'idle') {

      enemy.yFrame = 0

    }

    else if (enemy.state === 'inPursue' || enemy.state === 'keepingDistance') {

      walkingAnim(i)

    }

    else if (enemy.state === 'knockedBack') {

      knockedBackAnim(i)

    }

    else if (enemy.state === 'stabbing') {

      stabbingAnim(i)

    }

    else if (enemy.state === 'dashing') {
      
      dashingAnim(i)
      
    }



    //////////////////////////
    //Animation
    /////////////////////////

    //draw Image
    CTX.save()
    if (enemy.xVel < 0) {
      CTX.scale(-1, 1);
    }

    CTX.drawImage(
      //spritesheet
      enemy.sprite,
      //sx
      (enemy.xFrame * 16) + enemy.xFrame,
      //sy
      (enemy.yFrame * 16) + enemy.yFrame,
      //sWidth
      enemy.width,
      //sHeight
      enemy.height,
      //canvas x
      enemy.xPos * (enemy.xVel < 0 ? -1 : 1),
      //canvas y
      enemy.yPos,
      //scale x
      32 * (enemy.xVel < 0 ? -1 : 1),
      //scale y
      32
    )
    CTX.restore()

    //draw vector line
    /*
    CTX.beginPath()
    CTX.moveTo(enemy.trueX, enemy.trueY)
    CTX.lineTo(enemy.vectorX, enemy.vectorY)
    CTX.stroke()
    */

  })

}

function walkingAnim(i) {

  const enemy = enemiesArray[i]

  enemy.yFrame = 0;
  enemy.frameCount++

  if (enemy.frameCount >= 10) {

    enemy.xFrame++

    if (enemy.xFrame === 4) {

      enemy.xFrame = 0

    }

    enemy.frameCount = 0

  }

}

function knockedBackAnim(i) {

  const enemy = enemiesArray[i]

  enemy.xFrame = 0
  enemy.yFrame = 1

}

function stabbingAnim(i) {

  const enemy = enemiesArray[i]

  enemy.yFrame = 2
  enemy.frameCount++
  //calculated because not looped
  if (enemy.frameCount === 9) {
    enemy.xFrame++
  }

}

function dashingAnim(i) {
  
  const enemy = enemiesArray[i]
  
  enemy.yFrame = 2
  enemy.frameCount++
  //500ms before dashing (500/16)
  if (enemy.frameCount === 31) {
    
    enemy.xFrame++
    
  }
  //300ms duration of dashing ((300/16) + 31)
  else if (enemy.frameCount === 49) {
    
    enemy.xFrame++
    
  }
  
  else if (enemy.frameCount === 50) {
    
    enemy.yFrame = 0
    enemy.xFrame = 0
    
  }
  
}

function orbProjectileAnim(i) {

  const proj = projectileArray[i]

  proj.frameCount++

  //not calculated because it loops
  if (proj.frameCount === 5) {

    proj.xFrame++

    if (proj.xFrame === 18) {

      proj.xFrame = 0

    }

    proj.frameCount = 0

  }

}

//////////////////////////
//Particles Animation
/////////////////////////

function oneShotParticlesAnim() {

  if (oneShotParticlesArray.length === 0) {

    return

  }

  for (let i = oneShotParticlesArray.length - 1; i >= 0; i--) {

    const particles = oneShotParticlesArray[i]

    if (particles.animationDone) {

      oneShotParticlesArray.splice(i, 1)

    }

  }

  oneShotParticlesArray.forEach(particles => {

    particles.frameCount++

    if (particles.frameCount === 2 && !particles.animationDone) {

      particles.xFrame++

      if (particles.xFrame === particles.maxFrame) {
        //-1 so before the animation even starts
        particles.xFrame = -1
        particles.animationDone = true

      }

      particles.frameCount = 0

    }

  })
}

function drawOneShotParticles() {

  if (oneShotParticlesArray.length === 0) {

    return

  }

  oneShotParticlesArray.forEach(particles => {

  if (particles.isStatic === true) {
    
    CTX.drawImage(
    
          //spritesheet
          particles.sprite,
          //sx
          (particles.xFrame * particles.width) + particles.xFrame,
          //sy
          (particles.yFrame * particles.height) + particles.yFrame,
          //sWidth
          particles.width,
          //sHeight
          particles.height,
          //canvas x
          particles.xPos - 16,
          //canvas y
          particles.yPos - 16,
          //scale x
          particles.width * 2,
          //scale y
          particles.height * 2
    
        )
    
  }
  
  else if (particles.isStatic === false) {
    
        //find the index of enemy with same id
        const parentObjIndex = enemiesArray.findIndex(enemy => {
    
          return enemy.particleId === particles.id
    
        })
    
        //temp return for now
        if (parentObjIndex === -1) {
          return
        }
    
        const parentXPos = enemiesArray[parentObjIndex].xPos
        const parentYPos = enemiesArray[parentObjIndex].yPos
    
        CTX.drawImage(
    
          //spritesheet
          particles.sprite,
          //sx
          (particles.xFrame * particles.width) + particles.xFrame,
          //sy
          (particles.yFrame * particles.height) + particles.yFrame,
          //sWidth
          particles.width,
          //sHeight
          particles.height,
          //canvas x
          parentXPos - 16,
          //canvas y
          parentYPos - 16,
          //scale x
          particles.width * 2,
          //scale y
          particles.height * 2
    
        )
    
  }

  })

}