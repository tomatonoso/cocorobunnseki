
const SEARCH_ENGINES = [
  {
    hosts: [
      "google.com",
      "www.google.com",
      "google.co.jp",
      "www.google.co.jp"
    ],
    params: ["q"]
  },
  {
    hosts: ["bing.com", "www.bing.com"],
    params: ["q"]
  },
  {
    hosts: ["search.yahoo.co.jp"],
    params: ["p"]
  },
  {
    hosts: ["yahoo.com", "search.yahoo.com"],
    params: ["p", "q"]
  }
];

function extractSearchKeyword(rawUrl) {
  try {
    const url = new URL(rawUrl);

    const engine = SEARCH_ENGINES.find(item =>
      item.hosts.includes(url.hostname.toLowerCase())
    );

    if (!engine || !/\/search\/?$/.test(url.pathname)) {
      return null;
    }

    for (const key of engine.params) {
      const value = url.searchParams.get(key);

      if (value && value.trim()) {
        return value.trim().replace(/\s+/g, " ");
      }
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeHistoryRecord(record) {
  if (!record || typeof record !== "object") {
    throw new TypeError(
      "履歴レコードはオブジェクトである必要があります"
    );
  }

  const url = typeof record.url === "string"
    ? record.url
    : "";

  const keyword =
    typeof record.keyword === "string" &&
    record.keyword.trim()
      ? record.keyword.trim().replace(/\s+/g, " ")
      : extractSearchKeyword(url);

  if (!keyword) return null;

  const date = new Date(
    record.timestamp ?? record.lastVisitTime ?? NaN
  );

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("有効な検索日時が必要です");
  }

  return {
    id: String(
      record.id ??
      `${date.toISOString()}|${keyword}|${url}`
    ),
    keyword,
    timestamp: date.toISOString(),
    source: String(
      record.source ?? safeHost(url) ?? "import"
    ),
    url
  };
}

function safeHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function normalizeHistory(records) {
  if (!Array.isArray(records)) {
    throw new TypeError(
      "履歴は配列である必要があります"
    );
  }

  const seen = new Set();
  const normalized = [];

  for (const record of records) {
    const item = normalizeHistoryRecord(record);

    if (!item) continue;

    const key = item.id;

    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(item);
  }

  return normalized.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
}

function importHistoryJson(input) {
  let parsed;

  try {
    parsed = typeof input === "string"
      ? JSON.parse(input)
      : input;
  } catch {
    throw new SyntaxError(
      "JSON形式が正しくありません"
    );
  }

  return normalizeHistory(parsed);
}

module.exports = {
  extractSearchKeyword,
  normalizeHistoryRecord,
  normalizeHistory,
  importHistoryJson
};
