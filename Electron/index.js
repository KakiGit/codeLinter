const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem, dialog } = remote
// const ctags = require('ctags')
let currentFile = null // 当前文档保存的路径
let currentTagFile = null
// let isSaved = true // 当前文档是否已保存
let txtEditor = document.getElementById('txtEditor') // 获得TextArea文本框的引用
//let txtEditor1 = document.getElementById('txtEditor1')
let rightDiv = document.getElementById('rightDiv')
let myCanvas = document.getElementById('myCanvas')
let rightDivWidth = rightDiv.clientWidth
let rightDivHeight = rightDiv.clientHeight

document.title = 'Notepad - Untitled' // 设置文档标题，影响窗口标题栏名称

// 给文本框增加右键菜单
// const contextMenuTemplate = [
//   { role: 'undo' }, // Undo菜单项
//   { role: 'redo' }, // Redo菜单项
//   { type: 'separator' }, // 分隔线
//   { role: 'cut' }, // Cut菜单项
//   { role: 'copy' }, // Copy菜单项
//   { role: 'paste' }, // Paste菜单项
//   { role: 'delete' }, // Delete菜单项
//   { type: 'separator' }, // 分隔线
//   { role: 'selectall' } // Select All菜单项
// ]
// const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)
// txtEditor.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
//   contextMenu.popup(remote.getCurrentWindow())
// })

// 监控文本框内容是否改变
// txtEditor.oninput = (e) => {
//   if (isSaved) document.title += ' *'
//   isSaved = false
// }

// 监听与主进程的通信
ipcRenderer.on('action', (event, arg) => {
  switch (arg) {
    // case 'new': // 新建文件
    //   askSaveIfNeed()
    //   currentFile = null
    //   txtEditor.value = ''
    //   document.title = 'Notepad - Untitled'
    //   // remote.getCurrentWindow().setTitle("Notepad - Untitled *");
    //   isSaved = true
    //   break
    // case 'open': // 打开文件
    //   askSaveIfNeed()
    //   const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    //     filters: [
    //       { name: 'Text Files', extensions: ['txt', 'js', 'html', 'md'] },
    //       { name: 'All Files', extensions: ['*'] }],
    //     properties: ['openFile']
    //   })
    //   if (files) {
    //     currentFile = files[0]
    //     const txtRead = readText(currentFile)
    //     txtEditor.value = txtRead
    //     document.title = 'Notepad - ' + currentFile
    //     isSaved = true
    //   }
    //   break
    // case 'save': // 保存文件
    //   saveCurrentDoc()
    //   break
    case 'exiting':
      // askSaveIfNeed()
      askDeleteIfNeed()
      ipcRenderer.sendSync('reqaction', 'exit')
      break
    // case 'tagsGen':
    //   currentTagFile = currentFile
  }
})

// ipcRenderer.on('open-file-dialog-sheet', function (event) {
//   const window = remote.fromWebContents(event.sender)
//   const files = dialog.showOpenDialog(window, { properties: ['openFile'] })
// })

// 读取文本文件
function readText (file) {
  const fs = require('fs')
  // const path = require('path')
  // currentTagFile = path.join(file, '..', 'tags')
  return fs.readFileSync(file, 'utf8')
}
// // 保存文本内容到文件
// function saveText (text, file) {
//   const fs = require('fs')
//   fs.writeFileSync(file, text)
// }

// 保存当前文档
// function saveCurrentDoc () {
//   if (!currentFile) {
//     const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
//       filters: [
//         { name: 'Text Files', extensions: ['txt', 'js', 'html', 'md'] },
//         { name: 'All Files', extensions: ['*'] }]
//     })
//     if (file) currentFile = file
//   }
//   if (currentFile) {
//     const txtSave = txtEditor.value
//     saveText(txtSave, currentFile)
//     isSaved = true
//     document.title = 'Notepad - ' + currentFile
//   }
// }

function askDeleteIfNeed () {
  const fs = require('fs')
  if (currentTagFile != null) {
    if (fs.statSync(currentTagFile).isFile()) {
      const response = dialog.showMessageBox(remote.getCurrentWindow(), {
        message: 'Do you want to delete the result file?',
        type: 'question',
        buttons: ['Yes', 'No']
      })
      if (response === 0) fs.unlinkSync(currentTagFile)
    }
  }
}

// 如果需要保存，弹出保存对话框询问用户是否保存当前文档
// function askSaveIfNeed () {
//   if (isSaved) return
//   const response = dialog.showMessageBox(remote.getCurrentWindow(), {
//     message: 'Do you want to save the current document?',
//     type: 'question',
//     buttons: ['Yes', 'No']
//   })
//   if (response === 0) saveCurrentDoc() // 点击Yes按钮后保存当前文档
// }


