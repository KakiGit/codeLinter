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
let nodeID = 0
let currentNode
let nodeList = [] // stores used nodes. (for "go back" button)
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
        // filename can also be obtained from parent.name
        this.filename = ""
        this.line = 0
        this.ID = nodeID // unique ID
        nodeID++
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
    SetFilename(str) {
        this.filename = str
    }
    SetLine(line) {
        this.line = line
    }
    GetID() {
        return this.ID;
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
      console.log("Children size:" + this.children.length.toString())
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].type === "file") {
            console.log(this.name + "'s child No." + (i+1).toString() + " " + this.children[i].GetName());
            this.children[i].Print()
        }
      }
    }
}

let rootNode = new TreeNode(null, "root", "root")

/*

 */
function resolveFile(texts, node, level) {
  var tagx = "Analysing:"
  var tag0 = "Relied Files:"
  var tag1 = "Contained Functions:"
  var tag2 = "There are "
  var tag3 = "in line"

  var indexx = texts.indexOf(tagx)
  if (indexx < 0) return
  var index0 = texts.indexOf(tag0)
  var index1 = texts.indexOf(tag1)
  var index2 = texts.indexOf(tag2)

  // obtain filename
  var filename = texts.substring(indexx + tagx.length, index0)
  filename = filename.split('\n')[0].split('/')
  filename = filename[filename.length-1]

  // str0: substring containing all relied files, split by '\n'
  var str0 = texts.substring(index0 + tag0.length, index1)
  // str1: substring containing all functions in current files, split by '\n'
  var str1 = texts.substring(index1 + tag1.length, index2)
  // 'node' file contains the above str1 functions

  // record all the relied files
  var countFile = 0
  var res = str0.split("\n")
  for (var i = 0; i < res.length; i++) {
      if (res[i].length > 0) {
          var tempNode = new TreeNode(node, res[i], "file")
          tempNode.SetFilename(res[i])
          node.Add(tempNode)
          countFile++
      }
  }
  // record current file's contained functions
  res = str1.split("\n")
  for (var i = 0; i < res.length; i++) {
      // tag: containing "in line"
      if (res[i].length > 0 && res[i].indexOf(tag3) > 0) {
          var temp = res[i].split(' ')
          var tempNode = new TreeNode(node, temp[0], "func")
          tempNode.SetFilename(filename)
          tempNode.SetLine(temp[3])
          node.Add(tempNode)
      }
  }
  // expand sub level nodes: (relied file nodes)
  var tag = '[' + (level+1).toString() + '-'
  console.log(tag)
  var indices = getIndicesOf(tag, texts, true)
  var children = node.GetChildren()
  var index = 0

  for (var i = 0; i < children.length; i++) {
      // console.log("/" + children[i].name)
      // console.log(occurrences(texts, "/" + children[i].name, false) > 0)
      if (children[i].type === "file" && occurrences(texts, "/" + children[i].name, false) > 0) {
          // since all nodes are in order, we can just do this:
          // if children contains N 'file' node, indices.length must > N-1
          var start = getStartIndex(indices[index], texts)
          var end = indices.length === index + 1?texts.length-1:getEndIndex(indices[index+1], texts)
          // subtexts contains the new text for iteration
          var subtexts = texts.substring(start, end)
          //console.log(subtexts)
          resolveFile(subtexts, children[i], level + 1)
          index++
      }
  }
  return node
}

/*
   when the index of [N-x] is found, we need to traverse back to previous line of
    'Analysing ...'.
 */
function getStartIndex(index, texts) {
    var tag = "Analysing:"
    var indices = getIndicesOf(tag, texts, true)
    for (var i = indices.length; i >= 0; i--) {
        if (indices[i] < index) {
            return indices[i]
        }
    }
    return index
}

function getEndIndex(index, texts) {
    var tag = "Analysing:"
    var indices = getIndicesOf(tag, texts, true)
    for (var i = indices.length; i >= 0; i--) {
        if (indices[i] < index) {
            return indices[i] - 1
        }
    }
    return index
}


