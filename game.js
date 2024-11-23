// src/game.js

// Phaserの設定を定義
const config = {
    type: Phaser.AUTO, // 自動的にレンダラーを選択
    width: 320, // ゲーム画面の幅
    height: 240, // ゲーム画面の高さ
    pixelArt: true, // ドットを鮮明に保つ
    scene: {
        preload: preload, // プリロード処理
        create: create,   // ゲームの初期化処理
        update: update    // ゲームの更新処理
    },
    scale: {
        mode: Phaser.Scale.FIT, // ウィンドウに合わせる
        autoCenter: Phaser.Scale.CENTER_BOTH // 中央揃え
    }
};

// 新しいPhaserゲームを作成
const game = new Phaser.Game(config);
let player; // プレイヤーのスプライトを格納する変数
let startText; // スタートテキストのスプライトを格納する変数
let logo; // ロゴのスプライトを格納する変数
let logoFalling = true; // ロゴが降下中かどうかのフラグ
let textScaleDirection = 1; // テキストのスケールの方向（1: 拡大, -1: 縮小）
let textScaleSpeed = 0.005; // テキストのスケールの変化速度
let isGameActive = false; // ゲームがアクティブかどうかのフラグ

function preload() {
    // 画像をプリロード
    this.load.image('startImage', 'png/start.png'); // 画像のパスを指定
    this.load.image('logo', 'png/logo.png'); // ロゴ画像のパスを指定
    this.load.image('player', 'png/player.png'); // プレイヤーキャラクターの画像を指定
    this.load.image('candy', 'png/candy.png'); // お菓子の画像を指定
    // フォントをプリロード
    this.load.font('PixelFont', 'fonts/PixelMplus12-Regular.ttf'); // フォントのパスを指定
}

// ゲームの初期化
function create() {
    // 背景画像を表示
    this.add.image(config.width / 2, config.height / 2, 'startImage'); // 画面の中央に画像を配置

    // テキストを表示
    const textStyle = {
        fontFamily: 'PixelFont',
        fontSize: '18px',
        fill: '#fff', // テキストの色
        stroke: '#000', // 縁取りの色
        strokeThickness: 2 // 縁取りの太さ
    };
    startText = this.add.text(config.width / 2, 100, 'スペースキーでスタート', textStyle).setOrigin(0.5); // テキストを中央揃えで表示

    // ロゴ画像を表示
    logo = this.add.image(config.width / 2, 0, 'logo').setOrigin(0.5); // 画面の上部にロゴを配置

    // スペースキーの入力を設定
    this.input.keyboard.on('keydown-SPACE', startGame, this);
}

function startGame() {
    isGameActive = true; // ゲームをアクティブにする
    startText.setVisible(false); // スタートテキストを非表示にする
    logo.setVisible(false); // ロゴを非表示にする

    // プレイヤーキャラクターを作成
    player = this.physics.add.sprite(config.width / 2, config.height - 30, 'player').setOrigin(0.5);
    player.setCollideWorldBounds(true); // プレイヤーが画面外に出ないようにする

    // お菓子を投げるタイマーを設定
    candyTimer = this.time.addEvent({
        delay: 1000, // 1秒ごとにお菓子を投げる
        callback: throwCandy,
        callbackScope: this,
        loop: true
    });

    // キーボードの入力を管理
    cursors = this.input.keyboard.createCursorKeys();
}

// ゲームの更新処理
function update() {
    if (!isGameActive) {
        // ゲームがアクティブでない場合はロゴとテキストのアニメーションを続ける
        if (logoFalling) {
            logo.y += 2; 
            if (logo.y >= config.height - 30) {
                logo.y = config.height - 30;
                logoFalling = false;
            }
        }

        // スタートテキストの拡大・縮小処理
        startText.scaleX += textScaleSpeed * textScaleDirection;
        startText.scaleY += textScaleSpeed * textScaleDirection;

        // スケールの方向を反転
        if (startText.scaleX >= 1.2 || startText.scaleX <= 0.8) {
            textScaleDirection *= -1;
        }
    } else {
        // ゲームプレイ中の更新処理
        // プレイヤーの移動処理
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
        } else {
            player.setVelocityX(0);
        }

        // お菓子の衝突処理
        this.physics.overlap(player, candies, hitCandy, null, this);
    }
}

function throwCandy() {
    const candy = this.physics.add.sprite(Phaser.Math.Between(0, config.width), 0, 'candy');
    candy.setVelocity(0, 200);
    candies.push(candy);
}

function hitCandy(player, candy) {
    candy.destroy(); // お菓子を削除
    // ゲームオーバー処理をここに追加することができます
}
