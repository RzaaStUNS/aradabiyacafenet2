import { Navbar } from "@/components/Navbar";

const CustomerDashboard = () => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-5">
          <h1>Hello Customer</h1>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
