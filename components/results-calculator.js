class ResultsCalculator {
  constructor(session) {
    this.session = session;
    this.answers = Object.values(this.session.scoreInteractions);
    this.drugCategories = Object.keys(this.session.drugInteractions);
    this.results = {
      healthy: "Your drug use is not having much negative impact on your well being.  But if you would like to talk about some tips to stay safe please  have a chat",
      riskyAdvice: "Your drug use would be classed as risky.  You can chat with one of our advisors on ways to stay safe or check out the resources page for tips.",
      riskyIntervention: "Your drug use would be classed as Risky - You can chat with one of our advisors on ways to stay safe or check out the resources page for tips.",
      harmful: "Your drug use is classed as Harmful.  It is having an impact on your well being.   If you would like to chat this through with someone anonymously  or tips on reducing the harm of drugs.",
      dependant: "Your drug use is having a significant impact on your well being.  You may benefit from medical input or having a chat with a professional."
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
      (this.drugCategories.includes("speed") ||
        this.drugCategories.includes("cocaine") ||
        this.drugCategories.includes("opiates"))
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
