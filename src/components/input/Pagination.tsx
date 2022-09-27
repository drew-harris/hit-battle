import Button from "./Button";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  limit: number;
}
export default function Pagination({ page, setPage, limit }: PaginationProps) {
  return (
    <div className="my-4 flex justify-between">
      <Button onClick={() => setPage(page - 1)} disabled={page <= 1}>
        Prev
      </Button>
      <div>Page {page}</div>
      <Button onClick={() => setPage(page + 1)} disabled={page === limit}>
        Next
      </Button>
    </div>
  );
}
