import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
const Square = (props) => {
    return (
        props.value && props.i === props.lastMove || props.winningCombination && props.winningCombination.includes(props.i)
            ? <button className="square active" onClick={() => props.onClick()}>
                {props.value}
            </button>
            : <button className="square" onClick={() => props.onClick()}>
                {props.value}
            </button>
    );
}

const Board = (props) => {
    const renderSquare = i => {
        return (<Square value={props.squares[i]}
            onClick={() => props.onClick(i)}
            lastMove={props.lastMove}
            i={i}
            winningCombination={props.winningCombination} />)
    }
    const boardRows = () => {
        const array = Array(9).fill(null).map((el, index) => el = index)
        const size = 3; //размер подмассива
        const subarray = []; //массив в который будет выведен результат.
        for (let i = 0; i < Math.ceil(array.length / size); i++) {
            subarray[i] = array.slice((i * size), (i * size) + size);
        }

        return subarray.map(el => {
            return (
                <div className="board-row">
                    {el.map(el => renderSquare(el))}
                </div>
            )
        })
    }
    const board = boardRows()

    return (
        <div>
            {board}
        </div>
    );
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{ squares: Array(9).fill(null), lastMove: null, }],
            stepNumber: 0,
            moveCoordinates: [],
            xIsNext: true,
            isReverse: false,
        }
    }

    handleClick = (i) => {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = [...current.squares];
        const currentMoveCoordinates = i >= 3
            ? i.toString(3).split("").map(el => +el + 1)
            : [1, +i.toString(3) + 1]
        if (this.calculateWinner(squares) || squares[i]) return;
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([{ squares, lastMove: i }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            moveCoordinates: [...this.state.moveCoordinates, currentMoveCoordinates]
        }
        )
    }

    jumpTo = (step) => {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    onSortChange = e => {
        this.setState({
            isReverse: e.currentTarget.value === "true" ? true : false
        })
    }

    calculateWinner = squares => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], winningCombination: [a, b, c] };
            }
        }
        return null;
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.calculateWinner(current.squares)
            ? this.calculateWinner(current.squares).winner
            : null;
        const winningCombination = this.calculateWinner(current.squares)
            ? this.calculateWinner(current.squares).winningCombination
            : null;
        const moves = history.map((step, move) => {
            const desc = move
                ? `Back to move #${move} [${this.state.moveCoordinates[move - 1]}]`
                : "To game start";
            return (
                <li key={move}>
                    <button className={move === this.state.stepNumber
                        ? "activeButton"
                        : "button"} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            )
        })
        const isMovesLeft = current.squares.some(el => el === null)

        const status = winner
            ? `Winner is ${winner}`
            : isMovesLeft
                ? `Next player: ${this.state.xIsNext ? "X"
                    : "O"}` : "The game ended in a draw";
        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        lastMove={this.state.history[this.state.stepNumber].lastMove}
                        winningCombination={winningCombination} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        Sort:
                        <input
                            type="radio"
                            name="sort"
                            id="asc"
                            value={false}
                            defaultChecked
                            onChange={this.onSortChange}>
                        </input>
                        <label for="asc">ASC</label>
                        <input
                            type="radio"
                            id="desc"
                            name="sort"
                            value={true}
                            onChange={this.onSortChange}>
                        </input>
                        <label for="desc">DESC</label>
                    </div>
                    <ol reversed={this.state.isReverse}>{this.state.isReverse === true
                        ? [...moves.reverse()]
                        : moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);