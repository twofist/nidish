//initialize shit

//camera size (gamesize = *5)
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
		
//gamestate
		ingame = 2;
		inmenu = 1;

let 	game = new Phaser.Game(gamewidth, gameheight, Phaser.AUTO, '', { preload: preload, create: create, update: update }),
		gamestate,
		platforms,
		swords,
		shields,
		swordslash,
		swordpickup,
		swordhitobj;

let 	textanimation,
		nidish,
		playgame,
		github;
		
function preload() {
	
	text = game.add.text(game.camera.x, game.camera.height/2, 'loading...', { fill: '#ffffff' });
	game.load.onLoadStart.add(loadingstart, this);
	
	game.load.image('platform', 'images/platform.png');

	game.load.onFileComplete.add(filecomplete, this);
	game.load.onLoadComplete.add(loadingcomplete, this);
	
}

let loadingstart = () =>{
	
	game.load.image('platform', 'images/platform.png');
	game.load.image("test", "images/test.png");
	game.load.image("sword", "images/sword1.png");
	game.load.image("shield", "images/shield2.png");
	
	game.load.spritesheet('player', 'images/player.png', spritesizew, spritesizeh);
	
	game.load.audio('slash', 'sounds/swordslash.mp3');
	game.load.audio('pickup', 'sounds/swordpickup.mp3');
	game.load.audio('hitobj', 'sounds/swordhitobj.mp3');
	
	game.load.spritesheet("nyan", "images/menuanimation/nyan.png", 100, 30);
	
}

let filecomplete = (progress, cacheKey, success, totalLoaded, totalFiles) =>{
	
	text.setText("File Complete: "+ progress + "% - "+ totalLoaded+ " out of "+ totalFiles);
	
}

let loadingcomplete = () =>{
	
	text.setText("Load Complete");
	
}



function create() {
	
	text.destroy();
	gamestate = inmenu;
	
	game.world.setBounds(0, 0, gamewidth, gameheight);
	game.stage.backgroundColor = "#243e36";
	
	textanimation = game.add.sprite(0, 160, 'nyan');
	textanimation.animations.add('shiny', [1,2,3,4,5,6,7,8,9,10,11,12], 20, true);
	textanimation.visible = false;
	
	textinit();
	
}

function textinit(){
	
	nidish = game.add.text(gamewidth/2-160, 0, "Nidish", { font: "80px Courier New", fill: "#c2a83e", align: "center" });
	
	playgame = game.add.text(0, 100, "Play", { font: "65px Courier New", fill: "#c2a83e", align: "center" });
	
	github = game.add.text(0, 250, "Github", { font: "65px Courier New", fill: "#c2a83e", align: "center" });

	enableinput(playgame);
	enableinput(github);
	
}

function enableinput(item){
	
	item.inputEnabled = true;

    item.events.onInputOver.add(over, this);
    item.events.onInputUp.add(up, this);
	
}

function over(item) {
	
	textanimation.width = item.width;
	textanimation.animations.play("shiny");
	textanimation.visible = true;
	textanimation.y = item.y + 30 -10;
	
}

function up(item) {

    if(item === playgame){
		gamestate = ingame;
		startthegame();
	}else if(item === github){
		location.href = "http://www.github.com/twofist";
	}
	
}

function startthegame(){
	
	textanimation.destroy();
	nidish.destroy();
	playgame.destroy();
	github.destroy();

	game.world.setBounds(0, 0, gamewidth*5, gameheight);

	//enable physics system
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//make platforms a group
	platforms = game.add.group();
	//enable physics for every object in the group
	platforms.enableBody = true;

	//create ground
	let ground = platforms.create(0, game.world.height - 64, 'platform');

	//scale it to fit the game size
	ground.scale.setTo(9, 1);

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
	
		swordslash = game.sound.add('slash');
		swordpickup = game.sound.add('pickup');
		swordhitobj = game.sound.add('hitobj');
	
	//show fps
	game.time.advancedTiming = true;
	let style = { font: "24px Arial", fill: "#fff" };
	text = game.add.text(game.camera.x, 0, "FPS: " +game.time.fps, style);
	
	test = game.add.sprite(0, 0, 'test');
	game.physics.arcade.enable(test); //enable red rectangle to be moved in top left for testing purposes
	
}

