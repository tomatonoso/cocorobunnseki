
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  extractSearchKeyword,
  normalizeHistory,
  importHistoryJson
} = require("../src/history");

test("Google検索URLから日本語キーワードを抽出", () => {
  assert.equal(
    extractSearchKeyword(
      "https://www.google.com/search?q=%E8%B2%AF%E9%87%91+%E6%96%B9%E6%B3%95"
    ),
    "貯金 方法"
  );
});

test("Google日本ドメインを処理", () => {
  assert.equal(
    extractSearchKeyword(
      "https://www.google.co.jp/search?q=転職"
    ),
    "転職"
  );
});

test("Bing検索を処理", () => {
  assert.equal(
    extractSearchKeyword(
      "https://www.bing.com/search?q=JavaScript"
    ),
    "JavaScript"
  );
});

test("Yahoo! Japan検索を処理", () => {
  assert.equal(
    extractSearchKeyword(
      "https://search.yahoo.co.jp/search?p=引っ越し"
    ),
    "引っ越し"
  );
});

test("検索以外のURLはnull", () => {
  assert.equal(
    extractSearchKeyword(
      "https://www.google.com/maps"
    ),
    null
  );
});

test("不正URLはnull", () => {
  assert.equal(
    extractSearchKeyword("not a url"),
    null
  );
});

test("履歴を正規化して時系列に並べる", () => {
  const rows = normalizeHistory([
    {
      url: "https://www.google.com/search?q=B",
      timestamp: "2026-02-01T00:00:00Z"
    },
    {
      url: "https://www.google.com/search?q=A",
      timestamp: "2026-01-01T00:00:00Z"
    }
  ]);

  assert.equal(rows[0].keyword, "A");
  assert.equal(rows.length, 2);
});

test("同じIDの重複を除去", () => {
  const rows = normalizeHistory([
    {
      id: "x",
      keyword: "検索",
      timestamp: "2026-01-01"
    },
    {
      id: "x",
      keyword: "検索",
      timestamp: "2026-01-01"
    }
  ]);

  assert.equal(rows.length, 1);
});

test("検索語がない通常ページは除外", () => {
  assert.deepEqual(
    normalizeHistory([
      {
        url: "https://example.com",
        timestamp: "2026-01-01"
      }
    ]),
    []
  );
});

test("日時欠損はエラー", () => {
  assert.throws(
    () => normalizeHistory([
      { keyword: "検索" }
    ]),
    /日時/
  );
});

test("配列以外の入力はエラー", () => {
  assert.throws(
    () => normalizeHistory({}),
    /配列/
  );
});

test("不正JSONを拒否", () => {
  assert.throws(
    () => importHistoryJson("{bad"),
    /JSON/
  );
});

test("JSON文字列をインポート", () => {
  const rows = importHistoryJson(
    '[{"keyword":"英語 勉強","timestamp":"2026-01-01"}]'
  );

  assert.equal(rows[0].keyword, "英語 勉強");
});
