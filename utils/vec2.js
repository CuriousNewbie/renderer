module.exports = class Vec2 {
    constructor(vec = {}, y) {
        if (vec instanceof Vec2) {
            this.x = vec.x;
            this.y = vec.y
        } else {
            this.x = isNaN(vec) ? 0 : Number(vec);
            this.y = isNaN(y) ? 0 : Number(y)
        }

    }

    add(vec) {
        if (!(vec instanceof Vec2)) throw new Error('can add only Vec2 instance');
        return new Vec2(
            this.x + vec.x,
            this.y + vec.y
        )
    }

    subtract(vec) {
        if (!(vec instanceof Vec2)) throw new Error('can subtract only Vec2 instance');
        return new Vec2(
            this.x - vec.x,
            this.y - vec.y
        )
    }

    mult(n) {
        if (isNaN(n)) throw new Error('Can only multiply by number')
        return new Vec2(
            this.x * n,
            this.y * n
        )
    }

    multS(vec) {
        if (!vec instanceof Vec2) throw new Error('can multiply only Vec2 instance');
        return this.x * vec.x + this.y * vec.y
    }

    normalize() {
        return new Vec2(
            this.x / Math.hypot(this.x, this.y),
            this.y / Math.hypot(this.x, this.y)
        )
    }

    clone() {
        return new Vec2(
            this.x,
            this.y
        )
    }

    floor() {
        return new Vec2(
            Math.floor(this.x),
            Math.floor(this.y),
        )
    }
}
