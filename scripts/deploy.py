#!/usr/bin/env python
"""
PUSH++ 统一部署脚本 — 多项目 SFTP 部署到小轻 (120.24.31.151)

用法:
    python scripts/deploy.py                    # 自动检测变更，增量部署
    python scripts/deploy.py web                # 只部署 Web
    python scripts/deploy.py api                # 只部署 API
    python scripts/deploy.py all                # 部署 API + Web
    python scripts/deploy.py all --full         # 全量重建部署
    python scripts/deploy.py --status           # 查看服务器状态

项目路由 (根据 cwd 自动判断):
    E:\\ZUTING\\      → /opt/zuting    (祖庭旅行平台, 直接 node 进程)
    E:\\zuoyelang\\   → /opt/zuoyelang (作业郎, Docker 容器)
"""

import argparse
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import paramiko

# ═══════════════════════════════════════════════════════════
#  服务器配置
# ═══════════════════════════════════════════════════════════
SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
SSH_OPTS = dict(
    port=22, username=USER, password=PASSWORD,
    banner_timeout=60, timeout=30, auth_timeout=30,
    allow_agent=False, look_for_keys=False,
)

# ═══════════════════════════════════════════════════════════
#  项目配置
# ═══════════════════════════════════════════════════════════
PROJECTS = {
    "zuting": {
        "markers": ["CLAUDE.md", "apps/web", "services/api"],   # 识别标志
        "remote_base": "/opt/zuting",
        "deploy_mode": "process",  # 直接 node 进程
        "targets": {
            "api": {
                "local_src": "services/api",
                "build_cmd": "pnpm --filter @zuting/api build",
                "upload": [
                    # (本地路径, 远程路径, 排除模式)
                    ("services/api/dist", "/opt/zuting/api/dist", []),
                    ("services/api/prisma", "/opt/zuting/api/prisma", []),
                    ("services/api/package.json", "/opt/zuting/api/package.json", []),
                ],
                "post_upload": [
                    "cd /opt/zuting/api && npm install --omit=dev --silent 2>&1 | tail -3",
                    "cd /opt/zuting/api && npx prisma generate 2>&1 | tail -2",
                    "cd /opt/zuting/api && npx prisma db push --accept-data-loss 2>&1 | tail -2",
                ],
                "restart_cmd": (
                    "pkill -f 'node.*opt/zuting/api' 2>/dev/null; sleep 1; "
                    "cd /opt/zuting/api && "
                    "NODE_ENV=production PORT=3002 "
                    "nohup node dist/main.js > /opt/zuting/api.log 2>&1 & "
                    "echo PID:$!"
                ),
                "health_check": "curl -sf -o /dev/null -w '%{http_code}' http://localhost:3002/api/religions",
                "port": 3002,
            },
            "web": {
                "local_src": "apps/web",
                "build_cmd": "pnpm --filter @zuting/web build",
                "upload": [
                    ("apps/web/.next", "/opt/zuting/web/apps/web/.next", ["cache"]),
                    ("apps/web/server.js", "/opt/zuting/web/apps/web/server.js", []),
                    ("apps/web/package.json", "/opt/zuting/web/apps/web/package.json", []),
                ],
                "post_upload": [],
                "restart_cmd": (
                    "pkill -9 -f 'next-server' 2>/dev/null; sleep 2; "
                    "cd /opt/zuting/web/apps/web && "
                    "NODE_ENV=production PORT=3003 HOSTNAME=0.0.0.0 "
                    "NEXT_PUBLIC_API_URL=http://localhost:3002 "
                    "API_INTERNAL_URL=http://localhost:3002 "
                    "nohup node server.js > /opt/zuting/web.log 2>&1 & "
                    "echo PID:$!"
                ),
                "health_check": "curl -sf -o /dev/null -w '%{http_code}' http://localhost:3003/",
                "port": 3003,
            },
        },
    },
    "zuoyelang": {
        "markers": ["backend/src", "web-admin/src", "docker-compose.yml"],
        "remote_base": "/opt/zuoyelang",
        "deploy_mode": "docker",  # Docker 容器
        "targets": {
            "backend": {
                "local_src": "backend/src",
                "upload": [
                    ("backend/src", "/opt/zuoyelang/backend/src", []),
                    ("backend/prisma", "/opt/zuoyelang/backend/prisma", []),
                ],
                "post_upload": [],
                "restart_cmd": (
                    "cd /opt/zuoyelang && "
                    "docker compose stop backend && "
                    "docker compose build --no-cache backend 2>&1 | tail -5 && "
                    "docker compose up -d backend && "
                    "docker compose restart nginx"
                ),
                "health_check": "curl -sf -o /dev/null -w '%{http_code}' https://api.fszyl.top/api/health",
                "port": 3001,
            },
            "web-admin": {
                "local_src": "web-admin/src",
                "upload": [
                    ("web-admin/src", "/opt/zuoyelang/web-admin/src", []),
                    ("web-admin/package.json", "/opt/zuoyelang/web-admin/package.json", []),
                ],
                "post_upload": [],
                "restart_cmd": (
                    "cd /opt/zuoyelang && "
                    "docker compose stop web-admin && "
                    "docker compose build --no-cache web-admin 2>&1 | tail -5 && "
                    "docker compose up -d web-admin && "
                    "docker compose restart nginx"
                ),
                "health_check": "curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:80/",
                "port": 80,
            },
            "web-portal": {
                "local_src": "web-portal/src",
                "upload": [
                    ("web-portal/src", "/opt/zuoyelang/web-portal/src", []),
                    ("web-portal/package.json", "/opt/zuoyelang/web-portal/package.json", []),
                ],
                "post_upload": [],
                "restart_cmd": (
                    "cd /opt/zuoyelang && "
                    "docker compose stop web-portal && "
                    "docker compose build --no-cache web-portal 2>&1 | tail -5 && "
                    "docker compose up -d web-portal && "
                    "docker compose restart nginx"
                ),
                "health_check": "curl -sf -o /dev/null -w '%{http_code}' https://api.fszyl.top/portal/",
                "port": 80,
            },
        },
    },
}


