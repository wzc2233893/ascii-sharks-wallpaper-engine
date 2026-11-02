# ASCII 鲨鱼海洋 · Wallpaper Engine

实时 ASCII 海洋动画，以及可离线导入 Wallpaper Engine（小红车）的网页壁纸。

基于 **ascii-sharks**（Copyright © 2026 drewdi，MIT）修改。原作者的许可证完整保留于 [LICENSE](LICENSE)。这是包含视觉优化与小红车适配的修改版。

## 直接使用壁纸

1. 下载 [壁纸压缩包](downloads/ASCII-Sharks-Wallpaper-Engine.zip)，点击 GitHub 文件页的下载按钮。
2. 解压整个文件夹。
3. 打开小红车的壁纸编辑器，创建网页壁纸并导入文件夹里的 `index.html`，保存后应用。

也可以下载整个仓库，导入 `wallpaper-engine/index.html`。该文件夹已经编译完成，不需要安装 Node.js、启动服务器或连接互联网。

[完整中文使用说明](wallpaper-engine/使用说明.txt)包含参数菜单没有出现时的配置导入方式。

## 效果与设置

- 灰白 ASCII 鲨鱼，用字符表现明暗与轮廓，没有实心色块、彩色点缀和蓝色尾部拖尾。
- 默认 5 种鲨鱼、不同体型；支持普通鲨、锤头鲨、大锤头鲨、虎鲨、斑马鲨、鲭鲨、长尾鲨和护士鲨。
- 保留鱼群结群、避让、捕食、鼠标驱赶和点击扰动。
- 小红车参数：鲨鱼数量 1～8、大小 60%～140%、品种选择、鼠标交互开关。
- 初始 30 FPS；小红车发送全局设置后跟随其帧率。支持暂停/恢复、隐藏页面暂停和分辨率变化。
- 全屏应用与电池模式下的暂停规则请在小红车的“设置 → 性能”中配置。

## 本地开发与打包

```sh
npm ci
npm run dev
npm run typecheck
npm run build:wallpaper
```

`npm run build:wallpaper` 会生成或更新 `wallpaper-engine/`。普通网页预览可用 `?sharks=hammerhead,zebra,mako,nurse` 选择种群。

目录说明：`src/` 是模拟与渲染代码；`wallpaper/` 是壁纸模板与参数定义；`wallpaper-engine/` 是可直接导入的离线版本；`downloads/` 是打包下载。

## 验证范围

已通过 TypeScript 检查、构建、离线资源扫描，以及帧率限制、暂停/恢复、参数切换、分辨率变化和 8 种鲨鱼轮廓的模拟测试。

尚未在 Wallpaper Engine 客户端内实机验证。桌面鼠标事件是否转发还取决于小红车及桌面图标的输入行为。

## 许可

MIT，见 [LICENSE](LICENSE)。
