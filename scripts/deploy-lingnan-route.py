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

FILES = [
    ("prisma/data/holy-sites-data.ts", "prisma/data/holy-sites-data.ts"),
    ("prisma/seed-lingnan-dao-chan-route.ts", "prisma/seed-lingnan-dao-chan-route.ts"),
]


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
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=30)
    sftp = ssh.open_sftp()

    print("=== 1. 上传 seed 文件 ===")
    for local_rel, remote_rel in FILES:
        local = os.path.join(LOCAL_API, local_rel.replace("/", os.sep))
        remote = f"{REMOTE_API}/{remote_rel}"
        # Ensure parent dir exists
        parent = os.path.dirname(remote)
        run(ssh, f"mkdir -p {parent}", show=False)
        size = os.path.getsize(local)
        sftp.put(local, remote)
        print(f"  ✓ {remote}  ({size/1024:.1f} KB)")

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
    # Get Redis container + password
    redis_container = run(ssh, 'docker ps --format "{{.Names}}" | grep -i redis | head -1', show=False).strip()
    redis_pw = run(
        ssh,
        f"grep -E '^REDIS_PASSWORD' {REMOTE_API}/.env | cut -d= -f2- | tr -d '\"' | tr -d \"'\"",
        show=False,
    ).strip()
    print(f"  container={redis_container}, pw_set={bool(redis_pw)}")
    if redis_container:
        auth = f"-a {redis_pw}" if redis_pw else ""
        for pat in ["route:*", "holy-site:*", "religion:*"]:
            cmd = (
                f"docker exec {redis_container} redis-cli {auth} --scan --pattern '{pat}' "
                f"| xargs -r -n1 docker exec -i {redis_container} redis-cli {auth} DEL 2>&1 | tail -5"
            )
            print(f"  → flush {pat}")
            run(ssh, cmd, t=60)

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
    run(
        ssh,
        "curl -sk --max-time 10 'http://localhost:3002/api/routes/lingnan-dao-chan-2026-may' "
        "| python3 -c \"import sys,json; d=json.load(sys.stdin); "
        "print('slug:', d.get('slug')); "
        "print('title:', d.get('title')); "
        "print('priceFrom:', d.get('priceFrom')); "
        "print('duration:', d.get('duration'), 'days,', d.get('nights'), 'nights'); "
        "print('highlights:', len(d.get('highlights') or []), 'items'); "
        "print('included:', len(d.get('included') or []), 'items'); "
        "print('tips:', len(d.get('tips') or []), 'items'); "
        "print('images:', len(d.get('images') or []), 'pcs'); "
        "it=d.get('itinerary') or []; "
        "print('itinerary days:', len(it)); "
        "sites=d.get('sites') or []; "
        "print('sites bound:', len(sites)); "
        "for s in sites: print('  ·', s.get('day'), s.get('order'), (s.get('site') or {}).get('name'))\"",
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
