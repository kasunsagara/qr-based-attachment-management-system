import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
      <div className="hidden sm:flex flex-1 justify-between items-center">
        <div>
          <p className="text-sm text-surface-700">
            Showing page <span className="font-medium text-surface-900">{page}</span> of{' '}
            <span className="font-medium text-surface-900">{pages}</span>{' '}
            <span className="text-surface-500">({total} total items)</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-surface-300 bg-white text-sm font-medium text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === pages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-surface-300 bg-white text-sm font-medium text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile pagination */}
      <div className="flex items-center justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-secondary btn-sm"
        >
          Previous
        </button>
        <span className="text-sm text-surface-700">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="btn-secondary btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
