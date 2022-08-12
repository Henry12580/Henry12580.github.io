const canvas = document.getElementById('canvas1');
const select = document.getElementById('animations');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;
const SPIRITE_WIDTH = 575;
const SPIRITE_HEIGHT = 523;

const playerImage = new Image();
playerImage.src = 'shadow_dog.png';

let gameFrame = 0;
const staggerFrames = 5;

const frameNumOfAction = [
    {
        "actName": "idle",
        "frameNum": 7
    },
    {
        "actName": "jump",
        "frameNum": 7
    },
    {
        "actName": "fall",
        "frameNum": 7
    },
    {
        "actName": "run",
        "frameNum": 9
    },
    {
        "actName": "dizzy",
        "frameNum": 11
    },
    {
        "actName": "sit",
        "frameNum": 5
    },
    {
        "actName": "roll",
        "frameNum": 7
    },
    {
        "actName": "bite",
        "frameNum": 7
    },
    {
        "actName": "ko",
        "frameNum": 12
    },
    {
        "actName": "gethit",
        "frameNum": 4
    }
];

const animations = {};

(function getAnimationLocs() {
    frameNumOfAction.forEach( (act, idx) => {
        animations[act.actName] = {};
        const locs = [];
        for(let j = 0; j < act.frameNum; ++j) {
            locs.push({
                x: j * SPIRITE_WIDTH,
                y: idx * SPIRITE_HEIGHT,
                w: SPIRITE_WIDTH,
                h: SPIRITE_HEIGHT,
            })
        }
        animations[act.actName].frameNum = act.frameNum;
        animations[act.actName].locs = locs;
    })
})();

/**
 * action name
 * @type {string}
 */
let curSelectedAction = 'idle';

select.onchange = e => {
    curSelectedAction = e.target.value;
}

function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const curAction = animations[curSelectedAction];
    const { locs } = curAction;
    const pos = Math.floor(gameFrame / staggerFrames) % curAction.frameNum;
    ctx.drawImage(playerImage, locs[pos].x, locs[pos].y, locs[pos].w, locs[pos].h, 10, 10, SPIRITE_WIDTH, SPIRITE_HEIGHT);
    gameFrame++;
    requestAnimationFrame(animate);
}

animate();