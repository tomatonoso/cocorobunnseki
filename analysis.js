
const THEME_RULES = [
  {
    theme: "仕事・キャリア",
    words: [
      "転職", "就職", "履歴書",
      "面接", "仕事", "キャリア"
    ]
  },
  {
    theme: "お金・家計",
    words: [
      "貯金", "節約", "家計",
      "投資", "ローン", "お金"
    ]
  },
  {
    theme: "住まい・生活",
    words: [
      "一人暮らし", "引っ越し",
      "賃貸", "家賃", "家具", "生活費"
    ]
  },
  {
    theme: "学習・スキル",
    words: [
      "勉強", "資格", "英語",
      "プログラミング", "学習", "試験"
    ]
  },
  {
    theme: "健康・セルフケア",
    words: [
      "睡眠", "運動", "食事",
      "疲れ", "健康", "休息"
    ]
  },
  {
    theme: "人間関係",
    words: [
      "友人", "友達", "会話",
      "人間関係", "コミュニケーション"
    ]
  },
  {
    theme: "趣味・娯楽",
    words: [
      "ゲーム", "旅行", "映画",
      "音楽", "趣味"
    ]
  }
];

function classifyKeyword(keyword) {
  const text = String(keyword ?? "").toLowerCase();

  const matches = THEME_RULES.filter(rule =>
    rule.words.some(word => text.includes(word))
  );

  return matches
    .map(item => item.theme)
    .slice(0, 3);
}

function countKeywords(records) {
  const counts = new Map();

  for (const record of records) {
    const key = record.keyword;

    counts.set(
      key,
      (counts.get(key) || 0) + 1
    );
  }

  return [...counts.entries()]
    .map(([keyword, count]) => ({
      keyword,
      count
    }))
    .sort((a, b) =>
      b.count - a.count ||
      a.keyword.localeCompare(b.keyword, "ja")
    );
}

function buildVerticalBarData(
  records,
  { limit = 20 } = {}
) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(
      "limitは1以上の整数が必要です"
    );
  }

  const rows = countKeywords(records).slice(0, limit);

  return {
    type: "bar",
    indexAxis: "x",
    labels: rows.map(row => row.keyword),
    datasets: [
      {
        label: "検索回数",
        data: rows.map(row => row.count)
      }
    ]
  };
}

function buildThemeBarData(records) {
  const counts = new Map();

  for (const record of records) {
    for (const theme of classifyKeyword(record.keyword)) {
      counts.set(
        theme,
        (counts.get(theme) || 0) + 1
      );
    }
  }

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1]);

  return {
    type: "bar",
    indexAxis: "x",
    labels: rows.map(row => row[0]),
    datasets: [
      {
        label: "テーマ別検索回数",
        data: rows.map(row => row[1])
      }
    ]
  };
}

function buildTimeline(
  records,
  { interval = "month" } = {}
) {
  if (!["day", "month", "year"].includes(interval)) {
    throw new RangeError(
      "intervalが不正です"
    );
  }

  const counts = new Map();

  for (const record of records) {
    const d = new Date(record.timestamp);

    const key =
      interval === "year"
        ? String(d.getUTCFullYear())
        : interval === "month"
          ? `${d.getUTCFullYear()}-${String(
              d.getUTCMonth() + 1
            ).padStart(2, "0")}`
          : d.toISOString().slice(0, 10);

    counts.set(
      key,
      (counts.get(key) || 0) + 1
    );
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({
      period,
      count
    }));
}

function buildKeywordAssociations(records) {
  const counts = new Map();

  const wordsByQuery = records.map(record => {
    const tokens = String(record.keyword)
      .toLowerCase()
      .split(/[\s　、,・/]+/)
      .filter(token => token.length >= 2);

    return [...new Set(tokens)];
  });

  for (const words of wordsByQuery) {
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const pair = [words[i], words[j]]
          .sort((a, b) => a.localeCompare(b, "ja"));

        const key = pair.join("::");

        counts.set(
          key,
          (counts.get(key) || 0) + 1
        );
      }
    }
  }

  return [...counts.entries()]
    .map(([pair, count]) => {
      const [keywordA, keywordB] = pair.split("::");

      return {
        keywordA,
        keywordB,
        count
      };
    })
    .sort((a, b) =>
      b.count - a.count ||
      a.keywordA.localeCompare(b.keywordA, "ja")
    );
}

module.exports = {
  classifyKeyword,
  countKeywords,
  buildVerticalBarData,
  buildThemeBarData,
  buildTimeline,
  buildKeywordAssociations
};