function update() {

	switch(gamestate){
	  case ingame:
		let swordplatform = game.physics.arcade.collide(swords, platforms);
		let shieldplatform = game.physics.arcade.collide(shields, platforms);
		let hitPlayer = game.physics.arcade.collide(player1, player2);
		
		addweapontoplayer(player1, player2);
		addweapontoplayer(player2, player1);
		
		keepplayerupdated(player1, player2);
		keepplayerupdated(player2, player1);
		
		updateweaponposition(player1);
		updateweaponposition(player2);
		
		removecollisionifinhand(sword1);
		removecollisionifinhand(sword2);
		removecollisionifinhand(shield1);
		removecollisionifinhand(shield2);
		
		checkforfallingsword(player1, sword1, sword2);
		checkforfallingsword(player2, sword1, sword2);
		
		//check if player goes outside the camera
		checkforscene(player1, player2);
	
		text.setText("FPS: " +game.time.fps);
	break;
	default:
	}

}



let keepplayerupdated = (player, otherplayer) =>{

	player.body.velocity.x = 0; //resets velocity so it doesnt move forever
		
	movement(player); //handles movement
	updatebars(player); //updates hp/stambar
	playerstates(player, otherplayer); //handles current animation

}

let movement = (player) => {

	let hitPlatform = game.physics.arcade.collide(player, platforms);

	if(player === player1){
		playermovement(player, cursors.left, cursors.right, cursors.up, cursors.down, wasd.Okey, wasd.Pkey);
	}
	if (player === player2){
		playermovement(player, wasd.left, wasd.right, wasd.up, wasd.down, wasd.Zkey, wasd.Tkey);
	}
	
}

let playermovement = (player, leftkey, rightkey, upkey, downkey, attackkey, blockkey) =>{
	
	let blockamounttimer;
	
	if(downkey.isDown && player.body.touching.down && player.curstate !== normalattack){
 		player.curstate = ducking;
 	}else if(attackkey.justPressed() && player.body.touching.down && player.sword !== 0 && player.curstate !== normalattack){
 			player.curstate = normalattack;
			swordslash.play();
 	}else if(player === player1 && leftkey.isDown && player.curstate !== normalattack){
 		player.body.velocity.x = -walkspeed;
 		if(player.curstate !== airattackdown){
 			player.curstate = walking;
 		}
 			switch(player.scale.x){case -playerscalew: player.scale.x = player.scale.x * -1; break; default: }
 	}else if(player === player2 && leftkey.isDown && player.x-(player.width/2) > game.camera.x && player.curstate !== normalattack){
 		player.body.velocity.x = -walkspeed;
 		if(player.curstate !== airattackdown){
 			player.curstate = walking;
 		}
 			switch(player.scale.x){case -playerscalew: player.scale.x = player.scale.x * -1; break; default: }
 	}else if(player === player1 && rightkey.isDown && player.x-(player.width/2) < game.camera.x+game.camera.width && player.curstate !== normalattack){
 		player.body.velocity.x = walkspeed;
 		if(player.curstate !== airattackdown){
 			player.curstate = walking;
 		}
 			switch(player.scale.x){case playerscalew: player.scale.x = player.scale.x * -1; break; default: }
 	}else if(player === player2 && rightkey.isDown && player.curstate !== normalattack){
 		player.body.velocity.x = walkspeed;
 		if(player.curstate !== airattackdown){
 			player.curstate = walking;
 		}
 			switch(player.scale.x){case playerscalew: player.scale.x = player.scale.x * -1; break; default: }
 	}else if(blockkey.isDown && player.body.touching.down && player.shield !== 0 && player.curstate !== normalattack){
 		player.blocking = true;
 		player.curstam -= holdblockcost;
 		player.curstate = blocking;
		game.time.events.remove(blockamounttimer);
 	}else if(player.curstam < player.maxstam/5 && player.body.touching.down && player.curstate !== normalattack){
 		player.curstate = exhaustedidle;
 	}else if(player.body.touching.down && player.curstate !== normalattack){
 		player.curstate = idle;	
	}
	
	if(attackkey.justPressed() && !player.body.touching.down && player.sword !== 0 && player.curstate !== airattackdown){
		player.curstate = airattackdown
		swordslash.play();
	}else if(player.body.velocity.y > 0 && !player.body.touching.down && player.curstate !== airattackdown){
		player.curstate = falling;
	}else if(player.body.velocity.y < 0 && !player.body.touching.down && player.curstate !== airattackdown){
		player.curstate = jumping;
	}
	
	if(player.shield === 0 || player.curstate !== blocking){
		player.blocking = false;
		blockamounttimer = game.time.events.add(500, resetblockamount, this, player);
	}
	
	if(upkey.isDown && player.body.touching.down && player.curstate !== normalattack && player.curstate !== airattackdown){
		player.body.velocity.y = -jumpvelocity;
	}	
	
}

