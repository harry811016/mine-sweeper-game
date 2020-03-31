const GAME_STATE = {
  Await: 'await',
  Play: 'play',
  Gameover: 'Gameover',
}

const view = {

  // 顯示踩地雷的遊戲版圖在畫面上
  displayFields(rows) {
    let htmlContent = ``
    let i = 0
    let j = 0
    for (i = 0; i < rows; i++) {
      htmlContent += `<div class="row no-gutters">`
      for (j = 0; j < rows; j++) {
        htmlContent += `<div id='${i}-${j}' class="col back" data-index="${i}-${j}"></div>`
      }
      htmlContent += `</div>`
    }
    return document.querySelector('.container').innerHTML = htmlContent
  },

  //旗子放置
  showFieldContent(field, i, j) {
    switch (model.currentState) {
      case GAME_STATE.Play:

        flagNum = document.getElementById('flagNum')
        if (Number(flagNum.textContent) >= 0 && field.classList.contains('fa-flag')) { //點右鍵時如果原先有旗子
          utility.playSoundeffect(model.soundEffect.rightclick)
          field.parentNode.parentNode.innerHTML = ''
          flagNum.innerHTML++
        } else if (Number(flagNum.textContent) >= 0 && field.classList.contains('flagWrapper')) { //點右鍵時如果點到旗子空白處
          utility.playSoundeffect(model.soundEffect.rightclick)
          field.parentNode.innerHTML = ''
          flagNum.innerHTML++
        } else if (Number(flagNum.textContent) > 0 && !field.classList.contains('clicked')) { //點右鍵時如果原先無旗子
          field.innerHTML = `<div class="flagWrapper" data-index="${i}-${j}"><i class="fa fa-flag" data-index="${i}-${j}"></i></div>`
          utility.playSoundeffect(model.soundEffect.rightclick)
          flagNum.innerHTML--
        }
    }
  },

  // 顯示經過的遊戲時間在畫面上
  renderTime(time) { 
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    const formatTime = `${minutes}:${String(seconds).padStart(2, 0)}`
    document.getElementById('timerSet').textContent = formatTime
    model.timeTaked = formatTime
  },

  // 踩到地雷時，顯示出所有地雷位置
  showBoard() {
    for (let i = 0; i < model.numberOfRows; i++) {
      for (let j = 0; j < model.numberOfRows; j++) {
        if (model.mines[i][j] === 1) {
          document.getElementById(i + "-" + j).innerHTML = `<i class="fa fa-bomb"></i>`
        }
      }
    }
  },

  //顯示旗子標示錯誤的地方
  rendWrongflag() {
    for (let i = 0; i < model.numberOfRows * model.numberOfRows; i++) {
      let flegCell = document.querySelectorAll('.col')[i]
      let flegi = Number(flegCell.dataset.index.split('-')[0])
      let flegj = Number(flegCell.dataset.index.split('-')[1])
      // console.log(flegCell.firstChild, flegi, flegj)
      if (flegCell.firstChild !== null && flegCell !== null && flegCell.firstChild.firstChild !== null) {
        // console.log(flegCell.firstChild, flegi, flegj)
        if (flegCell.firstChild.classList.contains('flagWrapper')) {
          if (Number(model.mines[flegi][flegj]) !== 1) {
            // console.log(model.mines[flegi][flegj])
            flegCell.firstChild.innerHTML = ''
            flegCell.firstChild.innerHTML += `
                <i class="fa fa-flag fa-stack-1x"></i>
                <i class="fa fa-times fa-stack-1x fa-lg"></i>
            `
          }
        }
      }
    }
  },

  //贏的時候顯示
  showGameWinFinished () {
    const div = document.createElement('div')
    
    div.classList.add('completed')
    div.innerHTML =`
      <p>Complete!</p>
      <button type="button" class="btn btn-dark">Retry</button>
      `
    const header = document.querySelector('#header')
    header.before(div)
    utility.playSoundeffect(model.soundEffect.win)

  },

  //輸的時候顯示
  showGameLossFinished () {
    const div = document.createElement('div')
    
    div.classList.add('loss')
    div.innerHTML =`
      <p>Bomb!</p>
      <button type="button" class="btn btn-dark">Retry</button>
      `
    const header = document.querySelector('#header')
    header.before(div)

    utility.playSoundeffect(model.soundEffect.loss)
  }
}

