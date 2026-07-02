const StatCard = ({ label, value, colorClass, icon: Icon }) => {
  return (
    <div className="card flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-100">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClass}`}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
    </div>
  );
};

export default StatCard;
