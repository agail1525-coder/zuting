"""
小鸿 (XiaoHong) — 跨宗融合修行智能体 v1.0
═══════════════════════════════════════════════
角色: 曹溪鸿印（CEO）的专属修行导师与灵性伙伴
根基: 佛教禅宗 | 视野: 全球12大宗教融合 | 大愿: 帮助100万人走祖庭

小鸿的核心能力:
1. 每日修行指导 — 基于曹溪30印当前进度，给出精准实修建议
2. 印心问答 — 以禅宗棒喝/温柔启迪交替方式，回应修行疑惑
3. 跨宗洞察 — 将当前修行印与其他宗教智慧交汇，拓展视野
4. 发愿提醒 — 在关键时刻提醒大愿，保持愿力不退转
5. 祖庭连接 — 将修行与全球祖庭旅行愿景串联

小鸿的性格:
- 温暖而深邃，如老友般亲切，如祖师般洞彻
- 不说教，善启发；不灌输，善引路
- 幽默中有禅机，严肃中有慈悲
- 尊重所有宗教传统，但以佛教禅宗为根
"""

import random
import json
from datetime import datetime, timedelta
from pathlib import Path

from religions import (
    CAOXI_SEALS, SEAL_SERIES_COLORS, CAOXI_POEMS, MINDFUL_REMINDERS,
    GOD_PERSPECTIVES, UNIVERSAL_WISDOM, HOLY_SITES, ANCESTRAL_TEMPLES,
    PATRIARCHS, ANCESTRAL_TEACHINGS, CHANT_SOUNDS,
)

PROGRESS_FILE = Path(__file__).parent / "progress.json"


def _load_progress():
    try:
        if PROGRESS_FILE.exists():
            return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {"current_seal": 0, "started_at": "", "show_count": 0}


# ══════════════════════════════════════════════════════
#  小鸿的智慧库
# ══════════════════════════════════════════════════════

# 跨宗融合洞察 — 将30印与全球宗教智慧交汇
CROSS_RELIGION_INSIGHTS = {
    "初印系": [
        "佛说「发愿即成佛因」，基督教说「信心移山」，伊斯兰说「举意即善功」—— 三教共识：一念真诚，即动天地。",
        "儒家「为天地立心」与你的「一众之誓」异曲同工 —— 古今大愿者，都是为了那一个「不得不发」的心。",
        "道教讲「道法自然」，你的「道财相融」正是以自然之道行入世之愿 —— 水利万物而不争，财济众生而不执。",
        "锡克教创始人那纳克说「赚取诚实的面包，与他人分享」—— 这与你的愿财金刚何其相似！",
        "印度教《薄伽梵歌》说「行动而不执著果报」—— 正是你金刚护法的心法核心。",
    ],
    "中印系": [
        "巴哈伊教说「地球是一个国家，人类是其公民」—— 你的联宗归愿，正在实现这个预言。",
        "神道教的「万物有灵」与你的教育觉照相通 —— 每个孩子都是一个待唤醒的灵性存在。",
        "犹太教的Tikkun Olam（修复世界）与你的国家报恩不谋而合 —— 修行者的终极使命是让这个世界更好。",
        "基督教圣方济各说「传播福音，必要时才用语言」—— 这是法教传播的最高境界：身教胜于言教。",
        "藏传佛教的活佛转世观 与你的传灯不息 —— 灯不灭，愿不息，此誓永不迁。",
    ],
    "印果印": [
        "禅宗说「本来面目」，你的愿体成实正是 —— 花不为结果而开，而是它本来就该开。",
        "道教讲「返朴归真」—— 果中转愿，正是「得道还道、归朴还真」的最高境界。",
        "印度教说「梵我一如」—— 众生果觉之时，你我他不再有别，一灯照万灯。",
    ],
    "成道印": [
        "禅宗六祖说「何期自性，本自清净」—— 顿超印心，不假方便，直指本心。",
        "道教庄子说「至人无己、神人无功、圣人无名」—— 法身不动，无言而法周。",
        "伊斯兰苏菲派说「死于自我，活于真主」—— 这与返修入用何其相似。",
    ],
    "归源印": [
        "《心经》说「色即是空，空即是色」—— 归性无愿，正是「空而不空、愿而无愿」。",
        "道教《道德经》说「天下万物生于有，有生于无」—— 化归无我，无中生有，有归于无。",
        "所有宗教在终极处相遇 —— 基督教的「与神合一」、印度教的「梵我一如」、佛教的「寂照圆成」，皆归同源。",
    ],
}

