class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }
    
    create() {
        // Background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        // Player setup
        this.player = this.physics.add.sprite(400, 550, 'player').setCollideWorldBounds(true);
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);

        // Bullets
        this.playerBullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        // Enemies
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
        var enemy = this.enemies.create(xPosition, yPosition, 'enemy');
        enemy.setVelocityY(Phaser.Math.Between(50, 100));
    }

    hitEnemy(bullet, enemy) {
        bullet.disableBody(true, true);
        enemy.disableBody(true, true);
        this.score += 10;  // adjust score value as needed
        this.scoreText.setText('Score: ' + this.score);
    }
}
