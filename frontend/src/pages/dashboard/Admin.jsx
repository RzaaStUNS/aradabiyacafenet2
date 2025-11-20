import { Navbar } from "@/components/Navbar";

const AdminDashboard = () => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-5">
          <h1>Hello Admin</h1>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
