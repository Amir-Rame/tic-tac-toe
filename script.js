
const menu = (()=>{
    //variables
    const gameInfo={
        player: 'X',
        mode:0,
        size:3
    }
    //dom cache
    const newGame = document.getElementById('new-game');
    newGame.addEventListener('click',show);

    const initMenu = document.getElementById('init');
    const cover = document.getElementById('cover');

    function show(){
        initMenu.style.transform = 'translate(-50%,-50%)';
        cover.style.display='block';
        eventSet(); //set events for mnu items
    }
    function hide(){
        initMenu.style.transform = 'translate(-50%,-50%) scale(0)';
        cover.style.display='none';
        toggleMode(true);
        toggleSide(true);
        sizeSet(true);
    }
    function varReset(){
        gameInfo.player='X';
        gameInfo.mode=0;
        gameInfo.size=3;
    }
    function eventSet(){
        initMenu.children[0].children[0].addEventListener('click', toggleSide);
        initMenu.children[0].children[1].addEventListener('click', toggleSide);
        initMenu.children[2].children[0].addEventListener('click', toggleMode);
        initMenu.children[2].children[1].addEventListener('click', toggleMode);
        initMenu.children[4].children[1].addEventListener('change', sizeSet);
        initMenu.children[6].children[0].addEventListener('click', start);
        initMenu.children[6].children[1].addEventListener('click', cancel);
    }
    function toggleSide(reset=false){
        if(reset == true){
            initMenu.children[0].children[0].classList.add('active-side');
            initMenu.children[0].children[1].classList.remove('active-side');
            player1 = 'X';
            return
        }
        if([...this.classList].includes('active-side')) return;
        this.classList.add('active-side');
        let index = [...this.parentNode.children].indexOf(this);
        if(index ==0){
            initMenu.children[0].children[1].classList.remove('active-side');
            gameInfo.player = 'X';
        }else{
            initMenu.children[0].children[0].classList.remove('active-side');
            gameInfo.player = 'O';
        }
    }
    function toggleMode(reset = false){
        if(reset == true){
            initMenu.children[2].children[0].classList.add('active-btn');
            initMenu.children[2].children[1].classList.remove('active-btn');
            mode = 0;
            return
        }
        if([...this.classList].includes('active-btn')) return;
        this.classList.add('active-btn');
        let index = [...this.parentNode.children].indexOf(this);
        if(index ==0){
            initMenu.children[2].children[1].classList.remove('active-btn');
            gameInfo.mode = 0;
        }else{
            initMenu.children[2].children[0].classList.remove('active-btn');
            gameInfo.mode = 1;
        }
    }
    function sizeSet(reset = false){
        if(reset == true){
            initMenu.children[4].children[1].value = 3;
            gameInfo.size=3;
            return
        }
        if(this.value > 5 || this.value < 3){
            this.value = 3;
            alert('size can only be between 3 and 5');
        }else{
            gameInfo.size=parseInt(this.value);
        }
    }
    function cancel(){
        hide();  //hides the menu and resets the visuals
        varReset(); //resets the obj
    }
    function start(){
        game.reset();
        game.initiate(gameInfo);
        hide();  //hides the menu and resets the visuals
        varReset(); //resets the obj
    }
    return{
        show
    }
})();


const gameRender = (()=>{
    //dom cache
    const board = document.getElementById('board');
    const turnTxt = document.getElementById('turn');
    const announce = document.getElementById('announce');
    const cover = document.getElementById('cover');

    //functions
    function generateBoard(s){
        board.innerHTML = ''
        board.style.grid=(`repeat(${s},1fr)/repeat(${s},1fr)`);
        for(let i=0; i < s ** 2;i++){
            let gridItem = document.createElement('div');
            let itemSpan = document.createElement('span');
            gridItem.classList.add('grid-item');
            board.appendChild(gridItem);
            gridItem.appendChild(itemSpan);
            gridItem.addEventListener('click',game.move,{ once: true });
        }
    }
    function setTurn(gameStat){ //sets the span text in main page to show the current turn
        let sign='X';
        if(gameStat.mode==1){
            if(gameStat.player=='X'){
                gameStat.turn%2==0
                ?sign = 'X'
                :sign = 'O';
            }else{
                gameStat.turn%2==1
                ?sign = 'X'
                :sign = 'O';
            }
        }else{
            sign=gameStat.player;
        }
        turnTxt.innerText = `${sign}'s Turn`
    }
    function markTile(tile){
        tile.classList.add('filled-grid-item');
    }
    function announcer(sign){
        if(sign=='X'){
            announce.children[0].innerText = 'X has Won';
            announce.style.backgroundColor = 'var(--color-accent-2)';
        }else if(sign=='O'){
            announce.children[0].innerText = 'O has Won';
            announce.style.backgroundColor = 'var(--color-accent-1)';
        }else {
            announce.children[0].innerText = 'Draw';
            announce.style.backgroundColor = 'var(--color-gray)';
        }
        announce.style.transform = 'translate(-50%,-50%)';
        cover.style.display='block';
        cover.addEventListener('click',closeAnnouncer,{ once: true });
    }
    function closeAnnouncer(){
        announce.style.transform = 'translate(-50%,-50%) scale(0)'
        menu.show();
        game.initiate();
    }
    function winner(state,sign,index,size){
        let winArray =[];
        if(state=='H'){ //[-]
            for(let i=0; i< size; i++){
                winArray.push(board.children[index+i])
            }
        }else if(state=='V'){ //[|]
            for(let i=0; i< size**2; i+=size){
                winArray.push(board.children[index+i])
            }
        }else if(state=='D1'){ // [/]
            for(let i=1; i<=size; i++){
                winArray.push(board.children[i*(size-1)])
            }
        }else if(state=='D2'){ // [\]
            for(let i=0; i<size; i++){
                winArray.push(board.children[i*(size+1)])
            }
        }
        if(sign=='X'){
            winArray.forEach(e=>e.style.backgroundColor='var(--color-accent-2')
        }else{
            winArray.forEach(e=>e.style.backgroundColor='var(--color-accent-1')
        }
        winArray=[]
    }
    return{
        generateBoard,
        setTurn,
        markTile,
        announcer,
        winner
    }
})();


