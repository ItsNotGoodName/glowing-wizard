const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
var cameraX = 0;
var cameraY = 0;
/****************IMAGE MAPS*******************************/
var wizardImage = new Image();
var fireballs = [];
var backgroundImage = new Image();

/********************************MATH*********************/
function updateScreenSize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function calculateScreenCoordinate(x, y){
    x = x - cameraX + window.innerWidth/2;
    y = cameraY - y + window.innerHeight/2;
    //console.log("(" + x + "," + y + ")");
    return {x,y};
}

function calculateGameCoordinate(x, y){
    x = x + cameraX - window.innerWidth/2;
    y = cameraY - y + window.innerHeight/2;
    //console.log("(" + x + "," + y + ")");
    return {x,y};
}

function fireball(x, y, radius){
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.radius = radius
    this.tick = 0;

    this.draw = function(){
        var coord = calculateScreenCoordinate(this.x,this.y);
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.strokeStyle = 'red';
        
        ctx.arc(
            coord.x, 
            coord.y, 
            this.radius, 
            0, 
            Math.PI * 2, 
            false);

        ctx.fill();
        ctx.stroke();
    }
    
    this.update = function(){
        this.tick++;
        this.x+=this.dx;
        this.y+=this.dy;
    }
}

/**********************************************************/

function Wizard(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.animation = 0;
    this.speed = 5;
    this.tick = 0;
    this.tickSpeed = 5;
    this.fireball;
    this.backgroundQuadrant = {x: 0, y: 0};
    this.sprintSpeed = 10;

    this.sprinting = false;
    this.walkingUp = false;
    this.walkingRight = false;
    this.walkingDown = false;
    this.walkingLeft = false;
    this.mousedown = false;


    this.draw = function(){
        var coord = calculateScreenCoordinate(this.x,this.y);
        ctx.drawImage(
            wizardImage, 
            256*this.animation, 
            0, 
            256, 
            256, 
            coord.x-this.width/2, 
            coord.y-this.height/2,
            this.width, 
            this.height);
    }

    this.update = function(){
        var moving = false;

        if(this.sprinting){
            this.speed = this.sprintSpeed;
            this.tickSpeed = 1; 
        } else {
            this.speed = 5;
            this.tickSpeed = 5;
        }

        if(this.walkingUp){
            this.y+=this.speed;
            moving = true;
        }
        if(this.walkingRight){
            this.x+=this.speed;
            moving = true;
        }
        if(this.walkingDown){
            this.y-=this.speed;
            moving = true;
        }
        if(this.walkingLeft){
            this.x-=this.speed;
            moving = true;
        }

        if(moving){
            if(this.tick > this.tickSpeed){
                this.tick = 0;
                if(this.animation == 2){
                    this.animation = 1;
                } else {
                    this.animation = 2;
                }
            } else{
                this.tick++;
            }
        } else{
            this.animation = 0;
        }
        if(this.mousedown){
            this.fireball.radius++;
            this.fireball.x = this.x;
            this.fireball.y = this.y;
            this.fireball.draw();
        }
        cameraX = this.x;
        cameraY = this.y;
    }
    this.createFireball = function(){
        this.fireball = new fireball(this.x-2, this.y-2, 4);
        this.mousedown = true;
    }
    this.finishFireball = function(event){
        this.mousedown = false;
        var coord = calculateGameCoordinate(event['clientX'],event['clientY']);
        this.fireball.dx = (coord.x - this.x)/16;
        this.fireball.dy =  (coord.y - this.y)/16;

        fireballs.push(this.fireball);
    }
};

function drawBackground(){
    var qx = cameraX >= 0 ? Math.ceil(parseFloat(cameraX/backgroundImage.width)) : Math.floor(parseFloat(cameraX/backgroundImage.width)) ;
    var qy = cameraY >= 0 ? Math.ceil(parseFloat(cameraY/backgroundImage.height)) : Math.floor(parseFloat(cameraY/backgroundImage.height));

    if(qy < 0){
        qy++;
    }
    if(qx > 0){
        qx--;
    }

    for(var i = -1; i < 2; i+=2){
        var coord = calculateScreenCoordinate(
            (qx + i) * backgroundImage.width,
            qy * backgroundImage.height);
        ctx.drawImage(backgroundImage, coord.x, coord.y);
    }
    for(var i = -1; i < 2; i+=2){
        var coord = calculateScreenCoordinate(
            (qx ) * backgroundImage.width,
            (qy + i) * backgroundImage.height);
        ctx.drawImage(backgroundImage, coord.x, coord.y);
    }
    for(var i = -1; i < 2; i+=2){
        var coord = calculateScreenCoordinate(
            (qx + i) * backgroundImage.width,
            (qy + i) * backgroundImage.height);
        ctx.drawImage(backgroundImage, coord.x, coord.y);
    }
    for(var i = -1; i < 2; i++){
        var coord = calculateScreenCoordinate(
            (qx + i) * backgroundImage.width,
            (qy - i) * backgroundImage.height);
        ctx.drawImage(backgroundImage, coord.x, coord.y);
    }
}

function draw(){
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
    drawBackground();
    // update wizard
    // draw wizard
    // draw otherWizards

    wiz.update();
    wiz.draw();
    for(var e in fireballs){
        if(fireballs[e].tick > 600){ 
            fireballs.shift();
        } else{
            fireballs[e].update();
            fireballs[e].draw();
        }
    }
}

var wiz = new Wizard(0, 0, 128, 128);

function keyDown(event){
    console.log(event['key']);
    switch(event['key']){
        case 'w':
            wiz.walkingUp = true;
            break;
        case 'd':
            wiz.walkingRight = true;
            break;        
        case 's':
            wiz.walkingDown = true;
            break;     
        case 'a':
            wiz.walkingLeft = true;
            break;
        case 'Shift':
            wiz.sprinting = true;
            break;
        // case 'ArrowUp':
        //     cameraY++;
        //     break;
        // case 'ArrowRight':
        //     cameraX++;
        //     break;
        // case 'ArrowDown':
        //     cameraY--;
        //     break;
        // case 'ArrowLeft':
        //     cameraX--;
        //     break;
        
    }
}

function keyUp(event){
    switch(event['key']){
        case 'w':
            wiz.walkingUp = false;
            break;
        case 'd':
            wiz.walkingRight = false;
            break;        
        case 's':
            wiz.walkingDown = false;
            break;     
        case 'a':
            wiz.walkingLeft = false;
            break;     
        case 'Shift':
            wiz.sprinting = false;   
            break
    }
}

function mousedown(event){
    if(event['button'] == 0){
        wiz.createFireball();
    }
}

function mouseup(event){
    if(event['button'] == 0){
        wiz.finishFireball(event);
    }
}

function stopMovement(){
    wiz.walkingUp = false;
    wiz.walkingRight = false;
    wiz.walkingDown = false;
    wiz.walkingLeft = false;
}

/**************************Key Listener****************************/
window.addEventListener('keydown', keyDown, false);
window.addEventListener('keyup', keyUp, false);
window.addEventListener('blur', stopMovement, false);
canvas.addEventListener("mousedown", mousedown, false);
canvas.addEventListener("mouseup", mouseup, false);
window.addEventListener('resize', updateScreenSize);
updateScreenSize();

wizardImage.onload = function(){    
    backgroundImage.onload = function(){
        setInterval(function() {
            window.requestAnimationFrame(draw);
          }, 1000/60);
    }
}
backgroundImage.src = 'res/milky-way.jpg';
wizardImage.src = 'res/wizard.png';