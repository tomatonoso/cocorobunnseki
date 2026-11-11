
const {
  normalizeHistory
} = require("./history");

function createChromeHistoryAdapter(chromeApi) {
  if (!chromeApi?.history?.search) {
    throw new TypeError(
      "Chrome History APIが利用できません"
    );
  }

  return {
    async getSearchHistory({
      startTime = 0,
      endTime = Date.now(),
      maxResults = 1000
    } = {}) {

      if (
        !Number.isFinite(startTime) ||
        !Number.isFinite(endTime) ||
        startTime > endTime
      ) {
        throw new RangeError(
          "取得期間が正しくありません"
        );
      }

      if (
        !Number.isInteger(maxResults) ||
        maxResults < 1 ||
        maxResults > 10000
      ) {
        throw new RangeError(
          "maxResultsは1〜10000の整数で指定してください"
        );
      }

      const items = await new Promise((resolve, reject) => {
        chromeApi.history.search(
          {
            text: "",
            startTime,
            endTime,
            maxResults
          },
          result => {
            const error = chromeApi.runtime?.lastError;

            if (error) {
              reject(
                new Error(
                  error.message ||
                  "Chrome History API error"
                )
              );
            } else {
              resolve(result || []);
            }
          }
        );
      });

      return normalizeHistory(
        items.map(item => ({
          id: item.id,
          url: item.url,
          lastVisitTime: item.lastVisitTime,
          source: "chrome"
        }))
      );
    }
  };
}

module.exports = {
  createChromeHistoryAdapter
};
