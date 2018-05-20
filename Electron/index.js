　"use strict"

const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem, dialog } = remote
// const ctags = require('ctags')
let d3 = require('d3')
let currentFile = null // 当前文档保存的路径
let currentTagFile = null
// let isSaved = true // 当前文档是否已保存
let txtEditor = document.getElementById('txtEditor') // 获得TextArea文本框的引用
// let txtEditor1 = document.getElementById('txtEditor1')
let rightDiv = document.getElementById('rightDiv')
let myCanvas = document.getElementById('myCanvas')
let rightDivWidth = rightDiv.clientWidth
let rightDivHeight = rightDiv.clientHeight
let nodeID = 0
let currentNode
let nodeList = [] // stores used nodes. (for "go back" button)
let currentOpenedFile = null
document.title = 'Notepad - Untitled' // 设置文档标题，影响窗口标题栏名称
// document.getElementById('show').disabled = true
var showBtn = document.getElementById('show')
showBtn.disabled = true
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
ipcRenderer.send('synchronous-message', '')

ipcRenderer.on('notification', (event, arg) => {
    alert("Before you use: This is the beta version(v-1.0) of CODEV. Please click the buttons to open file and show analysis. \nOnly .c file are supported now.")
})

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
    var svg = d3.select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height')

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
        // .attr("xlink:href", function(d) {
        //     if (d.type === "file") return "./image/filenode_default.png";
        //     else if (d.type === "func") return "./image/funcnode_default.png";
        //     else if (d.type === "root") return "./image/rootnode_default.png";})
        .attr("fill", function (d) { return nodeColor[d.group]; })
        .attr("id", function (d) { return d.id; })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on("mouseover", ChangeIcon)
        .on("mouseout", Re_ChangeIcon)
        .on("mousedown", OpenFile_Jump)

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

    var text = group.selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        //set text color
        //.attr("fill", "#ddd")
        .text(function (d) { return d.name; });

    function ChangeIcon(d) {
        //d3.select('[id="' + d.id + '"]').style('fill', 'yellow')
        d3.select(this).attr("r", function (d) {
            if (d.type === "func") return 25;
            else if (d.type === "file") return 25;
            else if (d.type === "root") return 40;
        })
    }

    function Re_ChangeIcon(d) {
        d3.select(this).attr("r", function (d) {
            if (d.type === "func") return 15;
            else if (d.type === "file") return 15;
            else if (d.type === "root") return 30;
        })
    }

    function OpenFile_Jump(d) {
        console.log(d.path)
        currentFile = d.path
    }

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

        text
            .attr("x", function (d) {
                return d.x - 30;
            })
            .attr("y", function (d) {
                return d.y - 20;
            });
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

// function getFileContent(filepath) {
//     ipcRenderer.sendSync('open-file', filepath)
//     const path = require('path')
//     var tagFile = path.join(filepath, '..', 'result')
//     const txtRead = readText(tagFile)
// }
document.getElementById('open').addEventListener('click', function () {
    const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [
            { name: 'Text Files', extensions: ['c', 'cpp'] },
            { name: 'All Files', extensions: ['*'] }],
        properties: ['openFile']
    })
    if (files) {
        d3.select("svg").selectAll("*").remove()
        currentFile = files[0]
        const txtRead = readText(currentFile)
        txtEditor.value = txtRead
        document.title = 'Notepad - ' + currentFile
        ipcRenderer.sendSync('open-file', currentFile)
        const path = require('path')
        currentTagFile = path.join(currentFile, '..', 'result')

        const txtRead1 = readText(currentTagFile)
        resolveFile(txtRead1, rootNode, 1)
        writeJson()
        showBtn.disabled = false

    }
})

document.getElementById('show').addEventListener('click', function () {
    if (currentTagFile != null) {

        showBtn.disabled = true
        drawD3Tree()
        jsonObj = null
        rootNode = new TreeNode(null, 'root', 'root')

    } else {
        const notification = {
            title: 'Oops!',
            body: 'Please select a file'
        }
    }
})

document.getElementById('close').addEventListener('click', function () {
    askDeleteIfNeed()
    ipcRenderer.sendSync('reqaction', 'exit')
}
)
