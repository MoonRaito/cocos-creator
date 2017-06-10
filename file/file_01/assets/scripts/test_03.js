cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        
        // sp: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        
        var self = this;
        var url = "content";
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
             cc.log(err);
             var node = new cc.Node("New Sprite");
             var sprite = node.addComponent(cc.Sprite);
             sprite.spriteFrame = spriteFrame;
             cc.log(spriteFrame);
             node.parent = self.node
            // self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        
        // var url = "assets/res/textures/";
        // var sp = new cc.SpriteFrame();
        // sp.insetTop = 3;
        // var node_y = new cc.Node("New Sprite");
        // var sprite = node_y.addComponent(cc.Sprite);
        // sprite.spriteFrame = sp;
        // node_y.parent = this.node;
        
        // var self = this;
        // // var url = "assets/res/textures/content.png";
        // cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
        //      var node = new cc.Node("New Sprite");
        //      var sprite = node.addComponent(cc.Sprite);
        //      sprite.spriteFrame = spriteFrame;
        //      node.parent = self.node
        // });
 
         
        // var node_y = new cc.Node("New Sprite");
        // var sprite = node_y.addComponent(cc.Sprite);
        // sprite.spriteFrame = new cc.SpriteFrame("assets/res/rextures/bg.png");
    
        // node_y.setPosition(50,50);
        // node_y.setAnchorPoint(0,0);
        // node_y.color = new cc.Color(0, 0, 0);
        // node_y.setContentSize(100, 100);
        // node_y.x = 100;
        // node_y.y = 100;
        
        // var test = node_y.addComponent("Test");
        
        // cc.log(node_y.childrenCount);
        // cc.log(sprite.name);
        // cc.log("Node Name: " + node_y.name);
        // // cc.director.getScene().addChild(node);
        // node_y.parent = this.node;
        // node_y.active = true;
        // this.node.active = true;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
