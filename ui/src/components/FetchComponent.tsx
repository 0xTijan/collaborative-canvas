import React, { useState, useEffect } from "react";

const FetchComponent = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch("/hello")
      .then((res) => {
        console.log("res")
        console.log(res)
        return res.json();
      })
      .then((data) => {
        console.log("data")
        console.log(data.message)
        setData(data.message)
      });
  }, []);

  return (
    <p>{!data ? "Loading..." : data}</p>
  );
}

export default FetchComponent;