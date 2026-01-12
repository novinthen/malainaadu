import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary md:h-10 md:w-10">
        <span className="font-display text-lg font-bold text-primary-foreground md:text-xl">
          செ
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-lg font-bold leading-none text-foreground md:text-xl">
          செய்தி
        </span>
        <span className="text-xs font-medium leading-none text-primary md:text-sm">
          மலேசியா
        </span>
      </div>
    </Link>
  );
}
