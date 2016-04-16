
import {ISquare} from './ISquare';

export class Square implements ISquare {
    constructor(protected width = 0) {

    }

    getWidth() : number {
        return this.width;
    }

    getArea() : number {
        return this.width * this.width;
    }
}
