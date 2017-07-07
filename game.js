"use strict";
(function(){
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
			
			maximumhp = 20,
			
			walkspeed = 200,
			
			jumpvelocity = 400,

	//playeranimationstate
			walking = 1,
			idle = 2,
			normalattack = 3,
			blocking = 4,
			exhaustedidle = 5,
			airattackdown = 6,
			jumping = 7,
			falling = 8,
			ducking = 9,
			dead = 10,
			
	//gamestate
			
			inmenu = 1,
			ingame = 2,
			win = 3,
			
			decide = 0,
			goright = 1,
			goleft = 2,
			godown = 3;

	let 	game = new Phaser.Game(gamewidth, gameheight, Phaser.AUTO, '', { preload: preload, create: create, update: update }),
			player1,
			player2,
			gamescene,
			cursors,
			wasd,
			gamestate,
			handlesidepass,
			arrowstuff,
			canpassright,
			canpassleft,
			platforms,
			backgrounds,
			swords,
			shields,
			sword1,
			sword2,
			shield1,
			shield2,
			swordslash,
			swordpickup,
			swordhitobj,
			whowon,
			text,
			textanimation,
			nidish,
			playgame,
			fullscreen,
			github;
			
	function preload() {
		
		text = game.add.text(game.camera.x, game.camera.height/2, 'loading...', { fill: '#ffffff' });
		game.load.onLoadStart.add(loadingstart, this);
		
		game.load.image('platform', 'images/background/middle/middleplatform.png');

		game.load.onFileComplete.add(filecomplete, this);
		game.load.onLoadComplete.add(loadingcomplete, this);
		
	}

	let loadingstart = () =>{
		
		game.load.image('sideplatform', 'images/background/side/sideplatform.png');
		game.load.image('endplatform', 'images/background/end/endplatform.png');
		game.load.image("sword", "images/sword1.png");
		game.load.image("shield", "images/shield2.png");
		
		game.load.spritesheet("nyan", "images/menuanimation/nyan.png", 100, 30);
		game.load.spritesheet('player', 'images/player.png', spritesizew, spritesizeh);
		game.load.spritesheet('arrowstuff', 'images/arrow/arrowstuff.png', 32, 32);
		game.load.spritesheet('middlebackground', 'images/background/middle/middlebackground.png', 720, 480);
		game.load.spritesheet('sidebackground', 'images/background/side/sidebackground.png', 720, 480);
		game.load.spritesheet('endbackground', 'images/background/end/endbackground.png', 720, 480);
		
		game.load.audio('slash', 'sounds/swordslash.mp3');
		game.load.audio('pickup', 'sounds/swordpickup.mp3');
		game.load.audio('hitobj', 'sounds/swordhitobj.mp3');
		
	}

	let filecomplete = (progress, cacheKey, success, totalLoaded, totalFiles) =>{
		
		text.setText("File Complete: "+ progress + "% - "+ totalLoaded+ " out of "+ totalFiles);
		
	}

	let loadingcomplete = () =>{
		
		text.setText("Load Complete");
		
	}

	let 	bmd,
			mybmd,
			sprite,
			tooltip,
			player1display,
			player2display,
			sword1display,
			sword2display,
			shield1display,
			shield2display,
			displayarray = [],
			i = 0,
			hex;

	function create() {

		text.destroy();
		gamestate = inmenu;
		
		game.world.setBounds(0, 0, gamewidth, gameheight);
		game.stage.backgroundColor = "#243e36";
		
		//game.scale.fullScreenScaleMode = Phaser.ScaleManager.USER_SCALE;
		//game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		//game.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
		//game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
		
		textanimation = game.add.sprite(0, 160, 'nyan');
		textanimation.animations.add('shiny', [1,2,3,4,5,6,7,8,9,10,11,12], 20, true);
		textanimation.visible = false;
		
		textinit();
		
		addcolorpicker();
		
		let leftside = game.camera.x + (game.camera.width/4);
		let rightside = game.camera.x + game.camera.width - (game.camera.width/4);
		
		player2display = game.add.sprite(rightside, game.world.height/2, 'player');
		player1display = game.add.sprite(rightside, game.world.height/2-(player2display.height*4), 'player');
		
		initdisplay(player2display);
		initdisplay(player1display);
		
		sword1display = game.add.sprite(rightside + 75, player1display.y, "sword");
		sword2display = game.add.sprite(rightside + 75, player2display.y, "sword");
		
		initdisplay(sword1display);
		initdisplay(sword2display);
		
		shield1display = game.add.sprite(rightside + 74, player1display.y + player1display.height/1.5, "shield");
		shield2display = game.add.sprite(rightside + 74, player2display.y + player2display.height/1.5, "shield"); 
		
		initdisplay(shield1display);
		initdisplay(shield2display);
		
		displayarray.push(player1display, sword1display, shield1display, player2display, sword2display, shield2display);
	}

	let initdisplay = (displayobj) =>{
		
		displayobj.scale.setTo(3, 3);
		
	}

	function addcolorpicker(){

		bmd = game.add.bitmapData(150, 100);
		let grd = bmd.context.createLinearGradient(0, 0, 150, 0);
		grd.addColorStop(0, "black");
		grd.addColorStop(0.3,"magenta");
		grd.addColorStop(0.5,"blue");
		grd.addColorStop(0.6,"green");
		grd.addColorStop(0.8,"yellow");
		grd.addColorStop(1,"red");
		bmd.context.fillStyle = grd;
		bmd.context.fillRect(0,0,150,100);
		bmd.update();
		mybmd = game.add.sprite(game.camera.x + game.camera.width/2, game.height/3, bmd);
		
		tooltip = game.make.bitmapData(32, 32);

		sprite = game.add.sprite(0, 0, tooltip);
		
		game.input.addMoveCallback(updateTooltip, this);
		
	}

	function deletecolorpicker(){
		
		bmd.destroy();
		mybmd.destroy();
		tooltip.destroy();
		sprite.destroy();
		
	}

	function deletedisplay(){
		
		player1display.destroy();
		player2display.destroy();
		sword1display.destroy();
		sword2display.destroy();
		shield1display.destroy();
		shield2display.destroy();
		
	}

	function deletemenu(){
		
		textanimation.destroy();
		nidish.destroy();
		playgame.destroy();
		github.destroy();
		fullscreen.destroy();

	}

	function gofull() {
		
		if (game.scale.isFullScreen){
		
			game.scale.stopFullScreen();
			
		}
		else{
			
			//game.scale.setUserScale(1, 1);
			game.scale.startFullScreen(true);
			
		}

	}

	function updateTooltip (pointer, x, y) {
		
		if (x >= mybmd.x && x <= mybmd.x + mybmd.width && y >= mybmd.y && y <= mybmd.y + mybmd.height)
		{

			let cpickerx = pointer.x -(game.camera.x + game.camera.width/2)
			let cpickery = pointer.y -(game.height/3)
			let color = bmd.getPixelRGB(cpickerx, cpickery);
			
			let rgb = color.rgba.split("(")[1].split(")")[0];
			rgb = rgb.split(",");
			rgb.splice(-1,1)
		
			let hex = rgb.map(function(x){
				x = parseInt(x).toString(16);
				return (x.length==1) ? "0"+x : x;
			});
			
			hex = "0x"+hex.join("");

			tooltip.fill(0, 0, 0, 0);
			tooltip.rect(0, 0, 32, 32, color.rgba);		
			sprite.x = x;
			sprite.y = y;
			
			if (pointer.leftButton.justPressed()){
				
				displayarray[i].tint = hex;
				i++
				if(i > 5){i = 0;}
				
			}

		}

	}

	function textinit(){
		
		if(gamestate === inmenu){
			
			nidish = game.add.text(gamewidth/3, 0, "Nidish", { font: "80px Courier New", fill: "#c2a83e", align: "center" });
		
			playgame = game.add.text(0, 100, "Play", { font: "65px Courier New", fill: "#c2a83e", align: "center" });
		
			github = game.add.text(0, 250, "Github", { font: "65px Courier New", fill: "#c2a83e", align: "center" });
		
			fullscreen = game.add.text(0, 400, "Fullscreen", { font: "65px Courier New", fill: "#c2a83e", align: "center" });

			enableinput(playgame);
			enableinput(github);
			enableinput(fullscreen);
		
		}
		
		if(gamestate === win){

			nidish = game.add.text(gamewidth/10, 0, whowon + " Wins", { font: "80px Courier New", fill: "#c2a83e", align: "center" });
		
			playgame = game.add.text(0, 100, "Back to menu", { font: "65px Courier New", fill: "#c2a83e", align: "center" });
		
			github = game.add.text(0, 250, "Rematch", { font: "65px Courier New", fill: "#c2a83e", align: "center" });
		
			fullscreen = game.add.text(0, 400, "Fullscreen", { font: "65px Courier New", fill: "#c2a83e", align: "center" });

			enableinput(playgame);
			enableinput(github);
			enableinput(fullscreen);
		
		}
		
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
		
		if(item === fullscreen){
			gofull();
		}
		
		if (gamestate === inmenu){
			
			if(item === playgame){
				
				deletemenu();
				deletedisplay();
				deletecolorpicker();
				
				gamestate = ingame;
				startthegame();
				
			}else if(item === github){
				
				location.href = "http://www.github.com/twofist";
				
			}
		}
		
		if(gamestate === win){
			
			if(item === playgame){
				
				deletemenu();
				displayarray = [];
				i = 0;
				create();
				
			}else if(item === github){
				
				deletemenu();
				startthegame();
				
			}
			
		}

	}

	let background, sidebackground, endbackground;

	function startthegame(){

		game.world.setBounds(0, 0, gamewidth*5, gameheight);

		//enable physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		backgrounds = game.add.group();
		
		background = backgrounds.create(gamewidth*2, 0, 'middlebackground');
		background.animations.add('middlebackground', [0, 1, 2, 3, 4, 5, 6, 7, 8], 8, true);
		
		sidebackground = backgrounds.create(gamewidth, 0, 'sidebackground');
		sidebackground.animations.add('sidebackground', [0, 1, 2, 3, 4, 5, 6, 7, 8], 8, true);
		
		endbackground = backgrounds.create(0, 0, 'endbackground');
		endbackground.animations.add('endbackground', [0,1,2,3,4,5,6], 2, true);
		
		//make platforms a group
		platforms = game.add.group();
		//enable physics for every object in the group
		platforms.enableBody = true;

		//create ground
		let ground = platforms.create(gamewidth*2, game.height-40, 'platform');
		let ground2 = platforms.create(gamewidth, gameheight-40, 'sideplatform');
		let ground3 = platforms.create(gamewidth*4, gameheight-40, 'sideplatform');
		let ground4 = platforms.create(0, gameheight-40, 'endplatform');
		let ground5 = platforms.create(gamewidth*5, gameheight-40, 'endplatform');
		
		initground(ground);
		initground(ground2);
		initground(ground3);
		initground(ground4);
		initground(ground5);
		
		ground3.scale.x = -1;
		ground5.scale.x = -1;
		
		//set camera
		game.camera.x = (game.world.width/2) - (game.width/2);
		
		let leftside = game.camera.x + (game.camera.width/5);
		let rightside = game.camera.x + game.camera.width - (game.camera.width/5);
		
		// The player and its settings
		
		player1 = game.add.sprite(rightside, 0, 'player');
		player1.tint = displayarray[0].tint;

		player2 = game.add.sprite(leftside, 0, 'player');
		player2.tint = displayarray[3].tint;
		
			addplayerstats(player1);
			addplayerstats(player2);
		
		arrowstuff = game.add.sprite(game.camera.x + (game.camera.width/2), 0, 'arrowstuff');
		arrowstuff.scale.setTo(3,3);
		
		//make weapon group
		swords = game.add.group();
		shields = game.add.group();
		
		//add sword and shields
		sword1 = swords.create(rightside - 25, 0, "sword");
		sword1.tint = displayarray[1].tint;
		
		sword2 = swords.create(leftside + 25, 0, "sword");
		sword2.tint = displayarray[4].tint;

		shield1 = shields.create(rightside + 25, 0, "shield");
		shield1.tint = displayarray[3].tint;
		
		shield2 = shields.create(leftside - 25, 0, "shield");
		shield2.tint = displayarray[5].tint;

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
			'Pkey': Phaser.KeyCode.P,  //p1 block
			'Ikey': Phaser.KeyCode.I,  //p2 throw
			'Rkey': Phaser.KeyCode.R  //p1 throw
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
			Phaser.Keyboard.P,
			Phaser.Keyboard.I,
			Phaser.Keyboard.R
		]);
		
			swordslash = game.sound.add('slash');
			swordpickup = game.sound.add('pickup');
			swordhitobj = game.sound.add('hitobj');
		
		//show fps
		game.time.advancedTiming = true;
		let style = { font: "24px Arial", fill: "#fff" };
		text = game.add.text(game.camera.x, 0, "FPS: " +game.time.fps, style);
		
		handlesidepass = decide;
		gamescene = 0;
		
	}

	let initground = (ground) =>{
		
		//scale it to fit the window size
		ground.scale.setTo(1, 1);

		//make it not fall when you jump on it
		ground.body.immovable = true;
		
	}

	function update() {

		switch(gamestate){
		  case ingame:
			game.physics.arcade.collide(swords, platforms);
			game.physics.arcade.collide(shields, platforms);
			game.physics.arcade.collide(player1, player2);
			
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
			canpassside();
		
			text.setText("FPS: " +game.time.fps);
			
			checkforwin();
			
		break;
		default:
		}

	}

	let checkforwin = ()=>{
		
		if(player2.x < game.world.width && player2.x > game.world.width - 50 && handlesidepass === godown){
			gamestate = win;
			whowon = "player2";
			winscreen();
		}
		
		if(player1.x > 0 && player1.x < 50 && handlesidepass === godown){
			gamestate = win;
			whowon = "player1";
			winscreen();
		}
		
	}

	function winscreen(){
		
		backgrounds.destroy();
		platforms.destroy();
		player1.destroy();
		player2.destroy();
		swords.destroy();
		shields.destroy();
		arrowstuff.destroy();
		text.destroy();
		
		game.world.setBounds(0, 0, gamewidth, gameheight);
		
		textanimation = game.add.sprite(0, 160, 'nyan');
		textanimation.animations.add('shiny', [1,2,3,4,5,6,7,8,9,10,11,12], 20, true);
		textanimation.visible = false;
		
		textinit();
		
	}



	let keepplayerupdated = (player, otherplayer) =>{

		player.body.velocity.x = 0; //resets velocity so it doesnt move forever
			
		movement(player); //handles movement
		updatebars(player); //handle hp/death
		playerstates(player, otherplayer); //handles current animation

	}

	let movement = (player) => {

		game.physics.arcade.collide(player, platforms);

		if(player === player1){
			playermovement(player, cursors.left, cursors.right, cursors.up, cursors.down, wasd.Okey, wasd.Pkey, wasd.Ikey);
		}
		if (player === player2){
			playermovement(player, wasd.left, wasd.right, wasd.up, wasd.down, wasd.Zkey, wasd.Tkey, wasd.Rkey);
		}
		
	}

	let playermovement = (player, leftkey, rightkey, upkey, downkey, attackkey, blockkey, throwkey) =>{
		
		switch(player.curstate){
			
			case dead:
				break;
				
			default:
			
				let blockamounttimer;
				
				if(throwkey.justPressed() && player.curstate !== normalattack && player.curstate !== airattackdown && player.sword !== 0){
				
				throwthesword(player);
				
				}else if(downkey.isDown && player.body.touching.down && player.curstate !== normalattack){
					
					player.curstate = ducking;
					
				}else if(attackkey.justPressed() && player.body.touching.down && player.sword !== 0 && player.curstate !== normalattack){
					
						player.curstate = normalattack;
						swordslash.play();
								
				}else if((leftkey.isDown && player.curstate !== normalattack) && (player.x-(player.width/2) > game.camera.x || handlesidepass === goleft && canpassleft === player)){
					
					player.body.velocity.x = -walkspeed;
					
					if(player.curstate !== airattackdown){
						player.curstate = walking;
					}
						switch(player.scale.x){case -playerscalew: player.scale.x = player.scale.x * -1; break; default: }
						
				}else if((rightkey.isDown && player.curstate !== normalattack) && (player.x-(player.width/2) < game.camera.x+game.camera.width || handlesidepass === goright && canpassright === player)){
					
					player.body.velocity.x = walkspeed;
					
					if(player.curstate !== airattackdown){
						
						player.curstate = walking;
						
					}
						switch(player.scale.x){case playerscalew: player.scale.x = player.scale.x * -1; break; default: }
						
				}else if(blockkey.isDown && player.body.touching.down && player.shield !== 0 && player.curstate !== normalattack){
					
					player.blocking = true;
					player.curstate = blocking;
					game.time.events.remove(blockamounttimer);
				//}else if(player.body.touching.down && player.curstate !== normalattack){
				//	player.curstate = exhaustedidle;

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
			case dead:				player.animations.play('deadanimation').onComplete.add(function () {
										player.respawn();
									}, this);
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

		if(gamescene === 2 && handlesidepass !== goleft || gamescene === -2 && handlesidepass !== goright){
			handlesidepass = godown;
		}
		
		if(player.curhp <= 0){
			
			player.curstate = dead;
			
			if(player === player1 && gamescene !== 2){
				handlesidepass = goright;
			}else if(player === player2 && gamescene !== -2){
				handlesidepass = goleft;
			}else if(gamescene === 2 || gamescene === -2){
				handlesidepass = godown;
			}
			
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
			game.time.events.add(100, canhitplayer, this, thesword);
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
			playertakesdamage(player, sword1);
		}
		
		if(sword2.hittheplayer && test2){
			playertakesdamage(player, sword2);
		}
		
	}

	let playertakesdamage = (player, sword) => {
		
		player.curhp -= 20;
		sword.hittheplayer = false;
		
	}

	let throwthesword = (player) =>{
		
		let thesword = player.sword;
			player.sword.onplayer = 0;
			player.sword = 0;
			thesword.flying = true;
			thesword.body.velocity.y = -350;
			switch(player.scale.x){
				case -playerscalew: throwdirection(player, thesword, -playerscalew);
					break;
				case playerscalew:	throwdirection(player, thesword, playerscalew);
					break;
				default:
			}
			
			game.time.events.add(100, canhitplayer, this, thesword);
		
	}

	let throwdirection = (player, thesword, wichside) =>{
		
		thesword.x = player.x - (player.width + 20 * -wichside);
		thesword.body.velocity.x = 300 * -wichside;
		
	}



	let addweapontoplayer = (player, otherplayer) =>{

		let hitsword1 = game.physics.arcade.collide(player, sword1);
		let hitsword2 = game.physics.arcade.collide(player, sword2);
		let hitshield1 = game.physics.arcade.collide(player, shield1);
		let hitshield2 = game.physics.arcade.collide(player, shield2);
		
		if (player.sword === 0){
			
			if(hitsword1 && otherplayer.sword !== sword1 && sword1.onplayer === 0){
				handlepickupweapon(player, sword1);
			}else if(hitsword2 && otherplayer.sword !== sword2 && sword2.onplayer === 0){
				handlepickupweapon(player, sword2);
			}	
			
		}
		
		if(player.shield === 0){
			
			if(hitshield1 && otherplayer.shield !== shield1 && shield1.onplayer === 0){
				handlepickupweapon(player, shield1);
			}else if(hitshield2 && otherplayer.shield !== shield2 && shield2.onplayer === 0){
				handlepickupweapon(player, shield2);
			}
			
		}
		
	}

	let handlepickupweapon = (player, object) =>{
		
		if(shields.children.indexOf(object) > -1){
			player.shield = object;
			object.onplayer = player;
		}
		
		if(swords.children.indexOf(object) > -1){
			player.sword = object;
			object.onplayer = player;
		}
		
		swordpickup.play();
		
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
			case dead:				setsworddying(player, sword);
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
			case dead:				setshielddying(player, shield);
				break;
			default: 				shield.x = player.x - player.width/4;
									shield.y = player.y;
									shield.angle = 0;
		}
		
	}


	let setsworddying = (player, sword) =>{
		
		let swordinhandy; 
		let swordinhandx = player.x - player.width/4;
		let perf;
		
		switch(player.frame){
			
		case 21:	perf = 3;
					swordinhandy = player.y - 2;
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
			
		case 22: 	perf = 6;
					swordinhandy = player.y - 3;
				switch(player.scale.x){
				case -playerscalew:
							sword.angle = 40;
							sword.x = swordinhandx + perf;
							sword.y = swordinhandy;
					break;
				default: 
							sword.angle = -40;
							sword.x = swordinhandx - perf;
							sword.y = swordinhandy;
				}
			break;
			
		case 23: 	perf = 9;
					swordinhandy = player.y - -12;
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
			
		case 24: 	perf = 12;
					swordinhandy = player.y - -15;
				switch(player.scale.x){
				case -playerscalew:
							sword.angle = 90;
							sword.x = swordinhandx + perf;
							sword.y = swordinhandy;
					break;
				default: 
							sword.angle = -90;
							sword.x = swordinhandx - perf;
							sword.y = swordinhandy;
				}
			break;
			
		default:
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


	let setshielddying = (player, shield) =>{
		
		let shieldinhandy; 
		let shieldinhandx = player.x - player.width/4;
		let perf;
		
		switch(player.frame){
			
		case 21:	perf = -15;
					shieldinhandy = player.y - -2;
				switch(player.scale.x){
				case -playerscalew:
							shield.angle = 30;
							shield.x = shieldinhandx + perf;
							shield.y = shieldinhandy;
					break;
				default: 
							shield.angle = -30;
							shield.x = shieldinhandx - perf;
							shield.y = shieldinhandy;
				}
			break;
			
		case 22: 	perf = 0;
					shieldinhandy = player.y - -4;
				switch(player.scale.x){
				case -playerscalew:
							shield.scale.x = -playerscalew;
							shield.angle = 40;
							shield.x = shieldinhandx + perf;
							shield.y = shieldinhandy;
					break;
				default: 	shield.scale.x = playerscalew;
							shield.angle = -40;
							shield.x = shieldinhandx - perf;
							shield.y = shieldinhandy;
				}
			break;
			
		case 23: 	perf = -2;
					shieldinhandy = player.y - -12;
				switch(player.scale.x){
				case -playerscalew:
							shield.scale.x = -playerscalew;
							shield.angle = 100;
							shield.x = shieldinhandx + perf;
							shield.y = shieldinhandy;
					break;
				default: 	shield.scale.x = playerscalew;
							shield.angle = -100;
							shield.x = shieldinhandx - perf;
							shield.y = shieldinhandy;
				}
			break;
			
		case 24: 	perf = 0;
					shieldinhandy = player.y - -16;
				switch(player.scale.x){
				case -playerscalew:
							shield.scale.x = -playerscalew;
							shield.angle = 90;
							shield.x = shieldinhandx + perf;
							shield.y = shieldinhandy;
					break;
				default: 	shield.scale.x = playerscalew;
							shield.angle = -90;
							shield.x = shieldinhandx - perf;
							shield.y = shieldinhandy;
				}
			break;
			
		default:
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
		}
		
		if(handobject.onplayer === player1 || handobject.onplayer === player2){
			handobject.body.checkCollision.none = true;
			handobject.body.allowGravity = false;
			handobject.flying = false;
			handobject.hittheplayer = false;
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
				leftside = game.camera.x + (game.camera.width/20);
				rightside = game.camera.x + game.camera.width - (game.camera.width/20);
			player1.x = rightside;
			player2.x = leftside;
			text.x = game.camera.x;
			
		}else if(player2.x >= game.camera.x+game.camera.width){
			
			game.camera.x = game.camera.x + game.camera.width; //move camera right
				leftside = game.camera.x + (game.camera.width/20);
				rightside = game.camera.x + game.camera.width - (game.camera.width/20);
			player2.x = leftside;
			player1.x = rightside;
			text.x = game.camera.x;
		}
		
		switch(game.camera.x){
			case 0: 			gamescene = -2;
								endbackground.x = 0;
								endbackground.scale.x = 1;
								endbackground.animations.play('endbackground');
				break;
			case gamewidth: 	gamescene = -1;
								sidebackground.x = gamewidth;
								sidebackground.scale.x = 1;
								sidebackground.animations.play('sidebackground');
				break;
			case gamewidth*2: 	gamescene = 0;
								background.animations.play('middlebackground');
				break;
			case gamewidth*3: 	gamescene = 1;
								sidebackground.x = gamewidth*4;
								sidebackground.scale.x = -1;
								sidebackground.animations.play('sidebackground');
				break;
			case gamewidth*4: 	gamescene = 2;
								endbackground.x = gamewidth*5;
								endbackground.scale.x = -1;
								endbackground.animations.play('endbackground');
				break;
			default:
		}
		
		
	}

	let canpassside = () => {
		
		switch(handlesidepass){
			case decide: 	canpassright = 0;
							canpassleft = 0;
							arrowstuff.frame = 2;
							arrowstuff.x = game.camera.x + (game.camera.width/2) - (arrowstuff.width/2);
				break;
			case goright: 	canpassright = player2;
							canpassleft = 0;
							arrowstuff.frame = 0;
							arrowstuff.x = game.camera.x + game.camera.width - arrowstuff.width;
				break;
			case goleft: 	canpassright = 0;
							canpassleft = player1;
							arrowstuff.frame = 1;
							arrowstuff.x = game.camera.x;
				break;
			case godown:	arrowstuff.frame = 3;
							if(gamescene === -2){
								arrowstuff.x = game.camera.x;
							}else if(gamescene === 2){
								arrowstuff.x = game.camera.x + game.camera.width - arrowstuff.width;
							}
				break;
			default:
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
		player.curhp = player.maxhp;
		
		player.shield = 0;
		player.sword = 0;
		
		player.blockedamount = 0;
		player.beenhit = false;
		
		player.respawn = function(){
			
			if(player === player1){
				let rightside = game.camera.x + game.camera.width - (game.camera.width/20);
				resetplayerpos(player, rightside);
			}else if(player === player2){
				let leftside = game.camera.x + (game.camera.width/20);
				resetplayerpos(player, leftside);			
			}
			
			player.curhp = maximumhp;
			
			player.curstate = falling;
		}
		
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
		player.animations.add('deadanimation', [21, 22, 23, 24], 6, false);
		
	}

	let resetplayerpos = (player, wichside) =>{
		
		player.x = wichside;
		player.y = game.world.height/2;

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

})()
