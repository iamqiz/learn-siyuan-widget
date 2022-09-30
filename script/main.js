/**
 * JavaScript(js)文件
 * 实现挂件的功能
 * 我是块注释
 */
//我是行注释
//导入其他文件里的函数
//此种导入使用时用 api.xxx() 调用;且由于api.js里全是异步函数,调用时需加上 await关键词,示例: await api.xxx()
import * as api from './api.js';
//此种导入使用时直接 xxx() 调用
import {
	curtime,assert,beautify,getWidgetBlockInfo,delayMs
} from "./util.js";
import {config} from "./config.js";
import {getFullHPathByID} from "./api.js";


console.log("开始执行main.js")

/**
 * window.parent :通过它能使用更多自带功能,以及获取
 * window.parent.siyuan : 思源相关内容
 * window.parent.siyuan.config.system :包含思源所用用目录|内核版本等信息
 */
// 导入node.js的fs模块
const fs = window.parent.require('fs');

console.log("fs:"+fs)
console.log("fs:"+(typeof fs))
// const fs = window.require('fs');
// console.log("比较:"+(window==window.parent))
// console.log("window:"+window)
// console.log("window2:"+window.parent)


// 把index.html里的元素赋值给变量,这样在函数里可以直接引用这些变量来操作html元素
let msg_bar = document.getElementById('message_span')
let input1 = document.getElementById('input1');

//全局变量,表示上次新创建的块的id,该块用来显示挂件输出信息
let lastNewCreatedBlockID

//以下是html元素(这里是按钮)的点击事件

//按钮1的点击事件
document.getElementById('button1').addEventListener('click', function () {
	//事件的处理单独写到一个异步函数里
	button1func().then(r => {});
});
document.getElementById('button2').addEventListener('click', function () {
	button2func().then(r => {});
});

document.getElementById('button3').addEventListener('click', function () {
	button3func(2).then(r => {});
});

document.getElementById('button4').addEventListener('click', function () {
	console.clear()
	button4func().then(r => {});   //主

});
//-------------------------以下是各种函数,用来实现各种具体的挂件功能;
// function前加上async表示该函数是异步函数
/**/
async function button1func() {
	console.log("button1func")
	// msg_bar.innerHTML="当前时间:"+util.curtime()
	msg_bar.innerHTML="当前时间:"+curtime()
	beautify()
}

async function button2func() {
	console.log("button2func")
	input1.value="当前时间:"+curtime()
}

// 从剪贴板获取内容
async function button3func() {
	console.clear()
	console.log("button3func")
	let msg_ele=document.getElementById("button3msg")
	msg_ele.innerHTML=""

	//读取剪贴板, then部分是读取成功时的操作,catch部分是读取失败时的操作
	navigator.clipboard
		.readText()
		.then((clipText) => {
			let text = clipText.trim()
			console.log("获取剪贴板成功:", clipText);
			if (text.length > 25) {
				console.log("剪贴板内容过长:" + text.substring(0, 25))
				msg_ele.innerHTML="剪贴板内容过长"
			} else {
				console.log("剪贴板内容为:" + text)
				input1.value=text
				msg_ele.innerHTML="粘贴成功"
			}
		})
		.catch((v) => {
			console.log("获取剪贴板失败: ", v);
		});

	//2秒后提示消息消失
	// await delayMs(2000)
	// msg_ele.innerHTML=""
}

/**
 *
 */
async function button4func() {
	// 获取挂件所在块的信息
	let widgetBlockInfo = getWidgetBlockInfo();
	// let blockInfo = await api.getBlockInfo(widgetBlockInfo.id);
	let fullhpath = await api.getFullHPathByID(widgetBlockInfo.id);
	// console.log("blockInfo:"+blockInfo)
	// console.log("blockInfo str:"+beautify(blockInfo))
	msg_bar.innerHTML="当前文档名:"+fullhpath

}

//----------------------------------------------下面是常用函数


/* utils
使用api(非sql)获取block的各种信息,包括下面几种
获取当前文档的目录, 假如path为/a/b/c/d 则目录为/a/b/c/ ; 假如path为 /a 目录为 /
块的属性: 标题(title) 类型(type,比如doc),自定义属性(custom-)
*/
async function getBlockInfo(blockIdArg) {
	let blockId;
	let doc1_sy_path;
	let curBlock1
	let doc1_parent_path;
	// 获取当前文档的目录, 假如path为/a/b/c/d 则目录为/a/b/c/ ; 假如path为 /a 目录为 /
	// blockId="20220816091715-law0025"
	// blockId="20220813085628-f9j9mkb"  //三级文档
	// blockId="20220815052252-bzspew1" //一级文档
	blockId=blockIdArg //一级文档
	console.log("getBlockInfo-blockId:"+blockId)
	let blockFullHPath = await api.getFullHPathByID(blockId);
	let curBlock1Hpath=await getHPathByID(blockId)
	curBlock1= await api.getBlockInfo(blockId);
	if(!curBlock1){
		console.error("挂件错误:getBlockInfo无法获取块信息:"+blockId)
	}
	console.log("getBlockInfo-ret:"+JSON.stringify(curBlock1))

	console.log("path:"+curBlock1.path)
	console.log("box:"+curBlock1.box)
	console.log("hpath:"+curBlock1.hpath)
	console.log("hpath(other api):"+curBlock1Hpath)
	// doc1_sy_path = "/data/" + curBlock1.box  + curBlock1.path
	let doc1_path=curBlock1.path;
	doc1_parent_path=doc1_path.substring(0,doc1_path.lastIndexOf("/")+1)
	console.log("doc1_parent_path:"+doc1_parent_path)

	//获取块属性 (含有title)
	let blockAttrs= await api.getBlockAttrs(blockId);
	let isDoc
	// rootID是块所在文档的id, 如果块id等于文档id,则该块是文档块
	isDoc= blockId===curBlock1.rootID

	let ret = {
		dir_path:doc1_parent_path,
		path:curBlock1.path,
		hpath:curBlock1Hpath,// 通过单独api获取
		fullhpath:blockFullHPath,// 通过单独api获取
		box:curBlock1.box,
		id:blockId,
		blockAttrs: blockAttrs,
		title: blockAttrs.title, //或者 curBlock1.rootTitle
		rootID:curBlock1.rootID, //所在文档id
		isDoc:isDoc
	};
	return ret
}
