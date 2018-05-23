　"use strict"
const { clipboard } = require('electron')
const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem, dialog } = remote
// const ctags = require('ctags')
let d3 = require('d3')
let currentFile = null // 当前文档保存的路径
let currentTagFile = null
// let isSaved = true // 当前文档是否已保存
let txtEditor = document.getElementById('txtEditor') // 获得TextArea文本框的引用
// let txtEditor1 = document.getElementById('txtEditor1')
let githubLink = document.getElementById('githubLink')
let githubBtn = document.getElementById('githubBtn')
let rightDiv = document.getElementById('rightDiv')
let myCanvas = document.getElementById('myCanvas')
let myDirc = document.getElementById('direc')
let fileTitle = document.getElementById('fileName')
var svgCanva = document.getElementById("svgCanvas")
// var svgCanva = document.createElement("svg")
// svgCanva.setAttribute('id', 'svgCanvas')
// svgCanva.setAttribute('width', '100%')
// svgCanva.setAttribute('height', '100%')
let highLBtn
let rightDivWidth = rightDiv.clientWidth
let rightDivHeight = rightDiv.clientHeight
let nodeID = 0
let ForTextDisplay_Hide_name
let ForTextDisplay_Hide_x
let ForTextDisplay_Hide_y
let Icon_Stable = 0
let currentNode
let nodeList = [] // stores used nodes. (for "go back" button)
let currentOpenedFile = null
document.title = 'CODEV' // 设置文档标题，影响窗口标题栏名称
// document.getElementById('show').disabled = true

// dialog.showErrorBox('Beta Usage ', 'This is the beta version(v-1.0) of CODEV.\n Please click open to select an *.c file to analysis. Then click show to show analysis graph. \n Demo files are in the \"testFiles\" folder you downloed, select entry.c to see the demo. \n Analysis data is store in the result file named "result" in the same folder you select, you can open it with editors to see the data.')
let temDiv = document.createElement('div')
temDiv.style.textAlign = "center"
temDiv.style.height = "auto"
let openBtn = document.createElement("button")
openBtn.setAttribute("class", "btn btn-primary btn-lg")
openBtn.setAttribute("type", "button")
openBtn.style.marginTop = "50%"
openBtn.style.outline = "none"
openBtn.innerHTML = "Open Entry"
temDiv.appendChild(openBtn)
myDirc.appendChild(temDiv)

openBtn.addEventListener('click', function () {
    openFile()
})

let tem2Div = document.createElement('div')
tem2Div.style.textAlign = "center"
tem2Div.style.height = "auto"

let showBtn = document.createElement("button")
showBtn.setAttribute("class", "btn btn-primary btn-lg")
showBtn.setAttribute("type", "button")
showBtn.style.outline = "none"
showBtn.innerHTML = "Show"
showBtn.style.marginTop = "50%"

tem2Div.appendChild(showBtn)
showBtn.addEventListener('click', function () {
    show()
    // rightDiv.removeChild(showBtn)
})


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

githubLink.addEventListener('keyup', function (e) {
    if (e.keyCode == 13) {
        if (githubLink.value == "") {
            const notification = {
                title: 'Oops!',
                body: 'Please enter a link'
            }
            let myNotification = new Notification(notification.title, {
                body: notification.body
            })
        }
        else {
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                filters: [],
                properties: ['openDirectory']
            })
            if (files) {
                let arg = githubLink.value + '^' + files[0]
                ipcRenderer.sendSync('githubLink', arg)
                readFolders(files[0], myDirc)
                temDiv.removeChild(openBtn)
                githubLink.value = ""
            }
        }
    }
})

githubBtn.addEventListener('click', function () {
    if (githubLink.value == "") {
        const notification = {
            title: 'Oops!',
            body: 'Please enter a link'
        }
        let myNotification = new Notification(notification.title, {
            body: notification.body
        })
    }
    else {
        const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            filters: [],
            properties: ['openDirectory']
        })
        if (files) {
            let arg = githubLink.value + '^' + files[0]
            ipcRenderer.sendSync('githubLink', arg)
            readFolders(files[0], myDirc)
            temDiv.removeChild(openBtn)
            githubLink.value = ""
        }
    }
})
// githubLink.oninput = (e) => {
//     //   if (isSaved) document.title += ' *'
//     //   isSaved = false
// }
// 监听与主进程的通信

