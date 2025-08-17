# Finance.AI - Your Privacy-First Financial Planner

Finance.AI is a comprehensive, open-source personal finance dashboard designed to give you a complete picture of your financial health. Track everything from your daily cash flow to your long-term retirement goals with a suite of powerful tools and calculators. All your data is stored locally in your browser, ensuring complete privacy and control.

![Financial Planner Dashboard](https://raw.githubusercontent.com/bravetux/Finance.AI/main/public/screenshot.png)

## ✨ Key Features

- **Dashboard:** Get a high-level overview of your surplus cash flow, net worth, and the future value of your investments at a glance.
- **Cashflow Planning:**
    - **Detailed Cashflow:** Track all your income and expenses to understand where your money is going.
    - **Expense Reduction Planner:** Interactively plan and visualize the impact of reducing monthly expenses.
    - **Projected Cashflow:** Forecast your savings and accumulated corpus up to your retirement age.
- **Net Worth Tracking:**
    - A consolidated view of all your assets and liabilities.
    - Detailed trackers for **Real Estate**, **Domestic & US Equity**, **Mutual Funds**, **Debt Instruments**, **Precious Metals (Gold, Silver, Platinum, Diamond)**, **Cryptocurrency**, and **Loans**.
- **Goal Planning:**
    - Set long-term financial goals and calculate the monthly SIP required to achieve them, factoring in inflation and expected returns.
- **Retirement Planning:**
    - **Future Value Calculator:** Project the future value of all your assets.
    - **FIRE Calculator:** Calculate your target corpus for Lean, Coast, and Fat FIRE (Financial Independence, Retire Early).
    - **Retirement Dashboard:** A comprehensive tool to simulate your post-retirement strategy and see how long your corpus will last.
- **Comprehensive Calculators:** A suite of standalone calculators for **SIP**, **SWP**, **PPF**, and **EPF**.
- **Insurance Hub:** Keep track of all your insurance policies in one place.
- **FIDOK (Financial Information & Documents Of Kin):** A crucial module to securely document all essential financial information for your family's reference.
- **AI Financial Assistant:** Upload your exported financial data and chat with an AI to get personalized insights and answers to your financial questions.
- **Data Management:**
    - **Import/Export:** Easily back up and restore your data for each module using JSON files.
    - **Consolidated Reports:** Generate a single report containing all your financial data.
- **100% Privacy-Focused:** All data is stored exclusively in your browser's local storage. Nothing is ever sent to a server.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Charts:** Recharts
- **Routing:** React Router

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation & Running Locally

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/bravetux/Finance.AI.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd Finance.AI
    ```
3.  **Install dependencies:**
    ```sh
    npm install
    ```
4.  **Start the development server:**
    ```sh
    npm run dev
    ```
5.  Open your browser and navigate to `http://localhost:8080` (or the port specified in your terminal).

## 🔒 Privacy First

This application is built with privacy as its core principle. **All the financial data you enter is stored directly in your browser's `localStorage`**. It is never transmitted over the network or stored on any external server. This means you have full ownership and control over your sensitive information.

Because of this design, remember to use the **Export** feature regularly to back up your data.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.