function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}


function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}
function TraverseTree(id) {
    BSTree(rootNode, id);
    var children = rightDiv.children;
    for (var i = 0; i < children.length; i++) {
        var color;
        if (children[i].className === "node-file") {
            color = "#dd948a"
        } else if (children[i].className === "node-func") {
            color = "#f9fbb6"
        }
        children[i].setAttribute("style", "border-radius: 15px; background-color:" + color + ";position: absolute;top:" +
            children[i].offsetTop.toString() + "px;" + "left:" + children[i].offsetLeft.toString() + "px;");

        color = "#31ee72";
        if (children[i].id === currentNode.GetID().toString()) {
            children[i].setAttribute("style", "border-radius: 15px; background-color:" + color + ";position: absolute;top:" +
                children[i].offsetTop.toString() + "px;" + "left:" + children[i].offsetLeft.toString() + "px;");
            console.log(currentNode.GetName())
        }
        for (var j = 0; j < currentNode.children.length; j++) {
            if (children[i].id === currentNode.children[j].GetID().toString()) {
                children[i].setAttribute("style", "border-radius: 15px; background-color:" + color + ";position: absolute;top:" +
                    children[i].offsetTop.toString() + "px;" + "left:" + children[i].offsetLeft.toString() + "px;");
            }
        }

    }
}
function BSTree(node, id) {
    if (node === null) {
        return
    }
    if (node.GetID().toString() === id) {
        currentNode = node
        return
    }
    for (var i = 0; i < node.children.length; i++) {
        BSTree(node.children[i], id)
    }
}
function DrawTree(node, posy, posx, level) {
  posy = 10
  if(node.name == "root") {
      var btn1 = document.createElement("button")
      btn1.innerText = node.GetName()
      btn1.setAttribute("class", "node-root")
      btn1.setAttribute("style", "background-color: #697586; color: #eeeeee;" +
          "border-radius: 15px;position: absolute;top:" +
          posx.toString() + "px;" + "left:" + (posy.toString() + "px;"))
      node.SetPosition(posx, posy)
      rightDiv.appendChild(btn1)
  }
  var children = node.GetChildren()
  for (var i = 0; i < children.length; i++) {
      // if (children[i].type == "func") {
      //     return
      // }
      var btn1 = document.createElement("button")
      btn1.innerText = children[i].GetName()
      // var x = posx + 100 * Math.cos(Math.PI / 3 * i)
      // var y = posy + 100 * Math.sin(Math.PI / 3 * i)
      var x = posx + 60 * (i - children.length / 2) * Math.pow(0.6, level)
      var y = 100 * level
      var color;
      if (children[i].GetType() === "file") {
        btn1.setAttribute("class", "node-file")
        color = "#dd948a"
      } else {
        btn1.setAttribute("class", "node-func")
        color = "#f9fbb6"
      }

      btn1.setAttribute("style", "border-radius: 15px; background-color:" + color + ";position: absolute;top:" +
         x.toString() + "px;" + "left:" + y.toString() + "px;");
      btn1.setAttribute("id", children[i].GetID().toString())
      btn1.addEventListener('click', function () {
          TraverseTree(this.id)
      })
      rightDiv.appendChild(btn1)
      children[i].SetPosition(x, y)

      var context = myCanvas.getContext('2d')
      context.beginPath();

      context.moveTo(node.GetY(), node.GetX())
      context.lineTo(y, x)
      context.stroke()

      DrawTree(children[i], y, x, level + 1)
  }
}


function getFileContent(filepath) {
    ipcRenderer.send('open-file', filepath)
    const path = require('path')
    var tagFile = path.join(filepath, '..', 'result')
    const txtRead = readText(tagFile)
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

    resolveFile(txtRead, rootNode, 1)
    currentNode = rootNode
    rootNode.Print()
    // todo: now the tree structure is ready, we need to draw it on screen
    DrawTree(rootNode, rightDiv.clientWidth / 2, rightDiv.clientHeight / 2, 1)

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
