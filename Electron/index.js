const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem, dialog } = remote
// const ctags = require('ctags')
let currentFile = null // 当前文档保存的路径
let currentTagFile = null
// let isSaved = true // 当前文档是否已保存
let txtEditor = document.getElementById('txtEditor') // 获得TextArea文本框的引用
let txtEditor1 = document.getElementById('txtEditor1')
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
    txtEditor1.value = txtRead
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