let playerstates = (player, otherplayer) => {
	//handles current player states attacking walking etc

	switch (player.curstate){
		case walking:			player.animations.play('left');
			break;
		case idle:				player.animations.play('idle');
			break;
		case normalattack:		player.animations.play('normalattack');
								checkforhit(player, otherplayer);
								player.animations.play('normalattack').onComplete.add(function () {
									player.curstate = idle;
									otherplayer.beenhit = false;
								}, this);
			break;
		case blocking:			player.animations.play('blocking');
			break;
		case exhaustedidle: 	player.animations.play('exhaustedidle');
			break;
		case airattackdown:		player.animations.play('airattackdown');
								player.body.setSize(spritesizew/Math.abs(player.scale.x), (spritesizeh/Math.abs(player.scale.y))/2, 0, player.height/2);
								checkforhit(player, otherplayer, sword1, sword2);
								player.animations.play('airattackdown').onComplete.add(function () {
									player.curstate = idle;
									otherplayer.beenhit = false;
								}, this);
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

let checkforhit = (player, otherplayer) =>{
	
	let hitsword;
	
	if((sword1.onplayer.frame >= 13  && sword1.onplayer.frame <= 14) || (sword1.onplayer.frame >= 17  && sword1.onplayer.frame <= 18)){
		sword1.body.checkCollision.none = false;
		
		hitsword = game.physics.arcade.collide(otherplayer, sword1);

		if(hitsword && !otherplayer.beenhit && sword1.onplayer === player){
			if(otherplayer.blocking && player.body.touching.down && player.scale.x !== otherplayer.scale.x){
				playerblockedhit(otherplayer);
			}else{
				playergothit(otherplayer);
			}
		}

	}

	if((sword2.onplayer.frame >= 13  && sword2.onplayer.frame <= 14) || (sword2.onplayer.frame >= 17  && sword2.onplayer.frame <= 18)){
		sword2.body.checkCollision.none = false;

		hitsword = game.physics.arcade.collide(otherplayer, sword2);

		if(hitsword && !otherplayer.beenhit && sword2.onplayer === player){
			if(otherplayer.blocking && player.body.touching.down && player.scale.x !== otherplayer.scale.x){
				playerblockedhit(otherplayer);
			}else{
				playergothit(otherplayer);
			}
		}

	}
	
}

let playergothit = (player) =>{
	
	player.curhp -= 20;
	player.beenhit = true;
	
}

let playerblockedhit = (otherplayer) =>{

	otherplayer.blockedamount += 1;
	if(otherplayer.blockedamount >= 3){
		switch(otherplayer.scale.x){
			case -playerscalew: outofblocks(otherplayer, -playerscalew);
				break;
			case playerscalew:	outofblocks(otherplayer, playerscalew);
				break;
			default:
		}
		resetblockamount(otherplayer);
	}
	otherplayer.beenhit = true;
	swordhitobj.play();
	
}

let outofblocks = (otherplayer, wichside) =>{
	
	otherplayer.body.velocity.x = 1000 * wichside;
	
	if(otherplayer.sword !== 0){
		let thesword = otherplayer.sword;
		otherplayer.sword.onplayer = 0;
		otherplayer.sword = 0;
		thesword.flying = true;
		thesword.body.velocity.y = -750;
		game.time.events.add(200, canhitplayer, this, thesword);
	}
	
	if(otherplayer.shield !== 0){
		let theshield = otherplayer.shield;
		otherplayer.shield.onplayer = 0;
		otherplayer.shield = 0;
		theshield.flying = true;
		theshield.x = otherplayer.x + (otherplayer.width + 20 * wichside);
		theshield.body.velocity.y = -400;
		theshield.body.velocity.x = 300 * wichside;
	}
	
}

let resetblockamount = (player) =>{
	
	player.blockedamount = 0;
	
}

let canhitplayer = (sword) =>{
	
	sword.hittheplayer = true;
	
}

let checkforfallingsword = (player, sword1, sword2) =>{
	
	let test1 = game.physics.arcade.collide(player, sword1);
	let test2 = game.physics.arcade.collide(player, sword2);
	
	if(sword1.hittheplayer && test1){
		player.curhp -= 20;
		sword1.hittheplayer = false;
	}
	
	if(sword2.hittheplayer && test2){
		player.curhp -= 20;
		sword2.hittheplayer = false;
	}
	
}



let addweapontoplayer = (player, otherplayer) =>{

	let hitsword1 = game.physics.arcade.collide(player, sword1);
	let hitsword2 = game.physics.arcade.collide(player, sword2);
	let hitshield1 = game.physics.arcade.collide(player, shield1);
	let hitshield2 = game.physics.arcade.collide(player, shield2);
	
	if (player.sword === 0){
		
		if(hitsword1 && otherplayer.sword !== sword1){
			player.sword = sword1;
			sword1.onplayer = player;
			swordpickup.play();
		}
		
		if(hitsword2 && otherplayer.sword !== sword2){
			player.sword = sword2;
			sword2.onplayer = player;
			swordpickup.play();
		}	
		
	}
	
	if(player.shield === 0){
		
		if(hitshield1 && otherplayer.shield !== shield1){
			player.shield = shield1;
			shield1.onplayer = player;
			swordpickup.play();
		}
		
		if(hitshield2 && otherplayer.shield !== shield2){
			player.shield = shield2;
			shield2.onplayer = player;
			swordpickup.play();
		}
		
	}
	
}

let updateweaponposition = (player) =>{
	
	switch(player.sword){
		case sword1:	setswordposition(player, sword1);
			break;
		case sword2:	setswordposition(player, sword2);
			break;
		default:
	}
	
	switch(player.shield){
		case shield1:		setshieldposition(player, shield1);
			break;
		case shield2:		setshieldposition(player, shield2);
			break;
		default:
	}
	
}

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
								sword.angle = 0;
	}
	
}

