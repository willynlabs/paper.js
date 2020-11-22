/* Path2dProxyView - stand-in for View in Path2d module

 */

var Path2dProxyView = Base.extend({
    _class: 'Path2dProxyView',

    // Not expecting an element here, but keeping consistent with View
    initialize: function Path2dProxyView(project, element) {
        // Store reference to the currently active global paper scope, and the
        // active project, which will be represented by this view
        this._project = project;
        this._scope = project._scope;
        this._element = element;    // should be null!

        /*
        We could do this more elaborate test of pixelRatio, but we don't expect to
        have the canvas (at this point), so use the simple test below.  jl 07/06/2016
        this._pixelRatio = 1;
        if (!/^off|false$/.test(PaperScope.getAttribute(canvas, 'hidpi'))) {
            // Hi-DPI Canvas support based on:
            // http://www.html5rocks.com/en/tutorials/canvas/hidpi/
            var deviceRatio = window.devicePixelRatio || 1,
                backingStoreRatio = DomElement.getPrefixed(ctx,
                        'backingStorePixelRatio') || 1;
            this._pixelRatio = deviceRatio / backingStoreRatio;
        }
        */

        if (!this._pixelRatio)
            this._pixelRatio = window && window.devicePixelRatio || 1;

        // Set canvas size even if we just determined the size from it, since
        // it might have been set to a % size, in which case it would use some
        // default internal size (300x150 on WebKit) and scale up the pixels.
        // We also need this call here for HiDPI support.
        //this._setElementSize(size.width, size.height);
        //this._viewSize = size;
        // Keep track of views internally
        //View._views.push(this);
        // Link this id to our view
        //View._viewsById[this._id] = this;

        // Mostly we need a matrix here; that seems to be used in Item.  jl 06/11/2016
        (this._matrix = new Matrix())._owner = this;
        //this._zoom = 1;
    },

    remove: function () {
        throw new Error('unexpected call to Path2dProxyView#remove');
    },

    /**
     * Updates the view if there are changes. Note that when using built-in
     * event handlers for interaction, animation and load events, this method is
     * invoked for you automatically at the end.
     *
     * @return {Boolean} {@true if the view was updated}
     */
    update: function(canvas) {
        if (!this._needsUpdate)
            return false;

        var project = this._project,
            ctx = canvas.getContext('2d');

        this._canvas = canvas;      // needed for getTextWidth below.

        // The higher level layers set the transform on the canvas context and we need
        // the clearRect to draw in pixel space.  save/restore around it.  jl 06/17/2020
        ctx.save();
        ctx.setTransform();     // supposed to set to identity

        // Adjust for pixel ration (done with a scale in CanvasView)
        if (this._pixelRatio !== 1) {
            ctx.clearRect(0, 0, canvas.width * this._pixelRatio + 1, canvas.height * this._pixelRatio +1);
        } else {
            ctx.clearRect(0, 0, canvas.width + 1, canvas.height + 1);
        }

        ctx.restore();

        if (project)
            project.draw(ctx, this._matrix, this._pixelRatio);
        this._needsUpdate = false;
        return true;
    },

    // This is called for bounds with PointText, which is use in hitTest.  jl 11/17/2020
    getTextWidth: function(font, lines) {
        var ctx = this._canvas.getContext('2d'),
            prevFont = ctx.font,
            width = 0;
        ctx.font = font;
        // Measure the real width of the text. Unfortunately, there is no sane
        // way to measure text height with canvas.
        for (var i = 0, l = lines.length; i < l; i++)
            width = Math.max(width, ctx.measureText(lines[i]).width);
        ctx.font = prevFont;
        return width;
    },

});
