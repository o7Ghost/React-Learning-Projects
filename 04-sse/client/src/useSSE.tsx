import { useEffect, useState } from "react";

const useSSE = (url: string) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      console.log("what is newData");
      setData(newData);
    };

    eventSource.onerror = (error) => {
      console.log(error);
      setError("Connect lost. Trying to reconnect...");
      eventSource.close();
    };

    return () => eventSource.close();
  }, [url]);

  return { data, error };
};

export default useSSE;
