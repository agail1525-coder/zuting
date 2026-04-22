"""Verify Day1 depth fields for 12 cultural routes via API."""
import paramiko
import json

HOST = "120.24.31.151"
USER = "root"
PWD = "y1234567890."

SLUGS = [
    "lingnan-dao-chan-2026-may",
    "wudang-taiji-2026-may",
    "qufu-sankong-2026-sept",
    "tibet-lhasa-2026-aug",
    "europe-christian-2026-oct",
    "silkroad-islam-2026-may",
    "india-varanasi-2026-nov",
    "israel-jewish-2026-apr",
    "punjab-sikh-2026-jul",
    "kyoto-shinto-2026-mar",
    "peru-inca-2026-dec",
    "haifa-bahai-2026-sept",
]


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=30)

    print(f"{'slug':<32} {'acd':<4} {'mea':<4} {'cp':<4} {'legs':<5}")
    print("-" * 55)
    for slug in SLUGS:
        cmd = f"curl -s --max-time 8 'http://localhost:3002/api/routes/{slug}'"
        _, o, _ = ssh.exec_command(cmd, timeout=30)
        raw = o.read().decode(errors="replace")
        try:
            d = json.loads(raw)
        except Exception:
            print(f"{slug:<32} PARSE_FAIL")
            continue
        it = d.get("itinerary") or []
        d1 = it[0] if it else {}
        acd = 1 if d1.get("accommodationDetail") else 0
        mea = len(d1.get("mealsDetail") or [])
        cp = len(d1.get("culturalProducts") or [])
        legs = len(d1.get("transportLegs") or [])
        print(f"{slug:<32} {acd:<4} {mea:<4} {cp:<4} {legs:<5}")

    ssh.close()


if __name__ == "__main__":
    main()
