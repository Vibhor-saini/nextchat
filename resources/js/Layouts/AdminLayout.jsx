const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        {/* Admin nav links */}
      </aside>
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;