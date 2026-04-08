"""清除Redis缓存中所有 holy-site:* 键 — 修复seed后列表与详情ID不一致问题"""
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("120.24.31.151", username="root", password="y1234567890.")

stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}}' | grep -i redis")
container = stdout.read().decode().strip().split("\n")[0]
print("Container:", container)

cmd = (
    f"docker exec {container} sh -c \""
    "redis-cli -a 'CbFjnSKeIFi3dk7mzIRW' -n 2 --no-auth-warning --scan --pattern 'holy-site:*' | "
    "xargs -r redis-cli -a 'CbFjnSKeIFi3dk7mzIRW' -n 2 --no-auth-warning DEL\""
)
print(f"Run: {cmd}")
stdin, stdout, stderr = ssh.exec_command(cmd)
print("OUT:", stdout.read().decode())
print("ERR:", stderr.read().decode())

# Verify
stdin, stdout, stderr = ssh.exec_command(
    f"docker exec {container} sh -c \"redis-cli -a 'CbFjnSKeIFi3dk7mzIRW' -n 2 --no-auth-warning --scan --pattern 'holy-site:*' | wc -l\""
)
print("Remaining holy-site keys:", stdout.read().decode().strip())
ssh.close()
