# 🎸 吉他学习网站

一个面向初学者的吉他学习静态网站，包含和弦图、音阶指板、乐理教程和练习曲目。

## 功能

| 页面 | 说明 |
|------|------|
| **首页** (index.html) | 网站概览，导航到各功能模块 |
| **学习路线** (roadmap.html) | 分4阶段的系统化学习路径（入门→基础→进阶→精通） |
| **和弦库** (chords.html) | 24个常用和弦的指法图（SVG渲染），支持点击放大 |
| **音阶** (scales.html) | 12种音阶的指板图（SVG渲染），支持切换选择 |
| **乐理** (theory.html) | 6章基础乐理教程，手风琴式展开阅读 |
| **练习曲** (songs.html) | 15首从入门到挑战的歌曲，支持难度筛选和搜索 |

## 特色

- 🎨 暗色/亮色主题切换（点击导航栏 🌙/☀️ 按钮）
- 📱 全响应式设计（手机、平板、桌面）
- 🎯 分阶段学习路线图
- 🎼 SVG 动态渲染和弦图和指板图
- 🔍 练习曲搜索和难度筛选
- 💾 主题偏好通过 localStorage 持久化
- 🚀 纯静态，无需后端，可直接部署

## 本地运行

```bash
cd guitar-site
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 部署到 GitHub Pages

```bash
cd guitar-site
git init
git add .
git commit -m "feat: 吉他学习网站"
# 在 GitHub 创建仓库后
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
# 在仓库 Settings → Pages → 选择 main 分支 → 保存
```

## 部署到 Netlify

1. 将 guitar-site 目录上传到 GitHub
2. 登录 Netlify → New site from Git
3. 选择仓库
4. Publish directory: 留空（根目录）
5. Deploy

## 技术栈

- 纯 HTML5 + CSS3 + Vanilla JS
- SVG 绘制和弦图和指板图
- JSON 管理内容数据
- 无外部依赖，无构建工具
