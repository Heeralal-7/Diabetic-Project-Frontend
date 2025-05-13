import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../FoodAndNutrition/FAndNComponents/Carousel";
import PharmacyImg from "../../Assets/img/Pharmacy/PharmacyImg.png";
import PharmacyImg1 from "../../Assets/img/Pharmacy/PharmacyImg1.png";
import PharmacyImg2 from "../../Assets/img/Pharmacy/PharmacyImg2.png";
import PharmacyImg3 from "../../Assets/img/Pharmacy/PharmacyImg3.png";
import PharmacyImg4 from "../../Assets/img/Pharmacy/PharmacyImg4.png";
import PharmacyImg5 from "../../Assets/img/Pharmacy/PharmacyImg5.png";
import PharmacyShopImg from "../../Assets/img/Pharmacy/PharmacyShopImg.png";
import PharmacyShopImg1 from "../../Assets/img/Pharmacy/PharmacyShopImg1.png";
import PharmacyShopImg2 from "../../Assets/img/Pharmacy/PharmacyShopImg2.png";
import PharmacyShopImg3 from "../../Assets/img/Pharmacy/PharmacyShopImg3.png";
import PharmacyShopImg4 from "../../Assets/img/Pharmacy/PharmacyShopImg4.png";
import PharmacyShopImg5 from "../../Assets/img/Pharmacy/PharmacyShopImg5.png";
import Pharmacymed from "../../Assets/img/Pharmacy/Pharmacymed.png";
import Pharmacymed1 from "../../Assets/img/Pharmacy/Pharmacymed1.png";
import Pharmacymed2 from "../../Assets/img/Pharmacy/Pharmacymed2.png";
import Pharmacymed3 from "../../Assets/img/Pharmacy/Pharmacymed3.png";
import Pharmacymed4 from "../../Assets/img/Pharmacy/Pharmacymed4.png";
import Pharmacymed5 from "../../Assets/img/Pharmacy/Pharmacymed5.png";
import Pharmacymed6 from "../../Assets/img/Pharmacy/Pharmacymed6.png";
import Pharmacymed7 from "../../Assets/img/Pharmacy/Pharmacymed7.png";
import HowItWorks from "./PharmacyComponents/HowItWorks";
import Pharmacycard from "./PharmacyComponents/Pharmacycard";
import CategoryCard from "./PharmacyComponents/CategoryCard";
import CardsCarousel from "./PharmacyComponents/CardsCarousel";
import TopDealsCard from "./PharmacyComponents/TopDealsCard";
import Brand1 from "../../Assets/img/Pharmacy/Brands/Brand1.png";
import Brand2 from "../../Assets/img/Pharmacy/Brands/Brand2.png";
import Brand3 from "../../Assets/img/Pharmacy/Brands/Brand3.png";
import Brand4 from "../../Assets/img/Pharmacy/Brands/Brand4.png";
import Brand5 from "../../Assets/img/Pharmacy/Brands/Brand5.png";
import Brand6 from "../../Assets/img/Pharmacy/Brands/Brand6.png";
import Brand7 from "../../Assets/img/Pharmacy/Brands/Brand7.png";
import Brand8 from "../../Assets/img/Pharmacy/Brands/Brand8.png";
import Brand9 from "../../Assets/img/Pharmacy/Brands/Brand9.png";