const controller = {

  // 根據參數決定遊戲版圖的行列數，以及地雷的數量
  createGame(numberOfRows, numberOfMines) {
    model.numberOfRows = Number(numberOfRows)
    model.numberOfMines = Number(numberOfMines)
    model.numberOfFlag = Number(numberOfMines)
    //顯示遊戲畫面
    view.displayFields(model.numberOfRows)
    document.getElementById('flagNum').innerHTML = model.numberOfMines
    //綁定事件監聽器到格子上
    //左鍵事件
    document.querySelector('.data-panel').addEventListener('click', controller.leftckick)
    //右鍵事件
    document.querySelector('.data-panel').addEventListener('contextmenu', controller.rightckick)
    //reset
    document.querySelector('body').addEventListener('click', controller.resetckick)
    //客製化監聽
    this.customization()
  },

  //左鍵函數
  leftckick(event) {
    if (event.target.classList.contains("back")) {
      // console.log(event.target)
      controller.dig(event.target, Number(event.target.dataset.index.split('-')[0]), Number(event.target.dataset.index.split('-')[1]))
      if(model.currentState !== GAME_STATE.Gameover) {
        utility.playSoundeffect(model.soundEffect.leftclick)
        }
    }
  },

  //右鍵函數
  rightckick(event) {
    if (event.target.classList.contains("back") || event.target.classList.contains("fa-flag")||event.target.classList.contains("flagWrapper")) {
      event.preventDefault()
      // console.log(event.target)
      view.showFieldContent(event.target, Number(event.target.dataset.index.split('-')[0]), Number(event.target.dataset.index.split('-')[1]))
    }
  },

  //reset函數
  resetckick(event) {
    if (event.target.classList.contains("btn-dark")) {
      window.location.reload()
    }
  },

  //清除左右鍵監聽
  cleareventlistener() {
    document.querySelector('.data-panel').removeEventListener('click', controller.leftckick)
    document.querySelector('.data-panel').removeEventListener('contextmenu', controller.rightckick)
    document.querySelector('body').removeEventListener('click', controller.resetckick)
  },

  // 計算周圍地雷的數量
  getFieldData(fieldIdx, i, j) {
    let sum = 0
    let target_i = Number(i)
    let target_j = Number(j)

    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        if (0 <= target_i + x && target_i + x < model.numberOfRows && 0 <= target_j + y && target_j + y < model.numberOfRows) {
          if (target_i + x == target_i && target_j + y == target_j) {
            sum += 0
          } else {
            sum += model.mines[Number(target_i + x)][Number(target_j + y)]
          }
        }
      }
    }
    // console.log(sum)
    return sum
  },

  // 使用者挖格子時要執行的函式
  dig(field, i, j) {
    this.bombBurySite(i, j)

    let sum = this.getFieldData(field, i, j)
    let target_i = Number(i)
    let target_j = Number(j)
    let allReveal = model.numberOfRows * model.numberOfRows - model.numberOfMines

    if (model.numCellsClicked === 0) {
      model.currentState = GAME_STATE.Play
      utility.startTimer()
      // view.showBoard()  // 測試用
    }

    switch (model.currentState) {

      case GAME_STATE.Play:
        if (!field.classList.contains('clicked') && field.innerHTML !== `<i class="fas fa-flag"></i>`) {
          field.classList.add('clicked')
          model.numCellsClicked++

          if (Number(model.mines[target_i][target_j]) === 1) { // * 如果是地雷 => 遊戲結束
            utility.handleStop()
            field.classList.remove('back')
            field.classList.add('bomb')
            view.rendWrongflag()
            view.showBoard()
            view.showGameLossFinished ()
            model.currentState = GAME_STATE.Gameover
            return
          } else if (model.numCellsClicked === allReveal) { // * 如果是全揭開 => 遊戲結束
            utility.handleStop()
            if (sum !== 0) {   // * 最後一格如果是號碼或海洋 => 顯示格子
              field.textContent = sum
            }
            view.showGameWinFinished ()
            view.showBoard()
            model.currentState = GAME_STATE.Gameover
            return
          }

          if (sum !== 0) {   // * 如果是號碼或海洋 => 顯示格子
            field.innerHTML = sum
          } else if (sum === 0) { // * 如果是海洋 => 顯示格子
            controller.spreadOcean(Number(target_i), Number(target_j))
          }
        }
    }
  },

  // 若挖到的是空白，則展開
  spreadOcean(i, j) {
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        if (0 <= i + x && i + x < model.numberOfRows && 0 <= j + y && j + y < model.numberOfRows && controller.checkExist(Number(i + x), Number(j + y))) {
          if (i + x == i && j + y == j) {
          } else {
            model.fields.push({ row: (i + x), col: (j + y) })
          }
        }
      }
    }
    for (let x = 0; x < model.fields.length; x++) {
      let i = Number(model.fields[x].row)
      let j = Number(model.fields[x].col)
      const cell = document.getElementById(i + '-' + j)

      if (cell.firstChild === null || cell === null || cell.firstChild.firstChild === null) {  //如果有旗幟標籤 則不開
        controller.dig(cell, i, j)
      }
    }
  },
  // 確認格子編號是否已存在在field
  checkExist(i, j) {
    for (let x = 0; x < model.fields.length; x++) {
      if (model.fields[x].row === i && model.fields[x].col === j) {
        return false
      }
    }
    return true
  },
  // 埋炸彈
  bombBurySite(i, j) {
    if (model.numCellsClicked === 0) {
      for (x = 0; x < model.numberOfRows; x++) {
        model.mines[x] = []
        for (y = 0; y < model.numberOfRows; y++) {
          model.mines[x][y] = 0
        }
      }
      let bombNum = 0
      while (bombNum !== model.numberOfMines) {
        let bomb_i = utility.randomMath(model.numberOfRows);
        let bomb_j = utility.randomMath(model.numberOfRows);
        if (model.mines[bomb_i][bomb_j] != 1 && bomb_i != i && bomb_j != j) {
          model.mines[bomb_i][bomb_j] = 1;
          bombNum++
        }
      }
    } else {
      return
    }
  },

  //客製化
  customization() {
    const customizationCol = document.querySelector("#colsetinput")
    const customizationBomb = document.querySelector("#bombnuminput")
    
    // Enter Create col
    customizationCol.addEventListener("keypress", this.customizedcol)

    // Enter Create Bomb number
    customizationBomb.addEventListener("keypress", this.customizedbomb)
  },

  //客製化column函式
  customizedcol(event) {
    if (event.key == "Enter") {
      let inputValue = +document.querySelector("#colsetinput").value //僅為可轉換數字
      if (inputValue !== "" && model.numCellsClicked === 0 && utility.isNatural(inputValue) && inputValue < 37 && (inputValue -1) * (inputValue - 1) > model.numberOfMines) {
        // console.log(model.numberOfRows)
        utility.playSoundeffect(model.soundEffect.enter)
        controller.cleareventlistener()
        controller.createGame(inputValue, model.numberOfMines)
      } else if (model.numCellsClicked !== 0) {
        alert("You need to reload to set-up!")
        let confirmation = confirm(`Do you want to reload?`)
        if (confirmation === true) {
          window.location.reload()
        }
      } else if (isNaN(inputValue) || inputValue % 1 !== 0 || inputValue < 0) {
        alert("Please enter the natural number!\nFor example: 9")
      } else if (inputValue >= 37) {
        alert("Exceeded maximum limit 37 x 37!")
      } else if ((inputValue -1) * (inputValue - 1) <= model.numberOfMines) {
        alert(`Too small to place "${model.numberOfMines}" bombs!!`)
      }
    }
  },

  //客製化bomb函式
  customizedbomb(event) {
    if (event.key == "Enter") {
      let inputValue = +document.querySelector("#bombnuminput").value //僅為可轉換數字
      if (inputValue !== "" && model.numCellsClicked === 0 && utility.isNatural(inputValue) && inputValue > 1 && inputValue < (model.numberOfRows - 1) * (model.numberOfRows - 1)) {
        utility.playSoundeffect(model.soundEffect.enter)
        // console.log(model.numberOfMines)
        controller.cleareventlistener()
        controller.createGame(model.numberOfRows, inputValue)
      } else if (model.numCellsClicked !== 0) {
        alert("You need to reload to set-up!")
        let confirmation = confirm(`Do you want to reload?`)
        if (confirmation === true) {
          window.location.reload()
        }
      } else if (isNaN(inputValue) || inputValue % 1 !== 0 || inputValue <= 0) {
        alert("Please enter the natural number!\nFor example: 10")
      } else if (inputValue <= 1) {
        alert("The minimum limit is greater than 1!")
      } else if (inputValue >= (model.numberOfRows - 1) * (model.numberOfRows - 1)) {
        alert(`Too many bombs!!\n Maximum: ${(model.numberOfRows - 1) * (model.numberOfRows - 1) - 1}`)
      }
    }
  },
}

