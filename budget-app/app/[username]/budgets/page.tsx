'use client';

import { useEffect, useState } from "react";
import PastFiveYearsDropdown from "@/app/components/Dropdown/PastFiveYearsDropdown";
import { getBudgets } from "../../db";
import { BudgetHistory, YearlyBudgetHistory } from "./types";

const BudgetsPage = () => {
  const [activeYear, setActiveYear] = useState(0);
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistory[]>([]);
  const [budgets, setBudgets] = useState<YearlyBudgetHistory[]>([]);

  const getBudgetOfThisMonth = (month: string) => {
    const budgetOfThisMonth = budgetHistory.filter((history) => history.month === month);
    console.log(budgetOfThisMonth);
  };

  const getBudgetHistory = async () => {
    const budgetsOfTheYear: BudgetHistory[] = await getBudgets("year", activeYear);
    setBudgetHistory(budgetsOfTheYear);
  };

  useEffect(()=> {
    getBudgetHistory();
  }, [activeYear]);

  useEffect(()=> {
    const result: YearlyBudgetHistory[] = budgetHistory.map((budget) => {
        return {
        month: budget.month,
        budget: budget.budgets.reduce((accumulator, currentValue) => accumulator + currentValue.budget, 0),
        spent: budget.budgets.reduce((accumulator, currentValue) => accumulator + currentValue.spent, 0),
        left: budget.budgets.reduce((accumulator, currentValue) => accumulator + currentValue.left, 0),
      };
    });
    setBudgets(result);
  }, [budgetHistory]);

  const updateActiveYear = async (year: number) => {
    setActiveYear(year);
  };

  return (
      <div className="w-full px-6 bg-background">
          <div className="mt-20 py-2 px-3 bg-white text-background shadow-lg rounded-xl bg-clip-border">
              <div className="p-3 flex justify-between">
                  <p className="font-bold text-lg text-left">Budgets</p>
                  <div className="text-right">
                      <PastFiveYearsDropdown updateActiveYear={updateActiveYear}/>
                  </div>
              </div>
              { activeYear === 0 && <p className="text-center pt-20 pb-20">Please select the year to view Budgets</p>}
              { activeYear !== 0 && 
              <div className="px-12 pt-4 pb-12">
                <table className="w-full table-auto min-w-max">
                  <thead>
                      <tr className="text-center border-2">
                        <th className="border-2">Months</th>
                        <th className="border-2">Budget</th>
                        <th className="border-2">Spent</th>
                        <th className="border-2">Left</th>
                      </tr>
                  </thead>
                  <tbody>
                  {
                    budgets.length ? (
                      budgets.map((budget) => (
                        <tr key={budget.month} className="text-center border-2">
                          <td className="border-2">{budget.month}</td>
                          <td className="border-2">{budget.budget}</td>
                          <td className="border-2">{budget.spent}</td>
                          <td className="border-2">{budget.left}</td>
                        </tr>
                      ))
                      ) : (
                      <tr className="text-center border-2">
                        <td className="pt-20 pb-20 border-2" colSpan={4}>{`No Budgets for the year: ${activeYear}`}</td>
                      </tr>
                    )
                  }
                  </tbody>
                </table>
              </div>
              }
          </div>
      </div>
  );
}

export default BudgetsPage;