# ═══════════════════════════════════════════════════════════
#  工具函数
# ═══════════════════════════════════════════════════════════

def detect_project(cwd: str) -> tuple[str, dict]:
    """根据当前目录判断项目"""
    for name, conf in PROJECTS.items():
        if all((Path(cwd) / m).exists() for m in conf["markers"]):
            return name, conf
    print(f"错误: 无法识别项目 (cwd={cwd})")
    print("支持的项目:", list(PROJECTS.keys()))
    sys.exit(1)


def run_ssh(ssh, cmd, show=True, timeout=60):
    """执行远程命令"""
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(f"    {out}")
    # Filter noise
    if err:
        err_lines = [l for l in err.split('\n')
                     if not any(x in l.lower() for x in ['warn', 'notice', 'npm warn', 'deprecated'])]
        if err_lines:
            for l in err_lines[:5]:
                print(f"    ERR: {l[:200]}")
    return out


def run_local(cmd, cwd=None):
    """执行本地命令"""
    print(f"  $ {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  FAILED: {result.stderr[:500]}")
        return False
    if result.stdout.strip():
        for line in result.stdout.strip().split('\n')[-5:]:
            print(f"    {line}")
    return True


def sftp_upload_dir(sftp, local_dir, remote_dir, excludes=None):
    """递归上传目录"""
    excludes = excludes or []
    local_path = Path(local_dir)
    if not local_path.exists():
        print(f"  跳过 (不存在): {local_dir}")
        return 0

    count = 0
    if local_path.is_file():
        _sftp_mkdir_p(sftp, str(Path(remote_dir).parent))
        sftp.put(str(local_path), remote_dir)
        return 1

    for root, dirs, files in os.walk(local_path):
        # Apply excludes
        dirs[:] = [d for d in dirs if d not in excludes and not d.startswith('.')]

        rel = Path(root).relative_to(local_path)
        remote_sub = f"{remote_dir}/{rel}" if str(rel) != "." else remote_dir
        _sftp_mkdir_p(sftp, remote_sub)

        for f in files:
            if any(f.endswith(x) for x in ['.pyc', '.DS_Store']):
                continue
            local_file = os.path.join(root, f)
            remote_file = f"{remote_sub}/{f}"
            try:
                sftp.put(local_file, remote_file)
                count += 1
            except Exception as e:
                print(f"  上传失败: {remote_file}: {e}")
    return count


