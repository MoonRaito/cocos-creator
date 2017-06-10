


cc.Class({
    extends: cc.Component,

    properties: {
        mov:50
        ,point:null
        ,range:null
        ,touchPos:null
        
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
                // cc.log("yes");
        }, self);
        
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var touchPos = event.touch.getLocation();
            var puzzle = this.node.parent.getComponent("Puzzle");
            // puzzle._ylyTestAddSprite(touchPos);

            this.touchPos = touchPos;
            puzzle._ShowPathRange(this);

            // cc.log(this.node.getPosition());
            // cc.log(this.node.getPosition().x+"**"+this.node.getPosition().y);

        }, self);
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    
});
