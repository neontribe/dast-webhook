class ResultsCalculator {
  constructor(res, session) {
    this.res = res;
    this.session = session;
    this.answers = Object.values(this.session.scoreInteractions);
    this.drugCategories = Object.keys(this.session.drugInteractions);
  }

  countAnswers(array, searchTerm) {
    this.answers.reduce(function(n, val) {
      return n + (val === searchTerm);
    }, 0);
  }

  resultSummary(text) {
    const result = {
      responses: [
        {
          type: "text",
          elements: [text]
        }
      ]
    };
    return this.res.json(result);
  }

  dailyUse() {
    return (
      this.session.useInteractions.usageFrequencyAnswer !== "daily/almost daily"
    );
  }

  weeklyUseOfSpecificCategories() {
    return (
      this.session.useInteractions.usageFrequencyAnswer === "weekly" &&
      (this.drugCategories.includes("methamphetamines") ||
        this.drugCategories.includes("cocaine") ||
        this.drugCategories.includes("narcotics"))
    );
  }

  injectionHistory() {
    return (
      this.session.useInteractions.injectionAnswer !== "in the past 90 days"
    );
  }

  recentTreatment() {
    return this.session.useInteractions.treatmentAnswer !== "currently";
  }

  evaluate() {
    switch (true) {
      case countAnswers(this.answers, "yes") === 0:
        resultSummary("healthy - no action required");
        break;

      case countAnswers(this.answers, "yes") >= 3 &&
        countAnswers(this.answers, "yes") < 6:
        resultSummary("harmful - brief intervention/brief treatment");
        break;

      case countAnswers(this.answers, "yes") >= 6:
        resultSummary("dependant - refer to specialised treatment");
        break;

      case countAnswers(this.answers, "yes") > 0 &&
        countAnswers(this.answers, "yes") <= 2 &&
        (dailyUse() ||
          weeklyUseOfSpecificCategories() ||
          injectionHistory() ||
          recentTreatment()):
        resultSummary("risky - brief intervention");
        break;

      default:
        resultSummary("risky - advise");
        break;
    }
  }
}

module.exports = ResultsCalculator;
