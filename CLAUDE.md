# 全球祖庭之旅 v1.0 — 修行桌面助手

> 独立项目 | 路径: E:\ZUTING\ | 启动: `python zuting_app.py` 或 桌面快捷方式

## 愿景
帮助100万人走祖庭，建立全球宗教文化和平使者网络。
从桌面修行助手开始，逐步发展为全球宗教文化旅行平台。

## 核心功能
- **四模式轮播弹窗**: 圣地 → 祖师 → 祖庭 → 愿命印修 (每15分钟)
- **12大信仰覆盖**: 佛教/道教/基督教/伊斯兰教/印度教/犹太教/儒教/锡克教/神道教/藏传佛教/原住民灵性/巴哈伊教
- **曹溪愿命三十印**: 五系修炼体系 (初印系→中印系→印果印→成道印→归源印)
- **小鸿修行Agent**: 跨宗融合修行智能体，每日指引+修行日志
- **多语言吟诵**: 12种原语言宗教吟诵MP3 + 5系修炼吟诵
- **男女声交替**: 中文男女声轮换 + 当地语言追加

## 技术栈
- Python 3 + tkinter (GUI) + PIL/Pillow (图像合成)
- edge-tts (语音合成) + pygame (音频播放) + pystray (系统托盘)

## 文件结构
```
E:\ZUTING\
├── zuting_app.py          # 主程序
├── religions.py           # 宗教数据层 (12信仰×60圣地×36祖庭×40祖师×50祖训+30印)
├── xiaohong_agent.py      # 小鸿修行Agent
├── generate_chants.py     # 宗教吟诵MP3生成器
├── generate_seal_chants.py # 五系修炼吟诵生成器
├── generate_sounds.py     # 环境音效生成器
├── download_images.py     # 图片下载器
├── progress.json          # 修炼进度
├── backgrounds/           # 圣地/祖庭/祖师图片 (100+)
├── sounds/                # 吟诵MP3 + 环境WAV + 修炼吟诵
└── CLAUDE.md              # 本文件
```

## 安装依赖
```bash
pip install edge-tts pygame pystray Pillow python-docx
```

## 与主项目关系
- 原始位置: `zuoyelang_clean_production/tools/health-reminder/`
- 已独立化为 `E:\ZUTING\`，与作业郎项目无代码依赖
- 保留健康提醒核心功能作为修行基座
