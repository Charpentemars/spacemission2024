import * as Phaser from 'phaser';
import TiledObject = Phaser.Types.Tilemaps.TiledObject;

export default class Space extends Phaser.Scene
{
    private particles: Phaser.GameObjects.Particles.ParticleEmitter;
    private layer: Phaser.Tilemaps.TilemapLayer;
    private objets: Phaser.Tilemaps.TilemapLayer;
    private arrayObjets: number[] = [];
    private scoreText: Phaser.GameObjects.Text;
    private score: number;
    private sprite: Phaser.Physics.Arcade.Sprite & { body: Phaser.Physics.Arcade.Body };
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('space');
        this.score = 0;
    }

    preload() {
        this.load.tilemapTiledJSON('level1', 'assets/tilemaps/maps/cybernoid.json');

        this.load.image('cybernoid', 'assets/tilemaps/tiles/cybernoid.png');
        this.load.image('objets', 'assets/tilemaps/tiles/objets.png');

        this.load.image('ship', 'assets/sprites/phaser-ship.png');
        this.load.image('chunk', 'assets/sprites/chunk.png');
        console.log('Particle image loaded');

    }

    create() {
        // Charger la carte du jeu
        const map = this.make.tilemap({key: 'level1'});


        // Insérer les images dans la carte
        const tiles = map.addTilesetImage('cybernoid');
        const objets = map.addTilesetImage('objets');

        // Créer les couches d'objets de la carte
        this.layer = map.createLayer(0, tiles, 0, 0);
        this.objets = map.createLayer(1, objets, 0, 0);

        // Gérer les collisions avec les objets
        const listeObjets = [224, 161, 160, 204, 106, 205, 162, 233, 184];
        this.objets.setTileIndexCallback(listeObjets, this.toucheObjet, this);

        // Gérer les collisions avec le décor
        map.setCollisionByExclusion([7, 32, 35, 36, 71, 72], true, true, this.layer);

        // Gérer les collisions avec les objets
        // map.setCollisionBetween(0,250,'true','items');
        for (let i = 0; i < 225; i++) {
            this.arrayObjets[i] = i + 89;
        }
        map.setTileIndexCallback(this.arrayObjets, this.toucheObjet, this, this.objets);

        // layer.debug = true;

        // this.layer.resizeWorld();

        this.cursors = this.input.keyboard.createCursorKeys();
        const controlConfig = {
            camera: this.cameras.main,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            speed: 0.5
        };

        this.particles = this.add.particles(0, 0, 'chunk');

        this.particles.rotation = 0;
        this.particles.gravityY = 300;
        this.particles.bounce = 0.8;

        this.sprite = this.physics.add.sprite(200, 70, 'ship').setOrigin(0.5, 0.5);
        this.physics.add.collider(this.sprite, this.layer);
        this.physics.add.overlap(this.sprite, this.objets);

        // Définir les limites de la caméra pour correspondre à la taille de la carte
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Faire en sorte que la caméra suive le sprite
        this.cameras.main.startFollow(this.sprite);

        this.scoreText = this.add.text(16, 16, 'score: 0', { font: '14px arial' });
        this.scoreText.setScrollFactor(0);

    }

    particleBurst() {
        console.log('Particle burst called'); //debug
        this.particles.x = this.sprite.x;
        this.particles.y = this.sprite.y;
        this.particles.start(1000, 100)
    }

    update() {

        this.physics.collide(this.sprite, this.layer);
        this.physics.collide(this.particles, this.layer);
        this.physics.collide(this.sprite, this.objets);

        this.sprite.setVelocityX(0);
        this.sprite.setVelocityY(0);

        if (this.cursors.up.isDown)
        {
            this.sprite.setVelocityY(-150);
            this.particleBurst();
        }
        else if (this.cursors.down.isDown)
        {
            this.sprite.setVelocityY(150);
            this.particleBurst();
        }

        if (this.cursors.left.isDown)
        {
            this.sprite.setVelocityX(-150);
            this.sprite.flipX = true;
            this.particleBurst();
        }
        else if (this.cursors.right.isDown)
        {
            this.sprite.setVelocityX(150);
            this.sprite.flipX = false;
            this.particleBurst();
        }
    }

    toucheObjet(sprite, objet) {
        if (objet.index == 106) {
            this.score +=10;
        } else {
            this.score++;
        }
        objet.copy(0);

        this.scoreText.setText("Score : " + this.score);
    }
}

const config = {
    title: 'Space Mission',
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1000,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Pour activer/désactiver le mode debug des collisions
        }
    },
    scene: Space,
};

const game = new Phaser.Game(config);
