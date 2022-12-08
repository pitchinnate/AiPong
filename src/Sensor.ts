import Paddle from "./paddle";
import Ball from "./ball";
import Polygon, {Intersection, lerp} from "./polygon";

export type Reading = Intersection | null;

export default class Sensor {
    paddle: Paddle;
    count: number;
    length: number;
    spread: number;
    rays: Polygon[] = [];
    readings: Reading[] = [];
    balls: Ball[];

    constructor(paddle: Paddle, count: number, length: number, spread: number, balls: Ball[]) {
        this.paddle = paddle;
        this.count = count;
        this.length = length;
        this.spread = spread;
        this.balls = balls;
    }

    updateBalls(balls: Ball[]) {
        this.balls = balls;
    }

    update() {
        this.generateRays();
        this.readings = [];
        this.rays.forEach((ray) => {
            let touchesAway: Intersection[] = [];
            let touchesToward: Intersection[] = [];
            this.balls.forEach((ball) => {
                let ballTouches = ray.Touches(ball.polygon);
                if (ball.speedY > 0) {
                    ballTouches = ballTouches.map((touch) => {
                        touch.offset += (1000 - ball.currentPosition.y) * 10;
                        return touch;
                    });
                    touchesToward = touchesToward.concat(ballTouches);
                } else {
                    touchesAway = touchesAway.concat(ballTouches);
                }
            });
            if (touchesToward.length > 0) {
                const offsets = touchesToward.map(e=>e.offset);
                const minOffset=Math.min(...offsets);
                const closestTouch = touchesToward.find(e=>e.offset==minOffset);
                if (closestTouch) {
                    this.readings.push(closestTouch);
                } else {
                    this.readings.push(null);
                }
            } else if (touchesAway.length > 0) {
                const offsets = touchesAway.map(e=>e.offset);
                const minOffset=Math.min(...offsets);
                const closestTouch = touchesAway.find(e=>e.offset==minOffset);
                if (closestTouch) {
                    this.readings.push(closestTouch);
                } else {
                    this.readings.push(null);
                }
            } else {
                this.readings.push(null);
            }
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.rays.forEach((ray) => {
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                ray.points[0].x,
                ray.points[0].y,
            );
            ctx.lineTo(
                ray.points[1].x,
                ray.points[1].y,
            );
            ctx.stroke();
        })
    }

    generateRays() {
        this.rays = Array(this.count).fill(0).map((_, i) => {
            const rayAngle = lerp(this.spread/2, -this.spread/2, this.count==1?0.5:i/(this.count-1));
            const start = { x:this.paddle.currentPosition.x, y:this.paddle.currentPosition.y };
            const end = {
                x:this.paddle.currentPosition.x - Math.sin(rayAngle) * this.length,
                y:this.paddle.currentPosition.y - Math.cos(rayAngle) * this.length
            };
            const poly = new Polygon([start, end], 0);
            return poly;
        });
    }
}