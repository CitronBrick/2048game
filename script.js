'use strict';


function reducer(state, action) {
	let numList = state.numList;

	if(action.dir == 'Reset') {
		return {numList: numList.slice(), score: state.score, result: findResult(numList) };
	}

	if(action.dir == 'Left') {
		for(let row = 0; row < 4; row++) {
			do {
				state.score += moveLeftOnceRow(numList, row)
			} while(!rowHasMovedLeft(numList,row));
		}
	}
	if(action.dir == 'Right') {
		for(let row = 0; row < 4; row++) {
			do {
				state.score += moveRightOnceRow(numList,row);
			} while(!rowHasMovedRight(numList,row));
		}
	}
	if(action.dir == 'Up') {
		for(let col = 0; col < 4; col++) {
			do {
				state.score += moveUpOnceCol(numList,col);
			} while(!colHasMovedUp(numList,col));
		}
	}

	
	if(action.dir == 'Down') {
		for(let col = 0; col < 4; col++) {
			do {
				state.score += moveDownOnceCol(numList,col);
			} while(!colHasMovedDown(numList,col));
				
		}
	}

	insertNewNum(numList);


	return {numList: numList.slice(), score: state.score, result: findResult(numList) };
}


function moveDownOnceCol(numList, col) {
	var res = 0;
	for(var row = 3; row > 0; row--) {
		if(!numList[row][col]) {
			numList[row][col] = numList[row-1][col];
			numList[row-1][col] = 0;
		} else if(numList[row][col] == numList[row-1][col]) {

			numList[row][col] *= 2;
			numList[row-1][col] = 0; 

			res+= numList[row][col];
		}

	}
	return res;
}

function moveUpOnceCol(numList, col) {
	var res = 0;
	for(var row = 0; row < 3; row++) {
		if(!numList[row][col]) {
			numList[row][col] = numList[row+1][col];
			numList[row+1][col] = 0;
		} else if(numList[row][col] == numList[row+1][col]) {
			res += numList[row][col] *= 2;
			numList[row+1][col] = 0; 

		}
	}
	return res;
}

function moveLeftOnceRow(numList, row) {
	var res = 0;
	for(var col = 0; col < 3; col++) {
		if(!numList[row][col]) {
			numList[row][col] = numList[row][col+1];
			numList[row][col+1] = 0;
		} else if(numList[row][col] == numList[row][col+1]) {
			res += numList[row][col] *= 2;
			numList[row][col+1] = 0; 
		}
	}
	return res;
}

function moveRightOnceRow(numList, row) {
	var res = 0;
	for(var col = 3; col > 0; col--) {
		if(!numList[row][col]) {
			numList[row][col] = numList[row][col-1];
			numList[row][col-1] = 0;
		} else if(numList[row][col] == numList[row][col-1]) {
			res += numList[row][col] *= 2;
			numList[row][col-1] = 0; 
		}
	}
	return res;
}

function colHasMovedUp(numList, col) {
	for(var row = 0; row < 3; row++) {
		// not yet moved up completely if empty square above non-empty square
		if(!numList[row][col] && numList[row+1][col]) {
			return false;
		}
	}
	return true;
}

function colHasMovedDown(numList, col) {
	for(var row = 3; row > 0; row--) {
		// not yet moved down completely if non-empty square above empty square
		if(!numList[row][col] && numList[row-1][col]) {
			return false;
		}
	}
	return true;
}

function rowHasMovedLeft(numList, row) {
	for(var col = 0; col < 3; col++) {
		// not yet moved left completely if non-empty square next to empty square
		if(!numList[row][col] && numList[row][col+1]) {
			return false;
		}
	}
	return true;
}

function rowHasMovedRight(numList, row) {
	for(var col = 3; col > 0; col--) {
		// not yet moved right completely if empty square next to non-empty square
		if(!numList[row][col] && numList[row][col-1]) {
			return false;
		}
	}
	return true;
}

