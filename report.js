
const {
  countKeywords,
  buildTimeline,
  buildKeywordAssociations,
  buildThemeBarData,
  buildVerticalBarData
} = require("./analysis");

const {
  generatePsychologicalHypotheses
} = require("./psychology");

function createReport(records) {
  if (!Array.isArray(records)) {
    throw new TypeError(
      "recordsは配列が必要です"
    );
  }

  return {
    totalSearches: records.length,

    topKeywords:
      countKeywords(records).slice(0, 10),

    timeline:
      buildTimeline(records, {
        interval: "month"
      }),

    keywordAssociations:
      buildKeywordAssociations(records),

    keywordChart:
      buildVerticalBarData(records),

    themeChart:
      buildThemeBarData(records),

    psychologicalHypotheses:
      generatePsychologicalHypotheses(records),

    limitations: [
      "検索履歴は本人の考えや心理状態を直接示すものではありません。",
      "検索されなかったテーマを、関心がないと判断することはできません。",
      "心理的な仮説は診断・人格判定・本人の意図の断定に使用できません。"
    ]
  };
}

module.exports = {
  createReport
};