function openFile() {
    const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [
            { name: 'Text Files', extensions: ['c', 'cpp'] }],
        properties: ['openFile']
    })
    if (files) {
        currentFile = files[0]
        d3.select("svg").selectAll("*").remove();
        const txtRead = readText(currentFile)
        txtEditor.value = txtRead

        const path = require('path')

        let dir = path.join(currentFile, '..')
        readFolders(dir, myDirc)


        ipcRenderer.sendSync('open-file', currentFile)
        currentTagFile = path.join(currentFile, '..', 'result')
        const txtRead1 = readText(currentTagFile)
        fileTitle.innerHTML = currentFile.substr(currentFile.lastIndexOf('/') + 1)
        resolveFile(txtRead1, rootNode, 1)
        writeJson()
        rightDiv.insertBefore(tem2Div, svgCanva)
        temDiv.removeChild(openBtn)
    }
}

function isAssetTypeAnImage(ext) {
    return ['c', 'cpp'].indexOf(ext.toLowerCase()) !== -1;
}

function readFolders(dir, par) {
    let folders = [];
    let fs = require('fs')
    fs.readdir(dir, function (err, files) {
        //声明一个数组存储目录下的所有文件夹
        //从数组的第一个元素开始遍历数组
        //遍历数组files结束
        for (let i = 0; i < files.length; i++) {
            // console.log(files[i])
            //遍历查看目录下所有东西
            fs.stat(dir + '/' + files[i], function (err, stats) {
                //如果是文件夹，就放入存放文件夹的数组中
                if (stats.isDirectory()) {
                    folders.push(files[i])
                    let newRow = document.createElement('tr')
                    newRow.style.width = "100%"
                    let newItem = document.createElement('button')
                    newItem.setAttribute("class", "btn-xs btn")
                    newItem.setAttribute("type", "button")
                    newItem.style.backgroundColor = "Transparent"
                    newItem.style.color = "rgba(255,255,255,1)"
                    newItem.style.border = "0"
                    newItem.style.textAlign = "left"
                    // newItem.focus.outline = "none"
                    // newItem.active.focus.outline = "none"

                    newItem.addEventListener('click', function () {
                        if (highLBtn != null)
                            if (highLBtn != newItem)
                                highLBtn.style.backgroundColor = "Transparent"
                        highLBtn = newItem
                        highLBtn.style.backgroundColor = "rgba(30,30,30,1)"

                        if (newCollapse.style.display == "block")
                            newCollapse.style.display = "none"
                        else
                            newCollapse.style.display = "block"
                    })
                    // newItem.setAttribute("data-toggle", "collapse")
                    // newItem.setAttribute("data-target", "#collapse" + files[i])

                    newItem.style.width = "100%"
                    let newIcon = document.createElement('img')
                    newIcon.setAttribute('src', './image/Icons_Regular_folder@3x.png')
                    newIcon.setAttribute('class', 'img-responsive')
                    newIcon.setAttribute('alt', 'Responsive image')
                    let newContent0 = document.createTextNode("- ");
                    let newContent = document.createTextNode(' ' + files[i]);
                    let newCollapse = document.createElement('table')
                    newCollapse.setAttribute("class", "collapse")
                    newCollapse.setAttribute("id", "collapse" + files[i])
                    newCollapse.setAttribute('height', '100vh')
                    newCollapse.style.marginLeft = "15px"
                    // newCollapse.style.display = "block"
                    // newCollapse.setAttribute("aria-expanded", "false")
                    // newCollapse.setAttribute("aria-controls", "#collapse" + files[i])
                    // newCollapse.style.width = "100%"

                    newRow.appendChild(newItem)
                    newItem.appendChild(newContent0)
                    newItem.appendChild(newIcon)
                    newItem.appendChild(newContent)
                    par.appendChild(newRow)
                    newRow.appendChild(newCollapse)

                    readFolders(dir + '/' + files[i], newCollapse)
                }
                else {
                    if (isAssetTypeAnImage(files[i].substr(files[i].lastIndexOf(".") + 1))) {
                        let newRow = document.createElement('tr')
                        newRow.style.width = "100%"
                        let newItem = document.createElement('button')
                        newItem.setAttribute("class", "btn btn-xs")
                        newItem.setAttribute("type", "button")
                        newItem.style.width = "100%"
                        newItem.style.backgroundColor = "Transparent"
                        newItem.style.color = "rgba(255,255,255,1)"
                        // newItem.focus.outline = "none"
                        // newItem.active.focus.outline = "none"

                        newItem.style.textAlign = "left"
                        newItem.style.border = "0"
                        newItem.addEventListener('click', function () {
                            if (highLBtn != null)
                                if (highLBtn != newItem)
                                    highLBtn.style.backgroundColor = "Transparent"
                            highLBtn = newItem
                            highLBtn.style.backgroundColor = "rgba(30,30,30,1)"

                            let path = require('path')
                            d3.select("svg").selectAll("*").remove();
                            currentFile = dir + '/' + files[i]
                            const txtRead = readText(currentFile)
                            txtEditor.value = txtRead
                            ipcRenderer.sendSync('open-file', currentFile)
                            rightDiv.insertBefore(tem2Div, svgCanva)

                            fileTitle.innerHTML = currentFile.substr(currentFile.lastIndexOf('/') + 1)

                            currentTagFile = path.join(currentFile, '..', 'result')
                            const txtRead1 = readText(currentTagFile)
                            resolveFile(txtRead1, rootNode, 1)
                            writeJson()
                        })
                        let newContent = document.createTextNode(' ' + files[i]);
                        let newIcon = document.createElement('img')
                        newIcon.setAttribute('src', './image/Icons_Regular_file-alt@3x.png')
                        newIcon.setAttribute('class', 'img-responsive')
                        newIcon.setAttribute('alt', 'Responsive image')
                        newRow.appendChild(newItem)
                        newItem.appendChild(newIcon)
                        newItem.appendChild(newContent)
                        par.appendChild(newRow)
                    }
                }
            })
        }
    })
}