let setshieldposition = (player, shield) =>{
	
	switch (player.curstate){
		case walking:			setshieldwalk(player, shield);
			break;
		case idle:				setshieldidle(player, shield);
			break;
		case normalattack:		setshieldnormalattack(player, shield);
			break;
		case blocking:			setshieldblocking(player, shield);
			break;
		case exhaustedidle: 	setshieldexhaustedidle(player, shield);
			break;
		case airattackdown:		setshieldairattackdown(player, shield);
			break;
		case jumping:			setshieldjumping(player, shield);
			break;
		case falling:			setshieldfalling(player, shield);
			break;
		case ducking:			setshieldducking(player, shield);
			break;
		default: 				shield.x = player.x - player.width/4;
								shield.y = player.y;
								shield.angle = 0;
	}
	
}


let setswordwalk = (player, sword) =>{
	
	let swordinhandy = player.y - 3;
	let swordinhandx = player.x - player.width/4;
	let perf = 5;
	
	switch(player.scale.x){
		case -playerscalew:
				sword.angle = 30;
				sword.x = swordinhandx + perf;
				sword.y = swordinhandy;
			break;
		default: 
				sword.angle = -30;
				sword.x = swordinhandx - perf;
				sword.y = swordinhandy;
	}
	
}

let setswordidle = (player, sword) =>{
	
	let swordinhandy; 
	let swordinhandx = player.x - player.width/4;
	let perf = 4;
	
	switch(player.frame){
		
	case 1:	swordinhandy = player.y - 3;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 2: swordinhandy = player.y - 2;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	default:
	}
	
}

