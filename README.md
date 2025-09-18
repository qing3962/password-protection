English | [中文](#中文版说明)  

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22password-protection%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)  

------  

# Obsidian Password Protection Plugin

## Purpose

I developed this plugin for the Obsidian to prevent my girlfriend from peeking at my private notes/diaries in Obsidian.  

## What does this plugin do?

No encrypt, no decrypt. This plugin doesn't modify your notes, it only lock the Obsidian and ask password to unlock.  

## Settings

- "Enable/Disable password protection": you may set your password or use your password to enable/disable lock protection.
- "Auto-lock": Specify a number of minutes for auto-locking obsidian since the last right password is typed.
- "Password prompt": Please type a question to help you remember your password.
- "Protected folder or file": You may type a path for protecting, if you use the '/', the entire vault will be protected.
- "More folders or files": Add more paths to be protected, e.g. 'mynotes/diarys', up to 6.

## Changelog

- version 1.1.27 (1/1/2025)

1. Support adding more protected path.

2. Support type filepath protected.

- version 1.1.12 (8/16/2023)

1. Add the interval setting of Auto-lock password protection. If you set a value greater than 0, when time elapse certain minutes from last unlocked protection or last opened a protected file，the password verify box will pop up again as soon as you open a new protected file.  

## The systems have been tested:

I have tested the plugin on Windows and iOS (iPhone, iPad) with Obsidian 2023.5.

## Installation, Configuration, and Usage

If you can't install the plugin from the community plugin market, you can try this:
 
1. Download the latest release: password-protection-1.x.x.zip, this package in cross-platform have been tested in Windows and iOS; [Download](https://github.com/qing3962/password-protection/releases).

2. Open the folder for community plugins of Obsidian, usually locate in .obsidian/plugins of the your vault folder.

3. Unzip the release zip, a new folder appear named "password-protection", two files in the folder: main.js, manifest.json.

4. Relaunch Obsidian, click "Settings", choice "Community Plugins", you can see the "Password Protection" in installed plugins list, enable the plugin.

5. See the left-down part of the Settings, the “Password Protection” will appear, click it, the setting page of the plugin is opened, type the path you want to protect, default path is root path.

6. Enable the button of password protection, a Password Input Modal will popup, enter your password, click "OK".

7. The password protection plugin start working, when you open a note in the protected path you set, a Password Verify Modal will popup, enter the right password, you just open the note.  

## Contributing

Contributions to the password-protection plugin are welcome!  

1. If you find any bugs or have any suggestions, please [open an issue](https://github.com/qing3962/password-protection/issues) or submit a pull request.  

2. If you want to display your own native language in the plugin, please refer to the ./langs/en.json file in the source code, create a new language file, and then open an issue attached the file or submit a pull request.  

## License

This project is licensed under the [MIT License](LICENSE).

------  

# 中文版说明

## 目的

我开发这个插件的目的是，防止我的女朋友偷看 Obsidian 中我的私人笔记或日记。  

## 这个插件做了什么？

这个插件不会加密和解密你的笔记，也不会修改你的笔记，它只会用弹出密码验证框的形式锁定Obsidian。  

## 设置

- "开启或关闭密码保护": 这是一个开关，可以打开或关闭密码保护，会弹出密码输入框让你设置或验证密码.
- "自动开启密码保护的间隔时间": 一段时间后自动打开密码保护。时间从上次关闭密码保护或上次打开一个受保护的文件开始计算，0 代表不自动开启密码保护, 单位：分钟.
- "密码提示问题": 如果设置了这一项，当你忘记密码时，可以帮助你回忆起你的密码.
- "需要保护的文件夹或文件": 输入一个要保护的路径，可以是文件或文件夹，如果用默认值 '/'，代表保护整个笔记库，打开被保护的文件需要输入一次密码.
- "更多需要保护的文件夹或文件": 添加更多需要保护的路径, 例如：“我的笔记/日记”, 最多可以添加6条.

## 新功能  

- 版本: 1.1.12 (2023.8.16)

1. 增加自动打开密码保护的间隔时间设置，单位：分钟。如果设置的时间大于0，当距离上次关闭密码保护或上次打开一个被保护的文件，过去了设置的时间，插件将自动再次打开密码保护，如果用户再次打开一个受保护的文件，将弹出密码验证框验证密码。  

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

本插件使用 MIT 许可证： [MIT License](LICENSE)

------  

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22password-protection%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)  

------  

<a href="https://bmc.link/qing3962">Buy me a coffee?</a>  
