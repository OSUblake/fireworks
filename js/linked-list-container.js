const { Container, DisplayObject } = PIXI;
class LinkedListContainer extends Container {
    constructor() {
        super(...arguments);
        this._firstChild = null;
        this._lastChild = null;
        this._childCount = 0;
    }
    get firstChild() {
        return this._firstChild;
    }
    get lastChild() {
        return this._lastChild;
    }
    get childCount() {
        return this._childCount;
    }
    addChild(...children) {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1) {
            // loop through the array and add all children
            for (let i = 0; i < children.length; i++) {
                // eslint-disable-next-line prefer-rest-params
                this.addChild(children[i]);
            }
        }
        else {
            const child = children[0];
            // if the child has a parent then lets remove it as PixiJS objects can only exist in one place
            if (child.parent) {
                child.parent.removeChild(child);
            }
            child.parent = this;
            this.sortDirty = true;
            // ensure child transform will be recalculated
            child.transform._parentID = -1;
            // add to list if we have a list
            if (this._lastChild) {
                this._lastChild.nextChild = child;
                child.prevChild = this._lastChild;
                this._lastChild = child;
            }
            // otherwise initialize the list
            else {
                this._firstChild = this._lastChild = child;
            }
            // update child count
            ++this._childCount;
            // ensure bounds will be recalculated
            this._boundsID++;
            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange();
            this.emit('childAdded', child, this, this._childCount);
            child.emit('added', this);
        }
        return children[0];
    }
    addChildAt(child, index) {
        if (index < 0 || index > this._childCount) {
            throw new Error(`addChildAt: The index ${index} supplied is out of bounds ${this._childCount}`);
        }
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.sortDirty = true;
        // ensure child transform will be recalculated
        child.transform._parentID = -1;
        const c = child;
        // if no children, do basic initialization
        if (!this._firstChild) {
            this._firstChild = this._lastChild = c;
        }
        // add at beginning (back)
        else if (index === 0) {
            this._firstChild.prevChild = c;
            c.nextChild = this._firstChild;
            this._firstChild = c;
        }
        // add at end (front)
        else if (index === this._childCount) {
            this._lastChild.nextChild = c;
            c.prevChild = this._lastChild;
            this._lastChild = c;
        }
        // otherwise we have to start counting through the children to find the right one
        // - SLOW, only provided to fully support the possibility of use
        else {
            let i = 0;
            let target = this._firstChild;
            while (i < index) {
                target = target.nextChild;
                ++i;
            }
            // insert before the target that we found at the specified index
            target.prevChild.nextChild = c;
            c.prevChild = target.prevChild;
            c.nextChild = target;
            target.prevChild = c;
        }
        // update child count
        ++this._childCount;
        // ensure bounds will be recalculated
        this._boundsID++;
        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index); // the PixiJS types say this has no arguments
        child.emit('added', this);
        this.emit('childAdded', child, this, index);
        return child;
    }
    /**
     * Adds a child to the container to be rendered below another child.
     *
     * @param child The child to add
     * @param relative - The current child to add the new child relative to.
     * @return The child that was added.
     */
    addChildBelow(child, relative) {
        if (relative.parent !== this) {
            throw new Error(`addChildBelow: The relative target must be a child of this parent`);
        }
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.sortDirty = true;
        // ensure child transform will be recalculated
        child.transform._parentID = -1;
        // insert before the target that we were given
        relative.prevChild.nextChild = child;
        child.prevChild = relative.prevChild;
        child.nextChild = relative;
        relative.prevChild = child;
        if (this._firstChild === relative) {
            this._firstChild = child;
        }
        // update child count
        ++this._childCount;
        // ensure bounds will be recalculated
        this._boundsID++;
        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange();
        this.emit('childAdded', child, this, this._childCount);
        child.emit('added', this);
        return child;
    }
    /**
     * Adds a child to the container to be rendered above another child.
     *
     * @param child The child to add
     * @param relative - The current child to add the new child relative to.
     * @return The child that was added.
     */
    addChildAbove(child, relative) {
        if (relative.parent !== this) {
            throw new Error(`addChildBelow: The relative target must be a child of this parent`);
        }
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.sortDirty = true;
        // ensure child transform will be recalculated
        child.transform._parentID = -1;
        // insert after the target that we were given
        relative.nextChild.prevChild = child;
        child.nextChild = relative.nextChild;
        child.prevChild = relative;
        relative.nextChild = child;
        if (this._lastChild === relative) {
            this._lastChild = child;
        }
        // update child count
        ++this._childCount;
        // ensure bounds will be recalculated
        this._boundsID++;
        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange();
        this.emit('childAdded', child, this, this._childCount);
        child.emit('added', this);
        return child;
    }
    swapChildren(child, child2) {
        if (child === child2 || child.parent !== this || child2.parent !== this) {
            return;
        }
        const { prevChild, nextChild } = child;
        child.prevChild = child2.prevChild;
        child.nextChild = child2.nextChild;
        child2.prevChild = prevChild;
        child2.nextChild = nextChild;
        if (this._firstChild === child) {
            this._firstChild = child2;
        }
        else if (this._firstChild === child2) {
            this._firstChild = child;
        }
        if (this._lastChild === child) {
            this._lastChild = child2;
        }
        else if (this._lastChild === child2) {
            this._lastChild = child;
        }
        this.onChildrenChange();
    }
    getChildIndex(child) {
        let index = 0;
        let test = this._firstChild;
        while (test) {
            if (test === child) {
                break;
            }
            test = test.nextChild;
            ++index;
        }
        if (!test) {
            throw new Error('The supplied DisplayObject must be a child of the caller');
        }
        return index;
    }
    setChildIndex(child, index) {
        if (index < 0 || index >= this._childCount) {
            throw new Error(`The index ${index} supplied is out of bounds ${this._childCount}`);
        }
        if (child.parent !== this) {
            throw new Error('The supplied DisplayObject must be a child of the caller');
        }
        // remove child
        if (child.nextChild) {
            child.nextChild.prevChild = child.prevChild;
        }
        if (child.prevChild) {
            child.prevChild.nextChild = child.nextChild;
        }
        if (this._firstChild === child) {
            this._firstChild = child.nextChild;
        }
        if (this._lastChild === child) {
            this._lastChild = child.prevChild;
        }
        child.nextChild = null;
        child.prevChild = null;
        // do addChildAt
        if (!this._firstChild) {
            this._firstChild = this._lastChild = child;
        }
        else if (index === 0) {
            this._firstChild.prevChild = child;
            child.nextChild = this._firstChild;
            this._firstChild = child;
        }
        else if (index === this._childCount) {
            this._lastChild.nextChild = child;
            child.prevChild = this._lastChild;
            this._lastChild = child;
        }
        else {
            let i = 0;
            let target = this._firstChild;
            while (i < index) {
                target = target.nextChild;
                ++i;
            }
            target.prevChild.nextChild = child;
            child.prevChild = target.prevChild;
            child.nextChild = target;
            target.prevChild = child;
        }
        this.onChildrenChange(index);
    }
    removeChild(...children) {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1) {
            // loop through the arguments property and remove all children
            for (let i = 0; i < children.length; i++) {
                this.removeChild(children[i]);
            }
        }
        else {
            const child = children[0];
            // bail if not actually our child
            if (child.parent !== this)
                return null;
            child.parent = null;
            // ensure child transform will be recalculated
            child.transform._parentID = -1;
            // swap out child references
            if (child.nextChild) {
                child.nextChild.prevChild = child.prevChild;
            }
            if (child.prevChild) {
                child.prevChild.nextChild = child.nextChild;
            }
            if (this._firstChild === child) {
                this._firstChild = child.nextChild;
            }
            if (this._lastChild === child) {
                this._lastChild = child.prevChild;
            }
            // clear sibling references
            child.nextChild = null;
            child.prevChild = null;
            // update child count
            --this._childCount;
            // ensure bounds will be recalculated
            this._boundsID++;
            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange();
            child.emit('removed', this);
            this.emit('childRemoved', child, this);
        }
        return children[0];
    }
    getChildAt(index) {
        if (index < 0 || index >= this._childCount) {
            throw new Error(`getChildAt: Index (${index}) does not exist.`);
        }
        if (index === 0) {
            return this._firstChild;
        }
        // add at end (front)
        else if (index === this._childCount) {
            return this._lastChild;
        }
        // otherwise we have to start counting through the children to find the right one
        // - SLOW, only provided to fully support the possibility of use
        let i = 0;
        let target = this._firstChild;
        while (i < index) {
            target = target.nextChild;
            ++i;
        }
        return target;
    }
    removeChildAt(index) {
        const child = this.getChildAt(index);
        // ensure child transform will be recalculated..
        child.parent = null;
        child.transform._parentID = -1;
        // swap out child references
        if (child.nextChild) {
            child.nextChild.prevChild = child.prevChild;
        }
        if (child.prevChild) {
            child.prevChild.nextChild = child.nextChild;
        }
        if (this._firstChild === child) {
            this._firstChild = child.nextChild;
        }
        if (this._lastChild === child) {
            this._lastChild = child.prevChild;
        }
        // clear sibling references
        child.nextChild = null;
        child.prevChild = null;
        // update child count
        --this._childCount;
        // ensure bounds will be recalculated
        this._boundsID++;
        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index); // the PixiJS types say this has no arguments
        child.emit('removed', this);
        this.emit('childRemoved', child, this, index);
        return child;
    }
    removeChildren(beginIndex = 0, endIndex = this._childCount) {
        const begin = beginIndex;
        const end = endIndex;
        const range = end - begin;
        if (range > 0 && range <= end) {
            const removed = [];
            let child = this._firstChild;
            for (let i = 0; i <= end && child; ++i, child = child.nextChild) {
                if (i >= begin) {
                    removed.push(child);
                }
            }
            // child before removed section
            const prevChild = removed[0].prevChild;
            // child after removed section
            const nextChild = removed[removed.length - 1].nextChild;
            if (!nextChild) {
                // if we removed the last child, then the new last child is the one before
                // the removed section
                this._lastChild = prevChild;
            }
            else {
                // otherwise, stitch the child before the section to the child after
                nextChild.prevChild = prevChild;
            }
            if (!prevChild) {
                // if we removed the first child, then the new first child is the one after
                // the removed section
                this._firstChild = nextChild;
            }
            else {
                // otherwise stich the child after the section to the one before
                prevChild.nextChild = nextChild;
            }
            for (let i = 0; i < removed.length; ++i) {
                // clear parenting and sibling references for all removed children
                removed[i].parent = null;
                if (removed[i].transform) {
                    removed[i].transform._parentID = -1;
                }
                removed[i].nextChild = null;
                removed[i].prevChild = null;
            }
            this._boundsID++;
            this.onChildrenChange(beginIndex);
            for (let i = 0; i < removed.length; ++i) {
                removed[i].emit('removed', this);
                this.emit('childRemoved', removed[i], this, i);
            }
            return removed;
        }
        else if (range === 0 && this._childCount === 0) {
            return [];
        }
        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }
    /**
     * Updates the transform on all children of this container for rendering.
     * Copied from and overrides PixiJS v5 method (v4 method is identical)
     */
    updateTransform() {
        this._boundsID++;
        this.transform.updateTransform(this.parent.transform);
        // TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
        let child;
        let next;
        for (child = this._firstChild; child; child = next) {
            next = child.nextChild;
            if (child.visible) {
                child.updateTransform();
            }
        }
    }
    /**
     * Recalculates the bounds of the container.
     * Copied from and overrides PixiJS v5 method (v4 method is identical)
     */
    calculateBounds() {
        this._bounds.clear();
        this._calculateBounds();
        let child;
        let next;
        for (child = this._firstChild; child; child = next) {
            next = child.nextChild;
            if (!child.visible || !child.renderable) {
                continue;
            }
            child.calculateBounds();
            // TODO: filter+mask, need to mask both somehow
            if (child._mask) {
                const maskObject = (child._mask.maskObject || child._mask);
                maskObject.calculateBounds();
                this._bounds.addBoundsMask(child._bounds, maskObject._bounds);
            }
            else if (child.filterArea) {
                this._bounds.addBoundsArea(child._bounds, child.filterArea);
            }
            else {
                this._bounds.addBounds(child._bounds);
            }
        }
        this._bounds.updateID = this._boundsID;
    }
    /**
     * Retrieves the local bounds of the displayObject as a rectangle object. Copied from and overrides PixiJS v5 method
     */
    getLocalBounds(rect, skipChildrenUpdate = false) {
        // skip Container's getLocalBounds, go directly to DisplayObject
        const result = DisplayObject.prototype.getLocalBounds.call(this, rect);
        if (!skipChildrenUpdate) {
            let child;
            let next;
            for (child = this._firstChild; child; child = next) {
                next = child.nextChild;
                if (child.visible) {
                    child.updateTransform();
                }
            }
        }
        return result;
    }
    /**
     * Renders the object using the WebGL renderer. Copied from and overrides PixiJS v5 method
     */
    render(renderer) {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }
        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || (this.filters && this.filters.length)) {
            this.renderAdvanced(renderer);
        }
        else {
            this._render(renderer);
            let child;
            let next;
            // simple render children!
            for (child = this._firstChild; child; child = next) {
                next = child.nextChild;
                child.render(renderer);
            }
        }
    }
    /**
     * Render the object using the WebGL renderer and advanced features. Copied from and overrides PixiJS v5 method
     */
    renderAdvanced(renderer) {
        renderer.batch.flush();
        const filters = this.filters;
        const mask = this._mask;
        // _enabledFilters note: As of development, _enabledFilters is not documented in pixi.js
        // types but is in code of current release (5.2.4).
        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters) {
            if (!this._enabledFilters) {
                this._enabledFilters = [];
            }
            this._enabledFilters.length = 0;
            for (let i = 0; i < filters.length; i++) {
                if (filters[i].enabled) {
                    this._enabledFilters.push(filters[i]);
                }
            }
            if (this._enabledFilters.length) {
                renderer.filter.push(this, this._enabledFilters);
            }
        }
        if (mask) {
            renderer.mask.push(this, this._mask);
        }
        // add this object to the batch, only rendered if it has a texture.
        this._render(renderer);
        let child;
        let next;
        // now loop through the children and make sure they get rendered
        for (child = this._firstChild; child; child = next) {
            next = child.nextChild;
            child.render(renderer);
        }
        renderer.batch.flush();
        if (mask) {
            renderer.mask.pop(this);
        }
        if (filters && this._enabledFilters && this._enabledFilters.length) {
            renderer.filter.pop();
        }
    }
    /**
     * Renders the object using the WebGL renderer. Copied from and overrides PixiJS V4 method.
     */
    renderWebGL(renderer) {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }
        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || (this.filters && this.filters.length)) {
            this.renderAdvancedWebGL(renderer);
        }
        else {
            this._renderWebGL(renderer);
            let child;
            let next;
            // simple render children!
            for (child = this._firstChild; child; child = next) {
                next = child.nextChild;
                child.renderWebGL(renderer);
            }
        }
    }
    /**
     * Render the object using the WebGL renderer and advanced features. Copied from and overrides PixiJS V4 method.
     */
    renderAdvancedWebGL(renderer) {
        renderer.flush();
        // _filters is a v4 specific property
        const filters = this._filters;
        const mask = this._mask;
        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters) {
            if (!this._enabledFilters) {
                this._enabledFilters = [];
            }
            this._enabledFilters.length = 0;
            for (let i = 0; i < filters.length; i++) {
                if (filters[i].enabled) {
                    this._enabledFilters.push(filters[i]);
                }
            }
            if (this._enabledFilters.length) {
                renderer.filterManager.pushFilter(this, this._enabledFilters);
            }
        }
        if (mask) {
            renderer.maskManager.pushMask(this, this._mask);
        }
        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);
        let child;
        let next;
        // now loop through the children and make sure they get rendered
        for (child = this._firstChild; child; child = next) {
            next = child.nextChild;
            child.renderWebGL(renderer);
        }
        renderer.flush();
        if (mask) {
            renderer.maskManager.popMask(this, this._mask);
        }
        if (filters && this._enabledFilters && this._enabledFilters.length) {
            renderer.filterManager.popFilter();
        }
    }
    /**
     * Renders the object using the Canvas renderer. Copied from and overrides PixiJS V4 method or Canvas mixin in V5.
     */
    renderCanvas(renderer) {
        // if not visible or the alpha is 0 then no need to render this
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }
        if (this._mask) {
            renderer.maskManager.pushMask(this._mask);
        }
        this._renderCanvas(renderer);
        let child;
        let next;
        for (child = this._firstChild; child; child = next) {
            next = child.nextChild;
            child.renderCanvas(renderer);
        }
        if (this._mask) {
            renderer.maskManager.popMask(renderer);
        }
    }
}
