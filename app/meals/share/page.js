import Link from "next/link";
export default function ShareMealPage() {
  return (
    <>
      <h1>Share Meal</h1>
      <p>
        <Link href="/">Home</Link>
      </p>
      <p>
        <Link href="/meals">Meals</Link>
      </p>
    </>
  );
}
