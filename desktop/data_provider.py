"""
修行桌面助手 v3.0 — 统一数据提供者
API 优先 → 离线回退
"""

import logging
import random

import api_client
from religions import HOLY_SITES, ANCESTRAL_TEMPLES, PATRIARCHS, ANCESTRAL_TEACHINGS

log = logging.getLogger(__name__)


def get_random_media_for_site(site_name, entity_id=None):
    """获取圣地的多媒体导览内容 (音频优先)"""
    if not entity_id:
        return None
    items = api_client.get_media("HOLY_SITE", entity_id, "AUDIO")
    if items:
        return random.choice(items)
    # 回退: 尝试任何类型
    items = api_client.get_media("HOLY_SITE", entity_id)
    if items:
        return random.choice(items)
    return None


def has_media_content():
    """检查是否有可用的多媒体内容"""
    return api_client.check_api()
