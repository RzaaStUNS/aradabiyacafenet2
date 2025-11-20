import { Navbar } from "@/components/Navbar";

const CashierDashboard = () => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-5">
          <h1>Hello Cashier</h1>
        </div>
      </div>
    </>
  );
};

export default CashierDashboard;
