import MealItem from "./meal-item";
import classes from "./meals-gird.module.css";

export default function MealsGrid({ meals }) {
  console.log(
    "MealsGrid images before rendering:",
    meals.map((m) => m.image)
  ); // 👈 Lägg till

  return (
    <ul className={classes.meals}>
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealItem {...meal} />
        </li>
      ))}
    </ul>
  );
}