let setswordexhaustedidle = (player, sword) =>{
	
	let swordinhandy; 
	let swordinhandx = player.x - player.width/4;
	let perf = 5;
	
	switch(player.frame){
		
	case 3:	swordinhandy = player.y - 1;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 4: swordinhandy = player.y - 0;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	default:
	}
	
}

let setswordnormalattack = (player, sword) =>{
	
	let swordinhandy; 
	let swordinhandx = player.x - player.width/4;
	let perf;
	
	switch(player.frame){
		
	case 12:	perf = 5;
				swordinhandy = player.y - 15;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 13: 	perf = 9;
				swordinhandy = player.y - 9;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 70;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -70;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 14: 	perf = 9;
				swordinhandy = player.y - 0;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 100;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -100;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 15: 	perf = 5;
				swordinhandy = player.y + 9;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 140;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -140;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	default:
	}

}

let setswordairattackdown = (player, sword) =>{
	
	let swordinhandy; 
	let swordinhandx = player.x - player.width/4;
	let perf;
	
	switch(player.frame){
		
	case 16:	perf = 7;
				swordinhandy = player.y + 10;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 130;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -130;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 17: 	perf = 1;
				swordinhandy = player.y + 14;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 160;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -160;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 18: 	perf = -8;
				swordinhandy = player.y + 16;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 200;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -200;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 19: 	perf = -14;
				swordinhandy = player.y + 12;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 230;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -230;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	default:
	}
	
}

let setswordblocking = (player, sword) =>{
	
	let swordinhandy; 
	let swordinhandx = player.x - player.width/4;
	let perf = 8;
	
	switch(player.frame){
		
	case 10:	swordinhandy = player.y - 10;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	case 11: swordinhandy = player.y - 9;
			switch(player.scale.x){
			case -playerscalew:
						sword.angle = 30;
						sword.x = swordinhandx + perf;
						sword.y = swordinhandy;
				break;
			default: 
						sword.angle = -30;
						sword.x = swordinhandx - perf;
						sword.y = swordinhandy;
			}
		break;
		
	default:
	}
	
}

let setswordjumping = (player, sword) =>{
	
	let swordinhandy = player.y - 10;
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
	
	let swordinhandy = player.y - 8;
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


let setshieldwalk = (player, shield) =>{
	
	let shieldinhandy = player.y + 4; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.scale.x){
		case -playerscalew:
				shield.scale.x = playerscalew;
				shield.angle = 0;
				shield.x = shieldinhandx + perf;
				shield.y = shieldinhandy;
			break;
		default: 
				shield.scale.x = -playerscalew;
				shield.angle = -0;
				shield.x = shieldinhandx - perf;
				shield.y = shieldinhandy;
	}
	
}

