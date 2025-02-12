import Link from "next/link";
export default function DynamicRoute() {
  return (
    <>
      <h1>Dynamic Route</h1>
      <p>
        <Link href="/">Home</Link>
      </p>
      <p>
        <Link href="/meals">Meals</Link>
      </p>
    </>
  );
}
