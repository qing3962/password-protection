# Password Protection Plugin

## Purpose

I developed this plugin to prevent my girlfriend from peeking my private notes or diaries.  

## What does this plugin do?

No encrypt, no decrypt, This plugin doesn't modify your notes, it will not do anything with your notes.  

When you launch the Obsidian:

If the protected folder you set is the root folder (/), a password verification box will present, enter the correct password, you can just open a note.  

If the protected folder you set is a sub-folder (/xxx), when you open a note that located in the sub-folder, a password verification box will pop up, enter the correct password, you can open the note.  

Once you have entered the correct password, you will not be asked to enter it again when opening other protected notes.  

If you want to turn on protection again, you may invoke the command panel, type "pass", find the command - "Password Protection: Open", run it, when you open a protected note, the password verification box will pop up again.  

In Obsidian for Windows, a Password Protection Button locates on the left-bar. Click on it to execute protecting or unprotecting action.   

## The systems have been tested:

I have tested the plugin on Windows and iOS (iPhone、iPad) with Obsidian in 2023.5.

## Installation, Configruation, and Usage

If you cann't install the plugin from community plugin market, you can step by step follow this:
 
1. Download the latest release: password-protection-1.x.x.zip, this package in cross-platform have been tested in Windows and iOS; [Download](https://github.com/qing3962/password-protection/releases).

2. Open the folder for community plugins of Obsidian, usually locate in .obsidian/plugins of the your vault folder.

3. Unzip the release zip, a new folder appear named "password-protection", two files in the folder: main.js, manifest.json.

4. Relaunch Obsidian, click "Settings", choice "Community Plugins", you can see the "Password Protection" in installed plugins list, enable the plugin.

5. See the left-down part of the Settings, the “Password Protection” will appear, click it, the setting page of the plugin is opened, type the path you want to protect, default path is root path.

6. Enable the button of password protection, a Password Input Modal will popup, enter your password, click "OK".

7. the password protection plugin start work, when you open a note in the protected path you set, a Password Verify Modal will popup, enter the right password, you just open the note.  

## License

This project is licensed under the [MIT License](LICENSE).

------  

# 中文版说明 (For chinese)

## 目的

我开发这个插件的目的是，防止我的女朋友偷看我的私人笔记或日记。  

## 这个插件做了什么？

这个插件不会加密和解密你的笔记，也不会修改你的笔记，它不会对你的笔记做任何事。  

当你每次启动 Obsidian:

如果你设置的受保护路径是根路径（/），你将会看到一个密码验证框，只有输入正确的密码，你才能打开任何一篇笔记。  

如果你设置的受保护路径是子路径（/xxx），当你要打开的笔记位于这个子路径，就会弹出一个密码验证框，只有输入正确的密码，你才能继续打开这篇笔记。  

一旦输入过一次正确的密码，那么再打开其他受保护的笔记时，不会要求再次输入。  

如果你想再次开启保护，可以调出命令面板，输入“pass”，找到命令 - "Password Protection: 打开密码保护"，执行它，那么再要打开受保护的笔记，会再次弹出密码验证框。  

在 Windows 版的 Obsidian 里，左侧的工具栏会出现一个密码保护按钮，点击它也可以执行保护或不保护动作。  

## 已测试的系统

这个插件已经在 Windows 和 iOS (iPhone、iPad) 系统上通过测试，使用2023年5月下载的 Obsidian。  

## 安装、配置和使用

如果你不能从社区插件市场安装这个插件，你可以用下面的方法：

1. 下载这个插件的最新 Release 版本: password-protection-1.x.x.zip，这个包可以跨平台使用，已经在 Windows 和 iOS 上完成测试； [GitHub](https://github.com/qing3962/password-protection/releases)  
[Gitee](https://gitee.com/qing3962/password-protection/)

2. 找到你的 Obsidian 配置文件夹的插件文件夹：plugins，一般在你的笔记库所在的目录：.obsidian/plugins；

3. 在插件文件夹中，解压这个插件 zip 包，得到一个目录：.obsidian/plugins/password-protection，里面有两个文件: main.js 和 manifest.json；

4. 重新启动 Obsidian，在 Settings 中选择“第三方插件”，在右侧下方的“已安装插件”中，可以看到 Password Protection，点击右侧的启用按钮；

5. 在 Settings 中左侧下方“第三方插件”列表中，可以看到“Password Protection”，点击后右侧打开插件设置页面，设置一个要保护的路径，默认是根路径（/）；

6. 点击插件的启用按钮，弹出密码设置框，输入两遍密码，插件启用成功;

7. 当你打开一个位于保护路径下的笔记，将弹出密码验证弹窗，只有输入正确的密码，你才能继续打开笔记。  


## 许可证

本插件使用 MIT 许可证。 [MIT License](LICENSE)

------  

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22password-protection%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)  

------  

<a href="https://bmc.link/qing3962">Buy me a coffee?</a>  
