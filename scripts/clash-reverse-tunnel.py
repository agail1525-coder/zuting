"""
常驻 SSH 反向隧道:prod(120.24.31.151):7890 → 本机 127.0.0.1:7890 (Clash HTTP proxy)

用途: 让小轻服务器的爬虫++ 通过本机 Clash 访问 GFW 外的 wikipedia/wikidata/commons
搭配: 小轻 API .env 设 OUTBOUND_PROXY=http://127.0.0.1:7890

运行: python scripts/clash-reverse-tunnel.py &
"""
import paramiko
import select
import socket
import threading
import time
import sys

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE_PORT = 7890
LOCAL_HOST = "127.0.0.1"
LOCAL_PORT = 7890


def handler(chan, host, port):
    sock = socket.socket()
    try:
        sock.connect((host, port))
    except Exception as e:
        print(f"[handler] connect {host}:{port} fail: {e}", flush=True)
        chan.close()
        return
    while True:
        r, _, _ = select.select([sock, chan], [], [], 60)
        if sock in r:
            data = sock.recv(4096)
            if len(data) == 0:
                break
            chan.send(data)
        if chan in r:
            data = chan.recv(4096)
            if len(data) == 0:
                break
            sock.send(data)
    chan.close()
    sock.close()


def reverse_forward_tunnel(server_port, remote_host, remote_port, transport):
    transport.request_port_forward("127.0.0.1", server_port)
    print(f"[tunnel] prod:{server_port} → local:{remote_port} established", flush=True)
    while True:
        chan = transport.accept(60)
        if chan is None:
            continue
        thr = threading.Thread(target=handler, args=(chan, remote_host, remote_port), daemon=True)
        thr.start()


def main():
    while True:
        try:
            print(f"[tunnel] connecting to {SERVER}...", flush=True)
            client = paramiko.SSHClient()
            client.load_system_host_keys()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
            transport = client.get_transport()
            transport.set_keepalive(30)
            reverse_forward_tunnel(REMOTE_PORT, LOCAL_HOST, LOCAL_PORT, transport)
        except Exception as e:
            print(f"[tunnel] error: {e} — reconnect in 10s", flush=True)
            time.sleep(10)


if __name__ == "__main__":
    main()
