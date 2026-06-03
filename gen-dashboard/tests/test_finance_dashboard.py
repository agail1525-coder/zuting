import json
import tempfile
import unittest
from pathlib import Path

import finance_dashboard


class FinanceDashboardTests(unittest.TestCase):
    def test_percent_parser_handles_ratio_and_percent_text(self) -> None:
        self.assertAlmostEqual(finance_dashboard.to_percent("12.5%"), 0.125)
        self.assertAlmostEqual(finance_dashboard.to_percent(0.32), 0.32)
        self.assertAlmostEqual(finance_dashboard.to_percent(18), 0.18)

    def test_primary_owner_picks_first_non_empty_role(self) -> None:
        row = {"接团计调": "", "操作计调": "王丽", "报名计调": "张敏"}
        self.assertEqual(finance_dashboard.derive_primary_owner(row), "王丽")

    def test_dashboard_payload_aggregates_core_metrics(self) -> None:
        records = [
            {
                "department": "业务六部",
                "travellers": 10.0,
                "revenue": 10000.0,
                "cost": 8000.0,
                "profit": 2000.0,
                "margin": 0.2,
                "primary_owner": "李钟根",
                "line": "深圳精品团",
                "destination": "广东",
                "source_region": "深圳",
                "tour_no": "A1",
                "customer": "客户甲",
                "start_date": "2026-04-01",
                "business_type": "业务部款项",
                "receiving_coordinator": "李钟根",
                "operations_coordinator": "",
                "signup_coordinator": "",
                "outreach": "",
                "guide": "",
            },
            {
                "department": "业务六部",
                "travellers": 5.0,
                "revenue": 6000.0,
                "cost": 4200.0,
                "profit": 1800.0,
                "margin": 0.3,
                "primary_owner": "王丽",
                "line": "珠海高毛利团",
                "destination": "广东",
                "source_region": "珠海",
                "tour_no": "B2",
                "customer": "客户乙",
                "start_date": "2026-04-02",
                "business_type": "业务部款项",
                "receiving_coordinator": "王丽",
                "operations_coordinator": "",
                "signup_coordinator": "",
                "outreach": "",
                "guide": "",
            },
        ]
        payload = finance_dashboard.build_dashboard_payload_from_records(
            records,
            {
                "title": "测试战报",
                "period_text": "日期：2026-04-01到2026-04-30",
                "period_start": "2026-04-01",
                "period_end": "2026-04-30",
                "export_time": "2026-05-26 15:41",
            },
            {
                "path": "/tmp/report.xls",
                "name": "report.xls",
                "mtime": "2026-05-26 15:41:00",
                "generated_at": "2026-05-26 16:00:00",
            },
            15,
            {"configured": False, "provider": "未配置", "model": "未配置", "base_url": ""},
        )
        self.assertEqual(payload["summary"]["groups"], 2)
        self.assertAlmostEqual(payload["summary"]["revenue"], 16000.0)
        self.assertAlmostEqual(payload["summary"]["profit"], 3800.0)
        self.assertEqual(payload["spotlight"]["best_profit_group"]["tour_no"], "A1")
        self.assertEqual(payload["spotlight"]["best_margin_group"]["tour_no"], "B2")
        self.assertEqual(payload["leaderboards"]["owner_board"][0]["label"], "李钟根")
        self.assertEqual(payload["leaderboards"]["source_region_board"][0]["label"], "深圳")
        self.assertIn("累计创收", payload["briefing"]["fallback_text"])
        self.assertTrue(payload["briefing"]["fallback_analysis"]["route_focus"])

    def test_decrypt_zuoyelang_api_key(self) -> None:
        decrypted = finance_dashboard.decrypt_zuoyelang_api_key(
            "2YXwKX9F1jml7r+okgbzR8UWkW0sC+Regcpu8KMD+HlL9CM=.gYuWV9tXAItd7xbOTiNcgg==",
            "DwRs7BA7KdvC58sW",
            "302fbef1c6d8cb0823b478ecc32309f7",
        )
        self.assertEqual(decrypted, "sk-445d8ffc788d4779a8fc9b188c65707e")

    def test_build_record_from_form_input_generates_tour_no_and_profit(self) -> None:
        parsed_report = {
            "headers": finance_dashboard.STANDARD_HEADERS,
            "records": [
                {
                    "tour_no": "260501-1A",
                    "business_type": "业务部款项",
                    "department": "业务六部",
                }
            ],
        }
        record = finance_dashboard.build_record_from_form_input(
            {
                "start_date": "2026-05-01",
                "customer": "客户甲",
                "line": "广州精品团",
                "revenue": "10000",
                "cost": "8350.50",
                "adults": "8",
                "children": "2",
            },
            parsed_report,
        )
        self.assertEqual(record["tour_no"], "260501-2A")
        self.assertEqual(record["department"], "业务六部")
        self.assertAlmostEqual(record["profit"], 1649.5)
        self.assertAlmostEqual(record["margin"], 0.16495)
        self.assertEqual(record["travellers"], 10)

    def test_report_path_from_config_prefers_config_when_cli_uses_default(self) -> None:
        config = {"report_path": "/tmp/custom-report.xls"}
        resolved = finance_dashboard.report_path_from_config(config, finance_dashboard.DEFAULT_REPORT_PATH)
        self.assertEqual(resolved, Path("/tmp/custom-report.xls"))

    def test_access_password_helpers(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_path = Path(temp_dir) / "finance-dashboard.json"
            config_path.write_text(
                '{"storage":"sqlite","sqlite_path":"./data.db","base_path":"/gen","access_password":"666666"}',
                encoding="utf-8",
            )
            app = finance_dashboard.FinanceDashboardApp(Path("/tmp/report.xls"), config_path)

        self.assertTrue(app.auth_required())
        self.assertTrue(app.verify_password("666666"))
        self.assertFalse(app.verify_password("123456"))
        cookie_header = f"{app.cookie_name}={app.auth_token()}"
        self.assertTrue(app.is_authenticated(cookie_header))
        self.assertFalse(app.is_authenticated(f"{app.cookie_name}=bad-token"))
        self.assertEqual(app.normalize_redirect_target("/gen/api/dashboard"), "/gen/api/dashboard")
        self.assertEqual(app.normalize_redirect_target("https://evil.example"), "/gen")

    def test_compare_page_template_uses_base_path(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_path = Path(temp_dir) / "finance-dashboard.json"
            config_path.write_text('{"storage":"sqlite","sqlite_path":"./data.db","base_path":"/gen"}', encoding="utf-8")
            app = finance_dashboard.FinanceDashboardApp(Path("/tmp/report.xls"), config_path)

        html = app.render_compare_html()
        self.assertIn("月度经营对比分析", html)
        self.assertIn("const BASE_PATH = '/gen'", html)
        self.assertIn('id="revenue-profit-chart"', html)

    def test_append_record_to_report_rewrites_xls(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            report_path = Path(temp_dir) / "test-report.xls"
            initial_record = finance_dashboard.build_record_from_form_input(
                {
                    "tour_no": "260401-1A",
                    "business_type": "业务部款项",
                    "department": "业务六部",
                    "start_date": "2026-04-01",
                    "end_date": "2026-04-03",
                    "customer": "客户甲",
                    "line": "深圳精品团",
                    "destination": "广东",
                    "adults": "8",
                    "revenue": "10000",
                    "cost": "8000",
                    "receiving_coordinator": "李钟根",
                },
                {"headers": finance_dashboard.STANDARD_HEADERS, "records": []},
            )
            finance_dashboard.write_report_file(
                report_path,
                "测试利润表",
                [initial_record],
                finance_dashboard.STANDARD_HEADERS,
            )

            result = finance_dashboard.append_record_to_report(
                report_path,
                {
                    "start_date": "2026-04-05",
                    "customer": "客户乙",
                    "line": "珠海高毛利团",
                    "destination": "广东",
                    "adults": "5",
                    "elders": "1",
                    "children": "1",
                    "revenue": "6200",
                    "cost": "4100.25",
                    "receiving_coordinator": "王丽",
                },
            )

            parsed = finance_dashboard.parse_report(report_path)
            self.assertEqual(result["record"]["customer"], "客户乙")
            self.assertEqual(len(parsed["records"]), 2)
            self.assertEqual(parsed["records"][1]["tour_no"], "260405-1A")
            self.assertAlmostEqual(parsed["records"][1]["profit"], 2099.75)
            self.assertTrue(parsed["export_time"])
            self.assertAlmostEqual(parsed["total_row"]["合计利润"], 4099.75)

    def test_sqlite_dashboard_defaults_to_latest_month_and_allows_all_months(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            sqlite_path = Path(temp_dir) / "finance-dashboard.db"
            config_path = Path(temp_dir) / "finance-dashboard.json"
            config_path.write_text(
                json.dumps(
                    {
                        "storage": "sqlite",
                        "sqlite_path": str(sqlite_path),
                        "base_path": "/gen",
                        "access_password": "666666",
                    }
                ),
                encoding="utf-8",
            )
            records = []
            for item in (
                {
                    "tour_no": "260401-1A",
                    "start_date": "2026-04-01",
                    "customer": "四月客户",
                    "line": "深圳精品团",
                    "revenue": "10000",
                    "cost": "8000",
                },
                {
                    "tour_no": "260501-1A",
                    "start_date": "2026-05-01",
                    "customer": "五月客户",
                    "line": "珠海精品团",
                    "revenue": "12000",
                    "cost": "9000",
                },
            ):
                records.append(
                    finance_dashboard.build_record_from_form_input(
                        {
                            "business_type": "业务部款项",
                            "department": "业务六部",
                            "destination": "广东",
                            "adults": "8",
                            "receiving_coordinator": "李钟根",
                            **item,
                        },
                        {"headers": finance_dashboard.STANDARD_HEADERS, "records": records},
                    )
                )
            finance_dashboard.replace_sqlite_records(sqlite_path, "测试利润表", records)

            latest = finance_dashboard.load_dashboard_payload(Path("/tmp/report.xls"), config_path)
            self.assertEqual(latest["report"]["selected_month"], "2026-05")
            self.assertEqual(latest["summary"]["groups"], 1)
            self.assertAlmostEqual(latest["summary"]["profit"], 3000.0)
            self.assertEqual([item["value"] for item in latest["report"]["available_months"]], ["2026-04", "2026-05"])
            self.assertEqual([item["month"] for item in latest["analytics"]["monthly_series"]], ["2026-04", "2026-05"])
            self.assertEqual(latest["analytics"]["comparison"]["previous_month"], "2026-04")
            self.assertTrue(latest["analytics"]["comparison"]["cards"])
            self.assertIn("lines", latest["analytics"]["dimension_comparison"])
            self.assertIn("2026年5月较2026年4月", latest["analytics"]["coaching"]["headline"])

            april = finance_dashboard.load_dashboard_payload(Path("/tmp/report.xls"), config_path, "2026-04")
            self.assertEqual(april["report"]["selected_month"], "2026-04")
            self.assertAlmostEqual(april["summary"]["profit"], 2000.0)

            all_months = finance_dashboard.load_dashboard_payload(Path("/tmp/report.xls"), config_path, "all")
            self.assertEqual(all_months["report"]["selected_month"], "all")
            self.assertEqual(all_months["summary"]["groups"], 2)
            self.assertAlmostEqual(all_months["summary"]["profit"], 5000.0)

    def test_seed_sqlite_and_append_record_roundtrip(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            report_path = Path(temp_dir) / "seed-report.xls"
            sqlite_path = Path(temp_dir) / "finance-dashboard.db"
            initial_record = finance_dashboard.build_record_from_form_input(
                {
                    "tour_no": "260401-1A",
                    "business_type": "业务部款项",
                    "department": "业务六部",
                    "start_date": "2026-04-01",
                    "customer": "客户甲",
                    "line": "深圳精品团",
                    "destination": "广东",
                    "adults": "8",
                    "revenue": "10000",
                    "cost": "8000",
                    "receiving_coordinator": "李钟根",
                },
                {"headers": finance_dashboard.STANDARD_HEADERS, "records": []},
            )
            finance_dashboard.write_report_file(
                report_path,
                "测试利润表",
                [initial_record],
                finance_dashboard.STANDARD_HEADERS,
            )

            seeded = finance_dashboard.seed_sqlite_from_report(report_path, sqlite_path)
            self.assertTrue(seeded["ok"])
            self.assertEqual(seeded["records"], 1)

            finance_dashboard.append_record_to_sqlite(
                sqlite_path,
                {
                    "start_date": "2026-04-05",
                    "customer": "客户乙",
                    "line": "珠海高毛利团",
                    "destination": "广东",
                    "adults": "5",
                    "elders": "1",
                    "children": "1",
                    "revenue": "6200",
                    "cost": "4100.25",
                    "receiving_coordinator": "王丽",
                },
                "测试利润表",
            )

            parsed = finance_dashboard.load_report_from_sqlite(sqlite_path, "测试利润表")
            self.assertEqual(len(parsed["records"]), 2)
            self.assertEqual(parsed["records"][1]["tour_no"], "260405-1A")
            self.assertAlmostEqual(parsed["records"][1]["profit"], 2099.75)


if __name__ == "__main__":
    unittest.main()
