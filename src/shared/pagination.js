// Page sizes offered by every list page's pagination control. Kept out of
// dataTable.jsx because react-refresh requires component files to export only
// components.
//
// The API caps `limit` at 100 (PaginationQuery), so every option here is valid.
export const PAGE_SIZE_OPTIONS = [15, 20, 30, 50];

export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];
