const Vec2 = require('./vec2');

module.exports = class Vec3 {
    constructor(vec, y, z) {
        if (vec instanceof Vec3) {
            this.x = vec.x;
            this.y = vec.y;
            this.z = vec.z;
        } else if (vec instanceof Vec2) {
            this.x = vec.x;
            this.y = vec.y;
            this.z = isNaN(y) ? 0 : Number(y)
        } else {
            this.x = isNaN(vec) ? 0 : Number(vec)
            this.y = isNaN(y) ? 0 : Number(y)
            this.z = isNaN(z) ? 0 : Number(z)
        }
    }

    add(vec) {
        if (!(vec instanceof Vec3)) throw new Error('can add only Vec3 instance');
        return new Vec3(
            this.x + vec.x,
            this.y + vec.y,
            this.z + vec.z
        )
    }

    subtract(vec) {
        if (!(vec instanceof Vec3)) throw new Error('can subtract only Vec3 instance');
        return new Vec3(
            this.x - vec.x,
            this.y - vec.y,
            this.z - vec.z
        )
    }

    mult(n) {
        if (isNaN(n)) throw new Error('Can only multiply by number')
        return new Vec3(
            this.x * n,
            this.y * n,
            this.z * n
        )
    }

    multS(vec) {
        if (!vec instanceof Vec3) throw new Error('can multiply only Vec3 instance');
        return this.x * vec.x + this.y * vec.y + this.z * vec.z
    }
    multV(vec) {
        if (!vec instanceof Vec3) throw new Error('can multiply only Vec3 instance');
        return new Vec3(
            this.y * vec.z - this.z * vec.y,
            this.z * vec.x - this.x * vec.z,
            this.x * vec.y - this.y * vec.x
        )
    }
    normalize() {
        return new Vec3(
            this.x / Math.hypot(this.x, this.y, this.z),
            this.y / Math.hypot(this.x, this.y, this.z),
            this.z / Math.hypot(this.x, this.y, this.z),
        )
    }

    clone() {
        return new Vec3(
            this.x,
            this.y,
            this.z
        )
    }

    floor() {
        return new Vec3(
            Math.floor(this.x),
            Math.floor(this.y),
            Math.floor(this.z),
        )
    }
}