import React, { useState, useEffect } from "react";

const FetchComponent = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch("/hello")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <p>{!data ? "Loading..." : data}</p>
  );
}

export default FetchComponent;