let setshieldidle = (player, shield) =>{
	
	let shieldinhandy; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.frame){
		
	case 1:	shieldinhandy = player.y + 4;
			switch(player.scale.x){
			case -playerscalew:
						shield.scale.x = playerscalew;
						shield.angle = 0;
						shield.x = shieldinhandx + perf;
						shield.y = shieldinhandy;
				break;
			default: 
						shield.scale.x = -playerscalew;
						shield.angle = -0;
						shield.x = shieldinhandx - perf;
						shield.y = shieldinhandy;
			}
		break;
		
	case 2: shieldinhandy = player.y + 5;
			switch(player.scale.x){
			case -playerscalew:
						shield.scale.x = playerscalew;
						shield.angle = 0;
						shield.x = shieldinhandx + perf;
						shield.y = shieldinhandy;
				break;
			default: 
						shield.scale.x = -playerscalew;
						shield.angle = -0;
						shield.x = shieldinhandx - perf;
						shield.y = shieldinhandy;
			}
		break;
		
	default:
	}
	
}

let setshieldexhaustedidle = (player, shield) =>{
	
	let shieldinhandy; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.frame){
		
	case 3:	shieldinhandy = player.y + 4;
			switch(player.scale.x){
			case -playerscalew:
						shield.scale.x = playerscalew;
						shield.angle = 0;
						shield.x = shieldinhandx + perf;
						shield.y = shieldinhandy;
				break;
			default: 
						shield.scale.x = -playerscalew;
						shield.angle = -0;
						shield.x = shieldinhandx - perf;
						shield.y = shieldinhandy;
			}
		break;
		
	case 4: shieldinhandy = player.y + 5;
			switch(player.scale.x){
			case -playerscalew:
						shield.scale.x = playerscalew;
						shield.angle = 0;
						shield.x = shieldinhandx + perf;
						shield.y = shieldinhandy;
				break;
			default: 
						shield.scale.x = -playerscalew;
						shield.angle = -0;
						shield.x = shieldinhandx - perf;
						shield.y = shieldinhandy;
			}
		break;
		
	default:
	}
	
}

let setshieldnormalattack = (player, shield) =>{
	
	let shieldinhandy = player.y + 4; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.scale.x){
		case -playerscalew:
				shield.scale.x = playerscalew;
				shield.angle = 0;
				shield.x = shieldinhandx + perf;
				shield.y = shieldinhandy;
			break;
		default: 
				shield.scale.x = -playerscalew;
				shield.angle = -0;
				shield.x = shieldinhandx - perf;
				shield.y = shieldinhandy;
	}

}

let setshieldairattackdown = (player, shield) =>{
	
	let shieldinhandy = player.y - 2; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.scale.x){
		case -playerscalew:
				shield.scale.x = playerscalew;
				shield.angle = 0;
				shield.x = shieldinhandx + perf;
				shield.y = shieldinhandy;
			break;
		default: 
				shield.scale.x = -playerscalew;
				shield.angle = -0;
				shield.x = shieldinhandx - perf;
				shield.y = shieldinhandy;
	}
	
}

let setshieldblocking = (player, shield) =>{
	
	let shieldinhandy; 
	let shieldinhandx = player.x - player.width/4;
	let perf = 6;
	
	switch(player.frame){
		
	case 10:	shieldinhandy = player.y + 1;
			switch(player.scale.x){
			case -playerscalew:
						shield.scale.x = -playerscalew;
						shield.angle = 0;
						shield.x = shieldinhandx + perf;
						shield.y = shieldinhandy;
				break;
			default: 
						shield.scale.x = playerscalew;
						shield.angle = -0;
						shield.x = shieldinhandx - perf;
						shield.y = shieldinhandy;
			}
		break;
		
	case 11: shieldinhandy = player.y + 2;
			switch(player.scale.x){
			case -playerscalew:
						shield.scale.x = -playerscalew;
						shield.angle = 0;
						shield.x = shieldinhandx + perf;
						shield.y = shieldinhandy;
				break;
			default: 
						shield.scale.x = playerscalew;
						shield.angle = -0;
						shield.x = shieldinhandx - perf;
						shield.y = shieldinhandy;
			}
		break;
		
	default:
	}
	
}

