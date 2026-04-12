import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('120.24.31.151', username='root', password='y1234567890.')

sql = """SELECT id, name FROM \"HolySite\" WHERE id='cmnviulxa00gqpxcip8v3wqv9';
SELECT COUNT(*) AS total FROM \"HolySite\";
SELECT id, name FROM \"HolySite\" ORDER BY id LIMIT 3;"""
ssh.exec_command(f"cat > /tmp/q.sql <<'EOF'\n{sql}\nEOF")
import time; time.sleep(1)
stdin,stdout,stderr = ssh.exec_command('docker cp /tmp/q.sql zuoyelang-postgres:/tmp/q.sql && docker exec zuoyelang-postgres psql -U zuoyelang -d zuting -f /tmp/q.sql')
print(stdout.read().decode())
print('ERR:', stderr.read().decode()[:500])
ssh.close()
