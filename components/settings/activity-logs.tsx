"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ActivityLog } from "@/lib/types";
import { Clock, Filter } from "lucide-react";

const ACTION_BADGE_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  deleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  assigned:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  unassigned:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

const ENTITY_TYPE_OPTIONS = [
  "user",
  "role",
  "project",
  "category",
  "task",
];

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (entityTypeFilter) params.set("entityType", entityTypeFilter);
      const res = await fetch(`/api/activity-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityTypeFilter]);

  const handleFilterChange = (value: string) => {
    setEntityTypeFilter(value);
    setPage(1);
  };

  const getActionBadgeClass = (action: string) => {
    return (
      ACTION_BADGE_COLORS[action] ??
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Logs
        </h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <select
            value={entityTypeFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            {ENTITY_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading activity logs...
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No activity logs yet
          </p>
        </div>
      ) : (
        <>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Time
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    User
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Action
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Entity Type
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Entity Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {log.user?.fullName ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getActionBadgeClass(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {log.entityType.charAt(0).toUpperCase() +
                        log.entityType.slice(1)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {log.entityName ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
