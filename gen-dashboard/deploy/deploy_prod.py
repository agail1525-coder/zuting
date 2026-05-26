#!/usr/bin/env python3
import io
import json
import os
import posixpath
import tarfile
import tempfile
import time
from pathlib import Path

import paramiko


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REMOTE_ROOT = "/opt/zuting/gen-dashboard"
REMOTE_TAR = "/opt/zuting/gen-dashboard.tar.gz"
REMOTE_SERVICE = "/etc/systemd/system/zuting-gen-dashboard.service"
REMOTE_NGINX_CONF = "/opt/zuoyelang/docker/nginx/nginx-standalone.conf"
SERVICE_NAME = "zuting-gen-dashboard"
HOST = os.environ.get("ZUTING_PROD_HOST", "120.24.31.151")
USER = os.environ.get("ZUTING_PROD_USER", "root")
PASSWORD = os.environ.get("ZUTING_PROD_PASSWORD", "")
ENTRY_URL = os.environ.get("ZUTING_PROD_ENTRY_URL", "https://zuting.fszyl.top/gen/api/dashboard")


def run(ssh: paramiko.SSHClient, cmd: str) -> tuple[int, str, str]:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    return code, stdout.read().decode(), stderr.read().decode()


def require_ok(ssh: paramiko.SSHClient, cmd: str, label: str) -> str:
    code, out, err = run(ssh, cmd)
    if code != 0:
        raise RuntimeError(f"{label} failed: {err or out}")
    return out


def build_tarball() -> Path:
    handle = tempfile.NamedTemporaryFile(delete=False, suffix=".tar.gz")
    handle.close()
    tar_path = Path(handle.name)
    with tarfile.open(tar_path, "w:gz") as archive:
        archive.add(PROJECT_ROOT, arcname="gen-dashboard")
    return tar_path


def load_service_text() -> str:
    return (PROJECT_ROOT / "deploy" / "zuting-gen-dashboard.service").read_text(encoding="utf-8")


def load_location_text() -> str:
    return (PROJECT_ROOT / "deploy" / "nginx-gen-location.conf").read_text(encoding="utf-8").rstrip()


def patch_nginx_config(current: str, location_block: str) -> str:
    if "location /gen/" in current:
        return current

    marker = "        location / {\n            proxy_pass http://172.19.0.1:3003;\n"
    if marker not in current:
        raise RuntimeError("Could not find zuting web location block in nginx config")

    insert = (
        "\n"
        f"        {location_block.replace(chr(10), chr(10) + '        ')}\n\n"
        "        location / {\n            proxy_pass http://172.19.0.1:3003;\n"
    )
    return current.replace(marker, insert, 1)


def write_remote_text(sftp: paramiko.SFTPClient, remote_path: str, content: str) -> None:
    with sftp.open(remote_path, "w") as handle:
        handle.write(content)


def verify_http() -> dict:
    import urllib.request

    with urllib.request.urlopen(ENTRY_URL, timeout=20) as response:
        return json.load(response)


def main() -> None:
    if not PASSWORD:
        raise SystemExit("ZUTING_PROD_PASSWORD is required")

    tar_path = build_tarball()
    backup_suffix = time.strftime("%Y%m%d-%H%M%S")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=20, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()

    try:
        print("[1/6] Upload release bundle")
        require_ok(ssh, "mkdir -p /opt/zuting/releases", "prepare release directory")
        sftp.put(str(tar_path), REMOTE_TAR)

        print("[2/6] Install release")
        require_ok(
            ssh,
            (
                f"if [ -d {REMOTE_ROOT} ]; then mv {REMOTE_ROOT} /opt/zuting/releases/gen-dashboard-{backup_suffix}; fi && "
                f"mkdir -p {REMOTE_ROOT} && "
                f"tar xzf {REMOTE_TAR} -C {REMOTE_ROOT} --strip-components=1 && "
                f"chmod +x {REMOTE_ROOT}/launch_finance_dashboard.sh"
            ),
            "install release",
        )

        print("[3/6] Install systemd service")
        write_remote_text(sftp, REMOTE_SERVICE, load_service_text())
        require_ok(
            ssh,
            f"systemctl daemon-reload && systemctl enable --now {SERVICE_NAME} && systemctl restart {SERVICE_NAME}",
            "restart systemd service",
        )

        print("[4/6] Patch nginx route /gen")
        with sftp.open(REMOTE_NGINX_CONF, "r") as handle:
            current = handle.read().decode()
        updated = patch_nginx_config(current, load_location_text())
        if updated != current:
            backup_path = f"{REMOTE_NGINX_CONF}.bak-{backup_suffix}"
            write_remote_text(sftp, backup_path, current)
            write_remote_text(sftp, REMOTE_NGINX_CONF, updated)
            code, out, err = run(ssh, "docker exec zuoyelang-nginx nginx -t 2>&1")
            if code != 0:
                write_remote_text(sftp, REMOTE_NGINX_CONF, current)
                raise RuntimeError(f"nginx -t failed: {out}{err}")
            require_ok(ssh, "docker exec zuoyelang-nginx nginx -s reload 2>&1", "reload nginx")

        print("[5/6] Verify service and proxy")
        service_state = require_ok(ssh, f"systemctl is-active {SERVICE_NAME}", "check service state").strip()
        if service_state != "active":
            raise RuntimeError(f"{SERVICE_NAME} is not active: {service_state}")
        payload = verify_http()

        print("[6/6] Done")
        print(
            json.dumps(
                {
                    "ok": True,
                    "service": SERVICE_NAME,
                    "entry_url": ENTRY_URL,
                    "summary": {
                        "revenue": payload["summary"]["revenue"],
                        "profit": payload["summary"]["profit"],
                        "margin": payload["summary"]["margin"],
                    },
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    finally:
        ssh.close()
        tar_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
