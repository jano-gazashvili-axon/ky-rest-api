/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { del, get, post } from "./lib/http-request";
import { useMutation, useQuery } from "react-query";
import * as t from "io-ts";
import { concatQueryParams } from "./lib/concat-query-params";

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

const TFileUploadResponse = t.type({
  success: t.boolean,
  message: t.string,
  file: t.string,
});

const TBasicResponse = t.type({
  message: t.string,
});

const uploadFile = (image: File) =>
  post("/upload", {
    image,
  })
    .decode(TFileUploadResponse)
    .file();

const getProducts = () => get("/products").decode(TProducts).json();

const getProduct = (productId: string) =>
  get(`/products/${productId}`).decode(TProduct).json();

// basic usage same for other methods, they are not work because just i don't have api for them

//request with query and path params will be

const params = new URLSearchParams();
params.set("paramName", "value");

const getProductWithParams = (productId: string) =>
  get(concatQueryParams(`/some/endpoint/${productId}`, params))
    .decode(TProduct)
    .json();

// request with body will be

const deleteProduct = (productId: string) =>
  del(`/some/endpoint/${productId}`, { action: "something_special" })
    .decode(TBasicResponse)
    .json();

function App() {
  const productId = "5";

  const $products = useQuery("products", getProducts, { retry: false });
  const $product = useQuery(
    `product.${productId}`,
    () => getProduct(productId),
    { retry: false }
  );

  const $fileUploadFormData = useMutation(uploadFile);

  // just for testing http request for form data
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList) return;

    $fileUploadFormData.mutate(fileList[0], {
      onSuccess: () => alert("file uploaded successfully"),
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <input type="file" onChange={handleImageChange} accept="image/*" />
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
