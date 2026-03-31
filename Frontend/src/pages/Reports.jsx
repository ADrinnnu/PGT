import React, { useState, useEffect } from "react";
import {
  Download,
  Printer,
  TrendingUp,
  Users,
  Map,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5074";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [revenueData, setRevenueData] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  const [allCompaniesList, setAllCompaniesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCompany, setFilterCompany] = useState("All");

  const userStr = localStorage.getItem("tms_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isHeadAdmin = user?.role === "HeadAdmin";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("tms_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [revRes, tripsRes, compRes] = await Promise.all([
          fetch(`${API_URL}/api/reports/revenue`, { headers }),
          fetch(`${API_URL}/api/reports/trips`, { headers }),
          fetch(`${API_URL}/api/companies`, { headers }),
        ]);

        if (revRes.ok) {
          setRevenueData(await revRes.json());
        }

        if (tripsRes.ok) {
          setTripLogs(await tripsRes.json());
        }

        if (compRes.ok) {
          const compData = await compRes.json();
          setAllCompaniesList(compData.map((c) => c.name));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredRevenueData =
    isHeadAdmin && filterCompany !== "All"
      ? revenueData.filter((item) => item.companyName === filterCompany)
      : revenueData;

  const filteredTripLogs =
    isHeadAdmin && filterCompany !== "All"
      ? tripLogs.filter((log) => log.companyName === filterCompany)
      : tripLogs;

  const totalRevenue = filteredRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const topRouteData =
    filteredRevenueData.length > 0
      ? filteredRevenueData.reduce((prev, current) =>
          prev.revenue > current.revenue ? prev : current,
        )
      : { name: "N/A", revenue: 0 };

  const uniqueCompanies = ["All", ...allCompaniesList];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Reports</h1>
          <p className="text-slate-500">
            Analytics, financial summaries, and operational logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHeadAdmin && uniqueCompanies.length > 1 && (
            <div className="relative flex items-center mr-2">
              <Filter
                className="absolute left-3 text-emerald-600 pointer-events-none"
                size={16}
              />
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
              >
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company === "All" ? "All Companies" : company}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Printer size={18} />{" "}
            <span className="hidden sm:inline">Print</span>
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-colors">
            <Download size={18} />{" "}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("revenue")}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === "revenue" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} /> Revenue Analysis
          </div>
          {activeTab === "revenue" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === "trips" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <div className="flex items-center gap-2">
            <Map size={16} /> Trip Logs
          </div>
          {activeTab === "trips" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      {activeTab === "revenue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">
              Revenue by Route (This Month)
            </h3>
            <div className="h-72">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                  Loading chart data...
                </div>
              ) : filteredRevenueData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                  No revenue data available for this selection.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredRevenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Revenue (₱)"
                    />
                    <Bar
                      dataKey="trips"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Total Transactions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-sm font-medium text-slate-500 mb-2">
                Highest Earning Route
              </h4>
              <p className="text-2xl font-bold text-slate-800">
                {topRouteData.name}
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                ₱{" "}
                {topRouteData.revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-sm font-medium text-slate-500 mb-2">
                Total Monthly Revenue
              </h4>
              <p className="text-2xl font-bold text-slate-800">
                ₱{" "}
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trips" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Loading trip logs...
            </div>
          ) : filteredTripLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No trips match your selection.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                      Trip ID
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                      Date
                    </th>
                    {isHeadAdmin && filterCompany === "All" && (
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                        Company
                      </th>
                    )}
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                      Route
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                      Driver
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTripLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4 text-sm font-mono text-slate-600">
                        #{log.id}
                      </td>
                      <td className="p-4 text-sm text-slate-600">{log.date}</td>
                      {isHeadAdmin && filterCompany === "All" && (
                        <td className="p-4 text-sm font-bold text-emerald-700 uppercase">
                          {log.companyName}
                        </td>
                      )}
                      <td className="p-4 text-sm font-medium text-slate-800">
                        {log.route}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {log.driver}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            log.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-400 text-right">
                        {log.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
