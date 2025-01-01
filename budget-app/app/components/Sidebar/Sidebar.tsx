import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  return (
    <div className="w-30 place-self-center p-2 space-y-4">
      <Link
        href="/dashboard"
        className="block rounded-md px-3 py-2 text-sm border-4 border-white hover:border-black"
      >
        <Image
          className="dark:invert"
          src="/icons/dashboard.svg"
          alt="Dashboard logomark"
          width={30}
          height={30}
        />
      </Link>
      <Link
        href="/categories"
        className="block rounded-md px-3 py-2 text-sm border-4 border-white hover:border-black"
      >
        <Image
          className="dark:invert"
          src="/icons/category.svg"
          alt="Category logomark"
          width={30}
          height={30}
        />
      </Link>
      <Link
        href="/scanner"
        className="block rounded-md px-3 py-2 text-sm border-4 border-white hover:border-black"
      >
        <Image
          className="dark:invert"
          src="/icons/scanner.svg"
          alt="Category logomark"
          width={30}
          height={30}
        />
      </Link>
      <Link
        href="/budgets"
        className="block rounded-md px-3 py-2 text-sm border-4 border-white hover:border-black"
      >
        <Image
          className="dark:invert"
          src="/icons/budget.svg"
          alt="Category logomark"
          width={30}
          height={30}
        />
      </Link>
      <Link
        href="#"
        className="block rounded-md px-3 py-2 text-sm border-4 border-white hover:border-black"
      >
        <Image
          className="dark:invert"
          src="/icons/profile.svg"
          alt="Profile logomark"
          width={30}
          height={30}
        />
      </Link>
    </div>
  );
};

export default Sidebar;
