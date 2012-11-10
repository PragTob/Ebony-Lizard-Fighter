            (function () {
    //
    // Components
    //

    // a renderable entity
    Crafty.c('Renderable', {
        init: function () {
            // we're using DOM Spirtes
            this.requires('2D, DOM');
        },
        // set which sprite to use -- should match up with a call to Crafty.sprite()
        spriteName: function (name) {
            this.requires(name);
            return this; // so we can chain calls to setup functions
        }
    });

    // Platform component
    Crafty.c('Platform', {
        init: function () {
            this.requires('Renderable, Collision, Color')
                .color('green');
        }
    });

    // Limit movement to within the viewport
    Crafty.c('ViewportBounded', {
        init: function () {
            this.requires('2D');
        },
        // this must be called when the element is moved event callback
        checkOutOfBounds: function (oldPosition) {
            if (!this.within(0, 0, Crafty.viewport.width, Crafty.viewport.height)) {
                this.attr({
                    x: oldPosition.x,
                    y: oldPosition.y
                });
            }
        }
    });

    // Player component
    Crafty.c('Player', {
        init: function () {
            this.requires('Renderable, ViewportBounded, Collision, PlatformerGravity, PlatformerControls, Lizard')
                // set starting position
                .attr({ x: 100, y: 200 })
                // set platform-style controller up with walk + jump speeds
                .platformerControls(5, 8)
                // enable gravity, stop when we hit 'Platform' components
                .platformerGravity('Platform')
                // enable collision (not used by platformer gravity/controls but would be useful for other things)
                .collision();

            // bind our movement handler to keep us within the Viewport
            this.bind('Moved', function (oldPosition) {
                this.checkOutOfBounds(oldPosition);
            });

            // we need to flip the sprite for each direction we are travelling in
            this.bind('NewDirection', function (direction) {
                if (direction.x > 0) {
                    this.flip()
                } else if (direction.x < 0) {
                    this.unflip()
                }
            });
            Crafty("StupidFuckingRectangle").bind('Click', this.emitSword);
        },

        emitSword: function()
        {
            console.log("attempting to fire sword");
            Crafty.e('Sword').attr({x: Crafty('Player').x, y: Crafty('Player').y});
        }
    });


    //
    // Game loading and initialisation
    //
    var Game = function () {
            Crafty.scene('loading', this.loadingScene);
            Crafty.scene('main', this.mainScene);
        };

    Game.prototype.initCrafty = function () {
        console.log("page ready, starting CraftyJS");
        Crafty.init(1000, 600);
        Crafty.canvas.init();

        Crafty.modules({
            'crafty-debug-bar': 'release'
        }, function () {
            if (Crafty.debugBar) {
                Crafty.debugBar.show();
            }
        });
    };

    Crafty.c("Lizard", {
        init: function(){
            this.requires("Renderable, SpriteAnimation")
                .spriteName('lizard')
                .animate('walk', 0, 0, 3)
                .animate('walk', 20, -1);
    }})

    // A loading scene -- pull in all the slow things here and create sprites
    Game.prototype.loadingScene = function () {
        var loading = Crafty.e('2D, Canvas, Text, Delay');
        loading.attr({
            x: 512,
            y: 200,
            w: 100,
            h: 20
        });
        loading.text('loading...');

        Crafty.load(['img/LizardSpriteSheet.png'],onLoaded, onProgress, onError);
        function onLoaded() {
            // set up sprites
            Crafty.sprite(60, 'img/LizardSpriteSheet.png', { lizard: [0, 0] });
            Crafty.sprite(60, 'img/Sword.png', { sword: [0, 0, 13,32] });

            // jump to the main scene in half a second
            loading.delay(function () {
                Crafty.scene('main');
            }, 500);
        }

        function onProgress(progress) {
            loading.text('loading... ' + progress.percent + '% complete');
        }

        function onError() {
            loading.text('could not load assets');
        }

        // list of images to load
        Crafty.load(
        ['img/LizardSpriteSheet.png', 'img/sword.png'],
        onLoaded, onProgress, onError);

    };

    Crafty.c('StupidFuckingRectangle', {
        init: function() {
            this.requires('2D,DOM,Mouse')
                .attr({x:0,y:0,w: 1000, h: 600,z:99999999});
        }
    });

    //
    // The main game scene
    //
    Game.prototype.mainScene = function () {
        //create a player...
        Crafty.e('StupidFuckingRectangle');
        Crafty.e('Player');


        //This is the floor
        Crafty.e('Platform').attr({x: 0, y: 584, w: 1000, h: 16});

        //These are the platforms
        Crafty.e('Platform').attr({x: 300, y: 450, w: 100, h: 16});
        Crafty.e('Platform').attr({x: 500, y: 300, w: 100, h: 16});
        Crafty.e('Platform').attr({x: 700, y: 450, w: 100, h: 16});
    };

    Crafty.c('Sword', {
        init:function()
        {
            console.log("sword firing");
            var player = Crafty('Player');
            this.requires('Renderable, Collision, ViewportBounded')
            .spriteName('sword')
            .attr({w:13,h:32})
            .collision();
            this.yspeed = 1;
            this.xspeed = 1;

            var mousey = 3;
            var mousex = 3;



//            var radius = Math.sqrt(Math.pow(Crafty('Player').x - mousex, 2) + Math.pow(Crafty('Player').y - mousey, 2));

            var angleRadians = Math.atan(((Crafty('Player').y - mousey) / (Crafty('Player').x - mousex)));
            this.xspeed = Math.sin(angleRadians * (Math.PI/180)) * 10;
            this.yspeed = Math.cos(angleRadians / (Math.PI/180)) * 10;

            console.log("Blah" + this.xspeed + this.yspeed);
            
            this.bind('EnterFrame',this.updateMovement);
            this.bind('EnterFrame',this.checkDead);
            player.z = this.z+1;
        },

        updateMovement : function()
        {
//            this.rotate(10);
            this.x+=this.xspeed;
            this.y+=this.yspeed;
        },

        checkDead : function()
        {
            if(this.x>(Crafty.viewport.width + 58))
            {
                this.destroy();
            }

            if(this.x < 0)
            {
                this.destroy();
            }
        }
    });

    // kick off the game when the web page is ready
    $(document).ready(function () {
        var game = new Game();
        game.initCrafty();

        // start loading things
        Crafty.scene('loading');

    });

}());
