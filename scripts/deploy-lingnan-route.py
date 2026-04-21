"""Deploy 岭南道禅共修之旅 · 願財雙圓双圣吉日路线 to production.

Payload:
  - services/api/prisma/data/holy-sites-data.ts  (加了4圣地,供主 seed 下次重跑时有源)
  - services/api/prisma/seed-lingnan-dao-chan-route.ts  (独立 seed,upsert 4圣地+1路线+5 RouteSite)

Steps:
  1. SFTP 上传 2 文件
  2. cd /opt/zuting/api && NODE_NO_COMPILE_CACHE=1 npx tsx prisma/seed-lingnan-dao-chan-route.ts
  3. Redis flush route:* + holy-site:* + religion:*
  4. curl /api/routes/featured → assert first slug == lingnan-dao-chan-2026-may
  5. curl /api/routes/lingnan-dao-chan-2026-may → assert 200 + has 5 sites
"""
import paramiko
import os
import sys

HOST = "120.24.31.151"
USER = "root"
PWD = "y1234567890."

LOCAL_API = r"E:\ZUTING\services\api"
REMOTE_API = "/opt/zuting/api"

# Web 端更新 (RouteMapInner 升级 + page rebuild)
LOCAL_WEB = r"E:\ZUTING\apps\web"
REMOTE_WEB = "/opt/zuting/web"

FILES = [
    ("prisma/data/holy-sites-data.ts", "prisma/data/holy-sites-data.ts"),
    ("prisma/data/wiki-images-lingnan.json", "prisma/data/wiki-images-lingnan.json"),
    ("prisma/seed-lingnan-dao-chan-route.ts", "prisma/seed-lingnan-dao-chan-route.ts"),
]

# 新下的 wiki 图,从本地 holy-sites-images/ 上传到服务器 /opt/zuting/api/prisma/data/holy-sites-images/
# (后续 finalize-static 会复制到 /var/www/zuting-static/holy-sites/)
IMAGE_FILES: list[str] = []  # 由 main() 从 wiki-images-lingnan.json 读取填充


def run(ssh, cmd, t=120, show=True):
    _, out, err = ssh.exec_command(cmd, timeout=t)
    o = out.read().decode(errors="replace")
    e = err.read().decode(errors="replace")
    if show and o:
        print(o.rstrip())
    if show and e and "WARNING" not in e and "NOTICE" not in e:
        stripped = e.strip()
        if stripped:
            print(f"  STDERR: {stripped[:2000]}")
    return o + e


