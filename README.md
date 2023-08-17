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

## New feature  

- version: 1.1.12 (8/16/2023)

1. Add the interval setting of Auto-open password protection. If you set a value greater than 0, when time elapse certain minutes from last closed protection or last opened a protected file，the password verify box will pop up again as soon as you open a new protected file.  

2. Add the switch setting of prohibit close password verify box, this will provide more protection. If you enable the setting option, the password verify box wouldn’t be able to be closed as soon as it pop up, unless you type right password. Caution: If the protected folder you set is root path (/),  and you forgot your password, you may not be able to enter the Obsidian, because in this case, when the Obsidian launching, a password verification box will pop up and cannot be directly closed.  

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

## Contributing

Contributions to the password-protection plugin are welcome!  

1. If you find any bugs or have any suggestions, please [open an issue](https://github.com/qing3962/password-protection/issues) or submit a pull request.  

2. If you want to display your own native language in the plugin, please refer to the ./langs/en.json file in the source code, create a new language file, and then open an issue attached the file or submit a pull request.  

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

## 新功能  

- 版本: 1.1.12 (2023.8.16)

1. 增加自动打开密码保护的间隔时间设置，单位：分钟。如果设置的时间大于0，当距离上次关闭密码保护或上次打开一个被保护的文件，过去了设置的时间，插件将自动再次打开密码保护，如果用户再次打开一个受保护的文件，将弹出密码验证框验证密码。  

2. 增加禁止关闭密码验证框的选项，这将提供更多的保护。如果打开这个开关，密码验证框弹出后将不能被关闭。当你设置的保护目录是根目录，如果你忘记密码，你将有可能进不了Obsidian，因为这种情况下，Obsidian 启动时将弹出密码验证框，而且无法直接关闭。  

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

## 贡献和帮助

欢迎你对这个插件做出贡献!  

1. 如果你发现任何 Bug 或者有任何建议，请[创建一个 issue 在 GitHub](https://github.com/qing3962/password-protection/issues)，或者 fork 代码仓库修改后提交一个 pull request，或者发送邮件给我：qing3962@sina.com.  

## 许可证

本插件使用 MIT 许可证。 [MIT License](LICENSE)

------  

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22password-protection%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)  

------  

<a href="https://bmc.link/qing3962">Buy me a coffee?</a>  
