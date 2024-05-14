var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [PreloadScene, MainScene, ScoreScene]
};

var game = new Phaser.Game(config);

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("alienParts", "spritesheet_spaceships.png", "spritesheet_spaceships.xml");
        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml");
    }

    create() {
        this.scene.start('MainScene');
    }
}

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'spaceParts', 'background');
        
        // Player setup using the spaceParts atlas
        this.player = this.physics.add.sprite(400, 550, 'spaceParts', 'playerShip2_orange.png').setCollideWorldBounds(true);
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        
        // Player's bullets using the laserParts atlas
        this.playerBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image
        });

        // Enemies using the alienParts atlas
        this.enemies = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image
        });

        // Spawn enemies
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemies,
            callbackScope: this,
            loop: true
        });

        // Collisions
        this.physics.add.collider(this.playerBullets, this.enemies, this.hitEnemy, null, this);

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

        // Lives
        this.lives = 3;
        this.livesText = this.add.text(680, 16, 'Lives: 3', { fontSize: '32px', fill: '#fff' });
    }

    update() {
        this.movePlayer();
        this.background.tilePositionX += 2;

        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.space)) {
            this.shootBullet();
        }
    }

    movePlayer() {
        this.player.setVelocity(0);

        if (this.cursorKeys.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursorKeys.right.isDown) {
            this.player.setVelocityX(200);
        }
    }

    shootBullet() {
        var bullet = this.playerBullets.get(this.player.x, this.player.y);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-300);
        }
    }

    spawnEnemies() {
        var xPosition = Phaser.Math.Between(50, 750);
        var yPosition = 0;
        var enemy = this.enemies.create(xPosition, yPosition, 'alienParts', 'ufoRed');
        enemy.setVelocityY(Phaser.Math.Between(50, 100));
    }

    hitEnemy(bullet, enemy) {
        bullet.disableBody(true, true);
        enemy.disableBody(true, true);
        this.score += 10;  // adjust score value as needed
        this.scoreText.setText('Score: ' + this.score);
    }
}

class ScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreScene' });
    }

    create() {
        this.add.text(20, 20, 'Game Over\nClick to restart', { fontSize: '25px', fill: '#fff' });
        this.input.on('pointerdown', () => this.scene.start('MainScene'));
    }
}
