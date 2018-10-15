class ResultsCalculator {
  constructor(session) {
    this.session = session;
    this.answers = Object.values(this.session.scoreInteractions);
    this.drugCategories = Object.keys(this.session.drugInteractions);
    this.results = {
      healthy: "healthy - no action required",
      riskyAdvice: "risky - advise",
      riskyIntervention: "risky - brief intervention",
      harmful: "harmful - brief intervention/brief treatment",
      dependant: "dependant - refer to specialised treatment"
    };
  }

  countAnswers(array, searchTerm) {
    return array.reduce(function(n, val) {
      return n + (val === searchTerm);
    }, 0);
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
      case this.countAnswers(this.answers, "yes") === 0:
        return this.results.healthy;
        break;

      case this.countAnswers(this.answers, "yes") > 0 &&
        this.countAnswers(this.answers, "yes") <= 2 &&
        (this.dailyUse() ||
          this.weeklyUseOfSpecificCategories() ||
          this.injectionHistory() ||
          this.recentTreatment()):
        return this.results.riskyIntervention;
        break;

      case this.countAnswers(this.answers, "yes") >= 3 &&
        this.countAnswers(this.answers, "yes") < 6:
        return this.results.harmful;
        break;

      case this.countAnswers(this.answers, "yes") >= 6:
        return this.results.dependant
        break;

      default:
        return this.results.riskyAdvice;
        break;
    }
  }
}

module.exports = ResultsCalculator;
