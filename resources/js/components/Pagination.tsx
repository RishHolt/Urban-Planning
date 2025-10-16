interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ""
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 0) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2;
    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis if needed
    if (currentPage - delta > 2) {
      pages.push("...");
    }
    
    // Add pages around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (currentPage + delta < totalPages - 1) {
      pages.push("...");
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const renderPageButton = (page: number | string, index: number) => {
    if (page === "...") {
      return (
        <span
          key={index}
          className="px-3 py-2 text-gray-500 cursor-default"
        >
          ...
        </span>
      );
    }

    const pageNumber = page as number;
    const isActive = pageNumber === currentPage;

    return (
      <button
        key={index}
        onClick={() => onPageChange(pageNumber)}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {pageNumber}
      </button>
    );
  };

  // Always show pagination (as originally intended)
  // if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between bg-background px-6 py-4 border-t border-gray-200 rounded-b-xl ${className}`}>
      <div className="flex items-center text-gray-700 text-sm">
        <span>
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => renderPageButton(page, index))}

        {/* Next Button */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;