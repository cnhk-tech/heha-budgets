import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="sticky bg-background top-0 py-2 px-4 flex flex-row justify-between items-center">
      <Link 
        href="/"
        className="inline-block text-2xl font-extrabold"
      >
        HeHa
      </Link>
      <Link
        href="/login"
        className="inline-block rounded-md px-3 py-2 text-sm border-4 border-white hover:border-black"
      >
        <Image
          className="dark:invert"
          src="/icons/logout.svg"
          alt="Logout logomark"
          width={30}
          height={30}
        />
      </Link>
    </header>
  );
};

export default Header;
