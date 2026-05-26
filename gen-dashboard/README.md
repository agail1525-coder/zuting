# Gen Dashboard

`gen-dashboard` 是一个独立的旅游经营战报子项目，默认使用 SQLite 数据库并挂载在 `zuting.fszyl.top/gen`。

## 目录

- `finance_dashboard.py`：本地 HTTP 服务与数据聚合逻辑
- `finance_dashboard_ui.html`：战报前端页面
- `config/finance-dashboard.json`：默认运行配置
- `data/finance-dashboard.db`：独立数据库
- `deploy/`：小轻部署模板
- `deploy/deploy_prod.py`：一键部署到小轻 PROD

## 本地启动

```bash
cd gen-dashboard
bash launch_finance_dashboard.sh
```

默认入口：

- 页面：`http://127.0.0.1:47837/gen`
- 接口：`http://127.0.0.1:47837/gen/api/dashboard`
- 访问密码：`284611`

## 部署到 PROD

```bash
cd gen-dashboard
ZUTING_PROD_PASSWORD='你的生产密码' \
PYTHONPATH=/home/mark/codex-sandbox/.vendor-deploy \
python3 deploy/deploy_prod.py
```

默认会：

- 上传到 `/opt/zuting/gen-dashboard`
- 安装 `zuting-gen-dashboard.service`
- 把 `zuting.fszyl.top/gen` 反向代理到 `172.19.0.1:47837`
- 若启用了访问密码，会先自动登录，再校验 `https://zuting.fszyl.top/gen/api/dashboard`

## 重新从 Excel 种库

如果需要从新的 `.xls` 报表重建数据库：

```bash
cd gen-dashboard
python3 finance_dashboard.py seed-sqlite \
  --config config/finance-dashboard.json \
  --report-file /home/mark/Desktop/业务六部4月毛利表.xls \
  --sqlite-path data/finance-dashboard.db
```

## AI 配置

支持 OpenAI 兼容接口，建议用环境变量：

```bash
export AI_API_KEY=your_key
export PROVIDER=zuoyelang
export AI_BASE_URL=https://your-openai-compatible-endpoint/v1
export AI_MODEL=your-model-name
```

然后把 `config/finance-dashboard.json` 里的 `ai.enabled` 打开即可。
