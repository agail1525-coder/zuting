"""
修行桌面助手 v3.0 — API 客户端
httpx 连接 NestJS 后端，支持 SSE 流式解析
"""

import json
import time
import logging
import threading
from pathlib import Path

import config

log = logging.getLogger(__name__)

_cache = {}  # {key: (expire_time, data)}
CACHE_TTL = 1800  # 30 分钟


def _get_client():
    try:
        import httpx
        return httpx.Client(
            base_url=config.get("api_url"),
            timeout=5.0,
            headers={"User-Agent": "ZutingDesktop/3.0"}
        )
    except Exception:
        return None


def _cached_get(path, params=None):
    """带缓存的 GET 请求"""
    key = f"{path}?{json.dumps(params or {}, sort_keys=True)}"
    now = time.time()
    if key in _cache and _cache[key][0] > now:
        return _cache[key][1]

    client = _get_client()
    if not client:
        return None
    try:
        resp = client.get(path, params=params)
        resp.raise_for_status()
        data = resp.json()
        _cache[key] = (now + CACHE_TTL, data)
        return data
    except Exception:
        log.debug(f"API请求失败: {path}", exc_info=True)
        return None
    finally:
        client.close()


def check_api():
    """检测 API 是否在线"""
    try:
        client = _get_client()
        if not client:
            return False
        resp = client.get("/religions", params={"take": 1})
        client.close()
        return resp.status_code == 200
    except Exception:
        return False


def get_holy_sites(take=100):
    data = _cached_get("/holy-sites", {"take": take})
    if data and isinstance(data, dict) and "items" in data:
        return data["items"]
    if data and isinstance(data, list):
        return data
    return None


def get_temples(take=100):
    data = _cached_get("/temples", {"take": take})
    if data and isinstance(data, dict) and "items" in data:
        return data["items"]
    if data and isinstance(data, list):
        return data
    return None


def get_patriarchs(take=100):
    data = _cached_get("/patriarchs", {"take": take})
    if data and isinstance(data, dict) and "items" in data:
        return data["items"]
    if data and isinstance(data, list):
        return data
    return None


def get_teachings(take=100):
    data = _cached_get("/teachings", {"take": take})
    if data and isinstance(data, dict) and "items" in data:
        return data["items"]
    if data and isinstance(data, list):
        return data
    return None


def get_media(entity_type, entity_id, media_type=None):
    """获取多媒体内容"""
    params = {"entityType": entity_type, "entityId": entity_id}
    if media_type:
        params["mediaType"] = media_type
    data = _cached_get("/media", params)
    if data and isinstance(data, dict) and "items" in data:
        return data["items"]
    if data and isinstance(data, list):
        return data
    return None


def stream_xiaohong_chat(message, on_token=None, on_done=None):
    """SSE 流式聊天 — 在后台线程运行"""
    def _stream():
        try:
            import httpx
            url = config.get("api_url") + "/xiaohong/chat/stream"
            with httpx.stream("GET", url, params={"message": message}, timeout=60.0) as resp:
                buffer = ""
                for line in resp.iter_lines():
                    if line.startswith("data: "):
                        chunk = line[6:]
                        if chunk == "[DONE]":
                            break
                        try:
                            data = json.loads(chunk)
                            token = data.get("content", data.get("text", chunk))
                            buffer += token
                            if on_token:
                                on_token(token)
                        except json.JSONDecodeError:
                            buffer += chunk
                            if on_token:
                                on_token(chunk)
            if on_done:
                on_done(buffer)
        except Exception as e:
            log.debug(f"SSE聊天失败: {e}", exc_info=True)
            if on_done:
                on_done(None)

    threading.Thread(target=_stream, daemon=True).start()


def post_journal(seal_id, note=""):
    """同步修行日志到 API"""
    client = _get_client()
    if not client:
        return False
    try:
        resp = client.post("/journals", json={
            "sealId": seal_id,
            "note": note,
            "deviceId": config.get("device_id"),
        })
        client.close()
        return resp.status_code in (200, 201)
    except Exception:
        log.debug("同步日志失败", exc_info=True)
        return False


def get_unread_count():
    """获取未读消息数"""
    data = _cached_get("/chat/rooms")
    if not data:
        return 0
    # 简单统计未读
    try:
        if isinstance(data, list):
            return sum(1 for room in data if room.get("unreadCount", 0) > 0)
    except Exception:
        pass
    return 0