class TreeNode {
    constructor(parent, name, type) {
        this.parent = parent
        this.name = name
        this.children = []
        this.x = -1
        this.y = -1
        this.element = null
        this.type = type  // types : root, func, file, mult
    }
    GetChildren() {
      return this.children
    }
    GetParent() {
        return this.parent
    }
    GetX() {
      return this.x
    }
    GetY() {
        return this.y
    }
    GetName() {
        return this.name
    }
    Add(node) {
      this.children.push(node)
    }
    SetPosition(x, y) {
      this.x = x
      this.y = y
    }
    SetType(type) {
      this.type = type
    }
    GetType() {
        return this.type
    }
    SetElement(element) {
      this.element = element
    }
    ComputePosition() {

    }
    Print() {
      console.log("children size:" + this.children.length.toString())
      for (var i = 0; i < this.children.length; i++) {
        console.log(this.children[i].GetName());
        console.log("children:")
        this.children[i].Print()
      }
    }
}

let rootNode = new TreeNode(null, "root", "root")

/*

 */
function resolveFile(texts, node) {
  var tag0 = "Relied Files:"
  var tag1 = "Contained Functions:"
  var tag2 = "There are "

  var index0 = texts.indexOf(tag0)
  var index1 = texts.indexOf(tag1)
  var index2 = texts.indexOf(tag2)
  // str0: substring containing all relied files, split by '\n'
  var str0 = texts.substring(index0 + tag0.length, index1)
  // str1: substring containing all functions in current files, split by '\n'
  var str1 = texts.substring(index1 + tag1.length, index2)
  // 'node' file contains the above str1 functions

  var res = str1.split("\n")
  var res2 = []
  for (var i = 0; i < res.length; i++) {
    if (res[i].length > 0) {
      res2.push(res[i])
      node.Add(new TreeNode(node, res[i], "func"))
    }
  }
  res = str0.split("\n")
  for (var i = 0; i < res.length; i++) {
      if (res[i].length > 0) {
          var tempNode = new TreeNode(node, res[i], "file")
          node.Add(tempNode)
          // todo emmm this is silly
          if (res[i][res[i].length-1] === 'c' && res[i][res[i].length-2] === '.') {
              // todo: get file path
              //var texts2 = getFileContent("../utilities/" + res[i])
              //resolveFile(texts2, tempNode)
              getFileContent("../utilities/" + res[i])
          }
      }
  }

  return node
}
function DrawTree(node, posy, posx) {
  var btn1 = document.createElement("button")
  btn1.innerText = node.GetName()
  btn1.setAttribute("style", "background-color: yellow;position: absolute;top:" +
  posx.toString() + "px;" + "left:" + posy.toString() + "px;");
  node.SetPosition(posx, posy)
  rightDiv.appendChild(btn1)
  var children = node.GetChildren()
  for (var i = 0; i < children.length; i++) {
    if(i > 5) {
      // todo: node overlap
    }
      var btn1 = document.createElement("button")
      btn1.innerText = children[i].GetName()
      var x = posx + 100 * Math.cos(Math.PI / 3 * i)
      var y = posy + 100 * Math.sin(Math.PI / 3 * i)
      var color = "cyan"
      if (children[i].GetType() === "file") {
        color = "pink"
      }
      btn1.setAttribute("style", "background-color:" + color + ";position: absolute;top:" +
         x.toString() + "px;" + "left:" + y.toString() + "px;");
      rightDiv.appendChild(btn1)

      var context = myCanvas.getContext('2d')
      context.beginPath();

      context.moveTo(node.GetY(), node.GetX());
      context.lineTo(y, x);
      context.stroke()
  }
}
function getFileContent(filepath) {
    ipcRenderer.send('open-file', filepath)
    const path = require('path')
    var tagFile = path.join(filepath, '..', 'result')
    const txtRead = readText(tagFile)
    console.log(txtRead)
}
document.getElementById('open').addEventListener('click', function () {
  const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'html', 'md'] },
      { name: 'All Files', extensions: ['*'] }],
    properties: ['openFile']
  })
  if (files) {
    currentFile = files[0]
    const txtRead = readText(currentFile)
    txtEditor.value = txtRead
    document.title = 'Notepad - ' + currentFile
    ipcRenderer.send('open-file', currentFile)
    const path = require('path')
    currentTagFile = path.join(currentFile, '..', 'result')
  }
})

document.getElementById('show').addEventListener('click', function () {
  if (currentTagFile != null) {
    const txtRead = readText(currentTagFile)

    resolveFile(txtRead, rootNode)
    rootNode.Print()
    // todo: now the tree structure is ready, we need to draw it on screen
    DrawTree(rootNode, rightDiv.clientWidth / 2, rightDiv.clientHeight / 2)

  } else {
    const notification = {
      title: 'Oops!',
      body: 'Please select a file'
    }
    const myNotification = new window.Notification(notification.title, notification)
    myNotification.onclick = () => {
      console.log('Notification clicked')
    }
  }
}
)

document.getElementById('close').addEventListener('click', function () {
  askDeleteIfNeed()
  ipcRenderer.sendSync('reqaction', 'exit')
}
)
