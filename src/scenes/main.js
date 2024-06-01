class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // Load any assets needed for the title screen here
    }

    create() {
        this.add.text(400, 300, 'Press SPACE to Start', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 350, '<> to Move, SPACE to Shoot', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.atlasXML('alienParts', 'assets/spritesheet_spaceships.png', 'assets/spritesheet_spaceships.xml');
        this.load.atlasXML('spaceParts', 'assets/sheet.png', 'assets/sheet.xml');
    }

    create() {
        // Add a white border around the game area
        this.add.graphics()
            .lineStyle(5, 0xffffff, 1)
            .strokeRect(0, 0, this.game.config.width, this.game.config.height);

        // Use the correct frame names for player ship, bullets, and enemy ships
        this.player = this.physics.add.sprite(400, 500, 'spaceParts', 'playerShip2_orange.png');
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.bullets = this.physics.add.group({
            defaultKey: 'spaceParts',
            frame: 'laserBlue01.png',
            maxSize: 30,  // Create a pool of 30 bullets
            runChildUpdate: true
        });

        this.enemies = this.physics.add.group();

        this.time.addEvent({
            delay: 2000, // Adjusted to reduce the spawn rate
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Add collision detection between bullets and enemies
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        // Add collision detection between player and enemies
        this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);

        this.score = 0;
        this.lives = 3;

        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        this.livesText = this.add.text(10, 30, 'Lives: 3', { fontSize: '16px', fill: '#fff' });

        this.input.keyboard.on('keydown-SPACE', this.shoot, this);

        this.gameOver = false;
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.lives <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.endGame();
        }

        // Update lives text
        this.livesText.setText('Lives: ' + this.lives);
    }

    shoot() {
        const bullet = this.bullets.getFirstDead(true, this.player.x, this.player.y - 20, 'spaceParts', 'laserBlue01.png');

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.velocity.y = -300;
            bullet.body.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.body.world.on('worldbounds', () => {
                bullet.setActive(false);
                bullet.setVisible(false);
            });
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(50, 750);
        const enemy = this.enemies.create(x, 50, 'alienParts', 'shipBlue_manned.png');
        enemy.body.velocity.y = 50; // Reduced speed

        // Destroy enemy if it goes out of bounds and reduce player lives
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
        enemy.body.world.on('worldbounds', (body) => {
            if (body.gameObject === enemy && enemy.active) {
                this.lives -= 1;
                this.livesText.setText('Lives: ' + this.lives);
                enemy.destroy();
            }
        });
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false);
        bullet.setVisible(false);

        enemy.destroy();

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    playerHit(player, enemy) {
        enemy.destroy();

        this.lives -= 1;
        this.livesText.setText('Lives: ' + this.lives);

        if (this.lives <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.endGame();
        }
    }

    endGame() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, 'Press SPACE to Restart', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('TitleScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [TitleScene, GameScene]
};

const game = new Phaser.Game(config);