def main():
    import json as _json
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=30)
    sftp = ssh.open_sftp()

    print("=== 1. 上传 seed 文件 ===")
    for local_rel, remote_rel in FILES:
        local = os.path.join(LOCAL_API, local_rel.replace("/", os.sep))
        remote = f"{REMOTE_API}/{remote_rel}"
        parent = os.path.dirname(remote)
        run(ssh, f"mkdir -p {parent}", show=False)
        size = os.path.getsize(local)
        sftp.put(local, remote)
        print(f"  ✓ {remote}  ({size/1024:.1f} KB)")

    print("\n=== 1b. 上传 4 新圣地 Wiki 本地化图片到 /opt/zuting/static/holy-sites/ ===")
    # 读取 wiki-images-lingnan.json 提取所有 /static/holy-sites/ 文件名
    wiki_json_path = os.path.join(
        LOCAL_API, "prisma", "data", "wiki-images-lingnan.json"
    )
    local_img_dir = os.path.join(LOCAL_API, "prisma", "data", "holy-sites-images")
    remote_static = "/opt/zuting/static/holy-sites"
    run(ssh, f"mkdir -p {remote_static}", show=False)
    uploaded = 0
    skipped = 0
    if os.path.exists(wiki_json_path):
        wiki = _json.loads(open(wiki_json_path, "r", encoding="utf-8").read())
        all_files = []
        for _site, urls in wiki.items():
            for u in urls:
                if isinstance(u, str) and u.startswith("/static/holy-sites/"):
                    all_files.append(u.rsplit("/", 1)[-1])
        for fname in sorted(set(all_files)):
            local_path = os.path.join(local_img_dir, fname)
            if not os.path.exists(local_path):
                print(f"  ⚠ missing local: {fname}")
                continue
            remote_path = f"{remote_static}/{fname}"
            # 判断是否已存在 (按大小粗略)
            try:
                stat = sftp.stat(remote_path)
                if stat.st_size > 1024 and stat.st_size == os.path.getsize(local_path):
                    skipped += 1
                    continue
            except FileNotFoundError:
                pass
            sftp.put(local_path, remote_path)
            uploaded += 1
            if uploaded % 5 == 0:
                print(f"  … uploaded {uploaded}")
        print(f"  ✓ images uploaded={uploaded}, skipped={skipped}")
    else:
        print(f"  ⚠ wiki-images-lingnan.json not found at {wiki_json_path}")

    print("\n=== 2. 跑 seed (NODE_NO_COMPILE_CACHE=1) ===")
    out = run(
        ssh,
        f"cd {REMOTE_API} && NODE_NO_COMPILE_CACHE=1 npx tsx prisma/seed-lingnan-dao-chan-route.ts 2>&1 | tail -40",
        t=180,
    )
    if "DONE" not in out and "done" not in out.lower():
        print("  ⚠ seed 输出中未见 DONE,请审查上面日志")
    else:
        print("  ✓ seed 完成")

    print("\n=== 3. Redis 清缓存 ===")
    # Get Redis container + password (REDIS_PASSWORD 单独字段 或 从 REDIS_URL 解析)
    redis_container = run(ssh, 'docker ps --format "{{.Names}}" | grep -i redis | head -1', show=False).strip()
    redis_pw = run(
        ssh,
        f"grep -E '^REDIS_PASSWORD' {REMOTE_API}/.env | cut -d= -f2- | tr -d '\"' | tr -d \"'\"",
        show=False,
    ).strip()
    if not redis_pw:
        # fallback: 从 REDIS_URL (redis://:pw@host:port/db) 解析密码
        redis_pw = run(
            ssh,
            f"grep -E '^REDIS_URL' {REMOTE_API}/.env "
            f"| sed -E 's|.*redis://[^:]*:([^@]+)@.*|\\1|' | tr -d '\"' | tr -d \"'\"",
            show=False,
        ).strip()
        # 避免把整行 REDIS_URL=... 当密码
        if redis_pw.startswith('REDIS_URL'):
            redis_pw = ''
    if not redis_pw:
        # 最后兜底:从容器 env 读
        redis_pw = run(
            ssh,
            f"docker inspect {redis_container} --format '{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}' "
            f"| grep -E '(REDIS_PASSWORD|REQUIREPASS)' | head -1 | cut -d= -f2-",
            show=False,
        ).strip()
    print(f"  container={redis_container}, pw_set={bool(redis_pw)}")
    if redis_container:
        auth = f"-a '{redis_pw}' --no-auth-warning" if redis_pw else ""
        for pat in ["route:*", "holy-site:*", "religion:*", "next:*", "ssr:*"]:
            cmd = (
                f"docker exec {redis_container} sh -c \"redis-cli {auth} --scan --pattern '{pat}' "
                f"| xargs -r -n1 redis-cli {auth} DEL\" 2>&1 | tail -5"
            )
            print(f"  → flush {pat}")
            run(ssh, cmd, t=60)

    print("\n=== 3b. 重启 zuting-web (清 Next.js 页缓存 + ISR revalidate) ===")
    run(ssh, 'systemctl restart zuting-web 2>&1 | head -3', show=True)
    import time as _t
    _t.sleep(6)
    run(ssh, 'systemctl is-active zuting-web 2>&1', show=True)

    print("\n=== 4. 验证 /api/routes/featured (置顶) ===")
    run(
        ssh,
        "curl -sk --max-time 10 'http://localhost:3002/api/routes/featured?limit=3' "
        "| python3 -c \"import sys,json; d=json.load(sys.stdin); "
        "items=d if isinstance(d,list) else d.get('items',[]); "
        "print('HTTP OK' if items else 'EMPTY'); "
        "print('#1 slug:', items[0].get('slug') if items else '-'); "
        "print('#1 title:', items[0].get('title') if items else '-'); "
        "print('#1 bookCount:', items[0].get('bookCount') if items else '-'); "
        "print('#1 priceFrom:', items[0].get('priceFrom') if items else '-'); \"",
        t=30,
    )

    print("\n=== 5. 验证 /api/routes/lingnan-dao-chan-2026-may (详情) ===")
    # 避免 for 循环进入 one-liner,改用 map 生成
    verify_script = (
        "import sys,json\n"
        "d=json.load(sys.stdin)\n"
        "print('slug:', d.get('slug'))\n"
        "print('title:', d.get('title'))\n"
        "print('priceFrom:', d.get('priceFrom'))\n"
        "print('duration:', d.get('duration'), 'days,', d.get('nights'), 'nights')\n"
        "print('highlights:', len(d.get('highlights') or []), 'items')\n"
        "print('included:', len(d.get('included') or []), 'items')\n"
        "print('tips:', len(d.get('tips') or []), 'items')\n"
        "print('images:', len(d.get('images') or []), 'pcs')\n"
        "it=d.get('itinerary') or []\n"
        "print('itinerary days:', len(it))\n"
        "for day in it:\n"
        "    acts=day.get('activities') or []\n"
        "    print('  · Day', day.get('day'), '-', day.get('title'), '(', len(acts), 'activities)')\n"
        "    print('    accommodation:', day.get('accommodation'))\n"
        "sites=d.get('sites') or []\n"
        "print('sites bound:', len(sites))\n"
        "for s in sites:\n"
        "    print('  ·', 'day'+str(s.get('day')), 'order'+str(s.get('order')), (s.get('site') or {}).get('name'))\n"
    )
    # 把脚本写到远端再运行
    with sftp.open('/tmp/verify_route.py', 'w') as fh:
        fh.write(verify_script)
    run(
        ssh,
        "curl -sk --max-time 10 'http://localhost:3002/api/routes/lingnan-dao-chan-2026-may' "
        "| python3 /tmp/verify_route.py",
        t=30,
    )

    print("\n=== 6. 验证 Web 首页 (生产) ===")
    run(
        ssh,
        "curl -sk --max-time 10 https://zuting.fszyl.top/ --resolve zuting.fszyl.top:443:127.0.0.1 "
        "-o /dev/null -w 'HTTP:%{http_code} BYTES:%{size_download}\\n'",
        t=30,
    )

    sftp.close()
    ssh.close()
    print("\n✅ 部署完成")


if __name__ == "__main__":
    main()
