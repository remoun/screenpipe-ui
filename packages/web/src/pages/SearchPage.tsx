import { type FormEvent } from "react";
import { useSearch } from "@screenpipe-ui/react";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";
import { SearchResult } from "../components/SearchResult";

const contentTypes = [
  { value: "all", label: "All" },
  { value: "ocr", label: "Screen" },
  { value: "audio", label: "Audio" },
] as const;

export function SearchPage({ client }: { client: ScreenpipeUIClient }) {
  const {
    query,
    results,
    pagination,
    loading,
    error,
    contentType,
    search,
    nextPage,
    prevPage,
    setQuery,
    setContentType,
  } = useSearch(client);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    search();
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-lg font-semibold mb-6">Search</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search screen content, audio transcriptions..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </form>

      {/* Content type filter */}
      <div className="flex gap-1 mb-6">
        {contentTypes.map((ct) => (
          <button
            key={ct.value}
            type="button"
            onClick={() => {
              setContentType(ct.value);
              search();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              contentType === ct.value
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-3">
        {results.map((item, i) => (
          <SearchResult key={`${item.type}-${i}`} item={item} />
        ))}
      </div>

      {results.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600 text-sm py-12">
          No results yet. Enter a query and press Search.
        </p>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={prevPage}
            disabled={pagination.offset === 0 || loading}
            className="px-3 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages} &middot; {pagination.total} results
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={
              pagination.offset + pagination.limit >= pagination.total ||
              loading
            }
            className="px-3 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