const HomePharmacy = () => {
const CarouselData = [
{
image: PharmacyImg,
captionTitle: "Trusted Pharmacy",
captionText:
"Your health is our priority. Quality medicines you can trust.",
buttonText: "Shop Now",
},
{
image: PharmacyImg2,
captionTitle: "Affordable Healthcare",
captionText: "Providing affordable healthcare solutions for everyone.",
buttonText: "Learn More",
},
{
image: PharmacyImg1,
captionTitle: "Trusted Pharmacy",
captionText:
"Your health is our priority. Quality medicines you can trust.",
buttonText: "Shop Now",
},
{
image: PharmacyImg3,
captionTitle: "Expert Consultation",
captionText: "Speak to our pharmacists for expert health advice.",
buttonText: "Consult Now",
},
{
image: PharmacyImg4,
captionTitle: "Fast and Reliable",
captionText: "Quick delivery and reliable service for all your needs.",
buttonText: "Order Now",
},
{
image: PharmacyImg5,
captionTitle: "Comprehensive Care",
captionText: "A wide range of health and wellness products available.",
buttonText: "Discover More",
},
];
const CarouselData1 = [
{
image: PharmacyImg,
captionTitle: "Trusted Pharmacy Shop",
captionText:
"Your health is our priority. Quality medicines you can trust.",
buttonText: "Visit Now",
},
{
image: PharmacyImg2,
captionTitle: "Affordable Medicines",
captionText: "Providing affordable healthcare solutions for everyone.",
buttonText: "Find Out More",
},
{
image: PharmacyImg1,
captionTitle: "Health and Wellness",
captionText:
"Your health is our priority. Quality medicines you can trust.",
buttonText: "Explore Now",
},
{
image: PharmacyImg3,
captionTitle: "Pharmacist Advice",
captionText: "Speak to our pharmacists for expert health advice.",
buttonText: "Get Advice",
},
{
image: PharmacyImg4,
captionTitle: "Quick Delivery",
captionText: "Fast and reliable delivery for all your needs.",
buttonText: "Order Now",
},
{
image: PharmacyImg5,
captionTitle: "Comprehensive Care",
captionText: "A wide range of health and wellness products available.",
buttonText: "Discover More",
},
];
const CategoryCardData = [
{
title: "Vitamins & Supplements",
image: Pharmacymed7,
},
{
title: "Pain Relief",
image: Pharmacymed1,
},
{
title: "Cough, Cold & Flu",
image: Pharmacymed2,
},
{
title: "Allergy & Sinus",
image: Pharmacymed3,
},
{
title: "Digestive Health",
image: Pharmacymed4,
},
{
title: "Personal Care",
image: Pharmacymed5,
},
{
title: "Skin Care",
image: Pharmacymed6,
},
{
title: "Baby & Child Care",
image: Pharmacymed5,
},
{
title: "First Aid",
image: Pharmacymed7,
},
{
title: "Home Health Care",
image: Pharmacymed,
},
];

const PharmacyShopData = [
{
image: PharmacyShopImg,
name: "Healthy Life Pharmacy",
addr: "123 Main St, Springfield",
},
{
image: PharmacyShopImg1,
name: "Wellness Pharmacy",
addr: "456 Elm St, Shelbyville",
},
{
image: PharmacyShopImg2,
name: "Care Plus Pharmacy",
addr: "789 Maple Ave, Centerville",
},
{
image: PharmacyShopImg3,
name: "MediCare Pharmacy",
addr: "101 Oak St, Riverdale",
},
{
image: PharmacyShopImg4,
name: "HealthMart Pharmacy",
addr: "202 Pine St, Brookfield",
},
{
image: PharmacyShopImg5,
name: "Family Pharmacy",
addr: "303 Cedar Ave, Lakeview",
},
{
image: PharmacyShopImg,
name: "Community Pharmacy",
addr: "404 Birch Rd, Hilltown",
},
{
image: PharmacyShopImg1,
name: "Town Center Pharmacy",
addr: "505 Walnut St, Bayville",
},
{
image: PharmacyShopImg2,
name: "Neighborhood Pharmacy",
addr: "606 Chestnut Ave, Seaside",
},
{
image: PharmacyShopImg3,
name: "City Health Pharmacy",
addr: "707 Spruce St, Meadowbrook",
},
];
const Medicines1 = [
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "Allen Nutraceutical Vitamin D3 (Cholecalciferol) 1000 I.U for Bone Metabolism & ...",
    medQty: "box of 30 tabs",
    avgRating: 3.7,
    oldPrice: 20.0,
    price: 10.99,
    badge: "Bestseller",
    delivery: 60,
    offer: 15,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "BioPharm Multivitamin Complex - Boost Immunity & Energy",
    medQty: "bottle of 60 capsules",
    avgRating: 4.5,
    oldPrice: 25.0,
    price: 19.99,
    badge: "New",
    delivery: 45,
    offer: 20,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "GreenLeaf Organic Herbal Supplement for Detoxification",
    medQty: "pack of 20 teabags",
    avgRating: 4.2,
    oldPrice: 15.0,
    price: 12.50,
    badge: "Organic",
    delivery: 30,
    offer: 10,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "HeartCare Omega-3 Fish Oil for Cardiovascular Health",
    medQty: "bottle of 90 softgels",
    avgRating: 4.7,
    oldPrice: 40.0,
    price: 32.99,
    badge: "Top Rated",
    delivery: 50,
    offer: 25,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "SleepWell Melatonin Gummies - Improve Sleep Quality",
    medQty: "jar of 60 gummies",
    avgRating: 3.9,
    oldPrice: 18.0,
    price: 14.99,
    badge: "Popular",
    delivery: 20,
    offer: 5,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "ProHealth Probiotics for Digestive Health",
    medQty: "bottle of 30 capsules",
    avgRating: 4.8,
    oldPrice: 22.0,
    price: 17.50,
    badge: "Recommended",
    delivery: 25,
    offer: 15,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "JointFlex Glucosamine & Chondroitin for Joint Support",
    medQty: "bottle of 120 tablets",
    avgRating: 4.1,
    oldPrice: 35.0,
    price: 28.99,
    badge: "Best Value",
    delivery: 35,
    offer: 20,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "HairGrow Biotin Supplement for Hair Growth",
    medQty: "bottle of 90 tablets",
    avgRating: 3.6,
    oldPrice: 30.0,
    price: 24.99,
    badge: "Editor's Choice",
    delivery: 40,
    offer: 10,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "ImmuneBoost Vitamin C with Zinc for Immune Support",
    medQty: "pack of 100 tablets",
    avgRating: 4.3,
    oldPrice: 15.0,
    price: 11.99,
    badge: "Customer Favorite",
    delivery: 15,
    offer: 5,
  },
  {
    image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
    medName: "CalmMind Ashwagandha for Stress Relief",
    medQty: "bottle of 60 capsules",
    avgRating: 4.0,
    oldPrice: 20.0,
    price: 16.50,
    badge: "Best Seller",
    delivery: 20,
    offer: 15,
  }
];
const TopDealsData = [
{
  image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
  title:"Needles & Syringes",
},
{
  image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
  title:"Gloves",
},
{
  image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
  title:"Surgical Aids",
},
{
  image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
  title:"Gloves",
},

];
const ShopByHealthCondition = [
  {
    image: "https://img.freepik.com/free-photo/top-view-world-heart-day-concept-with-stethoscope_23-2148631023.jpg?t=st=1721049783~exp=1721053383~hmac=7ff5782ee89d96926f465db287e914731e2f4fb4e1b13f643b8402c8a26281ad&w=740",
    title: "Heart Care",
  },
  {
    image: "https://img.freepik.com/free-photo/close-up-man-rubbing-his-painful-back-isolated-white-background_1150-2935.jpg?t=st=1721049585~exp=1721053185~hmac=1f3ac8a026aa2a53e3b1e23898c6ee13fc45248be87ddbcfda794dedc19a455a&w=740",
    title: "Pain Relief",
  },
  {
    image: "https://img.freepik.com/premium-photo/doctor-touches-virtual-liver-hand-healthcare-hospital-service-concept_488220-76485.jpg?w=740",
    title: "Liver Care",
  },
  {
    image: "https://img.freepik.com/free-vector/coughing-man-with-coronavirus_23-2148491600.jpg?t=st=1721049883~exp=1721053483~hmac=bb45c071e630e2a460e4153ae25e0687afc42f9ef4d7a2c99f69ad2f4f4533cb&w=740",
    title: "Cold n Cough",
  },
  {
    image: "https://img.freepik.com/free-photo/woman-home-applying-cream-mask_1303-24618.jpg?t=st=1721049738~exp=1721053338~hmac=554c6eae1d5a807bb4f698fd58752125ceb10a92975609e52fe34754082a0dd1&w=740",
    title: "Skin & Hair Care",
  },
  {
    image: "https://img.freepik.com/free-vector/flat-lung-cancer-awareness-month-illustration_23-2150884614.jpg?t=st=1721049968~exp=1721053568~hmac=e8b61a4d6b5ed38bf8cd9ecc801a225f25a1e0138f5d47d2f3dcd8a293381da9&w=740",
    title: "Respiratory Care",
  },
  {
    image: "https://img.freepik.com/premium-photo/diabetic-woman-using-blood-glucose-meter-female-hands-hold-lancet-pen-glucometer-finger-measure-sugar-check-insulin_397897-443.jpg?w=740",
    title: "Diabetes Care",
  },
  {
    image: "https://img.freepik.com/free-vector/gradient-gut-health-illustration_23-2150617789.jpg?t=st=1721050028~exp=1721053628~hmac=c84f2739b89f0a38d0849a3061aa0a770578793fa03ec50831e3feb02839f81f&w=740",
    title: "Stomach Care",
  },
  {
    image: "https://img.freepik.com/free-vector/hand-drawn-health-illustration_23-2150074493.jpg?t=st=1721050053~exp=1721053653~hmac=7a8fd1e7c5b9d9a290557ba36d4537d77e73908d105e4d5c29a0bfe326d52a1c&w=740",
    title: "Weight Care",
  },

];
const TrendingBrands =[
  {
    img: Brand1,
    brand: "Brand 1"
  },
  {
    img: Brand2,
    brand: "Brand 2"
  },
  {
    img: Brand3,
    brand: "Brand 3"
  },
  {
    img: Brand4,
    brand: "Brand 4"
  },
  {
    img: Brand5,
    brand: "Brand 5"
  },
  {
    img: Brand6,
    brand: "Brand 6"
  },
  {
    img: Brand7,
    brand: "Brand 7"
  },
  {
    img: Brand8,
    brand: "Brand 8"
  },
  {
    img: Brand9,
    brand: "Brand 9"
  },
]