def _sftp_mkdir_p(sftp, remote_dir):
    """递归创建远程目录"""
    dirs = []
    d = remote_dir
    while d and d != "/":
        try:
            sftp.stat(d)
            break
        except FileNotFoundError:
            dirs.append(d)
            d = os.path.dirname(d)
    for d in reversed(dirs):
        try:
            sftp.mkdir(d)
        except Exception:
            pass


def git_changed_files(cwd, target_src):
    """获取 git diff 中变更的文件"""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            cwd=cwd, capture_output=True, text=True
        )
        staged = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            cwd=cwd, capture_output=True, text=True
        )
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=cwd, capture_output=True, text=True
        )
        all_files = set(
            result.stdout.strip().split('\n') +
            staged.stdout.strip().split('\n') +
            untracked.stdout.strip().split('\n')
        )
        # Filter to target
        return [f for f in all_files if f.startswith(target_src) and f.strip()]
    except Exception:
        return []


# ═══════════════════════════════════════════════════════════
#  核心部署逻辑
# ═══════════════════════════════════════════════════════════

def deploy_target(ssh, sftp, project_name, project_conf, target_name, target_conf, cwd, full=False):
    """部署单个目标"""
    print(f"\n{'─' * 50}")
    print(f"  部署 [{project_name}/{target_name}]")
    print(f"{'─' * 50}")

    # Step 1: Build
    build_cmd = target_conf.get("build_cmd")
    if build_cmd:
        print(f"\n  [BUILD] 本地构建...")
        if not run_local(build_cmd, cwd=cwd):
            print("  构建失败，跳过部署")
            return False

    # Step 2: Upload
    print(f"\n  [UPLOAD] 上传文件...")
    total_files = 0
    for upload_spec in target_conf["upload"]:
        local_rel, remote_path, excludes = upload_spec
        local_abs = os.path.join(cwd, local_rel)
        # Clean remote dir first for full deploy
        if full and os.path.isdir(local_abs):
            run_ssh(ssh, f"rm -rf {remote_path}", show=False)
        n = sftp_upload_dir(sftp, local_abs, remote_path, excludes)
        total_files += n
        print(f"    {local_rel} → {remote_path} ({n} files)")
    print(f"    共 {total_files} 个文件")

    # Step 3: Post-upload commands
    for cmd in target_conf.get("post_upload", []):
        print(f"\n  [POST] {cmd[:60]}...")
        run_ssh(ssh, cmd, timeout=120)

    # Step 4: Restart
    print(f"\n  [RESTART] 重启服务...")
    run_ssh(ssh, target_conf["restart_cmd"], timeout=300)

    # Step 5: Health check
    print(f"\n  [CHECK] 健康检查...", end=" ")
    time.sleep(5)
    code = run_ssh(ssh, target_conf["health_check"], show=False, timeout=10)
    if code == "200":
        print(f"✓ HTTP 200 (port {target_conf['port']})")
        return True
    else:
        print(f"✗ HTTP {code} (port {target_conf['port']})")
        # Show logs
        if project_name == "zuting":
            log_file = f"/opt/zuting/{target_name}.log"
            print(f"\n  最近日志 ({log_file}):")
            run_ssh(ssh, f"tail -10 {log_file}")
        return False


