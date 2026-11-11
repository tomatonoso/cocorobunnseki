
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyKeyword,
  countKeywords,
  buildVerticalBarData,
  buildThemeBarData,
  buildTimeline,
  buildKeywordAssociations
} = require("../src/analysis");

const sample = [
  {
    keyword: "転職 方法",
    timestamp: "2026-01-02T00:00:00Z"
  },
  {
    keyword: "転職 方法",
    timestamp: "2026-01-20T00:00:00Z"
  },
  {
    keyword: "貯金 方法",
    timestamp: "2026-02-01T00:00:00Z"
  },
  {
    keyword: "英語 資格",
    timestamp: "2026-02-15T00:00:00Z"
  }
];

test("テーマ分類が一致する", () => {
  assert.ok(
    classifyKeyword("未経験 転職")
      .includes("仕事・キャリア")
  );
});

test("未知のキーワードは空分類", () => {
  assert.deepEqual(
    classifyKeyword("xyz qqq"),
    []
  );
});

test("キーワード頻度を降順で集計", () => {
  assert.equal(
    countKeywords(sample)[0].keyword,
    "転職 方法"
  );

  assert.equal(
    countKeywords(sample)[0].count,
    2
  );
});

test("縦棒グラフ形式のデータを生成", () => {
  const chart = buildVerticalBarData(sample);

  assert.equal(chart.type, "bar");
  assert.equal(chart.indexAxis, "x");

  assert.equal(
    chart.labels[0],
    "転職 方法"
  );

  assert.equal(
    chart.datasets[0].data[0],
    2
  );
});

test("縦棒グラフの表示件数を制限", () => {
  assert.equal(
    buildVerticalBarData(
      sample,
      { limit: 1 }
    ).labels.length,
    1
  );
});

test("グラフlimitが不正ならエラー", () => {
  assert.throws(
    () => buildVerticalBarData(
      sample,
      { limit: 0 }
    ),
    /limit/
  );
});

test("テーマ別の縦棒グラフを生成", () => {
  const chart = buildThemeBarData(sample);

  assert.equal(chart.type, "bar");

  assert.ok(
    chart.labels.includes("仕事・キャリア")
  );
});

test("月単位の時系列集計", () => {
  assert.deepEqual(
    buildTimeline(sample),
    [
      { period: "2026-01", count: 2 },
      { period: "2026-02", count: 2 }
    ]
  );
});

test("年単位の時系列集計", () => {
  assert.deepEqual(
    buildTimeline(
      sample,
      { interval: "year" }
    ),
    [
      { period: "2026", count: 4 }
    ]
  );
});

test("日単位の時系列集計", () => {
  assert.equal(
    buildTimeline(
      sample,
      { interval: "day" }
    ).length,
    4
  );
});

test("不正な時系列単位を拒否", () => {
  assert.throws(
    () => buildTimeline(
      sample,
      { interval: "week" }
    ),
    /interval/
  );
});

test("同一検索語内の関連キーワードペアを集計", () => {
  const pairs = buildKeywordAssociations(sample);

  assert.ok(
    pairs.some(p =>
      [p.keywordA, p.keywordB].includes("方法") &&
      [p.keywordA, p.keywordB].includes("転職") &&
      p.count === 2
    )
  );
});

test("キーワードペアの重複トークンを二重計上しない", () => {
  const pairs = buildKeywordAssociations([
    {
      keyword: "英語 英語 勉強",
      timestamp: "2026-01-01"
    }
  ]);

  assert.equal(
    pairs.filter(p =>
      p.keywordA === "英語" &&
      p.keywordB === "勉強"
    ).length,
    1
  );
});

test("空履歴でもグラフ生成可能", () => {
  assert.deepEqual(
    buildVerticalBarData([]).labels,
    []
  );
});
