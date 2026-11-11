
class ConsentRequiredError extends Error {
  constructor() {
    super(
      "履歴の保存・分析には本人の明示的な同意が必要です"
    );

    this.name = "ConsentRequiredError";
  }
}

class InMemoryHistoryStore {
  constructor() {
    this.consentByUser = new Set();
    this.recordsByUser = new Map();
  }

  grantConsent(userId) {
    if (!userId) {
      throw new TypeError("userIdが必要です");
    }

    this.consentByUser.add(userId);
  }

  revokeConsent(userId) {
    this.consentByUser.delete(userId);
  }

  save(userId, records) {
    if (!this.consentByUser.has(userId)) {
      throw new ConsentRequiredError();
    }

    if (!Array.isArray(records)) {
      throw new TypeError(
        "recordsは配列が必要です"
      );
    }

    this.recordsByUser.set(
      userId,
      [
        ...(this.recordsByUser.get(userId) || []),
        ...records
      ]
    );

    return this.recordsByUser.get(userId).length;
  }

  read(userId) {
    if (!this.consentByUser.has(userId)) {
      throw new ConsentRequiredError();
    }

    return [
      ...(this.recordsByUser.get(userId) || [])
    ];
  }

  deleteAll(userId) {
    this.recordsByUser.delete(userId);
    this.consentByUser.delete(userId);

    return true;
  }
}

module.exports = {
  InMemoryHistoryStore,
  ConsentRequiredError
};
