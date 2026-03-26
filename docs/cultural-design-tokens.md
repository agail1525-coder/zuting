# Cultural Design Tokens / 文化设计令牌

> Global Ancestral Temple Travel Platform — 全球祖庭旅行平台
> Version 1.0 | 2026-03-25

Design system tokens that respect each faith's visual culture. This document supplements the existing design tokens in `packages/config/src/design.ts`.

尊重每种信仰视觉文化的设计系统令牌。本文档补充 `packages/config/src/design.ts` 中的现有设计令牌。

---

## Table of Contents / 目录

1. [Global Design Foundation / 全局设计基础](#1-global-design-foundation--全局设计基础)
2. [Per-Religion Color Palettes / 各宗教配色方案](#2-per-religion-color-palettes--各宗教配色方案)
3. [Icon & Symbol Guidelines / 图标与符号指南](#3-icon--symbol-guidelines--图标与符号指南)
4. [Typography / 字体排印](#4-typography--字体排印)
5. [Photography Guidelines / 摄影指南](#5-photography-guidelines--摄影指南)
6. [Implementation Reference / 实施参考](#6-implementation-reference--实施参考)

---

## 1. Global Design Foundation / 全局设计基础

### Existing Tokens (from design.ts) / 现有令牌

```
Brand Gold:     #D4A855 (gold), #E8C97A (goldLight), #B8922E (goldDark)
Background:     #020617 (bgPrimary), #0f172a (bgSecondary), #1e293b (bgCard)
Text:           #e2e8f0 (textPrimary), #94a3b8 (textSecondary), #64748b (textMuted)
Special:        #EC4899 (lotus), #10B981 (jade), #EF4444 (cinnabar), #F59E0B (incense)
```

### Design Philosophy / 设计哲学

The platform uses a **dark temple aesthetic** (深色殿堂风) as the unifying canvas, with each religion's unique colors providing warmth and identity. This creates a sense of:

平台使用**深色殿堂风**作为统一画布，每个宗教的独特颜色提供温暖和身份认同。这创造了：

- **Reverence (恭敬感):** Dark backgrounds evoke the interior of sacred spaces.
- **Universality (普世性):** The neutral dark theme does not favor any single tradition.
- **Warmth (温暖感):** Gold accents (#D4A855) represent the shared human search for the sacred.
- **Clarity (清晰度):** High contrast ensures readability across all platforms.

---

## 2. Per-Religion Color Palettes / 各宗教配色方案

Each religion has a **primary**, **secondary**, **accent**, **surface**, and **on-surface** color.

每个宗教有**主色**、**辅色**、**点缀色**、**表面色**和**表面上色**。

### 2.1 Buddhism / 佛教 (slug: `buddhism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#F59E0B` | Saffron/amber — monastic robes, wisdom / 藏红/琥珀——僧袍、智慧 |
| `secondary` | `#FCD34D` | Light gold — highlights, hover states / 浅金——高亮、悬停状态 |
| `accent` | `#92400E` | Deep amber — borders, active states / 深琥珀——边框、激活状态 |
| `surface` | `#451A03` | Dark warm brown — card backgrounds / 暗暖棕——卡片背景 |
| `onSurface` | `#FEF3C7` | Warm white — text on surface / 暖白——表面上的文字 |

**Cultural rationale / 文化依据:** Saffron is the color of renunciation in both Theravada and Mahayana traditions. Gold represents the radiance of enlightenment. / 藏红色是上座部和大乘传统中出离的颜色。金色代表觉悟的光辉。

### 2.2 Taoism / 道教 (slug: `taoism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#10B981` | Jade green — nature, vitality, the Dao / 玉绿——自然、生命力、道 |
| `secondary` | `#6EE7B7` | Light jade — highlights / 浅玉——高亮 |
| `accent` | `#065F46` | Deep forest — depth, mystery / 深林——深邃、神秘 |
| `surface` | `#022C22` | Dark jade — card backgrounds / 暗玉——卡片背景 |
| `onSurface` | `#D1FAE5` | Mint white — text on surface / 薄荷白——表面上的文字 |

**Cultural rationale / 文化依据:** Green represents the harmony with nature central to Taoism. Jade (玉) is the most revered material in Chinese culture, symbolizing virtue. / 绿色代表道教核心的与自然和谐。玉是中国文化中最受尊崇的材料，象征美德。

### 2.3 Christianity / 基督教 (slug: `christianity`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#3B82F6` | Royal blue — divinity, heaven, Mary / 皇家蓝——神性、天堂、圣母 |
| `secondary` | `#93C5FD` | Light blue — highlights / 浅蓝——高亮 |
| `accent` | `#7C3AED` | Purple — Advent/Lent, royalty / 紫色——将临期/大斋期、王权 |
| `surface` | `#1E1B4B` | Deep indigo — card backgrounds / 深靛——卡片背景 |
| `onSurface` | `#E0E7FF` | Soft lavender white — text on surface / 柔淡紫白——表面上的文字 |

**Cultural rationale / 文化依据:** Blue represents heaven and divinity across Christian traditions. Purple is the liturgical color for penitential seasons (Advent, Lent). / 蓝色在基督教各传统中代表天堂和神性。紫色是忏悔季节的礼仪颜色。

### 2.4 Islam / 伊斯兰教 (slug: `islam`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#059669` | Emerald green — Islam's sacred color, Paradise / 翠绿——伊斯兰圣色、天堂 |
| `secondary` | `#6EE7B7` | Light green — highlights / 浅绿——高亮 |
| `accent` | `#D4A855` | Gold — Quranic calligraphy, mosque domes / 金色——古兰经书法、清真寺穹顶 |
| `surface` | `#022C22` | Dark green — card backgrounds / 暗绿——卡片背景 |
| `onSurface` | `#ECFDF5` | Pale green-white — text on surface / 淡绿白——表面上的文字 |

**Cultural rationale / 文化依据:** Green is universally associated with Islam, representing paradise and the Prophet's favorite color. Gold reflects the tradition of Quranic illumination. / 绿色与伊斯兰教普遍相关，代表天堂和先知最喜爱的颜色。金色反映了古兰经装饰的传统。

### 2.5 Hinduism / 印度教 (slug: `hinduism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#F97316` | Saffron orange — sacred fire, renunciation / 藏红橙——圣火、出离 |
| `secondary` | `#FDBA74` | Light orange — highlights / 浅橙——高亮 |
| `accent` | `#DC2626` | Deep red — Shakti, Durga, auspiciousness / 深红——沙克蒂、杜尔迦、吉祥 |
| `surface` | `#431407` | Dark burnt sienna — card backgrounds / 暗焦褐——卡片背景 |
| `onSurface` | `#FFF7ED` | Warm white — text on surface / 暖白——表面上的文字 |

**Cultural rationale / 文化依据:** Saffron/orange is the most sacred color in Hinduism, representing fire (Agni), renunciation, and courage. Red symbolizes Shakti (divine feminine power). / 藏红/橙色是印度教中最神圣的颜色，代表火（阿耆尼）、出离和勇气。红色象征沙克蒂（神圣女性力量）。

### 2.6 Judaism / 犹太教 (slug: `judaism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#6366F1` | Indigo blue — tekhelet, divine presence / 靛蓝——特赫列特、神圣临在 |
| `secondary` | `#A5B4FC` | Light indigo — highlights / 浅靛——高亮 |
| `accent` | `#D4A855` | Gold — menorah, Temple vessels / 金色——七烛台、圣殿器皿 |
| `surface` | `#1E1B4B` | Deep blue-black — card backgrounds / 深蓝黑——卡片背景 |
| `onSurface` | `#E0E7FF` | Soft blue-white — text on surface / 柔蓝白——表面上的文字 |

**Cultural rationale / 文化依据:** Tekhelet (a blue dye) is mandated in the Torah for tzitzit. Blue and white are the national colors. Gold recalls the Temple menorah and sacred vessels. / 特赫列特（蓝色染料）是妥拉规定用于流苏的。蓝白是民族颜色。金色回忆圣殿七烛台和圣器。

### 2.7 Confucianism / 儒教 (slug: `confucianism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#DC2626` | Crimson — ceremony, auspicious, scholarly / 赤红——典礼、吉祥、学术 |
| `secondary` | `#FCA5A5` | Light red — highlights / 浅红——高亮 |
| `accent` | `#D4A855` | Gold — imperial, classic / 金色——帝王、经典 |
| `surface` | `#450A0A` | Dark crimson — card backgrounds / 暗赤——卡片背景 |
| `onSurface` | `#FEF2F2` | Warm rose-white — text on surface / 暖玫白——表面上的文字 |

**Cultural rationale / 文化依据:** Red/crimson is the ceremonial color of Confucian rites and Chinese culture broadly. Gold represents the imperial tradition and classical learning. / 赤红色是儒教仪式和中华文化的典礼颜色。金色代表帝王传统和古典学术。

### 2.8 Sikhism / 锡克教 (slug: `sikhism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#EA580C` | Deep saffron — Khalsa, Nishan Sahib flag / 深藏红——卡尔萨、尼善旗 |
| `secondary` | `#FB923C` | Orange — highlights / 橙——高亮 |
| `accent` | `#1D4ED8` | Royal blue — Nihang tradition / 皇家蓝——尼杭传统 |
| `surface` | `#431407` | Dark saffron-brown — card backgrounds / 暗藏红棕——卡片背景 |
| `onSurface` | `#FFF7ED` | Warm white — text on surface / 暖白——表面上的文字 |

**Cultural rationale / 文化依据:** Saffron/orange represents courage and sacrifice (the Khalsa). Royal blue is the color of the Nihang warrior tradition. / 藏红/橙色代表勇气和牺牲（卡尔萨）。皇家蓝是尼杭战士传统的颜色。

### 2.9 Shinto / 神道教 (slug: `shinto`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#E11D48` | Vermillion — torii gates, sacred / 朱红——鸟居、神圣 |
| `secondary` | `#FB7185` | Rose — highlights / 玫瑰——高亮 |
| `accent` | `#F5F5F4` | Off-white — purity, shimenawa / 米白——纯洁、注连绳 |
| `surface` | `#4C0519` | Dark vermillion — card backgrounds / 暗朱红——卡片背景 |
| `onSurface` | `#FFF1F2` | Soft rose-white — text on surface / 柔玫白——表面上的文字 |

**Cultural rationale / 文化依据:** Vermillion (朱) is the color of Shinto torii gates, symbolizing life force and protection against evil. White represents purity (kegare no nai). / 朱红色是神道鸟居的颜色，象征生命力和辟邪。白色代表纯洁。

### 2.10 Tibetan Buddhism / 藏传佛教 (slug: `tibetan-buddhism`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#7C3AED` | Deep purple — spiritual royalty, Vajrayana / 深紫——灵性王权、金刚乘 |
| `secondary` | `#A78BFA` | Light purple — highlights / 浅紫——高亮 |
| `accent` | `#EAB308` | Bright yellow — Gelug hats, dharma / 亮黄——格鲁派帽子、法 |
| `surface` | `#2E1065` | Dark violet — card backgrounds / 暗紫罗兰——卡片背景 |
| `onSurface` | `#EDE9FE` | Lavender white — text on surface / 淡紫白——表面上的文字 |

**Cultural rationale / 文化依据:** Deep purple/maroon is the robe color of Tibetan monks. Yellow represents the Gelug (Yellow Hat) tradition founded by Tsongkhapa. The five colors of prayer flags (blue, white, red, green, yellow) represent the five elements. / 深紫/栗色是藏族僧袍颜色。黄色代表宗喀巴创立的格鲁（黄帽）派。经幡五色（蓝白红绿黄）代表五大元素。

### 2.11 Indigenous Spirituality / 原住民灵性 (slug: `indigenous`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#78716C` | Warm stone — earth, authenticity / 暖石——大地、真实 |
| `secondary` | `#A8A29E` | Light stone — highlights / 浅石——高亮 |
| `accent` | `#B45309` | Ochre — sacred earth pigment / 赭——神圣大地颜料 |
| `surface` | `#292524` | Dark earth — card backgrounds / 暗土——卡片背景 |
| `onSurface` | `#F5F5F4` | Natural white — text on surface / 自然白——表面上的文字 |

**Cultural rationale / 文化依据:** Earth tones respect the universal Indigenous connection to land. Ochre is sacred across Australian Aboriginal, African, and American traditions. We avoid bright or synthetic-feeling colors that would misrepresent Indigenous aesthetics. / 大地色尊重原住民与土地的普遍联系。赭色在澳洲原住民、非洲和美洲传统中都是神圣的。我们避免会误代原住民美学的明亮或合成色。

### 2.12 Bahai / 巴哈伊教 (slug: `bahai`)

| Token | Hex | Usage / 用途 |
|---|---|---|
| `primary` | `#0891B2` | Cyan/teal — ocean, unity, embracing / 青/蓝绿——海洋、合一、包容 |
| `secondary` | `#67E8F9` | Light cyan — highlights / 浅青——高亮 |
| `accent` | `#D4A855` | Gold — divine light / 金色——神圣之光 |
| `surface` | `#083344` | Deep teal — card backgrounds / 深蓝绿——卡片背景 |
| `onSurface` | `#ECFEFF` | Ice white — text on surface / 冰白——表面上的文字 |

**Cultural rationale / 文化依据:** Teal/cyan represents the global unity and oceanic vision of the Baha'i faith ("The earth is but one country"). Gold represents divine illumination. / 蓝绿色代表巴哈伊信仰的全球合一和海洋般的愿景（"大地只是一个国家"）。金色代表神圣的光照。

---

## 3. Icon & Symbol Guidelines / 图标与符号指南

### 3.1 Approved Symbols Per Religion / 各宗教核准符号

These symbols are already defined in seed data and config. This section provides usage guidelines.

这些符号已在种子数据和配置中定义。本节提供使用指南。

| Religion / 宗教 | Primary Symbol / 主要符号 | Unicode | Safe to Use? / 可安全使用? | Notes / 备注 |
|---|---|---|---|---|
| Buddhism / 佛教 | Dharma Wheel / 法轮 | ☸ (U+2638) | Yes / 是 | Universally recognized; respectful / 普遍认可；恭敬 |
| Taoism / 道教 | Yin-Yang / 太极 | ☯ (U+262F) | Yes / 是 | Do not modify colors or orientation / 不可修改颜色或方向 |
| Christianity / 基督教 | Latin Cross / 十字架 | ✝ (U+271D) | Yes / 是 | Standard cross; avoid inverted / 标准十字架；避免倒置 |
| Islam / 伊斯兰教 | Star and Crescent / 星月 | ☪ (U+262A) | Yes, with care / 是，须谨慎 | Some Muslims consider it cultural, not religious / 部分穆斯林认为是文化而非宗教符号 |
| Hinduism / 印度教 | Om / 唵 | 🕉 (U+1F549) | Yes / 是 | Sacred; never on floors or feet / 神圣；不可置于地面或脚下 |
| Judaism / 犹太教 | Star of David / 大卫之星 | ✡ (U+2721) | Yes, with care / 是，须谨慎 | Also Israeli national symbol; political connotation / 也是以色列国家符号；有政治含义 |
| Confucianism / 儒教 | 儒 character / 儒字 | 儒 | Yes / 是 | Chinese character; clear meaning / 汉字；含义明确 |
| Sikhism / 锡克教 | Khanda / 锡克教标志 | ☬ (U+262C) | Yes / 是 | Sacred emblem of the Khalsa / 卡尔萨的神圣标志 |
| Shinto / 神道教 | Torii / 鸟居 | ⛩ (U+26E9) | Yes / 是 | Iconic and universally recognized / 标志性且普遍认可 |
| Tibetan Buddhism / 藏传佛教 | Tibetan ornament / 藏式装饰 | ༄ (U+0F04) | Yes / 是 | Tibetan Unicode character / 藏文Unicode字符 |
| Indigenous / 原住民 | Bullseye / 圆点 | ◉ (U+25C9) | Yes / 是 | Abstract; avoids appropriating specific traditions / 抽象；避免挪用特定传统 |
| Bahai / 巴哈伊 | Four-pointed star / 四角星 | ✦ (U+2726) | Yes / 是 | Simplified nine-pointed star reference / 简化九角星参考 |

### 3.2 Symbols to AVOID / 须避免的符号

| Symbol / 符号 | Issue / 问题 | Alternative / 替代 |
|---|---|---|
| Swastika (卍/卐) | Deeply offensive in Western context despite Hindu/Buddhist sacredness / 尽管在印度教/佛教中神圣，但在西方语境中极度冒犯 | Use Om (🕉) for Hinduism, Dharma Wheel (☸) for Buddhism / 印度教用唵，佛教用法轮 |
| Inverted cross (倒十字) | Associated with anti-Christianity / 与反基督教相关 | Use upright Latin cross ✝ / 使用正立十字架 |
| Pentagram (五芒星) | Occult associations / 神秘学联想 | Avoid entirely / 完全避免 |
| Crescent alone (单独的新月) | May be confused with Islamic symbol / 可能与伊斯兰符号混淆 | Always pair star with crescent ☪ / 始终将星与新月配对 |
| Generic "eye" symbols | Can evoke "Illuminati" conspiracy / 可能唤起"光照会"阴谋论 | Use established religious symbols only / 仅使用既定宗教符号 |
| Skull/bones with religious symbols | Deeply disrespectful / 极度不尊重 | Never combine / 绝不组合 |

### 3.3 Icon Design Principles / 图标设计原则

1. **Simplicity (简洁):** Icons should be recognizable at 16x16px. Use clean lines and minimal detail. / 图标在16x16像素时应可识别。使用干净线条和最少细节。

2. **Consistency (一致性):** All 12 religion icons should have the same visual weight, line width, and padding. No religion should appear "more prominent" through design. / 所有12个宗教图标应有相同的视觉重量、线宽和间距。不应通过设计使任何宗教显得"更突出"。

3. **Respectful abstraction (恭敬的抽象):** Icons abstract sacred symbols — they do not depict deities, prophets, or sacred figures. / 图标抽象化神圣符号——不描绘神祇、先知或神圣人物。

4. **Platform-specific rendering (平台特定渲染):**
   - **Web/Admin:** SVG icons with `currentColor` for theme adaptation. / SVG图标使用 `currentColor` 进行主题适配。
   - **Mobile (React Native):** Vector icons via `react-native-vector-icons` or custom SVGs. / 通过矢量图标库或自定义SVG。
   - **Miniprogram (Taro):** Base64-encoded SVGs or image sprites. / Base64编码SVG或图片精灵。

5. **Size tiers / 尺寸层级:**
   - `xs`: 16px — inline text, badges / 行内文字、徽章
   - `sm`: 24px — list items, chips / 列表项、标签
   - `md`: 32px — cards, navigation / 卡片、导航
   - `lg`: 48px — featured content / 精选内容
   - `xl`: 64px — hero sections, detail pages / 主要区域、详情页

---

## 4. Typography / 字体排印

### 4.1 Script Support / 文字支持

The platform must support multiple scripts. Typography choices should respect the visual tradition of each script.

平台必须支持多种文字。字体选择应尊重每种文字的视觉传统。

| Script / 文字 | Faiths / 信仰 | Recommended Font Stack / 推荐字体栈 | Notes / 备注 |
|---|---|---|---|
| Latin / 拉丁 | All (UI) | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Primary UI font / 主要UI字体 |
| Chinese / 中文 | Buddhism, Taoism, Confucianism | `"Noto Serif SC", "Source Han Serif SC", "SimSun", serif` (for quotes); `"Noto Sans SC", "PingFang SC", sans-serif` (for UI) | Serif for classical texts / 经典文本用衬线体 |
| Japanese / 日语 | Shinto, Buddhism | `"Noto Serif JP", "Yu Mincho", serif` (quotes); `"Noto Sans JP", "Hiragino Sans", sans-serif` (UI) | Respect vertical text when appropriate / 适当时尊重竖排文字 |
| Arabic / 阿拉伯 | Islam, Bahai | `"Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif` | RTL layout; always display Quran in Arabic serif / RTL布局；古兰经始终用阿拉伯衬线体 |
| Hebrew / 希伯来 | Judaism | `"Noto Serif Hebrew", "Frank Ruehl", serif` (sacred); `"Noto Sans Hebrew", sans-serif` (UI) | RTL layout / RTL布局 |
| Devanagari / 天城文 | Hinduism | `"Noto Serif Devanagari", serif` (Sanskrit); `"Noto Sans Devanagari", sans-serif` (Hindi UI) | Sanskrit quotations in serif / 梵语引文用衬线体 |
| Tibetan / 藏文 | Tibetan Buddhism | `"Noto Serif Tibetan", "Microsoft Himalaya", serif` | Unique script; test rendering carefully / 独特文字；仔细测试渲染 |
| Gurmukhi / 古鲁穆奇 | Sikhism | `"Noto Sans Gurmukhi", sans-serif` | Punjabi script / 旁遮普文字 |
| Korean / 韩文 | Confucianism (Korean) | `"Noto Serif KR", "Batang", serif` (classical); `"Noto Sans KR", "Malgun Gothic", sans-serif` (UI) | Hangul for modern; Hanja for classical / 现代用韩文；古典用汉字 |
| Tamil / 泰米尔 | Hinduism (South India) | `"Noto Sans Tamil", sans-serif` | South Indian temple inscriptions / 南印度庙宇碑文 |
| Pali / 巴利 | Buddhism (Theravada) | Latin with diacriticals: `"Gentium Plus", "Noto Serif", serif` | Requires diacritical mark support / 需要变音符号支持 |

### 4.2 Typography Rules / 字体排印规则

1. **Sacred Text Hierarchy / 神圣文本层级:**
   - **Original language** first, in a serif font at larger size. / **原文**在前，用较大尺寸的衬线体。
   - **Transliteration** second (if applicable), in italic. / **转写**第二（如适用），用斜体。
   - **Translation** third, in the UI font. / **翻译**第三，用UI字体。
   - Example: 经文应以 原文 > 转写 > 翻译 的层级展示。

2. **Quotation Marks / 引号:**
   - Chinese: 「 」 for primary, 『 』 for nested. / 中文：「」为一级，『』为嵌套。
   - Japanese: Same as Chinese. / 日语：与中文相同。
   - Arabic: « » (guillemets). / 阿拉伯语：« »。
   - Latin/English: " " for primary, ' ' for nested. / 拉丁/英文：""为一级，''为嵌套。
   - Hebrew: " " or « ». / 希伯来语：""或« »。

3. **Text Direction / 文字方向:**
   - Arabic and Hebrew: **RTL (right-to-left)**. Implement with `dir="rtl"` and CSS `direction: rtl`. / 阿拉伯语和希伯来语：**从右到左**。
   - All other scripts: **LTR (left-to-right)**. / 所有其他文字：**从左到右**。
   - Mixed content: Use `<bdi>` tags for bidirectional isolation. / 混合内容：使用 `<bdi>` 标签进行双向隔离。

4. **Font Sizes for Sacred Texts / 神圣文本字号:**
   - Original language: `text-xl` (1.25rem) minimum. / 原文：最小 `text-xl`（1.25rem）。
   - Never make sacred text smaller than UI text. / 不可使神圣文本比UI文字更小。
   - Quranic Arabic: minimum 18px for readability of diacriticals. / 古兰经阿拉伯语：最小18像素以保证变音符号可读性。

---

## 5. Photography Guidelines / 摄影指南

### 5.1 General Principles / 一般原则

1. **Authenticity over aesthetics (真实优先于美感):** Use real photographs from the actual sites, not stock photos. / 使用来自实际场所的真实照片，而非库存图片。

2. **Respect over drama (尊重优先于戏剧性):** Avoid sensationalist angles or compositions that trivialize sacred spaces. / 避免将神圣空间琐碎化的耸人听闻的角度或构图。

3. **People with dignity (有尊严的人物):** When photographing worshippers, ensure they appear dignified, not as exotic curiosities. / 拍摄朝拜者时，确保他们显得有尊严，而非异国猎奇。

4. **Diversity in representation (代表性的多样性):** Show diverse practitioners — not all Buddhist monks are Asian, not all Muslims are Arab. / 展示多样化的修行者——并非所有佛教僧侣都是亚洲人，并非所有穆斯林都是阿拉伯人。

### 5.2 Per-Religion Photography Rules / 各宗教摄影规则

| Religion / 宗教 | DO Show / 可展示 | Do NOT Show / 不可展示 |
|---|---|---|
| **Buddhism** | Temples, stupas, gardens, meditation halls, Dharma wheels, lotus ponds | Buddha images used as decoration; monks in disrespectful contexts; commercialized Buddhism |
| **Taoism** | Mountains, temples, calligraphy, natural landscapes, Yin-Yang in architecture | Fake mysticism; martial arts only; fortune-telling imagery |
| **Christianity** | Cathedrals, stained glass, candles, crosses, pilgrimage paths, architecture | Gory crucifixion close-ups; denominational propaganda; politically charged imagery |
| **Islam** | Mosque architecture, geometric art, calligraphy, gardens, minarets | **NO human faces in religious context**; prayer without permission; women without consent |
| **Hinduism** | Temple architecture, festivals (Holi, Diwali), river ceremonies, art | Caste-related imagery; poverty tourism; sacred cows in irreverent context |
| **Judaism** | Western Wall, synagogue architecture, Torah covers, menorahs, festivals | Holocaust imagery without context; political imagery; ultra-Orthodox without consent |
| **Confucianism** | Temples, academies, calligraphy, stone tablets, ceremonies | Kowtowing in mocking context; imperial excess without context |
| **Sikhism** | Golden Temple, Langar service, Gurdwara architecture, community | Swords/kirpans out of context; turban stereotypes |
| **Shinto** | Torii gates, shrines, nature (sacred trees, waterfalls), festivals | Yasukuni Shrine without context; militaristic Shinto imagery |
| **Tibetan Buddhism** | Monasteries, prayer flags, mountains, monks debating, butter sculptures | Political protest imagery; poverty tourism; wrathful deities without context |
| **Indigenous** | **Landscape only unless community-approved**; community events with permission | **NO sacred ceremonies**; colonial-era photographs; staged "tribal" photos |
| **Bahai** | Gardens, Houses of Worship, community gatherings, unity symbols | **NO images of Baha'u'llah**; persecution imagery without sensitivity |

### 5.3 Image Composition Guidelines / 图像构图指南

1. **Hero images / 主图:**
   - Landscape orientation preferred (16:9 or 21:9). / 首选横向构图。
   - Architecture should be shown in full, not cropped awkwardly. / 建筑应完整展示，不宜不当裁剪。
   - Golden hour (sunrise/sunset) lighting adds warmth without being manipulative. / 黄金时刻（日出/日落）光线增添温暖而不造作。

2. **Detail shots / 细节照片:**
   - Square format (1:1) or portrait (3:4). / 方形（1:1）或竖向（3:4）。
   - Focus on craftsmanship, texture, and artistry. / 聚焦工艺、质感和艺术性。
   - Close-ups of architectural details, calligraphy, offerings. / 建筑细节、书法、供品的特写。

3. **Map markers / 地图标记:**
   - Use the religion-specific primary color for map pins. / 地图图钉使用宗教特定的主色。
   - Icon should be the religion's symbol (from section 3.1). / 图标应为宗教符号（参见3.1节）。

4. **Color treatment / 色彩处理:**
   - Light desaturation for consistency across photos. / 轻度降低饱和度以保持照片间一致性。
   - Dark overlay for text readability on hero images (`bg-gradient-to-t from-black/80`). / 主图上用暗色叠加保证文字可读性。
   - Never apply religion-specific color tints to photographs — they should remain natural. / 绝不将宗教特定色调应用于照片——应保持自然。

---

## 6. Implementation Reference / 实施参考

### 6.1 CSS Custom Properties / CSS自定义属性

```css
/* Example: Buddhism theme applied to a component */
[data-religion="buddhism"] {
  --religion-primary: #F59E0B;
  --religion-secondary: #FCD34D;
  --religion-accent: #92400E;
  --religion-surface: #451A03;
  --religion-on-surface: #FEF3C7;
}

[data-religion="islam"] {
  --religion-primary: #059669;
  --religion-secondary: #6EE7B7;
  --religion-accent: #D4A855;
  --religion-surface: #022C22;
  --religion-on-surface: #ECFDF5;
}

/* Pattern: repeat for all 12 religions */
```

### 6.2 TypeScript Constant / TypeScript常量

This structure should be added to `packages/config/src/design.ts`:

```typescript
export const RELIGION_THEMES = {
  buddhism:          { primary: '#F59E0B', secondary: '#FCD34D', accent: '#92400E', surface: '#451A03', onSurface: '#FEF3C7' },
  taoism:            { primary: '#10B981', secondary: '#6EE7B7', accent: '#065F46', surface: '#022C22', onSurface: '#D1FAE5' },
  christianity:      { primary: '#3B82F6', secondary: '#93C5FD', accent: '#7C3AED', surface: '#1E1B4B', onSurface: '#E0E7FF' },
  islam:             { primary: '#059669', secondary: '#6EE7B7', accent: '#D4A855', surface: '#022C22', onSurface: '#ECFDF5' },
  hinduism:          { primary: '#F97316', secondary: '#FDBA74', accent: '#DC2626', surface: '#431407', onSurface: '#FFF7ED' },
  judaism:           { primary: '#6366F1', secondary: '#A5B4FC', accent: '#D4A855', surface: '#1E1B4B', onSurface: '#E0E7FF' },
  confucianism:      { primary: '#DC2626', secondary: '#FCA5A5', accent: '#D4A855', surface: '#450A0A', onSurface: '#FEF2F2' },
  sikhism:           { primary: '#EA580C', secondary: '#FB923C', accent: '#1D4ED8', surface: '#431407', onSurface: '#FFF7ED' },
  shinto:            { primary: '#E11D48', secondary: '#FB7185', accent: '#F5F5F4', surface: '#4C0519', onSurface: '#FFF1F2' },
  'tibetan-buddhism':{ primary: '#7C3AED', secondary: '#A78BFA', accent: '#EAB308', surface: '#2E1065', onSurface: '#EDE9FE' },
  indigenous:        { primary: '#78716C', secondary: '#A8A29E', accent: '#B45309', surface: '#292524', onSurface: '#F5F5F4' },
  bahai:             { primary: '#0891B2', secondary: '#67E8F9', accent: '#D4A855', surface: '#083344', onSurface: '#ECFEFF' },
} as const;

export type ReligionTheme = typeof RELIGION_THEMES[keyof typeof RELIGION_THEMES];
```

### 6.3 Accessibility Requirements / 无障碍要求

1. **Contrast ratios / 对比度:** All `primary` on `surface` combinations MUST meet WCAG AA (4.5:1 for normal text, 3:1 for large text). / 所有 `primary` 在 `surface` 上的组合必须满足WCAG AA标准。

2. **Color blindness / 色盲:** Each religion must be distinguishable by shape/icon as well as color (do not rely on color alone). / 每个宗教必须通过形状/图标以及颜色来区分（不可仅依赖颜色）。

3. **Screen readers / 屏幕阅读器:** All religious symbols must have `aria-label` or `alt` text describing the religion. / 所有宗教符号必须有 `aria-label` 或 `alt` 文本描述宗教。

4. **RTL support / RTL支持:** Arabic (Islam) and Hebrew (Judaism) content must render correctly in RTL. Test thoroughly. / 阿拉伯语和希伯来语内容必须正确渲染RTL。彻底测试。

### 6.4 Seal Series Colors (Existing Reference) / 印系列颜色（现有参考）

From the existing platform, the 30 seals use five series colors:

| Series / 系列 | Color / 颜色 | Range / 范围 |
|---|---|---|
| Initiation / 初印系 | Cyan/teal (青) | Seals 1-6 |
| Middle / 中印系 | Blue (蓝) | Seals 7-12 |
| Fruition / 印果印 | Purple (紫) | Seals 13-18 |
| Attainment / 成道印 | Red/crimson (红) | Seals 19-24 |
| Return / 归源印 | Gold (金) | Seals 25-30 |

These are separate from the religion-specific colors and should remain as-is.

---

### 6.5 Dark/Light Mode Considerations / 深色/浅色模式考量

The platform currently uses dark mode only. If light mode is added in the future:

平台目前仅使用深色模式。如果未来添加浅色模式：

- `primary` colors generally work in both modes. / `primary` 颜色通常在两种模式下都有效。
- `surface` should be inverted to light versions. / `surface` 应反转为浅色版本。
- `onSurface` should be inverted to dark text. / `onSurface` 应反转为深色文字。
- Religion-specific colors should maintain the SAME primary hue to preserve cultural meaning. / 宗教特定颜色应保持相同的主色调以维护文化含义。

---

*This document should be reviewed whenever design.ts is updated. Keep in sync with packages/config/src/design.ts and packages/config/src/religions.ts.*

*当 design.ts 更新时应审查本文档。与 packages/config/src/design.ts 和 packages/config/src/religions.ts 保持同步。*
