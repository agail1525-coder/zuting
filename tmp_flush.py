import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('120.24.31.151', username='root', password='y1234567890.')

AUTH = 'CbFjnSKeIFi3dk7mzIRW'
DB = 2
RC = f'docker exec zuoyelang-redis redis-cli -a {AUTH} -n {DB}'

for c in [
    f'{RC} DBSIZE',
    f'{RC} --scan --pattern "holy-site:*" | wc -l',
    f'{RC} --scan --pattern "holy-site:*" | xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} --scan --pattern "religion:*" | xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} --scan --pattern "temple:*"   | xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} --scan --pattern "patriarch:*"| xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} --scan --pattern "teaching:*" | xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} --scan --pattern "seal:*"     | xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} --scan --pattern "route:*"    | xargs -r -n 100 docker exec -i zuoyelang-redis redis-cli -a {AUTH} -n {DB} DEL',
    f'{RC} DBSIZE',
]:
    stdin,stdout,stderr = ssh.exec_command(c)
    out = stdout.read().decode()
    err = stderr.read().decode()
    label = c.split('|')[0][-60:]
    print('==', label, '==')
    if out.strip(): print(out[:400])
    if 'WARNING' not in err and err.strip(): print('ERR:', err[:200])
ssh.close()
