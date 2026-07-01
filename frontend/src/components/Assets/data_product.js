// Import product images
import p1_img from "./1.png";
import p2_img from "./2.png";
import p3_img from "./3.png";




// Define the data array
const data_product = [
  {
    id: 1,
    name: "Blue Striped Flower design",
    category: "blockprinting",
    image: p1_img, // Correct usage of imported image
    new_price: 750.0, // Correctly formatted number
    old_price: 580.0,
  },
  {
    id: 2,
    name: "Anglo Indian Black Print",
    category: "blockprinting",
    image: p2_img, // Correct usage of imported image
    new_price: 950.0,
    old_price: 80.0,
  },
  {
    id: 3,
    name: "Choker Multi Color Design",
    category: "blockprinting",
    image: p3_img, // Correct usage of imported image
    new_price: 550.0,
    old_price: 380.0,
  },
  
  
];

// Export the data
export default data_product;