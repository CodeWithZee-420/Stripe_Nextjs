"use client";
import Image from "next/image";
import product from '../../api/product.json';
import { useState } from "react";
import axios from "axios";

interface Product {
  image: string;
  title: string;
  description: string;
  price: number;
}

function ProductCard({ data }: { data: Product }) {
  const [loading, setLoading] = useState(false);

  const checkoutButton = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/payment', {
        name: data.title,
        price: data.price,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No URL received from payment API');
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full sm:w-1/2 lg:w-1/4">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl h-full flex flex-col">
        <div className="h-48 relative">
          <Image alt={data.title} src={data.image} layout="fill" objectFit="cover" />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h2 className="text-xl font-semibold text-white mb-2">{data.title}</h2>
          <p className="text-gray-400 flex-grow">{data.description}</p>
          <button
            onClick={checkoutButton}
            className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-full mt-4"
          >
            {loading ? "Processing..." : `Pay $${data.price}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <section className="text-gray-400 bg-gray-900 py-24">
      <div className="container mx-auto px-5">
        <div className="flex flex-wrap -m-4">
          {product.map((item, index) => (
            <ProductCard key={index} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
