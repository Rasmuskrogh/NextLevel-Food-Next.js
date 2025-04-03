// "use client";

// import { useRef, useState } from "react";
// import Image from "next/image";
// import classes from "./image-picker.module.css";

// export default function ImagePicker({ label, name }) {
//   const [pickedImage, setPickedImage] = useState();
//   const imageInput = useRef();

//   const handlePickClick = () => {
//     imageInput.current.click();
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];

//     if (!file) {
//       setPickedImage(null);
//       return;
//     }

//     const fileReader = new FileReader();

//     fileReader.onload = () => {
//       setPickedImage(fileReader.result);
//     };

//     fileReader.readAsDataURL(file);
//   };
//   return (
//     <div className={classes.picker}>
//       <label htmlFor={name}>{label}</label>
//       <div className={classes.controls}>
//         <div className={classes.preview}>
//           {!pickedImage && <p>No image picked yet.</p>}
//           {pickedImage && (
//             <Image
//               src={pickedImage}
//               alt="The image selected by the user."
//               fill
//             />
//           )}
//         </div>
//         <input
//           className={classes.input}
//           type="file"
//           id={name}
//           accept="image/png, image/jpeg"
//           name={name}
//           ref={imageInput}
//           onChange={handleImageChange}
//           required
//         />
//         <button
//           className={classes.button}
//           type="button"
//           onClick={handlePickClick}
//         >
//           Pick an Image
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import classes from "./image-picker.module.css";

export default function ImagePicker({ label, name, onImagePick }) {
  const [previewImage, setPreviewImage] = useState(null);
  const imageInput = useRef();

  const handlePickClick = () => {
    imageInput.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setPreviewImage(null);
      return;
    }

    console.log("📸 Selected image file:", file);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewImage(fileReader.result);
    };
    fileReader.readAsDataURL(file);

    // 🔥 Skicka filen till parent-komponenten (ShareMealPage)
    onImagePick(file);
  };

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {!previewImage && <p>No image picked yet.</p>}
          {previewImage && (
            <Image src={previewImage} alt="The selected image" fill />
          )}
        </div>
        <input
          className={classes.input}
          type="file"
          id={name}
          accept="image/png, image/jpeg"
          name={name}
          ref={imageInput}
          onChange={handleImageChange}
          required
        />
        <button
          className={classes.button}
          type="button"
          onClick={handlePickClick}
        >
          Pick an Image
        </button>
      </div>
    </div>
  );
}
