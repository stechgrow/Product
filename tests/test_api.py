from app.core.config import settings


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_eda_overview(client):
    r = client.get("/eda/sample.csv")
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]["total_rows"] == 5
    assert body["correlation"]["labels"] == ["Sales", "Profit", "Units"]


def test_kpis_endpoint(client):
    r = client.get("/analysis/sample.csv/kpis")
    assert r.status_code == 200
    assert r.json()["metrics"]["total_sales"]["value"] == 1500


def test_status_from_change(client):
    r = client.get("/analysis/sample.csv/kpis", params={"period": "month"})
    assert r.json()["business_status"] == "Growth"    # 1200 vs 300 = +300%


def test_insights_and_affected(client):
    ins = client.get("/analysis/sample.csv/insights").json()
    assert ins["insights"][0]["key"] == "top_product"
    assert client.get("/analysis/sample.csv/affected").status_code == 200


def test_dashboard(client):
    r = client.get("/dashboard/sample.csv")
    assert r.status_code == 200
    body = r.json()
    assert body["kpis"]["total_sales"]["value"] == 1500
    assert body["charts"]["sales_by_country"]["labels"][0] == "USA"
    assert "sales_by_segment" in body["unavailable"]


def test_bad_period_is_rejected(client):
    assert client.get("/dashboard/sample.csv", params={"period": "decade"}).status_code == 422


def test_missing_file_is_404(client):
    assert client.get("/eda/nope.csv").status_code == 404


def test_path_trick_is_blocked(client):
    assert client.get("/eda/..%2Fsecret.csv").status_code in (400, 404)


def test_empty_file_is_422(client):
    (settings.upload_dir / "empty.csv").write_text("a,b\n")
    assert client.get("/eda/empty.csv").status_code == 422


def test_text_only_file_does_not_crash(client):
    (settings.upload_dir / "text.csv").write_text("name,city\nA,X\nB,Y\nC,Z\nD,X\nE,Y\n")
    for url in ("/eda/text.csv", "/dashboard/text.csv", "/analysis/text.csv/kpis",
                "/analysis/text.csv/insights", "/cleaning/text.csv/report"):
        assert client.get(url).status_code == 200, url


def test_cleaning_apply_saves_copy(client):
    r = client.post("/cleaning/sample.csv/apply")
    assert r.status_code == 200
    assert (settings.cleaned_dir / r.json()["cleaned_file"]).exists()
    assert (settings.upload_dir / "sample.csv").exists()   # original still there
