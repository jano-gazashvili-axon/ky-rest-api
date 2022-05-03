import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  // del,
  get,
} from "./lib/http-request";
import { useQuery } from "react-query";
import * as t from "io-ts";
// import { concatQueryParams } from "./lib/concat-query-params";

const TProduct = t.type({
  id: t.number,
  title: t.string,
  price: t.number,
  description: t.string,
  category: t.string,
  image: t.string,
  rating: t.type({
    rate: t.number,
    count: t.number,
  }),
});

const TProducts = t.array(TProduct);
// const TBasicResponse = t.type({
//   message: t.string,
// });

const getProducts = () => get("/products").decode(TProducts);

const getProduct = (productId: string) =>
  get(`/products/${productId}`).decode(TProduct);

// basic usage same for other methods, they are not work because just i don't have api for them

//request with query and path params will be

// const params = new URLSearchParams();
// params.set("paramName", "value");

// const getProduct = (productId: string) =>
//   get(concatQueryParams(`/products/${productId}`, params)).decode(TProduct);

//request with body will be

// const deleteProduct = (productId: string) =>
//   del(`/products/${productId}`, { action: "something special" }).decode(
//     TBasicResponse
//   );

function App() {
  const productId = "5";

  const $products = useQuery("products", getProducts, { retry: false });
  const $product = useQuery(
    `product.${productId}`,
    () => getProduct(productId),
    { retry: false }
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>React - Test ky request</p>
        {$product.isLoading || $products.isLoading ? (
          <p>loading ...</p>
        ) : (
          <div>
            <p>
              Single Product - {$product.data?.id} - {$product.data?.title}
            </p>

            {$products.data?.map((product) => (
              <h1 key={`${product.id}${product.title}`}>
                {product.id} - {product.title}
              </h1>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