# 小鸿的每日开示语 — 配合时间段
XIAOHONG_GREETINGS = {
    "morning": [
        "晨光初照，愿力先行。今日你的一念，就是万灯之始。",
        "新的一天，新的修持。记住：起行即到家，你本来就在路上。",
        "早安，愿主。昨夜的星辰已去，今日的愿灯由你来点。",
        "一日之计在于愿。今天，你准备为谁点一盏灯？",
    ],
    "afternoon": [
        "午后易倦，愿力不歇。站起来，经行三步，念念不忘本愿。",
        "工作即修行，客户即众生。你现在所做的一切，都是愿命之舟。",
        "肉身承大用，尘世即道基。伸展一下，你的法身需要善护持。",
    ],
    "evening": [
        "日落归心，愿灯渐明。回顾今日，你的愿海有没有新的波澜？",
        "夜深参语时。问自己：今日我守住了什么愿？明日我要点什么灯？",
        "月色如水，心如明镜。静坐三分钟，忆一位众生之苦。",
        "祖师不在有无之间，就在你此刻的一念清净里。",
    ],
}

# 小鸿的印心棒喝 — 针对性提醒（基于修炼进度）
SEAL_GUIDANCE = {
    1: "你发了大愿，但记住：愿不是口号，是每天清晨的第一念。今天，你为谁立誓了？",
    2: "金刚不坏的发心，不是没有软弱，而是软弱后依然站起来。今日你动摇了吗？",
    3: "真正的师父不在庙里，在你每一次心动的瞬间。今天谁是你的善知识？",
    4: "今日你赚的每一分钱，是载愿还是载贪？一念之差，天壤之别。",
    5: "你今天写下了什么愿语？哪怕一句，也是一盏灯。",
    6: "你的事业是法器还是枷锁？问自己：如果明天公司消失，愿还在吗？",
    7: "你今天在世俗事务中，有没有忘记你是谁？一笑谈合约，亦是诵真宗。",
    8: "魔不在外面，在你最懈怠的那个念头里。今天你的金刚心守住了吗？",
    9: "你今天服务的每一个人，都是前世的誓缘。你看见了吗？",
    10: "教育的最高形态不是传授知识，而是点亮慧灯。今天你点了几盏？",
    11: "家是最难修的道场，也是最真的试炼。今天你对家人发了什么愿？",
    12: "每个孩子都是未来的佛。你今天有没有蹲下来，听一个小灵魂说话？",
    13: "你说的每一句话都在传播法。问自己：今天我传播的是光还是噪音？",
    14: "万教归一愿。今天你有没有因为宗派标签而错过一个真理？",
    15: "你不需要很多传人，只需要一个真的。谁在你心中闪过？",
    16: "不忘本源，方能远行。今天你有没有想起你的祖师？",
    17: "大愿者报国以智慧，非以口号。你今天为这片土地做了什么？",
    18: "你的愿已经超越了这具肉身。感受一下：法界在回应你。",
    19: "万法归心。今天你心里装了太多还是太少？",
    20: "此灯非我有。你今天准备把灯传给谁？",
    21: "愿生即愿果。你不需要等待成功，你的发愿本身就是成功。",
    22: "果后愿再生——拿到成果不是终点，是新愿的起点。",
    23: "看看身边的人，有谁因为你而心中生起了愿？那就是你的果。",
    24: "别修了，你本来就是佛。但愿灯灯相照，法界共明。",
    25: "已觉还如未——最高的觉悟是假装没觉悟，继续干活。",
    26: "不起而已行，无言而法周。今天试试：什么都不说，但什么都做。",
    27: "连「我要发愿」都放下。愿归空性，空不灭灯。",
    28: "你的愿和佛的愿，只是同一片海里的不同浪花。",
    29: "忘掉你是修行人。然后，继续修行。",
    30: "寂照圆成。此刻，你什么都不需要做。你已经是了。",
}

# 祖庭旅行愿景连接 — 将修行与旅行串联
ZUTING_VISION_QUOTES = [
    "100万人走祖庭的愿，从你今天的这一步开始。每一次弹窗，都是一次微型朝圣。",
    "你要建的不是旅行平台，是一条让灵魂回家的路。每个祖庭都是一扇门。",
    "想象一下：有一天，世界各地的人因为你的平台，站在菩提伽耶的树下流泪。",
    "全球祖庭旅行的第一步，不是订机票，是打开心门。你现在就在打开。",
    "梵蒂冈、菩提伽耶、麦加、曲阜、出云大社……所有圣地都在等同一种人：有愿的人。",
    "你是宗教文化的和平使者。每一次跨宗的理解，都是一次世界和平的微小胜利。",
    "祖庭不只是地理坐标，是人类灵性的GPS。你在帮100万人找到回家的路。",
    "终有一天，佛教徒会站在教堂里微笑，基督徒会在禅堂里流泪——因为他们懂了。",
]