const model = {
  numberOfRows: 9,  // 初始值
  numberOfMines: 10, // 初始地雷數量
  numCellsClicked: 0,// 初始檢查
  numFlags: 10,// 初始檢查
  timeTaked: '0:00', //初始時間
  currentState: 'await', //初始狀態

  // 存放地雷的編號(二維)
  mines: [],

  // 存放格子的編號(二維)
  fields: [],

  //音效庫
  soundEffect:{
    leftclick:'./poka02.mp3',
    rightclick:'./swing1.mp3',
    win:'./clapping_bravo.mp3',
    loss:'./bomb.mp3',
    enter:'./powerup03.mp3',
  }
}

const utility = {
  //隨機選位置
  randomMath(site) {
    return Math.floor(Math.random() * (site))
  },
  
  //計時器
  startTimer() {
    let Seconds = 0
    timerId = setInterval(() => {
      Seconds += 1
      view.renderTime(Seconds)
    }, 1000)
  },
  //停止時間記時
  handleStop() {
  clearInterval(timerId)
  },

  //判斷自然數
  isNatural(n) {
    if (typeof (n) === 'number' && n > 0 && Math.floor(n) === n && n !== Infinity) {
      return true
    }
    return false
  },

  //音效
  playSoundeffect(src) {
    let audio = new Audio(src);
    audio.play();
  },
}

controller.createGame(9, 10)