function show() {
    if (currentTagFile != null) {
        rightDiv.removeChild(tem2Div)
        // rightDiv.appendChild(svgCanva)
        drawD3Tree()
        jsonObj = null
        rootNode = new TreeNode(null, 'root', 'root')

    } else {
        const notification = {
            title: 'Oops!',
            body: 'Please select a file'
        }
        let myNotification = new Notification(notification.title, {
            body: notification.body
        })
    }
}

ipcRenderer.on('action', (event, arg) => {
    switch (arg) {
        case 'open': // 打开文件
            openFile()
            break
        case 'show':
            show()
            break
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
function readText(file) {
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

function traverseD3TreeNodes(node, obj, level) {
    var o = {}
    o['id'] = node.GetID()
    o['name'] = node.GetName()
    o['path'] = node.GetFilePath()
    o['type'] = node.GetType()
    //o['group'] = level
    if (node.GetType() === "func") {
        o['group'] = 2
    }
    if (node.GetType() === "file") {
        o['group'] = 1
    }
    if (node.GetType() === "root") {
        o['group'] = 0
    }

    obj['nodes'].push(o);
    for (var i = 0; i < node.children.length; i++) {
        traverseD3TreeNodes(node.children[i], obj, level + 1)
    }
}

function traverseD3TreeLinks(node, obj) {
    for (var i = 0; i < node.children.length; i++) {
        var o = {}
        o['source'] = node.GetID()
        o['target'] = node.children[i].GetID()
        obj['links'].push(o)
        traverseD3TreeLinks(node.children[i], obj)
    }
}
var jsonObj;

function writeJson() {
    var jsonStr = '{"nodes":[],' + '"links":[]}'

    jsonObj = JSON.parse(jsonStr)
    // console.log(rootNode.GetName())
    traverseD3TreeNodes(rootNode, jsonObj, 1)
    traverseD3TreeLinks(rootNode, jsonObj)

}
function drawD3Tree() {
    var svg = d3.select('svg')
    // width = +svg.attr('width'),
    // height = +svg.attr('height')
    var width = svgCanva.getClientRects()[0].width
    var height = svgCanva.getClientRects()[0].height

    var color = d3.scaleOrdinal(d3.schemeCategory20)

    var linkDistance = 50
    var linkForce = -100
    var simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function (d) { return d.id }).distance(linkDistance))
        .force('charge', d3.forceManyBody().strength(linkForce))
        .force('center', d3.forceCenter(width / 2, height / 2))

    var nodeColor = ["#1e7dd8", "#b5575b", "#4099a8", "#ffff00", "#00ffff"]

    var graph = jsonObj
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', function (d) { return Math.sqrt(d.value) })

    var group = svg.append('g')
        .attr('class', 'nodes')


    var node = group
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", function (d) {
            if (d.type === "func") return 15;
            else if (d.type === "file") return 15;
            else if (d.type === "root") return 30;
        })
        .attr("fill", function (d) { return nodeColor[d.group]; })
        .attr("id", function (d) { return d.id; })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on("mouseover", ChangeIcon_DisplayText)
        .on("mouseout", ReviseIcon_HideText)
        .on("click", OpenFile_FreezeIcon)
        .style("stroke-width", "0px")
        .attr("opacity", "1")

    function ChangeIcon_DisplayText(d) {
        d3.select(this).attr("r", function (d) {
            ForTextDisplay_Hide_name = d.name
            ForTextDisplay_Hide_x = d.x - 30
            ForTextDisplay_Hide_y = d.y - 20
            group.select("text")
            .attr("x", function (d) {return ForTextDisplay_Hide_x;})
            .attr("y", function (d) {return ForTextDisplay_Hide_y;})
            if (d.type === "func") return 25;
            else if (d.type === "file") return 25;
            else if (d.type === "root") return 40;

        })
        .attr("opacity", "0.3")
        group.select("text").text(function (d) {return ForTextDisplay_Hide_name; })
    }

    function ReviseIcon_HideText(d) {
        d3.select(this).attr("r", function (d) {
            if (d.type === "func" && Icon_Stable === 0) return 15;
            else if (d.type === "func" && Icon_Stable === 1) return 25;
            else if (d.type === "file" && Icon_Stable === 0) return 15;
            else if (d.type === "file" && Icon_Stable === 1) return 25;
            else if (d.type === "root" && Icon_Stable === 0) return 30;
            else if (d.type === "root" && Icon_Stable === 1) return 40;
        })
        .attr("opacity", "1")
        group.selectAll("text").text(function (d) {return ""; });
    }

    function OpenFile_FreezeIcon(d) {
        if (d.path[0] != "/")
            d.path = d.path.substr(1)
        if (d.path != "") {
            const txtRead = readText(d.path)
            txtEditor.value = txtRead
            fileTitle.innerHTML = currentFile.substr(currentFile.lastIndexOf('/') + 1)
        }
        group.selectAll("circle").attr("r", function (d) {
          if (d.type === "func") return 15;
          else if (d.type === "file") return 15;
          else if (d.type === "root") return 30;
        })
        d3.select(this).attr("r", function (d) {
            if (d.type === "func" ) return 25;
            else if (d.type === "file" ) return 25;
            else if (d.type === "root" ) return 40;
        })
        Icon_Stable = 1
        d3.select(this).attr("opacity", "1")
    }

    var icons = group
        .selectAll("image")
        .data(graph.nodes)
        .enter().append("image")
        .attr("height", function (d) {
            if (d.type === "func") return 10;
            else if (d.type === "file") return 15;
            else if (d.type === "root") return 20;
        })
        .attr("width", function (d) {
            if (d.type === "func") return 10;
            else if (d.type === "file") return 15;
            else if (d.type === "root") return 20;
        })
        .attr("xlink:href", function (d) {
            if (d.type === "func") return "./image/func_icon.png";
            else if (d.type === "file") return "./image/file_icon.png";
            else if (d.type === "root") return "./image/file_icon.png";
        })
        .attr("pointer-events", "none")

    var text = group.selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("pointer-events", "none")

    simulation
        .nodes(graph.nodes)
        .on('tick', ticked)

    simulation.force('link')
        .links(graph.links)

    function ticked() {
        link
            .attr('x1', function (d) { return d.source.x })
            .attr('y1', function (d) { return d.source.y })
            .attr('x2', function (d) { return d.target.x })
            .attr('y2', function (d) { return d.target.y })

        // todo change the const 15 in 'd.x - 15'
        node
            .attr("cx", function (d) { return d.x - 5; })
            .attr("cy", function (d) { return d.y - 5; });

        icons
            .attr("x", function (d) {
                if (d.type === "func") return d.x - 10;
                else if (d.type === "file") return d.x - 12;
                else if (d.type === "root") return d.x - 12;
            })
            .attr("y", function (d) {
                if (d.type === "func") return d.y - 10;
                else if (d.type === "file") return d.y - 12;
                else if (d.type === "root") return d.y - 12;
            })
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
    }
}

