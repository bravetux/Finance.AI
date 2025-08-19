export const safeParseJSON = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse JSON for key: ${key}`, e);
    return defaultValue;
  }
};

// Specific getters for commonly used data
export const getLiquidAssetsFromNetWorth = () => {
  const data = safeParseJSON('netWorthData', {});
  return (data.fixedDeposits || 0) + (data.debtFunds || 0) + (data.domesticStocks || 0) + 
         (data.domesticMutualFunds || 0) + (data.internationalFunds || 0) + (data.smallCases || 0) + 
         (data.savingsBalance || 0) + (data.preciousMetals || 0) + (data.cryptocurrency || 0) + (data.reits || 0);
};

export const getAnnualExpensesFromFinance = () => {
  const data = safeParseJSON('finance-data', {});
  return ((data.monthlyHouseholdExpense || 0) +
          (data.monthlyPpf || 0) +
          (data.monthlyUlip || 0) +
          (data.monthlyInsurance || 0) +
          (data.monthlyRds || 0) +
          (data.monthlyLoanEMIs || 0) +
          (data.monthlyDonation || 0) +
          (data.monthlyEntertainment || 0) +
          (data.monthlyTravel || 0) +
          (data.monthlyOthers || 0)) * 12;
};

export const getProjectedAccumulatedCorpus = () => {
  return safeParseJSON('projectedAccumulatedCorpus', 0);
};

export const getFutureValueSummaryData = () => {
  return safeParseJSON('futureValueSummary', { totalFutureValue: 0, averageROI: 0, ageAtGoal: 0, duration: 0 });
};

export const getRetirementCorpusMode = () => {
  const savedMode = localStorage.getItem('retirementCorpusMode');
  return savedMode === 'future' ? 'future' : 'now';
};

export const setRetirementCorpusMode = (mode: 'now' | 'future') => {
  localStorage.setItem('retirementCorpusMode', mode);
};

export const getFinanceData = () => {
  return safeParseJSON('finance-data', {});
};

export const getNetWorthData = () => {
  return safeParseJSON('netWorthData', {});
};

export const getGoalsData = () => {
  return safeParseJSON('goalsData', []);
};

export const getLiquidFutureValueTotal = () => {
  return safeParseJSON('liquidFutureValueTotal', 0);
};