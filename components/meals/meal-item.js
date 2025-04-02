// import Link from "next/link";
// import Image from "next/image";

// import classes from "./meal-item.module.css";

// export default function MealItem({ title, slug, image, summary, creator }) {
//   return (
//     <article className={classes.meal}>
//       <header>
//         <div className={classes.image}>
//           <Image src={image} alt={title} fill />
//         </div>
//         <div className={classes.headerText}>
//           <h2>{title}</h2>
//           <p>by {creator}</p>
//         </div>
//       </header>
//       <div className={classes.content}>
//         <p className={classes.summary}>{summary}</p>
//         <div className={classes.actions}>
//           <Link href={`/meals/${slug}`}>View Details</Link>
//         </div>
//       </div>
//     </article>
//   );
// }

import Link from "next/link";
import Image from "next/image";
import classes from "./meal-item.module.css";

export default function MealItem({ title, slug, image, summary, creator }) {
  console.log("MealItem image before processing:", image);
  // Kolla om bilden är lokal (börjar med "/images/")
  const isLocalImage = image.startsWith("/images/");
  return (
    <article className={classes.meal}>
      <header>
        <div className={classes.image}>
          <Image
            src={isLocalImage ? image : encodeURI(image)} // Kodar externa URL:er korrekt
            alt={title}
            fill
            //sizes="(max-width: 768px) 100vw, 33vw"
            priority={isLocalImage} // Förbättrar prestanda för lokala bilder
          />
        </div>
        <div className={classes.headerText}>
          <h2>{title}</h2>
          <p>by {creator}</p>
        </div>
      </header>
      <div className={classes.content}>
        <p className={classes.summary}>{summary}</p>
        <div className={classes.actions}>
          <Link href={`/meals/${slug}`}>View Details</Link>
        </div>
      </div>
    </article>
  );
}