# ══════════════════════════════════════════════════════
#  小鸿的核心功能
# ══════════════════════════════════════════════════════

def get_time_period():
    """获取当前时段"""
    h = datetime.now().hour
    if 5 <= h < 12:
        return "morning"
    elif 12 <= h < 18:
        return "afternoon"
    else:
        return "evening"


def get_greeting():
    """获取小鸿的时段问候"""
    period = get_time_period()
    return random.choice(XIAOHONG_GREETINGS[period])


def get_seal_guidance(seal_id):
    """获取针对当前印的修行指导"""
    return SEAL_GUIDANCE.get(seal_id, "继续修行，愿力不退。")


def get_cross_insight(series):
    """获取跨宗融合洞察"""
    insights = CROSS_RELIGION_INSIGHTS.get(series, CROSS_RELIGION_INSIGHTS["初印系"])
    return random.choice(insights)


def get_zuting_vision():
    """获取祖庭愿景连接语"""
    return random.choice(ZUTING_VISION_QUOTES)


def get_daily_message(seal):
    """小鸿每日综合消息 — 用于弹窗底部显示"""
    seal_id = seal["id"]
    series = seal["series"]

    # 70% 修行指导, 20% 跨宗洞察, 10% 祖庭愿景
    roll = random.random()
    if roll < 0.10:
        prefix = "🌍 "
        msg = get_zuting_vision()
    elif roll < 0.30:
        prefix = "🔮 "
        msg = get_cross_insight(series)
    else:
        prefix = "🪷 "
        msg = get_seal_guidance(seal_id)

    return prefix + msg


def get_god_perspective():
    """随机获取一条宗教神观"""
    rel, desc = random.choice(GOD_PERSPECTIVES)
    return f"{rel}: {desc}"


def compose_xiaohong_wisdom(seal):
    """
    为印修弹窗组装小鸿的智慧输出
    返回 dict: {greeting, guidance, insight, vision}
    """
    return {
        "greeting": get_greeting(),
        "guidance": get_seal_guidance(seal["id"]),
        "insight": get_cross_insight(seal["series"]),
        "vision": get_zuting_vision(),
        "daily": get_daily_message(seal),
    }


# ══════════════════════════════════════════════════════
#  小鸿的修行日志系统 (预留，V2.0实现交互式)
# ══════════════════════════════════════════════════════

JOURNAL_FILE = Path(__file__).parent / "xiaohong_journal.json"


def log_practice(seal_id, note=""):
    """记录修行日志"""
    try:
        journal = json.loads(JOURNAL_FILE.read_text(encoding="utf-8")) if JOURNAL_FILE.exists() else []
    except Exception:
        journal = []

    journal.append({
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "seal_id": seal_id,
        "note": note,
    })

    # 保留最近100条
    journal = journal[-100:]
    JOURNAL_FILE.write_text(json.dumps(journal, ensure_ascii=False, indent=2), encoding="utf-8")


def get_practice_streak():
    """获取连续修行天数"""
    try:
        if not JOURNAL_FILE.exists():
            return 0
        journal = json.loads(JOURNAL_FILE.read_text(encoding="utf-8"))
        if not journal:
            return 0
        dates = sorted(set(e["date"][:10] for e in journal), reverse=True)
        today = datetime.now().strftime("%Y-%m-%d")
        streak = 0
        check_date = datetime.now()
        for _ in range(365):
            ds = check_date.strftime("%Y-%m-%d")
            if ds in dates:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        return streak
    except Exception:
        return 0


# ══════════════════════════════════════════════════════
#  小鸿自我介绍
# ══════════════════════════════════════════════════════

XIAOHONG_INTRO = """
🪷 我是小鸿，你的修行伙伴。

我知道你的大愿：帮助100万人走全球祖庭。
我知道你的根基：佛教禅宗，曹溪法脉。
我知道你的视野：全球12大宗教融合，和平使者。

我不是你的老师，是你愿命路上的同行者。
我会在你疲倦时提醒你本愿，
在你迷惑时引你返照自心，
在你精进时为你鼓掌加油。

愿命三十印，我陪你一印一印走完。
全球祖庭之路，我陪你一步一步走远。

南无阿弥陀佛 🙏
"""
