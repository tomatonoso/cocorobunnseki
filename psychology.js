
const SIGNALS = [
  {
    id: "information_seeking",
    label: "情報収集・比較検討の傾向",
    terms: [
      "比較", "おすすめ", "ランキング",
      "違い", "メリット", "デメリット"
    ]
  },
  {
    id: "problem_solving",
    label: "課題解決を目指す検索傾向",
    terms: [
      "方法", "直し方", "解決",
      "対策", "手順"
    ]
  },
  {
    id: "future_planning",
    label: "将来に向けた準備の可能性",
    terms: [
      "将来", "準備", "計画",
      "資格", "転職", "貯金"
    ]
  },
  {
    id: "reassurance_seeking",
    label: "安心材料を探している可能性",
    terms: [
      "大丈夫", "不安", "心配",
      "安全", "危険性"
    ]
  }
];

function generatePsychologicalHypotheses(records) {
  const text = records
    .map(item => item.keyword)
    .join(" ");

  const total = records.length;

  if (!total) return [];

  return SIGNALS
    .map(signal => {
      const evidence = signal.terms.filter(term =>
        text.includes(term)
      );

      if (!evidence.length) return null;

      const matchingRecords = records.filter(record =>
        signal.terms.some(term =>
          record.keyword.includes(term)
        )
      );

      const ratio = matchingRecords.length / total;

      return {
        id: signal.id,
        label: signal.label,

        confidence:
          ratio >= 0.3 && matchingRecords.length >= 3
            ? "中程度"
            : "低め",

        evidence: evidence.slice(0, 5),

        evidenceCount: matchingRecords.length,

        alternativeInterpretation:
          "一時的な調査、学習、仕事上の必要など、心理状態以外の理由でも説明できます。",

        disclaimer:
          "検索履歴からの限定的な仮説です。本人の心理状態・性格・診断を確定するものではありません。"
      };
    })
    .filter(Boolean);
}

module.exports = {
  generatePsychologicalHypotheses
};
