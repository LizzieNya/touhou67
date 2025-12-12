export default class Entity {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 0;
        this.height = 0;
        this.radius = 0; // For circular collision
        this.active = true;
        this.type = 'entity';
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    render(renderer) {
        // Override in subclasses
    }

    // AABB Collision
    collidesWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    // Circle Collision
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
