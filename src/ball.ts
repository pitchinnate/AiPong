import Polygon, { Position } from "./polygon";
import Engine from "./engine";
import Paddle from "./paddle";

export default class Ball {
    currentPosition: Position;
    polygon: Polygon;
    speedX = 4;
    speedY = 4;
    engine: Engine;
    paddle: Paddle;
    lost = false;
    touchingPaddle = false;

    constructor(startX: number, startY: number, engine: Engine, paddle: Paddle) {
        this.paddle = paddle;
        this.engine = engine;
        this.currentPosition = {x: startX, y: startY};
        this.polygon = Polygon.Rectangle(this.currentPosition, 20, 20, 0);
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.lost) {
            return;
        }

        ctx.globalAlpha = 0.4;
        ctx.fillStyle="blue";
        ctx.beginPath();
        ctx.moveTo(this.polygon.points[0].x,this.polygon.points[0].y);
        for(let i=1;i<this.polygon.points.length;i++){
            ctx.lineTo(this.polygon.points[i].x,this.polygon.points[i].y);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update(): void {
        if (this.lost) {
            return
        }

        if ((this.currentPosition.x <= 5 && this.speedX < 0) || (this.currentPosition.x >= this.engine.width - 5 && this.speedX > 0)) {
            this.speedX = this.speedX * -1;
        }
        if ((this.currentPosition.y <= 5 && this.speedY < 0) || (this.currentPosition.y >= this.engine.height - 5 && this.speedY > 0)) {
            this.speedY = this.speedY * -1;
        }

        const hitPaddle = this.polygon.Intersect(this.paddle.polygon);
        if (hitPaddle && !this.touchingPaddle) {
            this.speedY = this.speedY * -1;
            this.paddle.addBounce();
            this.touchingPaddle = true;
        }
        if (!hitPaddle) {
            this.touchingPaddle = false;
        }

        this.currentPosition.x += this.speedX;
        this.currentPosition.y += this.speedY;

        if (this.currentPosition.y > 900) {
            this.paddle.lost = true;
            this.paddle.balls.forEach((ball) => {
                ball.lost = true;
            });
        }

        this.polygon.move(this.speedX,this.speedY);
    }
}