function insertNewNum(numList) {
	// cannot insertNewNum if numList is full
	var flatNumList = numList.flat();
	if(!flatNumList.some((n)=>!n)) { console.log('full');return;}
	var k;
	do {
		k= random(16);
	} while(flatNumList[k]);
	if(numList[Math.floor(k/4)][k%4]) {
		console.warn('insert will rewrite '+Math.floor(k/4)+ ' ' + k%4 + ' ' +k);
		return 
	}
	numList[Math.floor(k/4)][k%4] = randomTwoOrFour();
}



	

function Grid(props) {

	var numList = React.useMemo(()=>generateInitialNumbers(), []);

	var [state, dispatch] = React.useReducer(reducer, {numList: numList, score: 0, result: ''});

	function handleKeyDown(evt) {
		if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(evt.key)) {
			dispatch({dir: evt.key.substring(5)});
		}
	}

	React.useEffect(()=>{ // equivalent to componentDidMount, since dependancy array (2nd argument) is empty
		document.addEventListener('keydown', handleKeyDown);
	}, []);

	

	React.useEffect(()=> { 
		props.setScore(state.score);
	}, [state.score]);

	React.useEffect(()=>{
		if(state.result) {
			props.setResult(state.result);
			document.removeEventListener('keydown', handleKeyDown);
			numList = generateInitialNumbers();
		}
	}, [state.result]);


	var squareList = Array.from({length: 16}, (o,i)=> {
		var num = state.numList[Math.floor(i/4)][i%4];
		return <div className="square" key={i} data-row={i/4} data-column={i%4} data-num={num} >{num || ''}</div>;
	});

	return <React.Fragment><div className="grid">{squareList}</div></React.Fragment>
}


function gridIsFull(numList) {
	return numList.flat().every(n=>n );
}

function gridHas2IdenticalNeighbours(numList) {
	for(let row = 0; row < 4; row++) {
		for(let col = 0; col < 4; col++) {
			if(row) {
				if(numList[row][col] == numList[row-1][col]) {
					return true;
				}
			}
			if(col) {
				if(numList[row][col] == numList[row][col-1]) {
					return true;
				}
			}
		}
	}
	return false;
}

function findResult(numList) {
	if(numList.flat().includes(2048)) {
		return 'won';
	} else if(gridIsFull(numList) && !gridHas2IdenticalNeighbours(numList)) {
		return 'lost';
	}
	return false;
}


function App() {
	var [score, setScore] = React.useState(0);
	var [result, setResult] = React.useState(undefined);

	let startNewGame = ()=> {
		window.location.reload();
	};


	return <React.Fragment>
		<h1>2048 Game</h1>
		<div className="panel">
			<span>Score: <span id="score">{score}</span></span> <button onClick={startNewGame}>New Game</button>
		</div>
		<Grid setScore={setScore} setResult={setResult}  />
		<output>{result}</output>
		<p>Use the arrow keys to move the squares & make 2048</p>
	</React.Fragment>
}


function generateInitialNumbers() {
	var res = Array.from({length: 4},()=>Array.from({length: 4}, ()=>0));
	var k1 = random(16);
	var k2 = random(16);
	while(k1 == k2) {
		k2 = random(16);
	}
	console.log(Math.floor(k1/4),k1%4,Math.floor(k2/4), k2%4);
	res[Math.floor(k1/4)][k1%4] = randomTwoOrFour();
	res[Math.floor(k2/4)][k2%4] = randomTwoOrFour();

	console.log(res);
	return res;
}

function randomTwoOrFour() {
	return random(3)?2:4;
}

function random(n) {
	return Math.floor(Math.random() * n);
}

function runTests() {
	var numList = [[0,2,0,0],[0,0,2,0,0],[0,4,0,0],[0,4,0,0]];
	console.log(colHasMovedDown(numList,1), 'false');		
	console.log(colHasMovedUp(numList,1), 'false');		
	numList = [[0,0,0,0],[0,0,2,0,0],[0,4,0,0],[0,4,0,0]];
	console.log(colHasMovedDown(numList,1), 'true');		
	numList = [[0,2,0,0],[0,4,2,0,0],[0,4,0,0],[0,0,0,0]];
	console.log(colHasMovedUp(numList,1), 'true');		




}

window.addEventListener('load', ()=> {
	setTimeout(()=>{ // precompile jsx instead asap
		ReactDOM.render(<App/>, document.querySelector('main'));
	}, 500);
});