// Define interfaces for the data structures
interface NetWorthData {
  homeValue: number;
  otherRealEstate: number;
  jewellery: number;
  sovereignGoldBonds: number;
  ulipsSurrenderValue: number;
  epfPpfVpf: number;
  fixedDeposits: number;
  debtFunds: number;
  domesticStocks: number;
  domesticMutualFunds: number;
  internationalFunds: number;
  smallCases: number;
  savingsBalance: number;
  preciousMetals: number;
  cryptocurrency: number;
  reits: number;
  homeLoan: number;
  educationLoan: number;
  carLoan: number;
  personalLoan: number;
  creditCardDues: number;
  otherLiabilities: number;
}

interface FinanceData {
  postTaxSalaryIncome: number;
  businessIncome: number;
  rentalProperty1: number;
  rentalProperty2: number;
  rentalProperty3: number;
  fdInterest: number;
  bondIncome: number;
  dividendIncome: number;
  monthlyHouseholdExpense: number;
  monthlyPpf: number;
  monthlyUlip: number;
  monthlyInsurance: number;
  monthlyRds: number;
  monthlyLoanEMIs: number;
  monthlyDonation: number;
  monthlyEntertainment: number;
  monthlyTravel: number;
  monthlyOthers: number;
}

// Default state objects
const defaultNetWorthData: NetWorthData = {
  homeValue: 0, otherRealEstate: 0, jewellery: 0, sovereignGoldBonds: 0,
  ulipsSurrenderValue: 0, epfPpfVpf: 0, fixedDeposits: 0, debtFunds: 0,
  domesticStocks: 0, domesticMutualFunds: 0, internationalFunds: 0,
  smallCases: 0, savingsBalance: 0, preciousMetals: 0, cryptocurrency: 0,
  reits: 0, homeLoan: 0, educationLoan: 0, carLoan: 0, personalLoan: 0,
  creditCardDues: 0, otherLiabilities: 0
};

const defaultFinanceData: FinanceData = {
  postTaxSalaryIncome: 0, businessIncome: 0, rentalProperty1: 0,
  rentalProperty2: 0, rentalProperty3: 0, fdInterest: 0, bondIncome: 0,
  dividendIncome: 0, monthlyHouseholdExpense: 0, monthlyPpf: 0,
  monthlyUlip: 0, monthlyInsurance: 0, monthlyRds: 0, monthlyLoanEMIs: 0,
  monthlyDonation: 0, monthlyEntertainment: 0, monthlyTravel: 0,
  monthlyOthers: 0
};

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
  const data = safeParseJSON<NetWorthData>('netWorthData', defaultNetWorthData);
  return (data.fixedDeposits || 0) + (data.debtFunds || 0) + (data.domesticStocks || 0) + 
         (data.domesticMutualFunds || 0) + (data.internationalFunds || 0) + (data.smallCases || 0) + 
         (data.savingsBalance || 0) + (data.preciousMetals || 0) + (data.cryptocurrency || 0) + (data.reits || 0);
};

export const getAnnualExpensesFromFinance = () => {
  const data = safeParseJSON<FinanceData>('finance-data', defaultFinanceData);
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
  return safeParseJSON<FinanceData>('finance-data', defaultFinanceData);
};

export const getNetWorthData = () => {
  return safeParseJSON<NetWorthData>('netWorthData', defaultNetWorthData);
};

export const getGoalsData = () => {
  return safeParseJSON('goalsData', []);
};

export const getLiquidFutureValueTotal = () => {
  return safeParseJSON('liquidFutureValueTotal', 0);
};

export const getRetirementData = () => {
  const defaultState = {
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentAnnualExpenses: 0,
    inflation: 6,
    allocations: { equity: 50, fds: 25, bonds: 20, cash: 5 },
    returns: { equity: 12, fds: 7, bonds: 8, cash: 2.5 },
  };
  return safeParseJSON('retirementData', defaultState);
};