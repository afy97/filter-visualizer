class Vector2D {
    readonly i: number 
    readonly j: number 

    constructor(i: number, j: number) {
        this.i = i
        this.j = j
    }

    static get zero()   { return new Vector2D(0, 0) }
    static get up()     { return new Vector2D(0, 1) }
    static get down()   { return new Vector2D(0, -1) }
    static get left()   { return new Vector2D(-1, 0) }
    static get right()  { return new Vector2D(1, 0) }

    dot(vector: Vector2D) {
        return (this.i * vector.i) + (this.j * vector.j)
    }

    magnitude() {
        return Math.sqrt(this.dot(this))
    }

    normalized() {
        const c = 1.0 / this.magnitude()
        return new Vector2D(this.i * c, this.j * c)
    }

    add(vector: Vector2D) {
        return new Vector2D(this.i + vector.i, this.j + vector.j)
    }

    inverse() {
        return new Vector2D(-this.i, -this.j)
    }

    scale(scalar: number) {
        return new Vector2D(this.i * scalar, this.j * scalar)
    }

    clone() {
        return new Vector2D(this.i, this.j)
    }

    flip(type: "vertical" | "horizontal") {
        return type === "vertical" ? new Vector2D(this.i, -this.j) : new Vector2D(-this.i, this.j)
    }

    rotate(tetha: number) {
        const x = (Math.cos(tetha) * this.i) - (Math.sin(tetha) * this.j)
        const y = (Math.sin(tetha) * this.i) + (Math.cos(tetha) * this.j)

        return new Vector2D(x, y)
    }
}

export default Vector2D
