export interface Position {
    x: number;
    y: number;
}

export interface Intersection {
    x: number;
    y: number;
    offset: number;
}

export default class Polygon {
    points: Position[] = [];
    angle: number = 0;

    constructor(points: Position[], angle: number) {
        this.points = points;
        this.angle = angle;
    }

    move(x: number, y: number) {
        this.points.forEach((point) => {
           point.x += x;
           point.y += y;
        });
    }

    static Rectangle(center: Position, width: number, height: number, angle: number): Polygon {
        const points: Position[] = [];
        const rad=Math.hypot(width,height)/2;
        const alpha=Math.atan2(width,height);
        points.push({
            x:center.x-Math.sin(angle-alpha)*rad,
            y:center.y-Math.cos(angle-alpha)*rad
        });
        points.push({
            x:center.x-Math.sin(angle+alpha)*rad,
            y:center.y-Math.cos(angle+alpha)*rad
        });
        points.push({
            x:center.x-Math.sin(Math.PI+angle-alpha)*rad,
            y:center.y-Math.cos(Math.PI+angle-alpha)*rad
        });
        points.push({
            x:center.x-Math.sin(Math.PI+angle+alpha)*rad,
            y:center.y-Math.cos(Math.PI+angle+alpha)*rad
        });
        return new Polygon(points, angle);
    }

    Intersect(otherPoly: Polygon): boolean {
        const touches = this.Touches(otherPoly);
        return (touches.length > 0);
    }

    Touches(otherPoly: Polygon): Intersection[] {
        const touches = [];
        for(let i=0;i<this.points.length;i++) {
            for (let j = 0; j < otherPoly.points.length; j++) {
                const touch = getIntersection(
                    this.points[i],
                    this.points[(i + 1) % this.points.length],
                    otherPoly.points[j],
                    otherPoly.points[(j + 1) % otherPoly.points.length]
                );
                if (touch) {
                    touches.push(touch);
                }

            }
        }
        return touches;
    }
}

export function lerp(A:number,B:number,t:number){
    return A+(B-A)*t;
}

export function getIntersection(A:Position,B:Position,C:Position,D:Position): Intersection|null {
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);

    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t
            }
        }
    }

    return null;
}