import { Scroller } from './Scroller';

export class CWScroller  {
    constructor (configObj) {
        this.mIsScrollbarInitilize = false;
        this.mEnable = false;
        this.mousedown = false;
        this.mUpdatePosition = 0;
        this.configObj = configObj;
    }

    Enable (e) {
        this.mEnable = e;
        this.mousedown = !e
    }

    to (content, clientWidth, clientHeight, contentWidth, contentHeight, options) {
        this.content = content;
       
        if (this.mIsScrollbarInitilize) {
            delete this.scroller;
            this.scroller = new Scroller((x, y, z) => this.render(x, y, z), options);
        } else {
            this.scroller = new Scroller((x, y, z) => this.render(x, y, z), options);
            this.bindEvents();
            this.mIsScrollbarInitilize = true
        }
        this.mEnable = true;
        this.scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
    }

    bindEvents () {
        var e = this.configObj.game.canvas;
        console.log(this.configObj.game.device);
        if ("ontouchstart" in document.documentElement && (this.configObj.game.device.iPhone || this.configObj.game.device.android || this.configObj.game.device.iPhone4)) {
            e.addEventListener("touchstart", this._mouseDown1.bind(this), false);
            e.addEventListener("touchmove", this._mouseMove1.bind(this), false);
            e.addEventListener("touchend", this._mouseUp1.bind(this), false)
        } else {
            e.addEventListener("mousedown", this._mouseDown.bind(this), false);
            e.addEventListener("mouseup", this._mouseUp.bind(this), false);
            e.addEventListener("mousemove", this._mouseMove.bind(this), false);

            if (false || !!document.documentMode) {
                e.addEventListener("MSPointerDown", this._mouseDown.bind(this), false);
                e.addEventListener("MSPointerMove", this._mouseMove.bind(this), false);
                e.addEventListener("MSPointerUp", this._mouseUp.bind(this), false);

                e.addEventListener("pointerDown", this._mouseDown.bind(this), false);
                e.addEventListener("pointerMove", this._mouseMove.bind(this), false);
                e.addEventListener("pointerUp", this._mouseUp.bind(this), false);
            }
        }
    }

    render (left, top, zoom) {
        this.content.x = left ? -left / zoom : this.content.x;
        this.content.y = top ? -top / zoom : this.content.y
    }

    ScrollToPosition (e, t, n) {
        this.scroller.scrollTo(e, t, n)
    }

    _mouseDown (e) {
        if (!this.mEnable) {
            return
        }
        this.scroller.doTouchStart([
            { pageX: e.pageX, pageY: e.pageY }
        ], e.timeStamp);
        this.mousedown = true
    }

    _mouseMove (e) {
        if (!this.mousedown || !this.mEnable) {
            return
        }
        this.scroller.doTouchMove([
            { pageX: e.pageX, pageY: e.pageY }
        ], e.timeStamp);
        this.mousedown = true
    }

     _mouseUp (e) {
        if (!this.mousedown || !this.mEnable) {
            return
        }
        this.scroller.doTouchEnd(e.timeStamp);
        this.mousedown = false
    }

    _mouseDown1 (e) {
        if (!this.mEnable) {
            return
        }
        this.scroller.doTouchStart([
            { pageX: e.touches[0].clientX + document.body.scrollLeft + document.documentElement.scrollLeft, pageY: e.touches[0].clientY + document.body.scrollLeft + document.documentElement.scrollLeft }
        ], e.timeStamp);
        this.mousedown = true
    }

    _mouseMove1 (e) {
        if (!this.mousedown || !this.mEnable) {
            return
        }
        this.scroller.doTouchMove([
            { pageX: e.touches[0].clientX + document.body.scrollLeft + document.documentElement.scrollLeft, pageY: e.touches[0].clientY + document.body.scrollLeft + document.documentElement.scrollLeft }
        ], e.timeStamp);
        this.mousedown = true
    }

    _mouseUp1 (e) {
        if (!this.mousedown || !this.mEnable) {
            return
        }
        this.scroller.doTouchEnd(e.timeStamp);
        this.mousedown = false
    }
}