function askDeleteIfNeed() {
    const fs = require('fs')
    if (currentTagFile != null) {
        if (fs.statSync(currentTagFile).isFile()) {
            const response = dialog.showMessageBox(remote.getCurrentWindow(), {
                message: 'Do you want to delete the result file?',
                type: 'question',
                buttons: ['Yes', 'No']
            })
            if (response === 0) {
                // fs.unlinkSync('./tree.json')
                fs.unlinkSync(currentTagFile)
            }
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
        this.type = type // types : root, func, file, mult
        // filename can also be obtained from parent.name
        this.filename = ''
        this.line = 0
        this.ID = nodeID // unique ID
        this.filepath = ''
        nodeID++
    }
    GetChildren() {
        return this.children
    }
    GetParent() {
        return this.parent
    }
    SetFilePath(str) {
        this.filepath = str
    }
    GetFilePath(str) {
        return this.filepath
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
        this.name = str
    }
    SetLine(line) {
        this.line = line
    }
    GetID() {
        return this.ID
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
        console.log('Children size:' + this.children.length.toString())
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].type === 'file') {
                console.log(this.name + "'s child No." + (i + 1).toString() + ' ' + this.children[i].GetName())
                this.children[i].Print()
            }
        }
    }
}

let rootNode = new TreeNode(null, 'root', 'root')

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
    node.SetFilePath(filename.split('\n')[0])
    filename = filename.split('\n')[0].split('/')
    filename = filename[filename.length - 1]
    node.SetFilename(filename)

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
            tempNode.name = temp[1]
            tempNode.SetLine(temp[3])
            node.Add(tempNode)
        }
    }
    // expand sub level nodes: (relied file nodes)
    var tag = '[' + (level + 1).toString() + '-'
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
            var end = indices.length === index + 1 ? texts.length - 1 : getEndIndex(indices[index + 1], texts)
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
    var tag = 'Analysing:'
    var indices = getIndicesOf(tag, texts, true)
    for (var i = indices.length; i >= 0; i--) {
        if (indices[i] < index) {
            return indices[i]
        }
    }
    return index
}

function getEndIndex(index, texts) {
    var tag = 'Analysing:'
    var indices = getIndicesOf(tag, texts, true)
    for (var i = indices.length; i >= 0; i--) {
        if (indices[i] < index) {
            return indices[i] - 1
        }
    }
    return index
}

function occurrences(string, subString, allowOverlapping) {
    string += '';
    subString += '';
    if (subString.length <= 0) return (string.length + 1)

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length

    while (true) {
        pos = string.indexOf(subString, pos)
        if (pos >= 0) {
            ++n
            pos += step
        } else break
    }
    return n
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length
    if (searchStrLen == 0) {
        return []
    }
    var startIndex = 0, index, indices = []
    if (!caseSensitive) {
        str = str.toLowerCase()
        searchStr = searchStr.toLowerCase()
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index)
        startIndex = index + searchStrLen
    }
    return indices
}



document.getElementById('close').addEventListener('click', function () {
    ipcRenderer.send('close', 'close')
})

document.getElementById('min').addEventListener('click', function () {
    ipcRenderer.send('min', 'min')

})

document.getElementById('max').addEventListener('click', function () {
    ipcRenderer.send('max', 'max')

})
