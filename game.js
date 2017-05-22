//initialize shit

//fullgame size not just camera screen
const	gamewidth = 720,
		gameheight = 480,

//playerstuff
		spritesizeh = 31,
		spritesizew = 24,

		playeranchorh = 0.5,
		playeranchorw = 0.5,
		
		playerscaleh = 1,
		playerscalew = 1,
		
		playerbounce = 0.2,
		
		playergravity = 1250,
		
		maximumhp = 50,
		maximumstam = 50,
		
		walkspeed = 200,
		
		jumpvelocity = 400,
		
		holdblockcost = 0.2,
		
		regenstam = 0.03,

//playeranimationstate
		walking = 1,
		idle = 2,
		normalattack = 3,
		blocking = 4,
		exhaustedidle = 5,
		airattackdown = 6,
		jumping = 7,
		falling = 8,
		ducking = 9;	

var game = new Phaser.Game(gamewidth, gameheight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var platforms;
var swords;
var shields;

function preload() {
	
	game.load.image('platform', 'images/platform.png');
	game.load.spritesheet('player', 'images/player.png', spritesizew, spritesizeh);
	game.load.image("test", "images/test.png");
	game.load.image("sword", "images/sword1.png");
	game.load.image("shield", "images/shield2.png");
	
}

function create() {
	
	game.world.setBounds(0, 0, game.width*3, gameheight);

	 //enable physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //make platforms a group
    platforms = game.add.group();

    //enable physics for every object in the group
    platforms.enableBody = true;

    //create ground
    var ground = platforms.create(0, game.world.height - 64, 'platform');

    //scale it to fit the game size
    ground.scale.setTo(6, 1);

    //make it not fall when you jump on it
    ground.body.immovable = true;
	
	//set camera
	game.camera.x = (game.world.width/2) - (game.width/2);
	
	let leftside = game.camera.x + (game.camera.width/4);
	let rightside = game.camera.x + game.camera.width - (game.camera.width/4);
	
	// The player and its settings
    player1 = game.add.sprite(rightside, game.world.height/2, 'player');
	
	player2 = game.add.sprite(leftside, game.world.height/2, 'player');
		
		addplayerstats(player1);
		addplayerstats(player2);
	
	//make weapon group
	swords = game.add.group();
	shields = game.add.group();
	
	//add sword and shields
	sword1 = swords.create(rightside + 75, game.world.height/2, "sword");
	sword2 = swords.create(leftside + 75, game.world.height/2, "sword");
	
	shield1 = shields.create(rightside + 50, game.world.height/2, "shield");
	shield2 = shields.create(leftside + 50, game.world.height/2, "shield");
	
	addweaponstats(shield1);
	addweaponstats(shield2);
	addweaponstats(sword1);
	addweaponstats(sword2);
	
	cursors = game.input.keyboard.createCursorKeys();
	wasd = game.input.keyboard.addKeys( { 
		'up': Phaser.KeyCode.W, 
		'down': Phaser.KeyCode.S, 
		'left': Phaser.KeyCode.A, 
		'right': Phaser.KeyCode.D, 
		'Zkey': Phaser.KeyCode.Z, //p2 attack
		'Tkey': Phaser.KeyCode.T, //p2 block
		'Okey': Phaser.KeyCode.O, //p1 attack
		'Pkey': Phaser.KeyCode.P  //p1 block
	} );
	
	game.input.keyboard.addKeyCapture([
		Phaser.Keyboard.LEFT,
		Phaser.Keyboard.RIGHT,
		Phaser.Keyboard.UP,
		Phaser.Keyboard.DOWN,
		Phaser.Keyboard.W,
		Phaser.Keyboard.A,
		Phaser.Keyboard.S,
		Phaser.Keyboard.D,
		Phaser.Keyboard.Z,
		Phaser.Keyboard.T,
		Phaser.Keyboard.O,
		Phaser.Keyboard.P
	]);
	
	//show fps
	game.time.advancedTiming = true;
	let style = { font: "24px Arial", fill: "#fff" };
	text = game.add.text(game.camera.x, 0, "FPS: " +game.time.fps, style);
	
	test = game.add.sprite(0, 0, 'test');
	game.physics.arcade.enable(test); //enable red rectangle to be moved in top left for testing purposes
	
}

function update() {
		
		var swordplatform = game.physics.arcade.collide(swords, platforms);
		var shieldplatform = game.physics.arcade.collide(shields, platforms);
		var hitPlayer = game.physics.arcade.collide(player1, player2);
		
		addweapontoplayer(player1, player2);
		addweapontoplayer(player2, player1);
		
		shield1.body.velocity.x = 0;
		shield2.body.velocity.x = 0;
		
		sword1.body.velocity.x = 0;
		sword2.body.velocity.x = 0;
		
		//collide the player with the platforms
		keepplayerupdated(player1, player2, hitPlayer);
		keepplayerupdated(player2, player1, hitPlayer);

		//check if player goes outside the camera
		checkforscene(player1, player2);
		
		updateweaponposition(player1);
		updateweaponposition(player2);
	
	text.setText("FPS: " +game.time.fps);

}

let addweapontoplayer = (player, otherplayer) =>{
	
	//var hitWeapon = game.physics.arcade.collide(player, weapons);

	var hitsword1 = game.physics.arcade.collide(player, sword1);
	var hitsword2 = game.physics.arcade.collide(player, sword2);
	
	var hitshield1 = game.physics.arcade.collide(player, shield1);
	var hitshield2 = game.physics.arcade.collide(player, shield2);
	
	if (player.sword === 0){
	
		if(hitsword1 && otherplayer.sword !== 1){
			player.sword = 1;
			sword1.onplayer = player;
		}
		
		if(hitsword2 && otherplayer.sword !== 2){
			player.sword = 2;
			sword2.onplayer = player;
		}	
		
	}
	
	if(player.shield === 0){
		
		if(hitshield1 && otherplayer.shield !== 1){
			player.shield = 1;
			shield1.onplayer = player;
		}
		
		if(hitshield2 && otherplayer.shield !== 2){
			player.shield = 2;
			shield2.onplayer = player;
		}
		
	}
	
}

let updateweaponposition = (player) =>{
	
	switch(player.sword){
		case 1:		setswordposition(player, sword1);
			break;
		case 2:		setswordposition(player, sword2);
			break;
		default:
	}
	
	switch(player.shield){
		case 1:		setshieldposition(player, shield1);
			break;
		case 2:		setshieldposition(player, shield2);
			break;
		default:
	}
	
}

let keepplayerupdated = (player, otherplayer, hitPlayer) =>{
	
	player.body.velocity.x = 0; //resets velocity so it doesnt move forever
		
	movement(player, hitPlayer, otherplayer); //handles movement
	updatebars(player); //updates hp/stambar
	playerstates(player); //handles current animation
		
}

let movement = (player, hitPlayer, otherplayer) => {

	var hitPlatform = game.physics.arcade.collide(player, platforms);

	if(player === player1){
		player1movement(player, hitPlatform, hitPlayer, otherplayer);
	}
	if (player === player2){
		player2movement(player, hitPlatform, hitPlayer, otherplayer);
	}
	
}

let player1movement = (player, hitPlatform, hitPlayer, otherplayer) =>{
	
	if (cursors.left.isDown){
			//  Move to the left
			player.body.velocity.x = -walkspeed;
			player.curstate = walking;
			//flipsprite
			switch(player.scale.x){
				case -playerscalew: player.scale.x = player.scale.x * -1; break;
				default:
			}
		}else if (cursors.right.isDown && player.x-(player.width/2) < game.camera.x+game.camera.width){
			//  Move to the right
			player.body.velocity.x = walkspeed;
			player.curstate = walking;
			//flipsprite
			switch(player.scale.x){
				case playerscalew: player.scale.x = player.scale.x * -1; break;
				default:
			}
		}else if (cursors.down.isDown && player.body.touching.down) {
			player.curstate = ducking;
		}else if(wasd.Pkey.isDown ){
			player.blocking = true;
			player.curstam -= holdblockcost;
			player.curstate = blocking;
		}else if (player.curstam < player.maxstam/5 && player.body.touching.down){
			player.curstate = exhaustedidle;
		}else{
			//  Stand still
			player.curstate = idle;
		}

		if(wasd.Okey.isDown && player.curstam > player.maxstam/5){
			if (!player.body.touching.down && cursors.down.isDown){
				player.curstate = airattackdown;
				//player.curstam = player.curstam - (player.maxstam / 5);
			}else{
				player.curstate = normalattack;
				//player.curstam = player.curstam - (player.maxstam / 5);
			}
			if(hitPlayer && !otherplayer.blocking){
				otherplayer.curhp = otherplayer.curhp - (otherplayer.maxhp / 5);
			}
		}else if(player.body.velocity.y > 0 && !player.body.touching.down){
			player.curstate = falling;
		}
		else if(player.body.velocity.y < 0 && !player.body.touching.down){
			player.curstate = jumping;
		}
		
		if (!wasd.Pkey.isDown && player.blocking === true){
			player.blocking = false;
		}
		
		//  Allow the player to jump if they are touching the ground. && hitPlatform
		if (cursors.up.isDown && player.body.touching.down && player.curstam >= player.maxstam / 5){
			player.body.velocity.y = -jumpvelocity;
			player.curstam = player.curstam - (player.maxstam / 5);
		}
	
}

let player2movement = (player, hitPlatform, hitPlayer, otherplayer) =>{
	
	if (wasd.left.isDown && player.x-(player.width/2) > game.camera.x){
			//  Move to the left
			player.body.velocity.x = -walkspeed;
			player.curstate = walking;
			//flip sprite
			switch(player.scale.x){
				case -playerscalew: player.scale.x = player.scale.x * -1; break;
				default:
			}
		}else if (wasd.right.isDown){
			//  Move to the right
			player.body.velocity.x = walkspeed;
			player.curstate = walking;
			//flipsprite
			switch(player.scale.x){
				case playerscalew: player.scale.x = player.scale.x * -1; break;
				default:
			}
		}else if (wasd.down.isDown && player.body.touching.down) {
			player.curstate = ducking;
		}else if(wasd.Tkey.isDown){
			player.blocking = true;
			player.curstam -= holdblockcost;
			player.curstate = blocking;
		}else if (player.curstam < player.maxstam/5 && player.body.touching.down){
			player.curstate = exhaustedidle;
		}else{
			player.curstate = idle;
		}

		if(wasd.Zkey.isDown && player.curstam > player.maxstam/5){
			if (!player.body.touching.down && wasd.down.isDown){
				player.curstate = airattackdown;
				//player.curstam = player.curstam - (player.maxstam / 5);
			}else{
				player.curstate = normalattack;
				//player.curstam = player.curstam - (player.maxstam / 5);
			}
			if(hitPlayer && !otherplayer.blocking){
				otherplayer.curhp = otherplayer.curhp - (otherplayer.maxhp / 5);
			}
		}else if(player.body.velocity.y > 0 && !player.body.touching.down){
			player.curstate = falling;
		}
		else if(player.body.velocity.y < 0 && !player.body.touching.down){
			player.curstate = jumping;
		}

		if(!wasd.Tkey.isDown && player.blocking === true){
			player.blocking = false;
		}
		
		//  Allow the player to jump if they are touching the ground. && hitPlatform
		if (wasd.up.isDown && player.body.touching.down && player.curstam >= player.maxstam / 5){
			player.body.velocity.y = -jumpvelocity;
			player.curstam = player.curstam - (player.maxstam / 5);
		}
	
}

let setswordwalk = (player, sword) =>{
	
	sword.x = player.x - player.width/4;
	sword.y = player.y;
	sword.body.velocity.y = 0;
	
}

let setswordidle = (player, sword) =>{
	
	sword.x = player.x - player.width/4;
	sword.y = player.y;
	sword.body.velocity.y = 0;
	
}

let setswordnormalattack = (player, sword) =>{
	
	sword.x = player.x - player.width/4;
	sword.y = player.y;
	sword.body.velocity.y = 0;
	
}

let setswordexhaustedidle = (player, sword) =>{
	
	sword.x = player.x - player.width/4;
	sword.y = player.y;
	sword.body.velocity.y = 0;
	
}

let setswordairattackdown = (player, sword) =>{
	
	sword.x = player.x - player.width/4;
	sword.y = player.y;
	sword.body.velocity.y = 0;
	
}

let setswordjumping = (player, sword) =>{
	
	sword.body.velocity.y = 0;
	
	let swordinhandy = player.y - 7;
	let swordinhandx = player.x - player.width/4;
	let perf = 5;
	
	switch(player.scale.x){
		case -playerscalew:
					sword.angle = 45;
					sword.x = swordinhandx + perf;
					sword.y = swordinhandy;
			break;
		default: 
					sword.angle = -45;
					sword.x = swordinhandx - perf;
					sword.y = swordinhandy;
	}
}

let setswordfalling = (player, sword) =>{
	
	sword.body.velocity.y = 0;
	
	let swordinhandy = player.y - 7;
	let swordinhandx = player.x - player.width/4;
	let perf = 5;
	
	switch(player.scale.x){
		case -playerscalew:
					sword.angle = 45;
					sword.x = swordinhandx + perf;
					sword.y = swordinhandy;
			break;
		default: 
					sword.angle = -45;
					sword.x = swordinhandx - perf;
					sword.y = swordinhandy;
	}
}

let setswordducking = (player, sword) =>{
	
	sword.body.velocity.y = 0;
	
	let swordinhandy = player.y + player.height/2 - 7;
	let swordinhandx = player.x - player.width/4;
	let perf = 4;
	
	switch(player.scale.x){
		case -playerscalew:
					sword.angle = 45;
					sword.x = swordinhandx + perf;
					sword.y = swordinhandy;
			break;
		default: 
					sword.angle = -45;
					sword.x = swordinhandx - perf;
					sword.y = swordinhandy;
	}
	
}

let playerstates = (player) => {
	//handles current player states attacking walking etc

	switch (player.curstate){
		case walking:			player.animations.play('left');
			break;
		case idle:				player.animations.play('idle');
			break;
		case normalattack:		player.animations.play('normalattack');
			break;
		case blocking:			player.animations.play('blocking');
			break;
		case exhaustedidle: 	player.animations.play('exhaustedidle');
			break;
		case airattackdown:		player.animations.play('airattackdown');
								player.body.setSize(spritesizew/Math.abs(player.scale.x), (spritesizeh/Math.abs(player.scale.y))/2, 0, player.height/2);
			break;
		case jumping:			player.animations.stop();
								player.frame = 8
			break;
		case falling:			player.animations.stop();
								player.frame = 9
			break;
		case ducking:			player.animations.stop();
								player.body.setSize(spritesizew/Math.abs(player.scale.x), (spritesizeh/Math.abs(player.scale.y))/2, 0, player.height/2);
								player.frame = 20;
			break;
		default: 				player.animations.stop();
								player.frame = 0;
	}
	
	switch (player.curstate){
		case airattackdown:		
			break;
		case ducking:			
			break;
		default: 				player.body.setSize(spritesizew/Math.abs(player.scale.x), spritesizeh/Math.abs(player.scale.y), 0, 0);
	}
	
	
}
//working on rn
let setswordposition = (player, sword) =>{
	
	
	switch (player.curstate){
		case walking:			setswordwalk(player, sword);
			break;
		case idle:				setswordidle(player, sword);
			break;
		case normalattack:		setswordnormalattack(player, sword);
			break;
		case blocking:			setswordblocking(player, sword);
			break;
		case exhaustedidle: 	setswordexhaustedidle(player, sword);
			break;
		case airattackdown:		setswordairattackdown(player, sword);
			break;
		case jumping:			setswordjumping(player, sword);
			break;
		case falling:			setswordfalling(player, sword);
			break;
		case ducking:			setswordducking(player, sword);
			break;
		default: 				sword.x = player.x - player.width/4;
								sword.y = player.y;
								sword.body.velocity.y = 0;
	}
	
}
//have to update
let setshieldposition = (player, shield) =>{
	
	switch (player.curstate){
		case walking:			setswordwalk(player, shield);
			break;
		case idle:				setswordidle(player, shield);
			break;
		case normalattack:		setswordnormalattack(player, shield);
			break;
		case blocking:			setswordblocking(player, shield);
			break;
		case exhaustedidle: 	setswordexhaustedidle(player, shield);
			break;
		case airattackdown:		setswordairattackdown(player, shield);
			break;
		case jumping:			setswordjumping(player, shield);
			break;
		case falling:			setswordfalling(player, shield);
			break;
		case ducking:			setswordducking(player, shield);
			break;
		default: 				shield.x = player.x - player.width/4;
								shield.y = player.y;
								shield.body.velocity.y = 0;
	}
	
}

let addplayerstats = (player) =>{
	
	player.anchor.setTo(playeranchorh, playeranchorw);
	player.scale.setTo(playerscaleh, playerscalew);
	
	//enable physics on player
	game.physics.arcade.enable(player);

	//physics stuff give bounce
	player.body.bounce.y = playerbounce;
	player.body.gravity.y = playergravity;
	player.body.collideWorldBounds = true;
	
	player.maxhp = maximumhp;
	player.maxstam = maximumstam;
	
	player.curhp = player.maxhp;
	player.curstam = player.maxstam;
	
	player.shield = 0;
	player.sword = 0;
	
	//animations
	player.animations.add('left', [6, 7], 10, true);
	//player.frame = 8 is jumping
	//player.frame = 9 is falling
	//player.frame = 20 is ducking
	player.animations.add('blocking', [10, 11], 2, true);
	player.animations.add('idle', [1, 2], 1, true);
	player.animations.add('exhaustedidle', [3, 4], 1, true);
	player.animations.add('normalattack', [12, 13, 14, 15], 10, true);
	player.animations.add('airattackdown', [16, 17, 18, 19], 10, false);
	
	var hpbar = game.add.graphics();
		hpbar.beginFill(0xFF3300);
		hpbar.drawRect(-20, -30, 40, 4);
		hpbar.endFill();
	player.addChild(hpbar);
	player.hpbar = hpbar;
	
	var stambar = game.add.graphics();
		stambar.beginFill(0x0000FF);
		stambar.drawRect(-20, -25, 40, 4);
		stambar.endFill();
	player.addChild(stambar);
	player.stambar = stambar;
	
}

let addweaponstats = (weapon) => {
	
	weapon.anchor.setTo(playeranchorh, playeranchorw);
	weapon.scale.setTo(playerscaleh, playerscalew);
	
	//enable physics on weapon
	game.physics.arcade.enable(weapon);

	//give weapon a bounce
	weapon.body.bounce.y = playerbounce;
	weapon.body.gravity.y = playergravity;
	weapon.body.collideWorldBounds = true;
	
	weapon.onplayer = 0;
	
}

let updatebars = (player) => {
	
	player.hpbar.width = player.curhp;
	player.stambar.width = player.curstam;
	
	if(player.curstam < player.maxstam){
		player.curstam += regenstam; //add stam per frame
	}
	if(player.curstam > player.maxstam){
		player.curstam = player.maxstam; //dont go over
	}
	if(player.curstam < 0){
		player.curstam = 0; //dont go lower
	}
    if(player.curhp < 0){
		player.curhp = 0; //dont go lower
   	}
	
}

let checkforscene = (player1, player2) =>{
	
	let leftside, rightside;
	if(player1.x <= game.camera.x){
		
		game.camera.x = game.camera.x - game.camera.width; //move camera left
			leftside = game.camera.x + (game.camera.width/4);
			rightside = game.camera.x + game.camera.width - (game.camera.width/4);
		player1.x = rightside;
		player2.x = leftside;
		text.x = game.camera.x;
		
	}else if(player2.x >= game.camera.x+game.camera.width){
		
		game.camera.x = game.camera.x + game.camera.width; //move camera right
			leftside = game.camera.x + (game.camera.width/4);
			rightside = game.camera.x + game.camera.width - (game.camera.width/4);
		player2.x = leftside;
		player1.x = rightside;
		text.x = game.camera.x;
	}
	
}