const game = (()=>{
    //variables
    let gameStat = {
        gameArray: [],
        turn: 0,
        winner:false
    }
    //dom cache
    const board = document.getElementById('board');
    //functions
    function initiate(gameInfo){
        Object.assign(gameStat,gameInfo);
        gameRender.generateBoard(gameStat.size);
        generateArray(gameStat);
        if(gameStat.mode==0&&gameStat.player=='O'&&gameStat.turn==0){
            autoMove('X');
        }
    }
    function generateArray(gameStat){
        gameStat.gameArray = [];
        gameStat.gameArray[(gameStat.size**2)-1]=0;
        let x=0;
        for(let i of gameStat.gameArray){
            gameStat.gameArray[x]=x;
            x++;
        }
    }
    function move(){
        let sign='X';
        if (gameStat.mode==1){
            if(gameStat.turn%2==0){
                sign = gameStat.player
            }else{
                sign = gameStat.player=='X'?'O':'X';
            }
        }else{
            sign=gameStat.player;
        }
        this.children[0].innerText = sign;
        markArray(this,sign);
        gameRender.markTile(this);
        gameStat.turn++;
        gameRender.setTurn(gameStat);
        if(gameStat.turn>=gameStat.size*2-1){
            checkWin();
        }
        if(gameStat.winner==true)return
        if(gameStat.mode==0&&gameStat.turn<gameStat.size**2){
            sign = gameStat.player=='X'?'O':'X';
            autoMove(sign);
        }
    }
    function autoMove(sign){
        //get move number move
        let number=0;
        let best_move = bestMove(sign);
        if(best_move==-1){
            number=randomMove();
        }else{
            number=best_move;
        }
        if(number>=gameStat.size**2){
            alert('WTF')
        }
        // make move
        board.children[number].children[0].innerText = sign;
        board.children[number].removeEventListener('click',game.move,{ once: true });
        markArray(board.children[number],sign);
        gameRender.markTile(board.children[number]);
        gameStat.turn++;
        gameRender.setTurn(gameStat);
        if(gameStat.turn>=gameStat.size*2-1){
            checkWin();
        }
    }

    function randomMove(){
        let number = 0;
        while(1){
            number = Math.floor(Math.random() * gameStat.size**2+1);
            if(gameStat.gameArray.includes(number)|| gameStat.turn> gameStat.size**2-2){
                break;
            }
        }
        return number;
    }

    function bestMove(sign){
        if(gameStat.turn==0){ //in beginning go for 0
            return 0;
        }
        if(gameStat.turn==1&&gameStat.gameArray.includes(gameStat.size+1)
        &&gameStat.size==3){ //in beginning go for 0
            return gameStat.size+1;
        }
        if(gameStat.turn>=(gameStat.size**2)-1)return
        let number = 0;
        let arr = [...gameStat.gameArray];
        arr = arr.filter(e=> !isNaN(e));
        arr.forEach(e => {
            arr.push({index:e,score:0})
        });
        arr = arr.slice(arr.length/2);
        arr.forEach(c => {
            c.score=calcScore(c.index,sign);
        }); //making an array of available moves
        arr.sort((a,b)=> {return b.score-a.score})
        console.log(arr)
        if(arr[0].score==0)return -1;
        return arr[0].index; //get the best move and return index of it.
    }

    function calcScore(i,s){
        let score=0;
        let debug=[];
        let n = gameStat.size;
        let arr = gameStat.gameArray;
        let _s = s=='X'?'O': 'X';
        if(arr[i-1]==arr[i+1] //horizontal
            &&(i+1)%n!=0&&i%n!=0
            &&arr[i-1]!=undefined){ 
            arr[i-1]==s?score +=5:score +=3
            debug.push(1);
        }
        if(arr[i-n]==arr[i+n]
            &&arr[i-n]!=undefined){//vertical
            arr[i-n]==s?score +=5:score +=3
            debug.push(2);
        }
        if(arr[i-1]==arr[i-2]&&(i+1)%n==0
        &&arr[i-1]!=undefined){  //horizontal
            arr[i-1]==s?score +=5:score +=3
            debug.push(3);
        }
        if(arr[i+1]==arr[i+2]&&i%n==0
            &&arr[i+1]!=undefined){ //horizontal
            arr[i+1]==s?score +=5:score +=3
            debug.push(4);
        }
        if(arr[i-n]==arr[i-(2*n)]&&i>(2*n)-1
        &&arr[i-n]!=undefined){ //vertical
            arr[i-n]==s?score +=5:score +=3
            debug.push(5);
        }
        if(arr[i+n]==arr[i+(2*n)]&&i<n
        &&arr[i+n]!=undefined){ //vertical
            arr[i-1]==s?score +=5:score +=3
            debug.push(6);
        }
        if(arr[i-n-1]==arr[i+n+1]// [\]
            &&arr[i-n-1]!=undefined&&i%(n+1)==0){ 
            arr[i-n-1]==s?score +=5:score +=3
            debug.push(7);
        }
        else if(arr[i-n-1]==arr[i-2*n-2] // [\]
            &&arr[i-n-1]!=undefined&&i%(n+1)==0){
            arr[i-n-1]==s?score +=5:score +=3
            debug.push(8);
        }
        else if(arr[i+n+1]==arr[i+2*n+2] // [\]
            &&arr[i+n+1]!=undefined&&i%(n+1)==0){
            arr[i+n+1]==s?score +=5:score +=3
            debug.push(9);
        }
        if(arr[i-n+1]==arr[i+n-1] // [/]
            &&arr[i-n+1]!=undefined&&i%(n-1)==0&&i!=2){
            arr[i-n+1]==s?score +=5:score +=3
            debug.push(10);
        }
        else if(arr[i-n+1]==arr[i-2*n+2] // [/]
            &&arr[i-n+1]!=undefined&&i%(n-1)==0){
            arr[i-n+1]==s?score +=5:score +=3
            debug.push(11);
        }
        else if(arr[i+n-1]==arr[i+2*n-2] // [/]
            &&arr[i+n-1]!=undefined&&i%(n-1)==0&&i!=0){
            arr[i+n-1]==s?score +=5:score +=3
            debug.push(12);
        }
        if((arr[i-n])=='X'||(arr[i-n])=='O'){
            score++;
            debug.push(13);
        }else if((arr[i+n])=='X'||(arr[i+n])=='O'){
            score++;
            debug.push(14);
        }else if((arr[i-1])=='X'||(arr[i-1])=='O'){
            score++;
            debug.push(15);
        }else if((arr[i+1])=='X'||(arr[i+1])=='O'){
            score++;
            debug.push(16);
        }
        // console.log(i + ' :' + debug)
        return score;
    }
    function markArray(tile,sign){
        gameStat.gameArray[[...tile.parentNode.children].indexOf(tile)]=sign;
        // console.log(gameStat.gameArray)
    }
    function checkWin(){
        let n = gameStat.size;
        let arr = gameStat.gameArray;
        let list =[];
        //horizontal
        for (let i=0; i<=(n**2)-n; i+=n){
            if(arr.slice(i,i+n).every(x => Object.is(arr[i], x))){
                win(arr[i]);
                gameStat.winner=true;
                gameRender.winner('H',arr[i],i,n);
                return;
            }
        }
        //vertical
        for (let i=0; i<n; i++){
            for (let l=0; l<=(n**2)-n; l+=n){
                list.push(arr[i+l])
            }
            if(list.every(x => Object.is(list[0], x))){
                win(arr[i]);
                gameStat.winner=true;
                gameRender.winner('V',list[0],i,n);
                return;
            }
            list =[];
        }  
        //diagonal /
        list =[];
        for (let i=1; i<=n; i++){
            list.push(arr[i*(n-1)])
        }
        if(list.every(x => Object.is(list[0], x))){
            win(list[0]);
            gameStat.winner=true;
            gameRender.winner('D1',list[0],'',n);
            return;
        }
        list =[];
        //diagonal \
        for (let i=0; i<n; i++){
            list.push(arr[i*(n+1)])
        }
        if(list.every(x => Object.is(list[0], x))){
            win(list[0]);
            gameStat.winner=true;
            gameRender.winner('D2',list[0],'',n);
            return;''
        }
        list =[];
        //draw
        if(arr.every(x => isNaN(x))){
            win('D');
            gameStat.winner=true;
            return;
        }
    }
    function win(sign){
        gameRender.announcer(sign);
    }
    function reset(){
        gameStat = {
            gameArray: [],
            turn: 0
        }
    }
    return{
        initiate,
        move,
        reset
    }
})();




menu.show();

