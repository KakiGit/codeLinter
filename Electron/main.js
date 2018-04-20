const { app, BrowserWindow, Menu, MenuItem, dialog, ipcMain } = require('electron')
let exec = require('child_process').exec
let safeExit = false
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
// console.log(process.platform)
let exeFile
if (process.platform === "darwin")
  exeFile = 'findFunctions'
else
  exeFile = 'findFunctions_Linux'
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    frame: false
  })
  // app.addRecentDocument('/Users/lijiaqi/GitHub/learnCocoa/codeLinter/work.type')
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  let menuTemplate = new Menu()
  menuTemplate = [
    {
      Title: 'app',
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'window'
        },
        {
          role: 'services'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit',
          click() {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          click() {
            mainWindow.webContents.send('action', 'new') // 点击后向主页渲染进程发送“打开文件”的命令
          },
          // accelerator: 'CmdOrCtrl+N'
        },
        {
          label: 'Open',
          click() {
            mainWindow.webContents.send('action', 'open') // 点击后向主页渲染进程发送“打开文件”的命令
          },
          // accelerator: 'CmdOrCtrl+O'
        },
        {
          label: 'Save',
          click() {
            mainWindow.webContents.send('action', 'save') // 点击后向主页渲染进程发送“打开文件”的命令
          },
          // accelerator: 'CmdOrCtrl+s'
        },
        {
          label: 'Close',
          click() {
            mainWindow.webContents.send('action', 'exiting')
          },
          accelerator: 'CmdOrCtrl+w'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    }
  ]

  // -----------------------------------------------------------------
  // 增加主菜单（在开发测试时会有一个默认菜单，但打包后这个菜单是没有的，需要自己增加）
  const menu = Menu.buildFromTemplate(menuTemplate) // 从模板创建主菜单

  Menu.setApplicationMenu(menu) // 注意：这个代码要放到菜单添加完成之后，否则会造成新增菜单的快捷键无效

  // mainWindow.on('close', (e) => {
  //   if (!safeExit) {
  //     e.preventDefault()
  //     mainWindow.webContents.send('action', 'exiting')
  //   }
  // })
  // -----------------------------------------------------------------
  mainWindow.onbeforeunload = (e) => {
    mainWindow.webContents.send('action', 'exiting')
    if (safeExit) return true
    else return false
  }
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// -----------------------------------------------------------------
// 监听与渲染进程的通信
ipcMain.on('reqaction', (event, arg) => {
  switch (arg) {
    case 'exit':
      // 做点其它操作：比如记录窗口大小、位置等，下次启动时自动使用这些设置；不过因为这里（主进程）无法访问localStorage，这些数据需要使用其它的方式来保存和加载，这里就不作演示了。这里推荐一个相关的工具类库，可以使用它在主进程中保存加载配置数据：https://github.com/sindresorhus/electron-store
      // ...
      safeExit = true
      mainWindow.close()
      mainWindow = null
      // app.quit()// 退出程序
      break
  }
})
ipcMain.on('open-file', (event, arg) => {
  console.log(arg)
  const path = require('path')
  let str = path.join(arg, '..', 'result')
  let p = path.join(app.getAppPath(), exeFile)
  exec(`${p} ${arg} > ${str}`, (error, stdout, stderr) => {
    event.returnValue = 0
    if (error) {
      console.error(`exec error: ${error}`)
    }
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  }
  )


  // exec(`./findFunctions ${arg} > ${str}`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`exec error: ${error}`)
  //   }
  //   console.log(`stdout: ${stdout}`)
  //   console.log(`stderr: ${stderr}`)
  // })
  // event.sender.send('action', 'tagsGen')
})
// -----------------------------------------------------------------

// console.log('hello world from log')
