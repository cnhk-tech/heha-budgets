import Link from 'next/link';
import Image from 'next/image';

const Sidebar = ({ username }: { username: string }) => {
  return (
    <div className="
        w-30 grid grid-flow-row place-content-center p-2 space-y-4 text-lg
        max-md:grid-flow-col max-md:space-y-0 max-md:w-full max-md:fixed max-md:bottom-0 max-md:bg-foreground
      ">
      <Link
        href={`/${username}/dashboard`}
        className="block relative rounded-md px-3 py-2 text-sm border-4 border-foreground hover:border-background"
      >
        <Image
          className="dark:invert"
          src="/icons/dashboard.svg"
          alt="Dashboard logomark"
          width={45}
          height={45}
        />
      </Link>
      <Link
        href={`/${username}/categories`}
        className="block rounded-md px-3 py-2 text-sm border-4 border-foreground hover:border-background"
      >
        <Image
          className="dark:invert"
          src="/icons/category.svg"
          alt="Category logomark"
          width={45}
          height={45}
        />
      </Link>
      <Link
        href={`/${username}/scanner`}
        className="block rounded-md px-3 py-2 text-sm border-4 border-foreground hover:border-background"
      >
        <Image
          className="dark:invert"
          src="/icons/scanner.svg"
          alt="Category logomark"
          width={45}
          height={45}
        />
      </Link>
      <Link
        href={`/${username}/calculators`}
        className="block rounded-md px-3 py-2 text-sm border-4 border-foreground hover:border-background"
      >
        <Image
          className="dark:invert"
          src="/icons/calci.svg"
          alt="Calculator logomark"
          width={45}
          height={45}
        />
      </Link>
      <Link
        href={`/${username}/budgets`}
        className="block rounded-md px-3 py-2 text-sm border-4 border-foreground hover:border-background"
      >
        <Image
          className="dark:invert"
          src="/icons/budget.svg"
          alt="Category logomark"
          width={45}
          height={45}
        />
      </Link>
      <Link
        href={`/${username}/profile`}
        className="block rounded-md px-3 py-2 text-sm border-4 border-foreground hover:border-background"
      >
        <Image
          className="dark:invert"
          src="/icons/profile.svg"
          alt="Profile logomark"
          width={45}
          height={45}
        />
      </Link>
    </div>
  );
};

export default Sidebar;