return (
<>
  <div className="container-xl comtainer-fluid">
    <div className="row">
      <div className="col-12 mt-4">
        <div className="mb-5">
          <Carousel slideData={CarouselData} id="carousel1" autoplay="carousel" />
        </div>
        <div className="mb-5">
          <h1 className="display-6 mb-4 fw-semibold">
            Order Medicines Online
          </h1>
          <div className="card" style={{ maxWidth: "700px" }}>
            <div className="card-body py-2 pb-0">
              <span>
                <h5 className="card-titte fw-bold mb-1">
                  Order with prescription
                </h5>
              </span>
              <div className="d-flex mb-2 justify-content-between align-items-center">
                <span>
                  <p className="fs-6 mb-0 text-secondary fw-semibold">
                    Save upto 23%
                  </p>
                </span>
                <span>
                  <button className="btn text-light bg-mainRed">
                    Order now
                  </button>
                </span>
              </div>
              <p className="d-flex pt-2 border-top fw-bold justify-content-between align-items-center text-success">
                <span>Get up to 25% off on medicines</span>
                <span className="btn border-0 text-mainRed" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                  How it works <i class="ri-question-line fw-light"></i>
                </span>
              </p>
              <HowItWorks />
            </div>
          </div>
        </div>
        <div className="mb-5">
          <h1 className="display-6 d-flex align-items-center justify-content-between mb-4 fw-semibold">
            <span>Shops near by</span>
            <Link className="fs-5 link-danger text-dark">See more</Link>
          </h1>
          <div className="pharmacyCardContainer">
            {PharmacyShopData.map((Data, index) => (
            <Pharmacycard key={index} Data={Data} />
            ))}
          </div>
        </div>
        <div className="mb-5">
          <Carousel slideData={CarouselData1} id="carousel2" autoplay="carousel" />
        </div>
        <div className="mb-5">
          <h1 className="display-6 d-flex align-items-center justify-content-between mb-4 fw-semibold">
            <span>Popular Categories</span>
            <Link className="fs-5 link-danger text-dark">See more</Link>
          </h1>
          <div className="PhamacyProductCardsColorTheame pharmacyCardContainer">
            {CategoryCardData.map((Data, index) => (
            <CategoryCard key={index} Data={Data} />
            ))}
          </div>
        </div>
        <div className="mb-5">
          <CardsCarousel autoplay={true} loop={true} mainTittle="Vitamins & supplements" initialSlide={0}
            slideData={Medicines1} noOfSlides={[5,4,3,2,2,1]} />
        </div>
        <div className="mb-5">
          <h1 className="display-6 d-flex align-items-center justify-content-between mb-4 fw-semibold">
              <span>Top Deals</span>
          </h1>
          <div className="PhamacyProductCardsColorTheame pharmacyOfferContainer">
            {TopDealsData.map((Data, index) => (
              <TopDealsCard key={index} Data={Data} />
              ))}
          </div>
        </div>
        <div className="mb-5">
          <CardsCarousel autoplay={true} loop={true} mainTittle="Best Selling Products" initialSlide={0}
            slideData={Medicines1} noOfSlides={[5,4,3,2,2,1]} />
        </div>
        <div className="mb-5">
        <h1 className="display-6 d-flex align-items-center justify-content-between mb-4 fw-semibold">
              <span>Select by health condition</span>
          </h1>
          <div className="pharmacyCardContainer">
            {ShopByHealthCondition.map((Data, index) => (
              <div className="card border-0 rounded-3 p-0 overflow-hidden" key={index}>
              <div className="card-body flex-column d-flex gap-2  justify-content-center">
                <div className="mx-auto text-center">
                  <img src={Data.image} alt={Data.title} className="img-fluid object-fit-cover rounded-2" style={{width:"100%",height:"160px"}}/>
                </div>
                  <h6 className="ms-2 mt-2 fw-bold text-black text-center">{Data.title}</h6>
              </div>
            </div>
              ))}
          </div>
        </div>
        <div className="mb-5">
          <Carousel slideData={CarouselData} id="carousel1" autoplay="carousel" />
        </div>
        <div className="mb-5">
        <h1 className="display-6 d-flex align-items-center justify-content-between mb-4 fw-semibold">
              <span>Trending Brands</span>
          </h1>
          <div className="pharmacyBrandsContainer">
            {TrendingBrands.map((Data, index) => (
              <div className="card border-0 rounded-circle p-0 overflow-hidden shadow" style={{height:"90%"}}  key={index}>
              <div className="card-body d-flex align-items-center justify-content-center">
                  <img src={Data.img} alt={Data.title} className="img-fluid object-fit-contain rounded-2" style={{width:"70%",height:"150px", objectPosition:"center"}}/>
              </div>
            </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</>
);
};

export default HomePharmacy;