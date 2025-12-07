# 🛰️ 黑域侵入者 · Hacker Terminal Simulator
**⚡ Web Cyberpunk Hacking Simulation Game**
<div align="center">
  <img src="https://github.com/mire403/Hacker-Terminal-Simulator/blob/main/netrunner_-terminal-breach/%E9%A1%B5%E9%9D%A2.png">
</div>

## 🚀 项目概述 / Overview

**黑域侵入者**（DarkNet Infiltrator）是一个沉浸式的**黑客终端模拟器网页游戏**
。
你将在霓虹绿色的虚拟主机系统中扮演渗透者，输入指令、突破防线、破解密码、解密文件，
并在系统追踪到你时紧急反制。

**🔥 所有界面、动画、逻辑均为网页原生技术构建（HTML / CSS / JS / React）**

无需插件，即开即玩。

## ✨ 主要特色 / Key Features

### 🟢 1. 赛博朋克级视觉体验

动态绿色代码雨（可见 “Made By Haoze Zheng” 个性字符）

复古 CRT 显示器扫描线

霓虹绿文字发光效果

终端暗色透明 UI

稳定亮度波动而不刺眼的视觉呈现

### ⌨️ 2. 完整可交互终端模拟器

支持常用命令：

```powershell
help       显示帮助  
ls         查看目录  
cd <dir>   切换目录  
cat <file> 查看文件  
clear      清屏  
start      开始黑客小游戏  
exit       退出会话  
```

并实现了真实的终端体验：

**Tab自动补全**

**↑ / ↓ 调用历史命令**

**光标自动聚焦**

**输出带有延迟的“打字机效果”**

### 🎮 3. 多阶段黑客小游戏（Fully Playable Mini-Games）

**🔍 （1）文件系统侦查：寻找线索**

随机生成的虚拟文件系统，每次刷新都不一样！

**🔐 （2）密码破解（Cracking）**

类似 Mastermind 的密码逻辑谜题，需要推理正确组合。

**🧩 （3）文本解密（Decryption）**

例如 hex → ascii → key 的逐层解锁任务。

**⚠️ （4）TRACE 紧急追踪事件**

系统会随机触发：

```css
⚠ TRACE DETECTED  
ENTER OVERRIDE CODE: X9F-2A1
```

你必须在倒计时前正确输入，否则失败被踢出系统。

### 🔄 4. 随机化关卡，提高可玩性

文件系统结构变化

关键文件隐藏位置变化

破解密码随机生成

TRACE 事件随机触发

**✨ 这意味着每一次入侵都是全新体验。**

## 📁 项目结构 / Project Structure

```pgsql
/public
  index.html
/src
  index.tsx
  App.tsx
  types.ts
  constants.ts (随机文件系统生成)
  /components
      MatrixRain.tsx
      CRTOverlay.tsx
```

## 🛠 技术栈 / Tech Stack

**HTML5 Canvas**（代码雨）

**TailwindCSS + 自定义滤镜**

**React 18**

**TypeScript**

**自定义终端指令解析器**

**随机关卡生成器（文件系统）**

## 🎯 游戏目标 / Goal

你需要：

1.在文件系统中找到线索

2.破解密码

3.解密关键文件

4.避免系统追踪

5.解锁最终密钥并成功侵入主机

## ▶️ 运行方式 / Run Locally

```bash
npm install
npm run dev
```

或直接打开：

```pgsql
public/index.html
```

即可开始入侵 ⚡

## 🧪 未来扩展 / Future Ideas

SSH 端口扫描小游戏

“网络地图 / Node Graph 视图”

可解锁技能树（破解更快、TRACE 更慢）

BGM + 警告音效

多结局剧情模式

## ❤️ 致谢 / Credits

代码雨背景中不断闪现的一句话：

“Made By Haoze Zheng”

是本项目的签名与象征。

## ⭐ Star Support

如果你觉得这个项目对你有帮助，请给仓库点一个 ⭐ Star！
你的鼓励是我继续优化此项目的最大动力 😊

# 🚀 Enjoy Hacking.