def show_status(ssh, project_name, project_conf):
    """显示服务器状态"""
    print(f"\n{'═' * 50}")
    print(f"  服务器状态: {SERVER}")
    print(f"  项目: {project_name} → {project_conf['remote_base']}")
    print(f"{'═' * 50}")

    run_ssh(ssh, "echo 'CPU:' $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')% '  MEM:' $(free -m | awk '/Mem/{printf \"%d/%dMB (%.0f%%)\", $3, $2, $3/$2*100}')")

    if project_name == "zuting":
        run_ssh(ssh, "echo '---'; ps aux | grep 'node.*opt/zuting' | grep -v grep | awk '{printf \"  PID %-8s %s %s\\n\", $2, $9, $11}'")
        for name, t in project_conf["targets"].items():
            code = run_ssh(ssh, t["health_check"], show=False, timeout=5)
            print(f"    {name:10s} :{t['port']} → HTTP {code}")
    elif project_name == "zuoyelang":
        run_ssh(ssh, 'docker ps --format "table {{.Names}}\t{{.Status}}" | grep zuoyelang')


def detect_targets(cwd, project_conf):
    """根据 git diff 自动检测需要部署的目标"""
    targets = []
    for name, tconf in project_conf["targets"].items():
        changed = git_changed_files(cwd, tconf["local_src"])
        if changed:
            targets.append(name)
            print(f"  检测到 {name} 有 {len(changed)} 个变更文件")
    return targets


# ═══════════════════════════════════════════════════════════
#  主函数
# ═══════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="PUSH++ 统一部署")
    parser.add_argument("target", nargs="?", default=None,
                        help="部署目标: api, web, all (默认: 自动检测)")
    parser.add_argument("--full", action="store_true",
                        help="全量部署 (清除远程目录后重新上传)")
    parser.add_argument("--status", action="store_true",
                        help="查看服务器状态")
    parser.add_argument("--project", "-p", default=None,
                        help="指定项目 (默认: 自动检测)")
    args = parser.parse_args()

    cwd = os.getcwd()

    # Detect project
    if args.project:
        if args.project not in PROJECTS:
            print(f"未知项目: {args.project}")
            sys.exit(1)
        project_name = args.project
        project_conf = PROJECTS[project_name]
    else:
        project_name, project_conf = detect_project(cwd)

    print(f"\n{'═' * 50}")
    print(f"  PUSH++ 部署 → {project_name}")
    print(f"  {cwd} → {SERVER}:{project_conf['remote_base']}")
    print(f"{'═' * 50}")

    # Connect
    print("\n  连接服务器...", end=" ")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(SERVER, **SSH_OPTS)
        print("✓")
    except Exception as e:
        print(f"✗ {e}")
        sys.exit(1)

    # Status only
    if args.status:
        show_status(ssh, project_name, project_conf)
        ssh.close()
        return

    sftp = ssh.open_sftp()

    # Determine targets
    if args.target == "all":
        targets = list(project_conf["targets"].keys())
    elif args.target:
        if args.target not in project_conf["targets"]:
            print(f"未知目标: {args.target}")
            print(f"可用: {list(project_conf['targets'].keys())}")
            sys.exit(1)
        targets = [args.target]
    else:
        # Auto-detect from git diff
        targets = detect_targets(cwd, project_conf)
        if not targets:
            print("\n  未检测到变更文件，使用 'all' 部署全部，或指定目标")
            print(f"  可用目标: {list(project_conf['targets'].keys())}")
            ssh.close()
            return

    # Deploy each target
    results = {}
    for t in targets:
        ok = deploy_target(ssh, sftp, project_name, project_conf,
                           t, project_conf["targets"][t], cwd, args.full)
        results[t] = ok

    # Summary
    print(f"\n{'═' * 50}")
    print(f"  部署结果:")
    for t, ok in results.items():
        status = "✓ 成功" if ok else "✗ 失败"
        print(f"    {t:15s} {status}")

    if project_name == "zuting":
        print(f"\n  访问地址:")
        print(f"    Web:  http://zuting.fszyl.top")
        print(f"    API:  http://120.24.31.151:3002/api/religions")
    elif project_name == "zuoyelang":
        print(f"\n  访问地址:")
        print(f"    Admin: http://120.24.31.151")
        print(f"    API:   https://api.fszyl.top")
    print(f"{'═' * 50}")

    sftp.close()
    ssh.close()


if __name__ == "__main__":
    main()
