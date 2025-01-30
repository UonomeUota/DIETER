// src/game.js

class StartScene extends Phaser.Scene {
    //スタート画面を作成
    constructor() {
        super({ key: 'StartScene' });
        this.textScaleDirection = 1; // テキストのスケールの方向（1: 拡大, -1: 縮小）
        this.textScaleSpeed = 0.005; // テキストのスケールの変化速度
    }

    preload() {
        this.load.image('startImage', 'png/start.png');
        this.load.image('logo', 'png/logo.png');
        this.load.font('PixelFont', 'fonts/PixelMplus12-Regular.ttf');
    }

    create() {
        this.add.image(config.width / 2, config.height / 2, 'startImage');

        const textStyle = {
            fontFamily: 'PixelFont',
            fontSize: '18px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        };
        this.startText = this.add.text(config.width / 2, 100, 'スペースキーでスタート', textStyle).setOrigin(0.5);
        this.logo = this.add.image(config.width / 2, 0, 'logo').setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }

    update() {
        // ロゴの降下アニメーション
        if (this.logo.y < config.height - 30) {
            this.logo.y += 2; // ロゴを下に移動
        }

        // スタートテキストの拡大・縮小処理
        this.startText.scaleX += this.textScaleSpeed * this.textScaleDirection;
        this.startText.scaleY += this.textScaleSpeed * this.textScaleDirection;

        // スケールの方向を反転
        if (this.startText.scaleX >= 1.2 || this.startText.scaleX <= 0.8) {
            this.textScaleDirection *= -1;
        }
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.candies = []; // お菓子の配列
        this.enemies = []; // 敵の配列
        this.score = 0; // スコア
    }

    preload() {
        this.load.image('player', 'png/player.png');
        this.load.image('candy', 'png/candy.png');
        this.load.spritesheet('playerWalkingForward', 'png/player_walking_animation/walking_forward/sheet.png', { frameWidth: 64, frameHeight: 64 }); // 前進アニメーション用スプライトシートをロード
        this.load.spritesheet('playerWalkingBackward', 'png/player_walking_animation/walking_backward/sheet.png', { frameWidth: 64, frameHeight: 64 }); // 後退アニメーション用スプライトシートをロード
        this.load.spritesheet('playerWalkingRight', 'png/player_walking_animation/walking_right/sheet.png', { frameWidth: 64, frameHeight: 64 }); // 右移動アニメーション用スプライトシートをロード
        this.load.spritesheet('playerWalkingLeft', 'png/player_walking_animation/walking_left/sheet.png', { frameWidth: 64, frameHeight: 64 }); // 左移動アニメーション用スプライトシートをロード
    }

    create() {
        // 画面の中央にプレイヤーキャラクターを配置
        this.player = this.physics.add.sprite(config.width / 2, config.height / 2, 'player').setOrigin(0.5);
        this.player.setCollideWorldBounds(true); // プレイヤーが画面の端に衝突しないようにする

        this.cursors = this.input.keyboard.createCursorKeys(); // キーボードの入力を取得

        // アニメーションの作成
        this.anims.create({
            key: 'walkForward',
            frames: this.anims.generateFrameNumbers('playerWalkingForward', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkBackward',
            frames: this.anims.generateFrameNumbers('playerWalkingBackward', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkRight',
            frames: this.anims.generateFrameNumbers('playerWalkingRight', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkLeft',
            frames: this.anims.generateFrameNumbers('playerWalkingLeft', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // スコア表示用のテキスト
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '16px', fill: '#fff' });

        // 敵を生成するタイマー
        this.enemyTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // プレイヤーの移動処理
        let moving = false; // 移動中かどうかのフラグ

        if (this.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.A)) {
            this.player.setVelocityX(-160);
            this.player.anims.play('walkLeft', true); // 左移動アニメーションを再生
            moving = true;
        } else if (this.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.D)) {
            this.player.setVelocityX(160);
            this.player.anims.play('walkRight', true); // 右移動アニメーションを再生
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.W)) {
            this.player.setVelocityY(-160);
            this.player.anims.play('walkForward', true); // 前進アニメーションを再生
            moving = true;
        } else if (this.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.S)) {
            this.player.setVelocityY(160);
            this.player.anims.play('walkBackward', true); // 後退アニメーションを再生
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        // アニメーションの停止
        if (!moving) {
            this.player.anims.stop(); // アニメーションを停止
        }

        // 敵の移動処理
        this.enemies.forEach(enemy => {
            this.physics.moveToObject(enemy, this.player, 100);
        });

        // プレイヤーと敵の衝突処理
        this.physics.overlap(this.player, this.enemies, this.gameOver, null, this);
    }

    throwCandy() {
        const candy = this.physics.add.sprite(Phaser.Math.Between(0, config.width), 0, 'candy');
        candy.setVelocity(0, 200);
        this.candies.push(candy);
    }

    spawnEnemy() {
        const enemy = this.physics.add.sprite(Phaser.Math.Between(0, config.width), 0, 'enemy');
        enemy.setVelocity(0, 100);
        this.enemies.push(enemy);
    }

    gameOver() {
        this.scene.restart(); // ゲームオーバー時にシーンを再起動
    }

    hitCandy(player, candy) {
        candy.destroy(); // お菓子を削除
        this.score += 10; // スコアを増加
        this.scoreText.setText('Score: ' + this.score); // スコアを更新
    }
}

// Phaserの設定を定義
const config = {
    type: Phaser.AUTO,
    width: 320,
    height: 240,
    pixelArt: true,
    scene: [StartScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 新しいPhaserゲームを作成
const game = new Phaser.Game(config);
