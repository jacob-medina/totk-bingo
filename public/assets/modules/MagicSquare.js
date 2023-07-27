class MagicSquare {
    constructor(size) {
        this.size = Math.min(Math.max(size, 3), 5);
        this._matrix = Array(this.size).fill("?").map(() => Array(this.size).fill("?"));

        switch(this.size) {
            case 3:
                this.setMatrix([
                    [8,1,6],
                    [3,5,7],
                    [4,9,2]]);
                break;
            
            case 4:
                this.setMatrix([
                    [1,15,14,4],
                    [10,11,8,5],
                    [7,6,9,12],
                    [16,2,3,13]]);
                break;
            
            case 5:
                this.setMatrix([
                    [17,24,1,8,15],
                    [23,5,7,14,16],
                    [4,6,13,20,22],
                    [10,12,19,21,3],
                    [11,18,25,2,9]]);
                break;
        }

        this.map(x => x - 1);
    }

    display() {
        let output = "";
        for (const row of this._matrix) {
            for (const col of row) {
                output += col + ' ' + ((col >= 10) ? '' : " ");
            }
            output += '\n';
        }
        console.log(output);
    }

    getElement(x, y) {
        return this._matrix[x][y];
    }

    setMatrix(matrix) {
        this._matrix = matrix;
    }

    map(func) {
        const newMatrix = [];
        for (const row of this._matrix) {
            const newRow = [];
            for (let col of row) {
                newRow.push(func(col));
            }
            newMatrix.push(newRow);
        }

        this.setMatrix(newMatrix);
    }

    reflectX() {
        for (const row of this._matrix) {
            row.reverse();
        }
    }

    reflectY() {
        const swap = (rowA, rowB, matrix) => {
            if (rowA < 0) rowA = matrix.length + rowA;
            if (rowB < 0) rowB = matrix.length + rowB;

            const rowATemp = matrix[rowA];
            matrix[rowA] = matrix[rowB];
            matrix[rowB] = rowATemp;
            return matrix;
        }

        for (let i = 0; i < Math.floor(this._matrix.length / 2); i++) {
            this.setMatrix(swap(i, -(i + 1), this._matrix));
        }
    }
}

export { MagicSquare };