let setshieldjumping = (player, shield) =>{
	
	let shieldinhandy = player.y - 6; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.scale.x){
		case -playerscalew:
				shield.scale.x = playerscalew;
				shield.angle = 0;
				shield.x = shieldinhandx + perf;
				shield.y = shieldinhandy;
			break;
		default: 
				shield.scale.x = -playerscalew;
				shield.angle = -0;
				shield.x = shieldinhandx - perf;
				shield.y = shieldinhandy;
	}
	
}

let setshieldfalling = (player, shield) =>{
	
	let shieldinhandy = player.y - 4; 
	let shieldinhandx = player.x - player.width/4;
	let perf = - 15;
	
	switch(player.scale.x){
		case -playerscalew:
				shield.scale.x = playerscalew;
				shield.angle = 0;
				shield.x = shieldinhandx + perf;
				shield.y = shieldinhandy;
			break;
		default: 
				shield.scale.x = -playerscalew;
				shield.angle = -0;
				shield.x = shieldinhandx - perf;
				shield.y = shieldinhandy;
	}
	
}

let setshieldducking = (player, shield) =>{
	
	let shieldinhandy = player.y + player.height/2 - 4;
	let shieldinhandx = player.x - player.width/4;
	let perf = -14;
	
	switch(player.scale.x){
		case -playerscalew:
					shield.scale.x = playerscalew;
					shield.angle = 45;
					shield.x = shieldinhandx + perf;
					shield.y = shieldinhandy;
			break;
		default: 
					shield.scale.x = -playerscalew;
					shield.angle = -45;
					shield.x = shieldinhandx - perf;
					shield.y = shieldinhandy;
	}
	
}



let removecollisionifinhand = (handobject) =>{
	
	if(handobject.flying){
		handobject.angle += 10;
	}
	
	if(handobject.body.touching.down){
		handobject.flying = false;
		handobject.canhitplayer = false;
	}
	
	if(handobject.onplayer === player1 || handobject.onplayer === player2){
		handobject.body.checkCollision.none = true;
		handobject.body.allowGravity = false;
	}else{
		handobject.body.checkCollision.none = false;
		handobject.body.allowGravity = true;
	}
	
	if(handobject.body.allowGravity === true && !handobject.flying){
		handobject.body.velocity.x = 0;
	}else if(handobject.onplayer === player1){
		handobject.body.velocity.x = player1.body.velocity.x;
		handobject.body.velocity.y = player1.body.velocity.y;
	}else if(handobject.onplayer === player2){
		handobject.body.velocity.x = player2.body.velocity.x;
		handobject.body.velocity.y = player2.body.velocity.y;
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
	
	player.blockedamount = 0;
	player.beenhit = false;
	
	//animations
	player.animations.add('left', [6, 7], 10, true);
	//player.frame = 8 is jumping
	//player.frame = 9 is falling
	//player.frame = 20 is ducking
	player.animations.add('blocking', [10, 11], 2, true);
	player.animations.add('idle', [1, 2], 1, true);
	player.animations.add('exhaustedidle', [3, 4], 1, true);
	player.animations.add('normalattack', [12, 13, 14, 15], 18, false);
	player.animations.add('airattackdown', [16, 17, 18, 19], 18, false);
	
	let hpbar = game.add.graphics();
		hpbar.beginFill(0xFF3300);
		hpbar.drawRect(-20, -30, 40, 4);
		hpbar.endFill();
	player.addChild(hpbar);
	player.hpbar = hpbar;
	
	let stambar = game.add.graphics();
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
	weapon.flying = false;
	weapon.hittheplayer = false;
	
}
